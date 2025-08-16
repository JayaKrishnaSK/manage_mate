import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task } from '@/models/Task';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { taskUpdateSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/tasks/[id] - Get task by ID
export async function GET(
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

    if (!hasPermission(user, "read", "task")) {
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

    await connectToDatabase();

    const task = await Task.findById(id)
      .populate('projectId', 'name')
      .populate('moduleId', 'name')
      .populate('assignees', 'name email')
      .populate('reporter', 'name email')
      .populate('createdBy', 'name email')
      .lean();

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

    return NextResponse.json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Task GET error:", error);

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

// PUT /api/tasks/[id] - Update task
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
    const validation = taskUpdateSchema.safeParse(body);
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

    // Check permissions - users can update their own assigned tasks
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

    const validationData = validation.data;
    const updateData: Record<string, unknown> = { ...validationData };
    
    // Handle date conversions
    if (validationData.dueDate) {
      updateData.dueDate = new Date(validationData.dueDate);
    }
    if (validationData.startDate) {
      updateData.startDate = new Date(validationData.startDate);
    }
    if (validationData.completedDate) {
      updateData.completedDate = new Date(validationData.completedDate);
    }

    // Set completed date when status changes to done
    if (validationData.status === 'done' && task.status !== 'done') {
      updateData.completedDate = new Date();
    }

    Object.assign(task, updateData);
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
    });
  } catch (error) {
    console.error("Task PUT error:", error);

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

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
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

    if (!hasPermission(user, "delete", "task")) {
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

    await Task.findByIdAndDelete(id);

    // Revalidate relevant caches
    revalidateTag(`tasks-${task.projectId}`);
    revalidateTag('tasks');

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Task DELETE error:", error);

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