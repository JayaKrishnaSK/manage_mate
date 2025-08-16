import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Issue } from '@/models/Issue';
import { Task } from '@/models/Task';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { issueLinkTaskSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/issues/[id]/link-task - Link an issue to a task
export async function POST(
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

    if (!hasPermission(user, "update", "issue")) {
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
    const validation = issueLinkTaskSchema.safeParse(body);
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

    const [issue, task] = await Promise.all([
      Issue.findById(id),
      Task.findById(validation.data.taskId),
    ]);

    if (!issue) {
      return NextResponse.json(
        {
          error: {
            code: "ISSUE_NOT_FOUND",
            message: "Issue not found",
          },
        },
        { status: 404 }
      );
    }

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

    // Check if already linked
    if (issue.relatedTasks.includes(validation.data.taskId)) {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_LINKED",
            message: "Issue is already linked to this task",
          },
        },
        { status: 400 }
      );
    }

    // Add task to issue's related tasks
    issue.relatedTasks.push(validation.data.taskId);
    await issue.save();

    // Add issue to task's related issues
    task.relatedIssues.push(id);
    await task.save();

    // Populate the updated issue for response
    await issue.populate([
      { path: 'projectId', select: 'name' },
      { path: 'relatedTasks', select: 'title status' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`issues-${issue.projectId}`);
    revalidateTag(`tasks-${task.projectId}`);
    revalidateTag('issues');
    revalidateTag('tasks');

    return NextResponse.json({
      success: true,
      data: {
        issue,
      },
      message: "Issue linked to task successfully",
    });
  } catch (error) {
    console.error("Issue link task error:", error);

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

// DELETE /api/issues/[id]/link-task - Unlink an issue from a task
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

    if (!hasPermission(user, "update", "issue")) {
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

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Task ID is required",
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const [issue, task] = await Promise.all([
      Issue.findById(id),
      Task.findById(taskId),
    ]);

    if (!issue) {
      return NextResponse.json(
        {
          error: {
            code: "ISSUE_NOT_FOUND",
            message: "Issue not found",
          },
        },
        { status: 404 }
      );
    }

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

    // Remove task from issue's related tasks
    issue.relatedTasks = issue.relatedTasks.filter(
      (relatedTaskId: { toString(): string }) => relatedTaskId.toString() !== taskId
    );
    await issue.save();

    // Remove issue from task's related issues
    task.relatedIssues = task.relatedIssues.filter(
      (relatedIssueId: { toString(): string }) => relatedIssueId.toString() !== id
    );
    await task.save();

    // Revalidate relevant caches
    revalidateTag(`issues-${issue.projectId}`);
    revalidateTag(`tasks-${task.projectId}`);
    revalidateTag('issues');
    revalidateTag('tasks');

    return NextResponse.json({
      success: true,
      message: "Issue unlinked from task successfully",
    });
  } catch (error) {
    console.error("Issue unlink task error:", error);

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