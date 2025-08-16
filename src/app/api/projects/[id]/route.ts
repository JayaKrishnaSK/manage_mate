import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/Project';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { projectUpdateSchema } from '@/lib/validations/projects';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!hasPermission(user, "read", "project")) {
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

    const project = await Project.findById(params.id)
      .populate('owners', 'name email')
      .populate('managers', 'name email')
      .populate('members', 'name email')
      .populate('guestUsers', 'name email')
      .lean();

    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Project GET error:", error);

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

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!hasPermission(user, "update", "project")) {
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
    const validation = projectUpdateSchema.safeParse(body);
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

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }

    // Update project
    Object.assign(project, validation.data);
    await project.save();

    // Populate for response
    await project.populate([
      { path: 'owners', select: 'name email' },
      { path: 'managers', select: 'name email' },
      { path: 'members', select: 'name email' },
      { path: 'guestUsers', select: 'name email' },
    ]);

    // Revalidate cache
    revalidateTag("projects");
    revalidateTag(`project-${params.id}`);

    return NextResponse.json({
      success: true,
      data: {
        project,
      },
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Project PUT error:", error);

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

// DELETE /api/projects/[id] - Soft delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!hasPermission(user, "delete", "project")) {
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

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }

    // Soft delete by setting status to cancelled
    project.status = 'cancelled';
    await project.save();

    // Revalidate cache
    revalidateTag("projects");

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Project DELETE error:", error);

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