import { z } from 'zod';

// Test Case validation schemas
export const testCaseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID').optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  component: z.string().min(1, 'Component is required').max(100),
  preconditions: z.string().max(1000, 'Preconditions must be less than 1000 characters').optional(),
  testSteps: z.array(z.object({
    step: z.number().min(1),
    action: z.string().min(1, 'Action is required').max(500),
    expectedResult: z.string().min(1, 'Expected result is required').max(500),
  })).min(1, 'At least one test step is required'),
  testData: z.string().max(1000, 'Test data must be less than 1000 characters').optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  automatable: z.boolean().default(false),
  estimatedTime: z.number().min(0).optional(),
});

export const testCaseUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  component: z.string().min(1, 'Component is required').max(100).optional(),
  preconditions: z.string().max(1000, 'Preconditions must be less than 1000 characters').optional(),
  testSteps: z.array(z.object({
    step: z.number().min(1),
    action: z.string().min(1, 'Action is required').max(500),
    expectedResult: z.string().min(1, 'Expected result is required').max(500),
  })).optional(),
  testData: z.string().max(1000, 'Test data must be less than 1000 characters').optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  automatable: z.boolean().optional(),
  estimatedTime: z.number().min(0).optional(),
});

// Test Suite validation schemas
export const testSuiteCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  testCases: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid test case ID')).default([]),
});

export const testSuiteUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
  testCases: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid test case ID')).optional(),
});

// Test Run validation schemas
export const testRunCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  suiteId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid test suite ID'),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  environment: z.enum(['prod', 'staging', 'dev']).default('dev'),
  plannedStartDate: z.string().datetime().optional(),
  plannedEndDate: z.string().datetime().optional(),
});

export const testRunUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
  environment: z.enum(['prod', 'staging', 'dev']).optional(),
  plannedStartDate: z.string().datetime().optional(),
  plannedEndDate: z.string().datetime().optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
});

// Test Result validation schemas
export const testResultUpdateSchema = z.object({
  testCaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid test case ID'),
  status: z.enum(['not_executed', 'passed', 'failed', 'blocked', 'skipped']),
  actualResult: z.string().max(2000, 'Actual result must be less than 2000 characters').optional(),
  duration: z.number().min(0).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const testResultBulkUpdateSchema = z.object({
  results: z.array(testResultUpdateSchema),
});

export const defectCreateSchema = z.object({
  testCaseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid test case ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  priority: z.enum(['p0', 'p1', 'p2', 'p3']).default('p2'),
  component: z.string().min(1, 'Component is required').max(100),
  environment: z.enum(['prod', 'staging', 'dev']).default('dev'),
  stepsToReproduce: z.string().max(2000, 'Steps must be less than 2000 characters').optional(),
  expectedResult: z.string().max(1000, 'Expected result must be less than 1000 characters').optional(),
  actualResult: z.string().max(1000, 'Actual result must be less than 1000 characters').optional(),
});

// Pagination and filtering schemas
export const testCaseListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').optional(),
  moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid module ID').optional(),
  component: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
});

export const testSuiteListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').optional(),
  search: z.string().optional(),
});

export const testRunListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
  environment: z.enum(['prod', 'staging', 'dev']).optional(),
  search: z.string().optional(),
});

// Export types
export type TestCaseCreate = z.infer<typeof testCaseCreateSchema>;
export type TestCaseUpdate = z.infer<typeof testCaseUpdateSchema>;
export type TestCaseList = z.infer<typeof testCaseListSchema>;

export type TestSuiteCreate = z.infer<typeof testSuiteCreateSchema>;
export type TestSuiteUpdate = z.infer<typeof testSuiteUpdateSchema>;
export type TestSuiteList = z.infer<typeof testSuiteListSchema>;

export type TestRunCreate = z.infer<typeof testRunCreateSchema>;
export type TestRunUpdate = z.infer<typeof testRunUpdateSchema>;
export type TestRunList = z.infer<typeof testRunListSchema>;

export type TestResultUpdate = z.infer<typeof testResultUpdateSchema>;
export type TestResultBulkUpdate = z.infer<typeof testResultBulkUpdateSchema>;
export type DefectCreate = z.infer<typeof defectCreateSchema>;