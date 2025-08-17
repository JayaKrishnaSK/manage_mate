import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';

export async function GET(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Connect to the database
    await dbConnect();

    // Find all tasks assigned to the user
    const tasks = await Task.find({ assigneeId: userId });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}