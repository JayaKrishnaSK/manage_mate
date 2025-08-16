import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { TestSuite } from '@/models/QA';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { testSuiteCreateSchema } from '@/lib/validations/qa';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/test-suites - List test suites
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

    if (!hasPermission(user, "read", "test_suite")) {
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
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, string | { $search: string }> = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [testSuites, total] = await Promise.all([
      TestSuite.find(query)
        .populate('projectId', 'name')
        .populate('testCases', 'title priority component')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TestSuite.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        testSuites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Test Suites GET error:", error);

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

// POST /api/test-suites - Create a new test suite
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

    if (!hasPermission(user, "create", "test_suite")) {
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
    const validation = testSuiteCreateSchema.safeParse(body);
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

    const testSuiteData = {
      ...validation.data,
      createdBy: user.userId,
    };

    const testSuite = new TestSuite(testSuiteData);
    await testSuite.save();

    // Populate the created test suite for response
    await testSuite.populate([
      { path: 'projectId', select: 'name' },
      { path: 'testCases', select: 'title priority component' },
      { path: 'createdBy', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`testsuites-${validation.data.projectId}`);
    revalidateTag('testsuites');

    return NextResponse.json(
      {
        success: true,
        data: {
          testSuite,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Test Suites POST error:", error);

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