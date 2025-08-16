import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Project from '@/models/project.model';
import ProjectMembership from '@/models/projectMembership.model';

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

    const userId = session.user.id;

    // Connect to the database
    await dbConnect();

    // Find all projects where the user is a member
    const memberships = await ProjectMembership.find({ userId });
    const projectIds = memberships.map(membership => membership.projectId);

    // Find all projects the user is a member of
    const projects = await Project.find({
      _id: { $in: projectIds }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}