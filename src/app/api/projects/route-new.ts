import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Project } from "@/models/Project";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { hasPermission } from "@/lib/policies";
import { projectCreateSchema } from "@/lib/validations/projects";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

// GET /api/projects - List projects
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "read", "project")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get all projects for now (pagination can be added later)
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Projects GET error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "create", "project")) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = projectCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if project name already exists
    const existingProject = await Project.findOne({
      name: validation.data.name,
    });

    if (existingProject) {
      return NextResponse.json(
        {
          error: {
            code: "PROJECT_EXISTS",
            message: "A project with this name already exists",
          },
        },
        { status: 409 }
      );
    }

    const projectData = validation.data;

    // Ensure current user is in owners list
    if (!projectData.owners.includes(user.userId)) {
      projectData.owners.push(user.userId);
    }

    // Create project
    const project = new Project({
      ...projectData,
      createdBy: user.userId,
    });

    await project.save();

    // Revalidate cache
    revalidateTag("projects");

    return NextResponse.json(
      {
        success: true,
        data: { project },
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Projects POST error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
