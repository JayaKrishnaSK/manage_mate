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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  _id: string;
  title: string;
  moduleId: string;
  assigneeId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  startDate: string;
  deadline: string;
  hasConflict: boolean;
  status?: string;
}

export default function MyTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/tasks/my-tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [session, status, router]);

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    switch (filter) {
      case 'overdue':
        return deadline < now;
      case 'today':
        return deadline.toDateString() === now.toDateString();
      case 'upcoming':
        return deadline > now;
      default:
        return true;
    }
  });

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'orange';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'blue';
      case 'review': return 'purple';
      case 'done': return 'green';
      default: return 'secondary';
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Tasks assigned to you</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No tasks assigned to you.' : `No ${filter} tasks.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow 
                    key={task._id} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/tasks/${task._id}`)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status || 'Not Started'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                      {task.hasConflict && (
                        <span className="ml-2 text-destructive text-xs">Conflict</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tasks/${task._id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}