import { z } from 'zod';

// Issue schemas
export const issueCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  type: z.enum(['bug', 'incident', 'improvement', 'request']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']),
  projectId: z.string().optional(),
  moduleId: z.string().optional(),
  assignees: z.array(z.string()).optional().default([]),
  components: z.array(z.string()).optional().default([]),
  environment: z.enum(['prod', 'staging', 'dev']).optional(),
  reproducible: z.boolean().optional().default(false),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  labels: z.array(z.string()).optional().default([]),
});

export const issueUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  type: z.enum(['bug', 'incident', 'improvement', 'request']).optional(),
  status: z.enum(['new', 'triaged', 'in_progress', 'in_review', 'qa_testing', 'done', 'wontfix', 'duplicate']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']).optional(),
  assignees: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  environment: z.enum(['prod', 'staging', 'dev']).optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  labels: z.array(z.string()).optional(),
  duplicateOf: z.string().optional(),
});

export const issueTriageSchema = z.object({
  status: z.enum(['triaged', 'in_progress', 'wontfix', 'duplicate']),
  assignees: z.array(z.string()).optional(),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  duplicateOf: z.string().optional(),
  triageNotes: z.string().optional(),
});

// Comment schema for issues
export const issueCommentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty').max(2000),
  mentions: z.array(z.string()).optional().default([]),
});

// Types
export type IssueCreateInput = z.infer<typeof issueCreateSchema>;
export type IssueUpdateInput = z.infer<typeof issueUpdateSchema>;
export type IssueTriageInput = z.infer<typeof issueTriageSchema>;
export type IssueCommentInput = z.infer<typeof issueCommentSchema>;