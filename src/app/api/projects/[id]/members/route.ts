import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/Project';
import { User } from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { projectMemberSchema } from '@/lib/validations/projects';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/projects/[id]/members - Add member to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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
    const validation = projectMemberSchema.safeParse(body);
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

    const project = await Project.findById(projectId);
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

    const { userId, role } = validation.data;

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        {
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    // Remove user from all role arrays first (to avoid duplicates)
    project.owners = project.owners.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.managers = project.managers.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.qaLeads = project.qaLeads.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.members = project.members.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.guestUsers = project.guestUsers.filter((id: string | { toString(): string }) => id.toString() !== userId);

    // Add user to appropriate role array
    switch (role) {
      case 'owner':
        project.owners.push(userId);
        break;
      case 'manager':
        project.managers.push(userId);
        break;
      case 'qa_lead':
        project.qaLeads.push(userId);
        break;
      case 'member':
        project.members.push(userId);
        break;
      case 'guest':
        project.guestUsers.push(userId);
        break;
    }

    await project.save();

    // Populate for response
    await project.populate([
      { path: 'owners', select: 'name email' },
      { path: 'managers', select: 'name email' },
      { path: 'qaLeads', select: 'name email' },
      { path: 'members', select: 'name email' },
      { path: 'guestUsers', select: 'name email' },
    ]);

    // Revalidate cache
    revalidateTag("projects");
    revalidateTag(`project-${projectId}`);

    return NextResponse.json({
      success: true,
      data: {
        project,
      },
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Project member POST error:", error);

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

// DELETE /api/projects/[id]/members - Remove member from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "userId is required",
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const project = await Project.findById(projectId);
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

    // Check if user is the last owner
    if (project.owners.length === 1 && project.owners[0].toString() === userId) {
      return NextResponse.json(
        {
          error: {
            code: "LAST_OWNER",
            message: "Cannot remove the last owner from project",
          },
        },
        { status: 400 }
      );
    }

    // Remove user from all role arrays
    project.owners = project.owners.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.managers = project.managers.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.qaLeads = project.qaLeads.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.members = project.members.filter((id: string | { toString(): string }) => id.toString() !== userId);
    project.guestUsers = project.guestUsers.filter((id: string | { toString(): string }) => id.toString() !== userId);

    await project.save();

    // Revalidate cache
    revalidateTag("projects");
    revalidateTag(`project-${projectId}`);

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Project member DELETE error:", error);

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

// GET /api/projects/[id]/members - Get project members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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

    const project = await Project.findById(projectId)
      .populate('owners', 'name email avatar')
      .populate('managers', 'name email avatar')
      .populate('qaLeads', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('guestUsers', 'name email avatar')
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

    // Format members with their roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectData = project as any;
    const members = [
      ...projectData.owners.map((member: { _id: string; name: string; email: string; avatar?: string }) => ({ ...member, role: 'owner' })),
      ...projectData.managers.map((member: { _id: string; name: string; email: string; avatar?: string }) => ({ ...member, role: 'manager' })),
      ...projectData.qaLeads.map((member: { _id: string; name: string; email: string; avatar?: string }) => ({ ...member, role: 'qa_lead' })),
      ...projectData.members.map((member: { _id: string; name: string; email: string; avatar?: string }) => ({ ...member, role: 'member' })),
      ...projectData.guestUsers.map((member: { _id: string; name: string; email: string; avatar?: string }) => ({ ...member, role: 'guest' })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        members,
        project: {
          _id: projectData._id,
          name: projectData.name,
        },
      },
    });
  } catch (error) {
    console.error("Project members GET error:", error);

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