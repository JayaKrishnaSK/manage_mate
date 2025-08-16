import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Issue } from '@/models/Issue';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { issueCreateSchema } from '@/lib/validations/tasks';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/issues - List issues
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const environment = searchParams.get('environment');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, string | { $search: string }> = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (status) {
      query.status = status;
    }
    if (severity) {
      query.severity = severity;
    }
    if (priority) {
      query.priority = priority;
    }
    if (type) {
      query.type = type;
    }
    if (assignedTo) {
      query.assignees = assignedTo;
    }
    if (environment) {
      query.environment = environment;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('projectId', 'name')
        .populate('assignees', 'name email')
        .populate('reporter', 'name email')
        .populate('duplicateOf', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Issues GET error:", error);

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

// POST /api/issues - Create a new issue
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

    if (!hasPermission(user, "create", "issue")) {
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
    const validation = issueCreateSchema.safeParse(body);
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

    // Calculate SLA target based on severity
    const slaHours = {
      critical: 4,
      high: 24,
      medium: 72,
      low: 168,
    };

    const targetAt = new Date();
    targetAt.setHours(targetAt.getHours() + slaHours[validation.data.severity]);

    const issueData = {
      ...validation.data,
      reporter: user.userId,
      createdBy: user.userId,
      sla: {
        targetAt,
        breached: false,
      },
      // Generate similarity hash for duplicate detection (simplified)
      similarityHash: validation.data.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50),
    };

    const issue = new Issue(issueData);
    await issue.save();

    // Populate the created issue for response
    await issue.populate([
      { path: 'projectId', select: 'name' },
      { path: 'assignees', select: 'name email' },
      { path: 'reporter', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`issues-${validation.data.projectId}`);
    revalidateTag('issues');

    return NextResponse.json(
      {
        success: true,
        data: {
          issue,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Issues POST error:", error);

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