'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart } from 'recharts';

interface ProjectTaskCount {
  projectName: string;
  taskCount: number;
}

interface WeeklyTaskCount {
  date: string;
  count: number;
}

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projectTaskData, setProjectTaskData] = useState<ProjectTaskCount[]>([]);
  const [weeklyTaskData, setWeeklyTaskData] = useState<WeeklyTaskCount[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user dashboard data
        const response = await fetch('/api/reports/user-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch user dashboard data');
        }
        const data = await response.json();
        
        setProjectTaskData(data.projectTaskCounts);
        setWeeklyTaskData(data.weeklyTaskCounts);
        setTotalProjects(data.totalProjects);
        setTotalTasks(data.totalTasks);
        setCompletedTasks(data.completedTasks);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null; // Router will redirect to login
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button onClick={() => router.push('/dashboard')}>Back to Main Dashboard</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProjects}</p>
          </CardContent>
        </Card>
        
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Project</CardTitle>
            <CardDescription>Number of tasks assigned to you in each project</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectTaskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectTaskData}>
                  <XAxis dataKey="projectName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taskCount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed This Week</CardTitle>
            <CardDescription>Your task completion trend over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {weeklyTaskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTaskData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
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