'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  status?: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (status === "loading") return;

      if (!getSessionUser(session)) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/tasks/my-tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching tasks"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [session, status, router]);

  // Get priority color
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "orange";
      case "Medium":
        return "yellow";
      case "Low":
        return "green";
      default:
        return "default";
    }
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Days from previous month to show
    const startDay = firstDay.getDay();
    // Total days to display (6 weeks)
    const totalDays = 42;

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Format day of week
  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Format day
  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!getSessionUser(session)) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your tasks and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 py-2 bg-muted rounded-md">
            <span className="font-medium">{formatMonthYear(currentDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-px border-b bg-muted">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-px bg-muted">
                {calendarDays.map((dayObj, index) => {
                  const dayTasks = getTasksForDate(dayObj.date);
                  const isToday =
                    dayObj.date.toDateString() === today.toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 bg-background p-1 ${
                        !dayObj.isCurrentMonth ? "text-muted-foreground" : ""
                      }`}
                    >
                      <div
                        className={`text-right p-1 text-sm ${
                          isToday
                            ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-auto"
                            : ""
                        }`}
                      >
                        {formatDay(dayObj.date)}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            className="text-xs p-1 bg-muted rounded cursor-pointer hover:bg-muted/80 truncate"
                            onClick={() => router.push(`/tasks/${task._id}`)}
                          >
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={getPriorityColor(task.priority)}
                                className="w-2 h-2 p-0 rounded-full"
                              />
                              <span className="truncate">{task.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.filter((task) => {
                const deadline = new Date(task.deadline);
                const now = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(now.getDate() + 7);
                return deadline >= now && deadline <= nextWeek;
              }).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming deadlines
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks
                      .filter((task) => {
                        const deadline = new Date(task.deadline);
                        const now = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(now.getDate() + 7);
                        return deadline >= now && deadline <= nextWeek;
                      })
                      .sort(
                        (a, b) =>
                          new Date(a.deadline).getTime() -
                          new Date(b.deadline).getTime()
                      )
                      .map((task) => (
                        <TableRow
                          key={task._id}
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => router.push(`/tasks/${task._id}`)}
                        >
                          <TableCell className="font-medium">
                            {task.title}
                          </TableCell>
                          <TableCell>
                            {new Date(task.deadline).toLocaleDateString()}
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
    </div>
  );
}