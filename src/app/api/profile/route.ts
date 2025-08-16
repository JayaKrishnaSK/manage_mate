import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/models/User';
import { getAuthenticatedUser, AuthError } from '@/lib/auth-helpers';
import { profileUpdateSchema } from '@/lib/validations/auth';
import { logActivity, ACTIVITY_ACTIONS, ACTIVITY_RESOURCES } from '@/lib/activity-logger';

export const runtime = 'nodejs';

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    await connectToDatabase();

    const userProfile = await User.findById(user.userId)
      .select('-password')
      .lean();

    if (!userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: userProfile },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error instanceof AuthError) {
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

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    const body = await request.json();

    // Validate input
    const validation = profileUpdateSchema.safeParse(body);
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

    const userProfile = await User.findById(user.userId);
    if (!userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
        },
        { status: 404 }
      );
    }

    // Update profile
    if (updateData.name) userProfile.name = updateData.name;
    if (updateData.avatar) userProfile.avatar = updateData.avatar;
    if (updateData.preferences) {
      userProfile.preferences = { ...userProfile.preferences, ...updateData.preferences };
    }

    await userProfile.save();

    // Log activity based on what was updated
    const updatedFields = Object.keys(updateData);
    
    if (updateData.avatar) {
      await logActivity({
        userId: user.userId,
        action: ACTIVITY_ACTIONS.AVATAR_UPDATED,
        resource: ACTIVITY_RESOURCES.PROFILE,
        resourceId: user.userId,
        details: { avatar: updateData.avatar },
        request,
      });
    }

    if (updateData.preferences) {
      await logActivity({
        userId: user.userId,
        action: ACTIVITY_ACTIONS.PREFERENCES_UPDATED,
        resource: ACTIVITY_RESOURCES.PROFILE,
        resourceId: user.userId,
        details: { preferences: updateData.preferences },
        request,
      });
    }

    await logActivity({
      userId: user.userId,
      action: ACTIVITY_ACTIONS.PROFILE_UPDATED,
      resource: ACTIVITY_RESOURCES.PROFILE,
      resourceId: user.userId,
      details: { updatedFields },
      request,
    });

    // Return user without password
    const userResponse = userProfile.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: { user: userResponse },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof AuthError) {
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
