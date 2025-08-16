import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Issue } from '@/models/Issue';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { issueTriageSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// PUT /api/issues/[id]/triage - Triage an issue
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

    if (!hasPermission(user, "triage", "issue")) {
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
    const validation = issueTriageSchema.safeParse(body);
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

    // Only allow triaging issues in 'new' status
    if (issue.status !== 'new') {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATUS",
            message: "Only new issues can be triaged",
          },
        },
        { status: 400 }
      );
    }

    const triageData = validation.data;

    // Update SLA based on new severity
    const slaHours = {
      critical: 4,
      high: 24,
      medium: 72,
      low: 168,
    };
    
    const targetAt = new Date(issue.createdAt);
    targetAt.setHours(targetAt.getHours() + slaHours[triageData.severity]);

    Object.assign(issue, {
      ...triageData,
      sla: {
        targetAt,
        breached: new Date() > targetAt,
      },
    });

    await issue.save();

    // Populate the updated issue for response
    await issue.populate([
      { path: 'projectId', select: 'name' },
      { path: 'assignees', select: 'name email' },
      { path: 'reporter', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`issues-${issue.projectId}`);
    revalidateTag('issues');

    return NextResponse.json({
      success: true,
      data: {
        issue,
      },
      message: "Issue triaged successfully",
    });
  } catch (error) {
    console.error("Issue triage error:", error);

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