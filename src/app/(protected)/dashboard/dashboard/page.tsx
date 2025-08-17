"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSessionUser } from "@/lib/utils";

interface Task {
  _id: string;
  title: string;
  moduleId: string;
  assigneeId: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  startDate: string;
  deadline: string;
  hasConflict: boolean;
  description?: string;
  status?: string;
}

interface Project {
  _id: string;
  name: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "overdue" | "today" | "upcoming"
  >("all");

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return;

      if (!getSessionUser(session)) {
        router.push("/login");
        return;
      }

      try {
        // Fetch user's tasks
        const tasksResponse = await fetch("/api/tasks/my-tasks");
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        // Fetch projects (for display purposes)
        const projectsResponse = await fetch("/api/projects");
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!getSessionUser(session)) {
    return null; // Router will redirect to login
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);

    switch (filter) {
      case "overdue":
        return deadline < now;
      case "today":
        return deadline.toDateString() === now.toDateString();
      case "upcoming":
        return deadline > now;
      default:
        return true;
    }
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="flex gap-2">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push("/todos")}>Personal To-Dos</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              Tasks assigned to you across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No tasks assigned to you."
                  : `No ${filter} tasks.`}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow
                      key={task._id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => router.push(`/tasks/${task._id}`)}
                    >
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        {/* In a real app, you would map task.moduleId to project name */}
                        Project Name
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            task.priority === "Critical"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "High"
                              ? "bg-orange-100 text-orange-800"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        {task.status ? (
                          <span className="capitalize">{task.status}</span>
                        ) : (
                          "Not started"
                        )}
                        {task.hasConflict && (
                          <span className="text-red-500 text-xs font-medium ml-2">
                            Conflict
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
