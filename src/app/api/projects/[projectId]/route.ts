import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Project from "@/models/project.model";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const user = session.user.id;

    // Connect to the database
    await dbConnect();

    // Find all memberships for this project
    // Populate the user field with user details (name and email)
    const project = await Project.findById(projectId);

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
