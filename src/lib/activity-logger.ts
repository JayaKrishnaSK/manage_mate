import { NextRequest } from 'next/server';
import connectToDatabase from './db';
import { ActivityLog, IActivityLog } from '@/models/ActivityLog';

export interface LogActivityParams {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
}

/**
 * Log user activity for audit purposes
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectToDatabase();

    const activityData = {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.request?.headers.get('x-forwarded-for') || params.request?.headers.get('x-real-ip') || 'unknown',
      userAgent: params.request?.headers.get('user-agent') || 'unknown',
    };

    await ActivityLog.create(activityData);
  } catch (error) {
    // Log error but don't throw to avoid breaking main functionality
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get activity logs for a user (admin only)
 */
export async function getActivityLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  page?: number;
  limit?: number;
}): Promise<{
  logs: IActivityLog[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  await connectToDatabase();

  const { userId, action, resource, page = 1, limit = 20 } = filters;

  const query: Record<string, unknown> = {};
  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (resource) query.resource = resource;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return {
    logs: logs as unknown as IActivityLog[],
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Predefined activity actions for consistency
 */
export const ACTIVITY_ACTIONS = {
  // Auth actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_COMPLETE: 'password_reset_complete',
  
  // User management actions
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DEACTIVATED: 'user_deactivated',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // Invite actions
  INVITE_SENT: 'invite_sent',
  INVITE_ACCEPTED: 'invite_accepted',
  INVITE_EXPIRED: 'invite_expired',
  
  // Profile actions
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_UPDATED: 'avatar_updated',
  PREFERENCES_UPDATED: 'preferences_updated',
} as const;

/**
 * Predefined resource types for consistency
 */
export const ACTIVITY_RESOURCES = {
  USER: 'user',
  INVITE: 'invite',
  PROFILE: 'profile',
  SESSION: 'session',
} as const;
