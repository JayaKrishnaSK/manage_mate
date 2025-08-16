import { z } from 'zod';

// Task validation schemas
export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID').optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).default([]),
  labels: z.array(z.string().trim().min(1)).default([]),
  estimatedHours: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
});

export const taskStatusUpdateSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done']),
});

export const taskBulkUpdateSchema = z.object({
  taskIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID')),
  updates: taskUpdateSchema,
});

export const taskTodoSchema = z.object({
  text: z.string().min(1, 'Todo text is required').max(500, 'Todo text must be less than 500 characters'),
});

// Issue validation schemas
export const issueCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  type: z.enum(['bug', 'incident', 'improvement', 'request']).default('bug'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']).default('p2'),
  components: z.array(z.string().trim().min(1)).default([]),
  environment: z.enum(['prod', 'staging', 'dev']).default('dev'),
  reproducible: z.boolean().default(false),
  stepsToReproduce: z.string().max(2000, 'Steps must be less than 2000 characters').optional(),
  expectedResult: z.string().max(1000, 'Expected result must be less than 1000 characters').optional(),
  actualResult: z.string().max(1000, 'Actual result must be less than 1000 characters').optional(),
  labels: z.array(z.string().trim().min(1)).default([]),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).default([]),
});

export const issueUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters').optional(),
  type: z.enum(['bug', 'incident', 'improvement', 'request']).optional(),
  status: z.enum(['new', 'triaged', 'in_progress', 'in_review', 'qa_testing', 'done', 'wontfix', 'duplicate']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']).optional(),
  components: z.array(z.string().trim().min(1)).optional(),
  environment: z.enum(['prod', 'staging', 'dev']).optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().max(2000, 'Steps must be less than 2000 characters').optional(),
  expectedResult: z.string().max(1000, 'Expected result must be less than 1000 characters').optional(),
  actualResult: z.string().max(1000, 'Actual result must be less than 1000 characters').optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
});

export const issueTriageSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')),
  status: z.enum(['triaged', 'in_progress']).default('triaged'),
});

export const issueLinkTaskSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
});

export const issueDuplicateSchema = z.object({
  masterIssueId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid issue ID'),
});

// Module validation schemas
export const moduleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  owners: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).min(1, 'At least one owner is required'),
  contributors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).default([]),
  dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID')).default([]),
  estimatedHours: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const moduleUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.enum(['planning', 'in_progress', 'testing', 'completed', 'on_hold']).optional(),
  owners: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  contributors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID')).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const moduleContributorSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;
export type TaskBulkUpdate = z.infer<typeof taskBulkUpdateSchema>;
export type TaskTodo = z.infer<typeof taskTodoSchema>;

export type IssueCreate = z.infer<typeof issueCreateSchema>;
export type IssueUpdate = z.infer<typeof issueUpdateSchema>;
export type IssueTriage = z.infer<typeof issueTriageSchema>;
export type IssueLinkTask = z.infer<typeof issueLinkTaskSchema>;
export type IssueDuplicate = z.infer<typeof issueDuplicateSchema>;

export type ModuleCreate = z.infer<typeof moduleCreateSchema>;
export type ModuleUpdate = z.infer<typeof moduleUpdateSchema>;
export type ModuleContributor = z.infer<typeof moduleContributorSchema>;