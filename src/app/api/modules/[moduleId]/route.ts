import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Module from '@/models/module.model';
import { hasProjectPermission } from '@/lib/auth/utils';

export async function PATCH(
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

    const { moduleId } = params;
    const userId = session.user.id;
    const { name, description, flowType } = await req.json();

    // Connect to the database
    await dbConnect();

    // Find the module by ID
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to update this module
    const hasPermission = await hasProjectPermission(userId, module.projectId.toString(), 'BA');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update this module' },
        { status: 403 }
      );
    }

    // Update the module
    module.name = name || module.name;
    module.flowType = flowType || module.flowType;
    await module.save();

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { moduleId } = params;
    const userId = session.user.id;

    // Connect to the database
    await dbConnect();

    // Find the module by ID
    const module = await Module.findById(moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to delete this module
    const hasPermission = await hasProjectPermission(userId, module.projectId.toString(), 'Manager');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this module' },
        { status: 403 }
      );
    }

    // Delete the module
    await Module.deleteOne({ _id: moduleId });

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}