import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getSessionUser } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
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

    const { jobId } = await params;

    // Check job status (in a real app, you'd use Redis or a database)
    if (!global.exportJobs || !global.exportJobs[jobId]) {
      return NextResponse.json(
        { error: 'Export job not found' },
        { status: 404 }
      );
    }

    const job = global.exportJobs[jobId];

    // Check if the job belongs to the user
    if (job.userId !== sessionUser.id) {
      return NextResponse.json(
        { error: "You do not have permission to access this export job" },
        { status: 403 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error checking export job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}