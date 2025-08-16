import { NextRequest } from 'next/server';
import { auth } from "@/../auth";
import bcrypt from "bcryptjs";

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Get authenticated user from NextAuth session
export async function getAuthenticatedUser(): Promise<JWTPayload | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    return {
      userId: session.user.id!,
      email: session.user.email!,
      roles: session.user.roles || [],
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

// Legacy function - kept for backward compatibility but now returns null
// since we're using NextAuth sessions instead of request headers
export function getAuthenticatedUserFromHeaders(request: NextRequest): JWTPayload | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const rolesHeader = request.headers.get('x-user-roles');

  if (!userId || !email || !rolesHeader) {
    return null;
  }

  try {
    const roles = JSON.parse(rolesHeader);
    return {
      userId,
      email,
      roles,
    };
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class PermissionError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'PermissionError';
  }
}