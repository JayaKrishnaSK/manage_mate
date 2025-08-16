import dbConnect from '@/lib/db';
import ProjectMembership from '@/models/projectMembership.model';

/**
 * Checks if a user has the required role or higher for a specific project.
 * @param userId The ID of the user.
 * @param projectId The ID of the project.
 * @param requiredRole The minimum role required.
 * @returns True if the user has the required role or higher, false otherwise.
 */
export async function hasProjectPermission(
  userId: string,
  projectId: string,
  requiredRole: 'Guest' | 'QA' | 'Developer' | 'BA' | 'Manager'
): Promise<boolean> {
  // Define role hierarchy (higher index means higher privilege)
  const roleHierarchy = ['Guest', 'QA', 'Developer', 'BA', 'Manager'];
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  if (requiredRoleIndex === -1) {
    throw new Error(`Invalid role: ${requiredRole}`);
  }

  try {
    await dbConnect();

    // Find the user's membership in the project
    const membership = await ProjectMembership.findOne({ userId, projectId });

    if (!membership) {
      return false; // User is not a member of the project
    }

    const userRoleIndex = roleHierarchy.indexOf(membership.role);

    // Check if the user's role is equal to or higher than the required role
    return userRoleIndex >= requiredRoleIndex;
  } catch (error) {
    console.error('Error checking project permission:', error);
    return false;
  }
}