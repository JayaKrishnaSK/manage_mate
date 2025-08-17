import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/chatMessage.model';
import Module from '@/models/module.model';
import { publish } from '@/lib/redis';
import { hasProjectPermission } from '@/lib/auth/utils';
import { getSessionUser } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    const sessionUser = getSessionUser(session);

    // Check if the user is authenticated
    if (!sessionUser) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    const { moduleId, content } = await req.json();

    // Validate input
    if (!moduleId || !content) {
      return NextResponse.json(
        { error: "Module ID and content are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if the module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if the user has permission to chat in this module
    const hasPermission = await hasProjectPermission(
      sessionUser.id,
      module.projectId.toString(),
      "Guest"
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to chat in this module" },
        { status: 403 }
      );
    }

    // Create a new chat message
    const newMessage = new ChatMessage({
      moduleId,
      userId: sessionUser.id,
      userName: sessionUser.name,
      content,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Publish the message to Redis
    await publish('chat', {
      id: newMessage._id.toString(),
      moduleId: newMessage.moduleId.toString(),
      userId: newMessage.userId.toString(),
      userName: newMessage.userName,
      content: newMessage.content,
      timestamp: newMessage.timestamp.toISOString(),
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}