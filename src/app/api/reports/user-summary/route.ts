import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
import Project from '@/models/project.model';
import ProjectMembership from '@/models/projectMembership.model';
import { getSessionUser } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    const sessionUser = getSessionUser(session);

    // Check if the user is authenticated
    if (!sessionUser) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Get projects the user is a member of
    const memberships = await ProjectMembership.find({
      userId: sessionUser.id,
    });
    const projectIds = memberships.map((membership) => membership.projectId);

    // Get project task counts
    const projectTaskCounts = await Project.aggregate([
      {
        $match: {
          _id: { $in: projectIds },
        },
      },
      {
        $lookup: {
          from: "modules",
          localField: "_id",
          foreignField: "projectId",
          as: "modules",
        },
      },
      {
        $unwind: "$modules",
      },
      {
        $lookup: {
          from: "tasks",
          localField: "modules._id",
          foreignField: "moduleId",
          as: "tasks",
        },
      },
      {
        $project: {
          projectName: "$name",
          taskCount: { $size: "$tasks" },
        },
      },
    ]);

    // Get weekly task counts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTaskCounts = await Task.aggregate([
      {
        $match: {
          assigneeId: sessionUser.id,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Fill in missing dates with zero counts
    const filledWeeklyTaskCounts = [];
    const currentDate = new Date(sevenDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split("T")[0];
      const existingEntry = weeklyTaskCounts.find(
        (entry) => entry.date === dateString
      );

      filledWeeklyTaskCounts.push({
        date: dateString,
        count: existingEntry ? existingEntry.count : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get total projects
    const totalProjects = projectIds.length;

    // Get total tasks assigned to user
    const totalTasks = await Task.countDocuments({
      assigneeId: sessionUser.id,
    });

    // Get completed tasks (assuming status 'done' means completed)
    const completedTasks = await Task.countDocuments({
      assigneeId: sessionUser.id,
      status: "done",
    });

    return NextResponse.json({
      projectTaskCounts,
      weeklyTaskCounts: filledWeeklyTaskCounts,
      totalProjects,
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}