import { NextRequest } from 'next/server';
import { JWTPayload } from './auth';

export function getAuthenticatedUser(request: NextRequest): JWTPayload | null {
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