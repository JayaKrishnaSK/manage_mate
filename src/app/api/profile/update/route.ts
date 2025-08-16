import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/user.model';
import { z } from 'zod';

// Zod schema for validating profile update
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
});

export async function PUT(req: NextRequest) {
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

    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await req.json();
    const { name } = updateProfileSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, select: '-password' }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      systemRole: user.systemRole,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
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