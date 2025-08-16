import { JWTPayload } from './auth';

export type Role = 'admin' | 'manager' | 'qa_lead' | 'team_member' | 'guest';

export interface Permission {
  action: string;
  resource: string;
  condition?: (user: JWTPayload, resource?: unknown) => boolean;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { action: '*', resource: '*' }, // Admin has all permissions
  ],
  manager: [
    { action: 'read', resource: '*' },
    { action: 'create', resource: 'project' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { action: 'update', resource: 'project', condition: (user, project: any) => project?.managers?.includes(user.userId) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { action: 'delete', resource: 'project', condition: (user, project: any) => project?.managers?.includes(user.userId) },
    { action: 'create', resource: 'module' },
    { action: 'update', resource: 'module' },
    { action: 'delete', resource: 'module' },
    { action: 'create', resource: 'task' },
    { action: 'update', resource: 'task' },
    { action: 'delete', resource: 'task' },
    { action: 'create', resource: 'issue' },
    { action: 'update', resource: 'issue' },
    { action: 'triage', resource: 'issue' },
    { action: 'manage', resource: 'team' },
  ],
  qa_lead: [
    { action: 'read', resource: '*' },
    { action: 'create', resource: 'test_case' },
    { action: 'update', resource: 'test_case' },
    { action: 'delete', resource: 'test_case' },
    { action: 'create', resource: 'test_suite' },
    { action: 'update', resource: 'test_suite' },
    { action: 'delete', resource: 'test_suite' },
    { action: 'create', resource: 'test_run' },
    { action: 'update', resource: 'test_run' },
    { action: 'create', resource: 'issue' },
    { action: 'update', resource: 'issue' },
    { action: 'link', resource: 'defect' },
  ],
  team_member: [
    { action: 'read', resource: '*' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { action: 'update', resource: 'task', condition: (user, task: any) => task?.assignees?.includes(user.userId) },
    { action: 'create', resource: 'issue' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { action: 'update', resource: 'issue', condition: (user, issue: any) => issue?.assignees?.includes(user.userId) },
    { action: 'execute', resource: 'test_run' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { action: 'update', resource: 'profile', condition: (user, profile: any) => profile?.userId === user.userId },
  ],
  guest: [
    { action: 'read', resource: 'project' },
    { action: 'read', resource: 'task' },
    { action: 'read', resource: 'issue' },
    { action: 'read', resource: 'test_case' },
  ],
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  user: JWTPayload,
  action: string,
  resource: string,
  resourceData?: unknown
): boolean {
  // Check each role the user has
  for (const role of user.roles as Role[]) {
    const permissions = ROLE_PERMISSIONS[role];
    
    for (const permission of permissions) {
      // Check for wildcard permissions
      if (permission.action === '*' && permission.resource === '*') {
        return true;
      }
      
      // Check for exact matches
      if (permission.action === action && permission.resource === resource) {
        // If there's a condition, evaluate it
        if (permission.condition) {
          return permission.condition(user, resourceData);
        }
        return true;
      }
      
      // Check for wildcard action
      if (permission.action === '*' && permission.resource === resource) {
        if (permission.condition) {
          return permission.condition(user, resourceData);
        }
        return true;
      }
      
      // Check for wildcard resource
      if (permission.action === action && permission.resource === '*') {
        if (permission.condition) {
          return permission.condition(user, resourceData);
        }
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Middleware helper to check permissions in API routes
 */
export function requirePermission(action: string, resource: string) {
  return (user: JWTPayload, resourceData?: unknown) => {
    if (!hasPermission(user, action, resource, resourceData)) {
      throw new Error(`Insufficient permissions to ${action} ${resource}`);
    }
  };
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: JWTPayload, roles: Role[]): boolean {
  return user.roles.some(role => roles.includes(role as Role));
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.roles.includes('admin');
}

/**
 * Check if user is manager
 */
export function isManager(user: JWTPayload): boolean {
  return user.roles.includes('manager');
}

/**
 * Check if user is QA lead
 */
export function isQALead(user: JWTPayload): boolean {
  return user.roles.includes('qa_lead');
}