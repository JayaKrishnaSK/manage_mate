import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Issue } from '@/models/Issue';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { issueUpdateSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/issues/[id] - Get issue by ID
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

    if (!hasPermission(user, "read", "issue")) {
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

    const issue = await Issue.findById(id)
      .populate('projectId', 'name')
      .populate('assignees', 'name email')
      .populate('reporter', 'name email')
      .populate('createdBy', 'name email')
      .populate('closedBy', 'name email')
      .populate('duplicateOf', 'title status')
      .populate('relatedTasks', 'title status')
      .lean();

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

    return NextResponse.json({
      success: true,
      data: {
        issue,
      },
    });
  } catch (error) {
    console.error("Issue GET error:", error);

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

// PUT /api/issues/[id] - Update issue
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
    const validation = issueUpdateSchema.safeParse(body);
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

    const issue = await Issue.findById(id);
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

    // Check permissions - users can update their own reported/assigned issues
    if (!hasPermission(user, "update", "issue", issue)) {
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

    // Set closed date and user when status changes to done/wontfix/duplicate
    const closedStatuses = ['done', 'wontfix', 'duplicate'];
    if (validationData.status && closedStatuses.includes(validationData.status) && !closedStatuses.includes(issue.status)) {
      updateData.closedAt = new Date();
      updateData.closedBy = user.userId;
    }

    // Update SLA breach status
    if (validationData.severity && validationData.severity !== issue.severity) {
      const slaHours = {
        critical: 4,
        high: 24,
        medium: 72,
        low: 168,
      };
      
      const targetAt = new Date(issue.createdAt);
      targetAt.setHours(targetAt.getHours() + slaHours[validationData.severity as keyof typeof slaHours]);
      
      updateData.sla = {
        targetAt,
        breached: new Date() > targetAt,
      };
    }

    Object.assign(issue, updateData);
    await issue.save();

    // Populate the updated issue for response
    await issue.populate([
      { path: 'projectId', select: 'name' },
      { path: 'assignees', select: 'name email' },
      { path: 'reporter', select: 'name email' },
      { path: 'duplicateOf', select: 'title status' },
      { path: 'relatedTasks', select: 'title status' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`issues-${issue.projectId}`);
    revalidateTag('issues');

    return NextResponse.json({
      success: true,
      data: {
        issue,
      },
    });
  } catch (error) {
    console.error("Issue PUT error:", error);

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

// DELETE /api/issues/[id] - Delete issue
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

    if (!hasPermission(user, "delete", "issue")) {
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

    const issue = await Issue.findById(id);
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

    await Issue.findByIdAndDelete(id);

    // Revalidate relevant caches
    revalidateTag(`issues-${issue.projectId}`);
    revalidateTag('issues');

    return NextResponse.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error("Issue DELETE error:", error);

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