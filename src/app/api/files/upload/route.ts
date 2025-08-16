import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { LocalFsProvider } from '@/services/localFsProvider.service';
import File from '@/models/file.model';
import Module from '@/models/module.model';
import Task from '@/models/task.model';
import { hasProjectPermission } from '@/lib/auth/utils';
import { z } from "zod";

// Zod schema for validating file upload
const fileUploadSchema = z
  .object({
    moduleId: z.string().optional(),
    taskId: z.string().optional(),
  })
  .refine((data) => data.moduleId || data.taskId, {
    message: "Either moduleId or taskId must be provided",
  });

export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to access this resource' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;

    // Connect to the database
    await dbConnect();

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Validate input
    if (!file) {
      return new Response(JSON.stringify({ error: "File is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate form data
    const moduleId = (formData.get("moduleId") as string) || undefined;
    const taskId = (formData.get("taskId") as string) || undefined;
    fileUploadSchema.parse({ moduleId, taskId });

    // Determine the project ID based on module or task
    let projectId;
    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (!module) {
        return new Response(
          JSON.stringify({ error: 'Module not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      projectId = module.projectId;
    } else if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return new Response(
          JSON.stringify({ error: 'Task not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Find the module for this task to get the project ID
      const module = await Module.findById(task.moduleId);
      if (!module) {
        return new Response(
          JSON.stringify({ error: 'Module not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      projectId = module.projectId;
    }

    // Check if the user has permission to upload files to this project
    if (projectId) {
      const hasPermission = await hasProjectPermission(userId, projectId.toString(), 'Guest');
      if (!hasPermission) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to upload files to this project' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use the LocalFsProvider to save the file
    const storageService = new LocalFsProvider('./uploads');
    const fileUrl = await storageService.upload(buffer, file.name, file.type);

    // Create a file metadata document in the database
    const newFile = new File({
      fileName: fileUrl.split('/').pop(), // Extract filename from URL
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl,
      uploadedBy: userId,
      projectId: projectId || undefined,
      moduleId: moduleId || undefined,
      taskId: taskId || undefined,
    });

    await newFile.save();

    return new Response(
      JSON.stringify({ 
        message: 'File uploaded successfully',
        file: newFile
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error uploading file:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error.stack }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}