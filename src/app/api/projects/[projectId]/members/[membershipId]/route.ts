import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ProjectMembership from '@/models/projectMembership.model';
import { hasProjectPermission } from '@/lib/auth/utils';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; membershipId: string } }
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

    const { projectId, membershipId } = params;
    const userId = session.user.id;
    const { role } = await req.json();

    // Check if the user has permission to update member roles
    const hasPermission = await hasProjectPermission(userId, projectId, 'Manager');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update member roles' },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the membership by ID and project ID
    const membership = await ProjectMembership.findOne({
      _id: membershipId,
      projectId,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Update the role
    membership.role = role;
    await membership.save();

    // Populate the userId field with user details
    await membership.populate('userId', 'name email');

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error updating project member role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; membershipId: string } }
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

    const { projectId, membershipId } = params;
    const userId = session.user.id;

    // Check if the user has permission to remove members
    const hasPermission = await hasProjectPermission(userId, projectId, 'Manager');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the membership by ID and project ID
    const membership = await ProjectMembership.findOne({
      _id: membershipId,
      projectId,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Delete the membership
    await ProjectMembership.deleteOne({ _id: membershipId });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}