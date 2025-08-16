import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/user.model';

export async function GET(req: NextRequest) {
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

    // Check if the user has admin role
    if (session.user.systemRole !== 'Admin') {
      return NextResponse.json(
        { error: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Fetch all users
    const users = await User.find({}).select('-password'); // Exclude password field

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}