import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
import Module from '@/models/module.model';
import { hasProjectPermission } from '@/lib/auth/utils';
import { createNotification } from '@/lib/notificationService';
import { z } from 'zod';
import { getSessionUser } from "@/lib/utils";

// Zod schema for validating PATCH request body
const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z
    .enum(["Critical", "High", "Medium", "Low"], "Invalid priority")
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)")
    .optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid deadline format (YYYY-MM-DD)")
    .optional(),
  status: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;

    // Connect to the database
    await dbConnect();

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Find the module for this task
    const module = await Module.findById(task.moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if the user has permission to view this task
    const hasPermission = await hasProjectPermission(
      sessionUser.id,
      module.projectId.toString(),
      "Guest"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view this task" },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;

    // Parse and validate request body
    const body = await req.json();
    const {
      title,
      description,
      assigneeId,
      priority,
      startDate,
      deadline,
      status,
      dependencies,
    } = updateTaskSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Find the module for this task
    const module = await Module.findById(task.moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if the user has permission to update this task
    // Guests can only update their own tasks
    // Others with higher permissions can update any task
    const isGuest = !(await hasProjectPermission(
      sessionUser.id,
      module.projectId.toString(),
      "Developer"
    ));
    const isTaskAssignee = task.assigneeId.toString() === sessionUser.id;

    if (isGuest && !isTaskAssignee) {
      return NextResponse.json(
        { error: "You do not have permission to update this task" },
        { status: 403 }
      );
    }

    // Check if assignee is being changed
    const oldAssigneeId = task.assigneeId.toString();
    const isAssigneeChanged = assigneeId && oldAssigneeId !== assigneeId;

    // Update the task
    if (title) task.title = title;
    if (description) task.description = description;
    if (assigneeId) task.assigneeId = assigneeId;
    if (priority) task.priority = priority;
    if (startDate) task.startDate = new Date(startDate);
    if (deadline) task.deadline = new Date(deadline);
    if (status) task.status = status;
    if (dependencies) task.dependencies = dependencies;

    await task.save();

    // If assignee was changed, create a notification
    if (isAssigneeChanged) {
      try {
        await createNotification(
          assigneeId,
          `You have been assigned to task: ${task.title}`,
          "TaskAssigned",
          `/projects/${module.projectId}/modules/${task.moduleId}/tasks/${task._id}`
        );
      } catch (error) {
        console.error("Error creating notification:", error);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;

    // Connect to the database
    await dbConnect();

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Find the module for this task
    const module = await Module.findById(task.moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if the user has permission to delete this task
    const hasPermission = await hasProjectPermission(
      sessionUser.id,
      module.projectId.toString(),
      "Developer"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to delete this task" },
        { status: 403 }
      );
    }

    // Delete the task
    await Task.deleteOne({ _id: taskId });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}