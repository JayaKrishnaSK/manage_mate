'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface Todo {
  _id: string;
  content: string;
  isCompleted: boolean;
  completedAt: string | null;
  linkedResourceType?: 'Project' | 'Module' | 'Task' | null;
  linkedResourceId?: string | null;
  linkedResource?: {
    title: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TodosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      if (status === 'loading') return;

      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch('/api/todos');
        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching todos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [session, status, router]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTodo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add todo');
      }

      const newTodoItem = await response.json();
      setTodos([newTodoItem, ...todos]);
      setNewTodo('');
      toast.success('To-do added successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while adding the to-do');
    }
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
      toast.success('To-do updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while updating the to-do');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete todo');
      }

      setTodos(todos.filter(todo => todo._id !== id));
      toast.success('To-do deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the to-do');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
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
        <h1 className="text-3xl font-bold">Personal To-Dos</h1>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New To-Do</CardTitle>
            <CardDescription>Create a new personal to-do item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What needs to be done?"
                className="flex-1"
              />
              <Button onClick={addTodo}>Add</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My To-Dos</CardTitle>
            <CardDescription>Manage your personal to-do list</CardDescription>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <p className="text-muted-foreground">No to-dos yet. Add one above!</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li 
                    key={todo._id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.isCompleted}
                        onCheckedChange={() => toggleTodo(todo._id, todo.isCompleted)}
                      />
                      <span className={todo.isCompleted ? 'line-through text-muted-foreground' : ''}>
                        {todo.content}
                      </span>
                      {todo.linkedResource && (
                        <a 
                          href={todo.linkedResource.url} 
                          className="text-blue-500 hover:underline text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ({todo.linkedResource.title})
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}