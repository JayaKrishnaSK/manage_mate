import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { TestRun } from '@/models/QA';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { testRunCreateSchema } from '@/lib/validations/qa';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/test-runs - List test runs
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

    if (!hasPermission(user, "read", "test_run")) {
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
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (environment) {
      query.environment = environment;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [testRuns, total] = await Promise.all([
      TestRun.find(query)
        .populate('projectId', 'name')
        .populate('suiteId', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TestRun.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        testRuns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Test Runs GET error:", error);

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

// POST /api/test-runs - Create a new test run
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

    if (!hasPermission(user, "create", "test_run")) {
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
    const validation = testRunCreateSchema.safeParse(body);
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

    // Get the test suite to populate test cases
    const { TestSuite } = await import('@/models/QA');
    const testSuite = await TestSuite.findById(validation.data.suiteId)
      .populate('testCases')
      .lean();

    if (!testSuite) {
      return NextResponse.json(
        {
          error: {
            code: "TEST_SUITE_NOT_FOUND",
            message: "Test suite not found",
          },
        },
        { status: 404 }
      );
    }

    // Initialize results for all test cases in the suite
    const testCases = (testSuite as { testCases?: { _id: string }[] }).testCases || [];
    const results = testCases.map((testCase: { _id: string }) => ({
      testCaseId: testCase._id,
      status: 'not_executed' as const,
      attachments: [],
      defects: [],
    }));

    const testRunData = {
      ...validation.data,
      createdBy: user.userId,
      results,
      plannedStartDate: validation.data.plannedStartDate ? new Date(validation.data.plannedStartDate) : undefined,
      plannedEndDate: validation.data.plannedEndDate ? new Date(validation.data.plannedEndDate) : undefined,
    };

    const testRun = new TestRun(testRunData);
    await testRun.save();

    // Populate the created test run for response
    await testRun.populate([
      { path: 'projectId', select: 'name' },
      { path: 'suiteId', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`testruns-${validation.data.projectId}`);
    revalidateTag('testruns');

    return NextResponse.json(
      {
        success: true,
        data: {
          testRun,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Test Runs POST error:", error);

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