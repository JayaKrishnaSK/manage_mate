import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task } from '@/models/Task';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { taskStatusUpdateSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// PUT /api/tasks/[id]/status - Update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = taskStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json(
        {
          error: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
          },
        },
        { status: 404 }
      );
    }

    // Check permissions - users can update status of their assigned tasks
    if (!hasPermission(user, "update", "task", task)) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    const { status } = validation.data;
    const oldStatus = task.status;

    // Set completed date when moving to done
    if (status === 'done' && oldStatus !== 'done') {
      task.completedDate = new Date();
    }

    // Clear completed date when moving away from done
    if (status !== 'done' && oldStatus === 'done') {
      task.completedDate = null;
    }

    task.status = status;
    await task.save();

    // Populate the updated task for response
    await task.populate([
      { path: 'projectId', select: 'name' },
      { path: 'moduleId', select: 'name' },
      { path: 'assignees', select: 'name email' },
      { path: 'reporter', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`tasks-${task.projectId}`);
    revalidateTag('tasks');

    return NextResponse.json({
      success: true,
      data: {
        task,
      },
      message: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Task status update error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}