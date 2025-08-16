import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ProjectMembership from '@/models/projectMembership.model';
import User from '@/models/user.model';
import { hasProjectPermission } from '@/lib/auth/utils';
import { z } from 'zod';

// Zod schema for validating POST request body
const addMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['Manager', 'BA', 'Developer', 'QA', 'Guest'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const userId = session.user.id;

    // Check if the user has permission to view members
    const hasPermission = await hasProjectPermission(userId, projectId, 'BA');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view project members' },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find all memberships for this project
    // Populate the userId field with user details (name and email)
    const memberships = await ProjectMembership.find({ projectId })
      .populate('userId', 'name email');

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await req.json();
    const { email, role } = addMemberSchema.parse(body);

    // Check if the user has permission to add members
    const hasPermission = await hasProjectPermission(userId, projectId, 'Manager');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add project members' },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User with this email not found' },
        { status: 404 }
      );
    }

    // Check if the user is already a member of this project
    const existingMembership = await ProjectMembership.findOne({
      projectId,
      userId: user._id,
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Create a new project membership
    const newMembership = new ProjectMembership({
      projectId,
      userId: user._id,
      role,
    });

    await newMembership.save();

    // Populate the userId field with user details
    await newMembership.populate('userId', 'name email');

    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    console.error('Error adding project member:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}