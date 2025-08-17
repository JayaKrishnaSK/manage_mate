'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

interface TaskStatusCount {
  status: string;
  count: number;
}

interface TaskPriorityCount {
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  count: number;
}

export default function ProjectDashboardPage({ projectId }: { projectId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [taskStatusData, setTaskStatusData] = useState<TaskStatusCount[]>([]);
  const [taskPriorityData, setTaskPriorityData] = useState<TaskPriorityCount[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;

      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      try {
        // Fetch project dashboard data
        const response = await fetch(`/api/reports/project-summary/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project dashboard data');
        }
        const data = await response.json();
        
        setTaskStatusData(data.taskStatusCounts);
        setTaskPriorityData(data.taskPriorityCounts);
        setTotalTasks(data.totalTasks);
        setCompletedTasks(data.completedTasks);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, projectId]);

  // Colors for priority chart
  const priorityColors = {
    Critical: '#ef4444', // red
    High: '#f97316',     // orange
    Medium: '#eab308',   // yellow
    Low: '#22c55e',      // green
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Router will redirect to login
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <Button onClick={() => router.push(`/projects/${projectId}`)}>Back to Project</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedTasks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks - completedTasks}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Distribution of tasks across different statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of tasks across different priorities</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {taskPriorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPriorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ priority, count }) => `${priority}: ${count}`}
                  >
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.priority]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}