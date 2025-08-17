import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import TimeLog from '@/models/timeLog.model';
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

    // Find time logs for this user, populated with task information
    const timeLogs = await TimeLog.find({ userId })
      .populate({
        path: 'taskId',
        select: 'title',
      })
      .sort({ date: -1 });

    // Format the response
    const formattedTimeLogs = timeLogs.map(log => ({
      _id: log._id.toString(),
      taskId: log.taskId._id.toString(),
      taskTitle: (log.taskId as any).title,
      date: log.date.toISOString(),
      hours: log.hours,
      description: log.description,
    }));

    return NextResponse.json(formattedTimeLogs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const { taskId, date, hours, description } = await req.json();

    // Validate input
    if (!taskId || !date || !hours) {
      return NextResponse.json(
        { error: 'Task ID, date, and hours are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Create a new time log
    const timeLog = new TimeLog({
      userId,
      taskId,
      date: new Date(date),
      hours,
      description,
    });

    await timeLog.save();

    // Populate the task information
    await timeLog.populate({
      path: 'taskId',
      select: 'title',
    });

    // Format the response
    const formattedTimeLog = {
      _id: timeLog._id.toString(),
      taskId: timeLog.taskId._id.toString(),
      taskTitle: (timeLog.taskId as any).title,
      date: timeLog.date.toISOString(),
      hours: timeLog.hours,
      description: timeLog.description,
    };

    return NextResponse.json(formattedTimeLog, { status: 201 });
  } catch (error) {
    console.error('Error creating time log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}