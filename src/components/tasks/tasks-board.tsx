'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';

export interface Task {
  _id: string;
  projectId: { _id: string; name: string };
  moduleId?: { _id: string; name: string };
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: Array<{ _id: string; name: string; email: string }>;
  reporter: { _id: string; name: string; email: string };
  labels: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { id: 'in_review', title: 'In Review', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 'testing', title: 'Testing', color: 'bg-purple-100 dark:bg-purple-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900/20' },
];

export function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '100', // Get more tasks for Kanban view
        ...(search && { search }),
        ...(selectedProject !== 'all' && { projectId: selectedProject }),
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTasks(result.data.tasks || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, selectedProject]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status).sort((a, b) => a.order - b.order);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <CardTitle>Task Board</CardTitle>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="flex items-center space-x-2 flex-1 lg:flex-initial">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[600px]">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <Card className={column.color}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Tasks in Column */}
              <div className="space-y-3 min-h-[500px]">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <Card 
                      key={task._id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm line-clamp-2">
                            {task.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {task.projectId?.name}
                          </div>
                          <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((assignee) => (
                              <div
                                key={assignee._id}
                                className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                                title={assignee.name}
                              >
                                <span className="text-xs font-medium">
                                  {assignee.name.charAt(0)}
                                </span>
                              </div>
                            ))}
                            {task.assignees.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs">
                                  +{task.assignees.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                            {task.labels.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.labels.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {tasks.length} tasks across all columns
      </div>
    </div>
  );
}