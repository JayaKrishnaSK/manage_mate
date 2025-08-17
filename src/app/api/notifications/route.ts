import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Notification from '@/models/notification.model';
import { getSessionUser } from "@/lib/utils";

export async function GET(req: NextRequest) {
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

    // Connect to the database
    await dbConnect();

    // Find notifications for this user
    const notifications = await Notification.find({
      recipientId: sessionUser.id,
    })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 most recent notifications

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}