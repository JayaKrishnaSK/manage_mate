"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/utils";

interface TimeLog {
  _id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  hours: number;
  description?: string;
}

export default function TimesheetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchTimeLogs = async () => {
      if (status === "loading") return;

      if (!getSessionUser(session)) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/timelogs");
        if (!response.ok) {
          throw new Error("Failed to fetch time logs");
        }
        const data = await response.json();
        setTimeLogs(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching time logs"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeLogs();
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

  // Filter time logs by selected date
  const filteredTimeLogs = date
    ? timeLogs.filter(
        (log) => new Date(log.date).toDateString() === date.toDateString()
      )
    : timeLogs;

  // Calculate total hours for the selected date
  const totalHours = filteredTimeLogs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Timesheet</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button variant="outline">Export to Excel</Button>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Time Logs</CardTitle>
              <CardDescription>Track time spent on tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {timeLogs.length === 0 ? (
                <p className="text-muted-foreground">
                  No time logs recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimeLogs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>
                            {new Date(log.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{log.taskTitle}</TableCell>
                          <TableCell>{log.hours}</TableCell>
                          <TableCell>{log.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center">
                    <p>Total hours: {totalHours.toFixed(2)}</p>
                    <Button>Add Time Log</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View time logs by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-4">
                    {date ? date.toLocaleDateString() : "Select a date"}
                  </h3>
                  {filteredTimeLogs.length === 0 ? (
                    <p className="text-muted-foreground">
                      No time logs for this date.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredTimeLogs.map((log) => (
                        <div key={log._id} className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">{log.taskTitle}</span>
                            <span>{log.hours} hours</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.description || "No description"}
                          </p>
                        </div>
                      ))}
                      <p className="font-semibold">
                        Total: {totalHours.toFixed(2)} hours
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
