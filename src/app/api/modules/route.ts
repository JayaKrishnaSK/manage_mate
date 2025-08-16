import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Module } from '@/models/Module';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { moduleCreateSchema } from '@/lib/validations/projects';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/modules - List modules
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

    if (!hasPermission(user, "read", "module")) {
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
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, string | { $search: string } | { $in: string[] }> = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const [modules, total] = await Promise.all([
      Module.find(query)
        .populate('projectId', 'name')
        .populate('owners', 'name email')
        .populate('contributors', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Module.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        modules,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Modules GET error:", error);

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

// POST /api/modules - Create a new module
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

    if (!hasPermission(user, "create", "module")) {
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
    const validation = moduleCreateSchema.safeParse(body);
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

    const moduleData = {
      ...validation.data,
      createdBy: user.userId,
    };

    const moduleDoc = new Module(moduleData);
    await moduleDoc.save();

    // Populate the created module for response
    await moduleDoc.populate([
      { path: 'projectId', select: 'name' },
      { path: 'owners', select: 'name email' },
      { path: 'contributors', select: 'name email' },
    ]);

    // Revalidate relevant caches
    revalidateTag(`modules-${validation.data.projectId}`);
    revalidateTag('modules');

    return NextResponse.json(
      {
        success: true,
        data: {
          module: moduleDoc,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Modules POST error:", error);

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