import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Project from '@/models/project.model';
import ProjectMembership from '@/models/projectMembership.model';
import User from "@/models/user.model";
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

    // Find all projects where the user is a member
    const memberships = await ProjectMembership.find({
      userId: sessionUser.id,
    });
    const projectIds = memberships.map((membership) => membership.projectId);

    // Find all projects the user is a member of
    const projects = await Project.find({
      _id: { $in: projectIds },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Check if the user is an Admin
    if (sessionUser.systemRole !== "Admin") {
      return NextResponse.json(
        { error: "Only administrators can create projects" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { name, description, owner, managers } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: "Project name and description are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Create the project
    const project = new Project({
      name,
      description,
      owner: owner || sessionUser.id, // Default to current user if no owner specified
    });

    await project.save();

    // Create project memberships
    const memberships = [];

    // Add the project owner (if different from current user)
    if (owner && owner !== sessionUser.id) {
      const ownerMembership = new ProjectMembership({
        projectId: project._id,
        userId: owner,
        role: "Manager", // Owner is also a Manager
      });
      await ownerMembership.save();
      memberships.push(ownerMembership);
    }

    // Add the current user as a Manager if they're not the owner
    if (sessionUser.id !== owner) {
      const currentUserMembership = new ProjectMembership({
        projectId: project._id,
        userId: sessionUser.id,
        role: "Manager",
      });
      await currentUserMembership.save();
      memberships.push(currentUserMembership);
    }

    // Add additional managers if provided
    if (managers && Array.isArray(managers)) {
      for (const managerId of managers) {
        // Skip if this is the owner or current user (already added)
        if (managerId === owner || managerId === sessionUser.id) {
          continue;
        }

        // Check if user exists
        const user = await User.findById(managerId);
        if (!user) {
          continue; // Skip invalid users
        }

        const managerMembership = new ProjectMembership({
          projectId: project._id,
          userId: managerId,
          role: "Manager",
        });
        await managerMembership.save();
        memberships.push(managerMembership);
      }
    }

    return NextResponse.json(
      {
        project,
        memberships,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}