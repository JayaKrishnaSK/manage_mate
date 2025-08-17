import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";
import { z } from "zod";
import { getSessionUser } from "@/lib/utils";

// Zod schema for validating user updates
const updateUserSchema = z.object({
  systemRole: z.enum(["Admin", "User"], "Invalid role" ),
  }),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    const sessionUser = getSessionUser(session);

    // Check if the user is authenticated
    if (!sessionUser) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Check if the user has admin role
    if (sessionUser.systemRole !== "Admin") {
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await req.json();
    const { systemRole } = updateUserSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      id,
      { systemRole },
      { new: true, select: "-password" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    const sessionUser = getSessionUser(session);

    // Check if the user is authenticated
    if (!sessionUser) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Check if the user has admin role
    if (sessionUser.systemRole !== "Admin") {
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const { id } = params;

    // Connect to the database
    await dbConnect();

    // Check if trying to delete themselves
    if (id === sessionUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the user
    const result = await User.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
