import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import { Invite } from '@/models/Invite';
import { User } from '@/models/User';
import { getAuthenticatedUser, AuthError, PermissionError } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/policies';
import { inviteCreateSchema } from '@/lib/validations/auth';
import { logActivity, ACTIVITY_ACTIONS, ACTIVITY_RESOURCES } from '@/lib/activity-logger';

export const runtime = 'nodejs';

// GET /api/invites - List invites (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!isAdmin(user)) {
      throw new PermissionError('Admin access required');
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'pending', 'used', 'expired'

    const query: Record<string, unknown> = {};
    
    if (status === 'pending') {
      query.isUsed = false;
      query.expiresAt = { $gt: new Date() };
    } else if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'expired') {
      query.isUsed = false;
      query.expiresAt = { $lte: new Date() };
    }

    const [invites, total] = await Promise.all([
      Invite.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invite.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        invites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Invites list error:', error);

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

// POST /api/invites - Send invite (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!isAdmin(user)) {
      throw new PermissionError('Admin access required');
    }

    const body = await request.json();

    // Validate input
    const validation = inviteCreateSchema.safeParse(body);
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

    const { email, roles } = validation.data;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // Check if pending invite already exists
    const existingInvite = await Invite.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return NextResponse.json(
        {
          error: {
            code: 'INVITE_EXISTS',
            message: 'A pending invite for this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = new Invite({
      email,
      roles,
      token,
      expiresAt,
      invitedBy: user.userId,
    });

    await invite.save();

    // Log activity
    await logActivity({
      userId: user.userId,
      action: ACTIVITY_ACTIONS.INVITE_SENT,
      resource: ACTIVITY_RESOURCES.INVITE,
      resourceId: invite._id.toString(),
      details: { email, roles },
      request,
    });

    // In production, send email here
    const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          invite: {
            email,
            roles,
            expiresAt,
            inviteLink, // In production, this should be sent via email only
          },
        },
        message: 'Invite sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite creation error:', error);

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
