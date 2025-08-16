/**
 * Permission map defining what actions each project-level role can perform.
 * This map is used by the RBAC middleware to authorize requests.
 */
export const PROJECT_PERMISSIONS = {
  Guest: [
    'viewProject',
    'viewTasksAssigned',
  ],
  QA: [
    'viewProject',
    'viewTasksAssigned',
    'updateOwnTasks',
  ],
  Developer: [
    'viewProject',
    'viewTasksAssigned',
    'updateOwnTasks',
    'createTasks',
    'commentOnTasks',
  ],
  BA: [
    'viewProject',
    'viewAllTasks',
    'createTasks',
    'updateTasks',
    'commentOnTasks',
    'createModules',
  ],
  Manager: [
    'viewProject',
    'viewAllTasks',
    'createTasks',
    'updateTasks',
    'deleteTasks',
    'commentOnTasks',
    'createModules',
    'updateModules',
    'deleteModules',
    'addMembers',
    'removeMembers',
    'updateMemberRoles',
  ],
};