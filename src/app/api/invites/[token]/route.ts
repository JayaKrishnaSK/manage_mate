import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Invite, IInvite } from '@/models/Invite';
import { User } from '@/models/User';
import { inviteAcceptSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth';
import { logActivity, ACTIVITY_ACTIONS, ACTIVITY_RESOURCES } from '@/lib/activity-logger';

export const runtime = 'nodejs';

// GET /api/invites/[token] - Verify invite token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    await connectToDatabase();

    const invite = await Invite.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).lean() as IInvite | null;

    if (!invite) {
      return NextResponse.json(
        {
          error: {
            code: 'INVITE_INVALID',
            message: 'Invalid or expired invite token',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invite.email,
        roles: invite.roles,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invite verification error:', error);

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

// POST /api/invites/[token] - Accept invite and create account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    // Validate input
    const validation = inviteAcceptSchema.safeParse({ ...body, token });
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

    const { name, password } = validation.data;

    await connectToDatabase();

    // Find and validate invite
    const invite = await Invite.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return NextResponse.json(
        {
          error: {
            code: 'INVITE_INVALID',
            message: 'Invalid or expired invite token',
          },
        },
        { status: 404 }
      );
    }

    // Check if user already exists (race condition protection)
    const existingUser = await User.findOne({ email: invite.email });
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = new User({
      name,
      email: invite.email,
      password: hashedPassword,
      roles: invite.roles,
      isActive: true,
    });

    await newUser.save();

    // Mark invite as used
    invite.isUsed = true;
    invite.usedAt = new Date();
    await invite.save();

    // Log activity
    await logActivity({
      userId: newUser._id.toString(),
      action: ACTIVITY_ACTIONS.INVITE_ACCEPTED,
      resource: ACTIVITY_RESOURCES.INVITE,
      resourceId: invite._id.toString(),
      details: { email: invite.email, roles: invite.roles },
      request,
    });

    await logActivity({
      userId: newUser._id.toString(),
      action: ACTIVITY_ACTIONS.USER_CREATED,
      resource: ACTIVITY_RESOURCES.USER,
      resourceId: newUser._id.toString(),
      details: { email: invite.email, roles: invite.roles, source: 'invite' },
      request,
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        data: { user: userResponse },
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite acceptance error:', error);

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
