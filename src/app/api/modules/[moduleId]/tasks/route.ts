import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
import Module from '@/models/module.model';
import { hasProjectPermission } from '@/lib/auth/utils';
import { z } from 'zod';

// Zod schema for validating POST request body
const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  assigneeId: z.string().min(1, "Assignee ID is required"),
  priority: z.enum(["Critical", "High", "Medium", "Low"]),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid deadline format (YYYY-MM-DD)"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
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

    const { moduleId } = params;
    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const { title, description, assigneeId, priority, startDate, deadline } =
      createTaskSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Find the module by ID
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if the user has permission to create tasks in this module
    const hasPermission = await hasProjectPermission(
      userId,
      module.projectId.toString(),
      "Developer"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to create tasks in this module" },
        { status: 403 }
      );
    }

    // Create a new task
    const newTask = new Task({
      title,
      moduleId,
      assigneeId,
      priority,
      startDate: new Date(startDate),
      deadline: new Date(deadline),
      description,
    });

    await newTask.save();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}