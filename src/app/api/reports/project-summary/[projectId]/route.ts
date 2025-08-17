import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
import Project from '@/models/project.model';
import ProjectMembership from '@/models/projectMembership.model';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { projectId } = params;

    // Connect to the database
    await dbConnect();

    // Check if the user is a member of the project
    const membership = await ProjectMembership.findOne({
      projectId,
      userId,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Get task status counts
    const taskStatusCounts = await Task.aggregate([
      {
        $match: {
          moduleId: { $in: await getModuleIdsForProject(projectId) },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get task priority counts
    const taskPriorityCounts = await Task.aggregate([
      {
        $match: {
          moduleId: { $in: await getModuleIdsForProject(projectId) },
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          priority: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get total tasks
    const totalTasks = await Task.countDocuments({
      moduleId: { $in: await getModuleIdsForProject(projectId) },
    });

    // Get completed tasks (assuming status 'done' means completed)
    const completedTasks = await Task.countDocuments({
      moduleId: { $in: await getModuleIdsForProject(projectId) },
      status: 'done',
    });

    return NextResponse.json({
      taskStatusCounts,
      taskPriorityCounts,
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get module IDs for a project
async function getModuleIdsForProject(projectId: string) {
  const modules = await mongoose.models.Module.find({ projectId });
  return modules.map(module => module._id);
}