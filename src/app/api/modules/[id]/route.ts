import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Module } from '@/models/Module';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { hasPermission } from '@/lib/policies';
import { moduleUpdateSchema } from '@/lib/validations/projects';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/modules/[id] - Get module details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "read", "module")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const moduleDoc = await Module.findById(id)
      .populate('projectId', 'name description')
      .populate('owners', 'name email')
      .populate('contributors', 'name email')
      .populate('dependencies', 'name description status')
      .populate('createdBy', 'name email')
      .lean();

    if (!moduleDoc) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        module: moduleDoc,
      },
    });
  } catch (error) {
    console.error("Module GET error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "update", "module")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = moduleUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const moduleDoc = await Module.findById(id);
    if (!moduleDoc) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        { status: 404 }
      );
    }

    // Check for circular dependencies if dependencies are being updated
    if (validation.data.dependencies) {
      const hasCircularDependency = await checkCircularDependency(
        id,
        validation.data.dependencies
      );
      if (hasCircularDependency) {
        return NextResponse.json(
          {
            error: {
              code: "CIRCULAR_DEPENDENCY",
              message: "Circular dependency detected",
            },
          },
          { status: 400 }
        );
      }
    }

    // Update module
    Object.assign(moduleDoc, validation.data);
    await moduleDoc.save();

    // Populate for response
    await moduleDoc.populate([
      { path: 'projectId', select: 'name description' },
      { path: 'owners', select: 'name email' },
      { path: 'contributors', select: 'name email' },
      { path: 'dependencies', select: 'name description status' },
    ]);

    // Revalidate cache
    revalidateTag("modules");
    revalidateTag(`modules-${moduleDoc.projectId}`);
    revalidateTag(`module-${id}`);

    return NextResponse.json({
      success: true,
      data: {
        module: moduleDoc,
      },
      message: "Module updated successfully",
    });
  } catch (error) {
    console.error("Module PUT error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "delete", "module")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const moduleDoc = await Module.findById(id);
    if (!moduleDoc) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Module not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if other modules depend on this one
    const dependentModules = await Module.find({ dependencies: id });
    if (dependentModules.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "HAS_DEPENDENCIES",
            message: "Cannot delete module with dependencies",
            details: dependentModules.map(m => ({ id: m._id, name: m.name })),
          },
        },
        { status: 400 }
      );
    }

    await Module.findByIdAndDelete(id);

    // Revalidate cache
    revalidateTag("modules");
    revalidateTag(`modules-${moduleDoc.projectId}`);

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Module DELETE error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to check for circular dependencies
async function checkCircularDependency(
  moduleId: string,
  dependencies: string[]
): Promise<boolean> {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  async function dfs(currentId: string): Promise<boolean> {
    if (recursionStack.has(currentId)) {
      return true; // Circular dependency found
    }
    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);
    recursionStack.add(currentId);

    // Get dependencies for current module
    let currentDependencies: string[] = [];
    if (currentId === moduleId) {
      // Use the new dependencies being set
      currentDependencies = dependencies;
    } else {
      // Get existing dependencies from database
      try {
        const moduleDoc = await Module.findById(currentId).select('dependencies').lean();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (moduleDoc && (moduleDoc as any).dependencies) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentDependencies = ((moduleDoc as any).dependencies as any[]).map(dep => dep.toString());
        }
      } catch {
        // If we can't fetch the module, continue without dependencies
        currentDependencies = [];
      }
    }

    // Check each dependency
    for (const depId of currentDependencies) {
      if (await dfs(depId)) {
        return true;
      }
    }

    recursionStack.delete(currentId);
    return false;
  }

  return await dfs(moduleId);
}