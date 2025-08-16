import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError, PermissionError } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/policies';
import { getActivityLogs } from '@/lib/activity-logger';

export const runtime = 'nodejs';

// GET /api/activity-logs - Get activity logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!isAdmin(user)) {
      throw new PermissionError('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;

    const result = await getActivityLogs({
      userId,
      action,
      resource,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Activity logs fetch error:', error);

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
