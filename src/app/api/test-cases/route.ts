import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { TestCase } from '@/models/QA';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { testCaseCreateSchema } from '@/lib/validations/qa';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/test-cases - List test cases
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

    if (!hasPermission(user, "read", "test_case")) {
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
    const component = searchParams.get('component');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, string | { $search: string } | { $in: string[] }> = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (moduleId) {
      query.moduleId = moduleId;
    }
    if (component) {
      query.component = component;
    }
    if (priority) {
      query.priority = priority;
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [testCases, total] = await Promise.all([
      TestCase.find(query)
        .populate('projectId', 'name')
        .populate('moduleId', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TestCase.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        testCases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Test Cases GET error:", error);

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

// POST /api/test-cases - Create a new test case
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

    if (!hasPermission(user, "create", "test_case")) {
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
    const validation = testCaseCreateSchema.safeParse(body);
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

    const testCaseData = {
      ...validation.data,
      createdBy: user.userId,
    };

    const testCase = new TestCase(testCaseData);
    await testCase.save();

    // Populate the created test case for response
    await testCase.populate([
      { path: 'projectId', select: 'name' },
      { path: 'moduleId', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`testcases-${validation.data.projectId}`);
    revalidateTag('testcases');

    return NextResponse.json(
      {
        success: true,
        data: {
          testCase,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Test Cases POST error:", error);

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