import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TodoService } from '@/services/todo.service';
import { getSessionUser } from "@/lib/utils";

export async function GET(
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

    const { id } = params;

    // Get the todo
    const todos = await TodoService.getTodos(sessionUser.id);
    const todo = todos.find((t) => t._id.toString() === id);

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { id } = params;
    const updates = await req.json();

    // Update the todo
    const todo = await TodoService.updateTodo(sessionUser.id, id, updates);

    return NextResponse.json(todo);
  } catch (error: any) {
    console.error("Error updating todo:", error);

    if (error.message === "Todo not found") {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
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

    const { id } = params;

    // Delete the todo
    await TodoService.deleteTodo(sessionUser.id, id);

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting todo:", error);

    if (error.message === "Todo not found") {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}