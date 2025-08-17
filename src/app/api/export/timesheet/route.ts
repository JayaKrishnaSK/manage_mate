import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Worker } from 'worker_threads';
import path from 'path';
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

    // Create a worker thread for the export process
    const workerPath = path.resolve('./src/workers/export.worker.js');
    const worker = new Worker(workerPath, {
      workerData: { userId: sessionUser.id },
    });

    // Return a job ID immediately
    const jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store job information (in a real app, you'd use Redis or a database)
    // For now, we'll just use a global object
    if (!global.exportJobs) {
      global.exportJobs = {};
    }
    global.exportJobs[jobId] = {
      status: "processing",
      userId: sessionUser.id,
      startTime: new Date(),
    };

    // Handle worker events
    worker.on('message', (result) => {
      global.exportJobs[jobId] = {
        ...global.exportJobs[jobId],
        status: 'completed',
        filePath: result.filePath,
        endTime: new Date(),
      };
    });

    worker.on('error', (error) => {
      console.error('Export worker error:', error);
      global.exportJobs[jobId] = {
        ...global.exportJobs[jobId],
        status: 'failed',
        error: error.message,
        endTime: new Date(),
      };
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Export worker stopped with exit code ${code}`);
        global.exportJobs[jobId] = {
          ...global.exportJobs[jobId],
          status: 'failed',
          error: `Worker stopped with exit code ${code}`,
          endTime: new Date(),
        };
      }
    });

    return NextResponse.json({ 
      jobId,
      message: 'Export job started. Please check back later for the result.'
    });
  } catch (error) {
    console.error('Error starting export job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}