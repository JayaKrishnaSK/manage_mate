import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/chatMessage.model';
import Module from '@/models/module.model';
import { hasProjectPermission } from '@/lib/auth/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
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

    const userId = session.user.id;
    const { moduleId } = params;

    // Connect to the database
    await dbConnect();

    // Check if the module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to view chat in this module
    const hasPermission = await hasProjectPermission(userId, module.projectId.toString(), 'Guest');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view chat in this module' },
        { status: 403 }
      );
    }

    // Find chat messages for this module, sorted by timestamp
    const messages = await ChatMessage.find({ moduleId })
      .sort({ timestamp: 1 })
      .limit(50); // Limit to 50 most recent messages

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}