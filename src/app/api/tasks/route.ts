import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Task } from '@/models/Task';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { taskCreateSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const projectId = searchParams.get('projectId');
    const moduleId = searchParams.get('moduleId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, string | { $search: string }> = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (moduleId) {
      query.moduleId = moduleId;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignees = assignedTo;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('projectId', 'name')
        .populate('moduleId', 'name')
        .populate('assignees', 'name email')
        .populate('reporter', 'name email')
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Tasks GET error:", error);

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

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
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

    if (!hasPermission(user, "create", "task")) {
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

    const body = await request.json();

    // Validate input
    const validation = taskCreateSchema.safeParse(body);
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

    // Get the highest order number for this project/status
    const maxOrderTask = await Task.findOne({
      projectId: validation.data.projectId,
    }).sort({ order: -1 });

    const taskData = {
      ...validation.data,
      reporter: user.userId,
      createdBy: user.userId,
      order: (maxOrderTask?.order || 0) + 1,
      dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : undefined,
      startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the created task for response
    await task.populate([
      { path: 'projectId', select: 'name' },
      { path: 'moduleId', select: 'name' },
      { path: 'assignees', select: 'name email' },
      { path: 'reporter', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`tasks-${validation.data.projectId}`);
    revalidateTag('tasks');

    return NextResponse.json(
      {
        success: true,
        data: {
          task,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Tasks POST error:", error);

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