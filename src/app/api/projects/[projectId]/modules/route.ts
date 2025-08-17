import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Module from '@/models/module.model';
import { hasProjectPermission } from '@/lib/auth/utils';
import { getSessionUser } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    const { projectId } = await params;

    // Check if the user has permission to view modules
    const hasPermission = await hasProjectPermission(
      sessionUser.id,
      projectId,
      "Guest"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view project modules" },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find all modules for this project
    const modules = await Module.find({ projectId });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching project modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    const { projectId } = params;
    const { name, description, flowType } = await req.json();

    // Check if the user has permission to create modules
    const hasPermission = await hasProjectPermission(
      sessionUser.id,
      projectId,
      "BA"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to create project modules" },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Create a new module
    const newModule = new Module({
      name,
      projectId,
      flowType,
      owner: sessionUser.id, // The user creating the module becomes the owner
      contributorIds: [sessionUser.id], // The owner is also a contributor
    });

    await newModule.save();

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating project module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}