import { z } from "zod";

// Custom date regex for validation (MM/DD/YYYY)
const CUSTOM_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Project schemas
export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  template: z.enum(["agile", "waterfall", "kanban", "custom"]).default("agile"),
  owners: z.array(z.string()).min(1, "At least one owner is required"),
  managers: z.array(z.string()).optional().default([]),
  qaLeads: z.array(z.string()).optional().default([]),
  members: z.array(z.string()).optional().default([]),
  guestUsers: z.array(z.string()).optional().default([]),
  components: z.string().optional().default(""),
  startDate: z
    .string()
    .regex(CUSTOM_DATE_REGEX, "Invalid start date format")
    .optional(),
  endDate: z
    .string()
    .regex(CUSTOM_DATE_REGEX, "Invalid end date format")
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).optional(),
  template: z.enum(["agile", "waterfall", "kanban", "custom"]).optional(),
  owners: z.array(z.string()).min(1).optional(),
  managers: z.array(z.string()).optional(),
  qaLeads: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  guestUsers: z.array(z.string()).optional(),
  components: z.string().optional().default(""),
  startDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  endDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

// Module schemas
export const moduleCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Module name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  owners: z.array(z.string()).min(1, "At least one owner is required"),
  contributors: z.array(z.string()).optional().default([]),
  dependencies: z.array(z.string()).optional().default([]),
  startDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  endDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const moduleUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z
    .enum(["planning", "in_progress", "testing", "completed", "on_hold"])
    .optional(),
  owners: z.array(z.string()).min(1).optional(),
  contributors: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  startDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  endDate: z.string().regex(CUSTOM_DATE_REGEX).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Project member management
export const projectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z
    .enum(["owner", "manager", "qa_lead", "member", "guest"])
    .default("member"),
});

// Types
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type ModuleUpdateInput = z.infer<typeof moduleUpdateSchema>;
export type ProjectMemberInput = z.infer<typeof projectMemberSchema>;
