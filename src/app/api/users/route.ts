import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { User } from '@/models/User';
import { getAuthenticatedUser, AuthError, PermissionError } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/policies';
import { userCreateSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
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
    const search = searchParams.get('search') || '';

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Users list error:', error);

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

// POST /api/users - Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!isAdmin(user)) {
      throw new PermissionError('Admin access required');
    }

    const body = await request.json();

    // Validate input
    const validation = userCreateSchema.safeParse(body);
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

    const { name, email, roles, isActive } = validation.data;

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

    // Generate a temporary password (should be changed on first login)
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(temporaryPassword);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      roles,
      isActive,
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userResponse,
          temporaryPassword, // In production, this should be sent via email
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('User creation error:', error);

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