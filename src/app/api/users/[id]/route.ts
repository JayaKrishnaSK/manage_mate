import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/models/User';
import { getAuthenticatedUser, AuthError, PermissionError } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/policies';
import { userUpdateSchema } from '@/lib/validations/auth';
import { logActivity, ACTIVITY_ACTIONS, ACTIVITY_RESOURCES } from '@/lib/activity-logger';

export const runtime = 'nodejs';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    // Users can view their own profile, admins can view any profile
    if (!isAdmin(user) && user.userId !== id) {
      throw new PermissionError('Access denied');
    }

    await connectToDatabase();

    const targetUser = await User.findById(id).select('-password').lean();
    if (!targetUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: targetUser },
    });
  } catch (error) {
    console.error('User fetch error:', error);

    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: {
            code: error.name.toUpperCase().replace('ERROR', ''),
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    const body = await request.json();

    // Validate input
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    await connectToDatabase();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwnProfile = user.userId === id;
    const canManageUsers = isAdmin(user);

    if (!isOwnProfile && !canManageUsers) {
      throw new PermissionError('Access denied');
    }

    // Non-admin users can only update certain fields
    if (!canManageUsers) {
      const allowedFields = ['name', 'preferences'];
      const hasDisallowedFields = Object.keys(updateData).some(
        field => !allowedFields.includes(field)
      );

      if (hasDisallowedFields) {
        throw new PermissionError('Cannot modify restricted fields');
      }
    }

    // Update user
    const originalRoles = targetUser.roles;
    Object.assign(targetUser, updateData);
    await targetUser.save();

    // Log activity
    const logDetails: Record<string, unknown> = { updatedFields: Object.keys(updateData) };
    
    // Special logging for role changes
    if (updateData.roles && JSON.stringify(originalRoles) !== JSON.stringify(updateData.roles)) {
      await logActivity({
        userId: user.userId,
        action: ACTIVITY_ACTIONS.USER_ROLE_CHANGED,
        resource: ACTIVITY_RESOURCES.USER,
        resourceId: id,
        details: { 
          previousRoles: originalRoles, 
          newRoles: updateData.roles,
          targetUserId: id 
        },
        request,
      });
    }

    await logActivity({
      userId: user.userId,
      action: ACTIVITY_ACTIONS.USER_UPDATED,
      resource: ACTIVITY_RESOURCES.USER,
      resourceId: id,
      details: logDetails,
      request,
    });

    // Return user without password
    const userResponse = targetUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: { user: userResponse },
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('User update error:', error);

    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: {
            code: error.name.toUpperCase().replace('ERROR', ''),
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!isAdmin(user)) {
      throw new PermissionError('Admin access required');
    }

    // Prevent self-deletion
    if (user.userId === id) {
      return NextResponse.json(
        {
          error: {
            code: 'SELF_DELETE_ERROR',
            message: 'Cannot delete your own account',
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    targetUser.isActive = false;
    await targetUser.save();

    // Log activity
    await logActivity({
      userId: user.userId,
      action: ACTIVITY_ACTIONS.USER_DEACTIVATED,
      resource: ACTIVITY_RESOURCES.USER,
      resourceId: id,
      details: { targetUserEmail: targetUser.email },
      request,
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('User deletion error:', error);

    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: {
            code: error.name.toUpperCase().replace('ERROR', ''),
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}