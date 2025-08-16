import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Project } from '@/models/Project';
import { getAuthenticatedUser, AuthError, PermissionError } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { projectCreateSchema } from '@/lib/validations/projects';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!hasPermission(user, 'read', 'project')) {
      throw new PermissionError('Access denied');
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    // Build query based on user permissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // If not admin, filter to projects where user is involved
    if (!hasPermission(user, '*', '*')) {
      query.$or = [
        { owners: user.userId },
        { managers: user.userId },
        { qaLeads: user.userId },
        { members: user.userId },
        { guestUsers: user.userId },
      ];
    }

    // Add search filters
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owners', 'name email')
        .populate('managers', 'name email')
        .populate('qaLeads', 'name email')
        .populate('members', 'name email')
        .populate('guestUsers', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Projects list error:', error);

    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: {
            code: error.name.toUpperCase().replace('ERROR', ''),
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!hasPermission(user, 'create', 'project')) {
      throw new PermissionError('Access denied');
    }

    const body = await request.json();

    // Validate input
    const validation = projectCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const projectData = validation.data;

    await connectToDatabase();

    // Check if project name already exists
    const existingProject = await Project.findOne({ name: projectData.name });
    if (existingProject) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_EXISTS',
            message: 'A project with this name already exists',
          },
        },
        { status: 409 }
      );
    }

    // Ensure current user is included as owner if not already
    if (!projectData.owners.includes(user.userId)) {
      projectData.owners.push(user.userId);
    }

    const project = new Project({
      ...projectData,
      startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
      endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
      createdBy: user.userId,
    });

    await project.save();

    // Populate references
    await project.populate(['owners', 'managers', 'qaLeads', 'members', 'guestUsers', 'createdBy']);

    // Revalidate projects cache
    revalidateTag('projects');

    return NextResponse.json(
      {
        success: true,
        data: { project },
        message: 'Project created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Project creation error:', error);

    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: {
            code: error.name.toUpperCase().replace('ERROR', ''),
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}