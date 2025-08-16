'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateTestCaseFormData {
  title: string;
  preconditions: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  tags: string;
  version: string;
}

interface CreateTestCaseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTestCaseModal({ onClose, onSuccess }: CreateTestCaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTestCaseFormData>({
    defaultValues: {
      title: '',
      preconditions: '',
      priority: 'medium',
      component: '',
      tags: '',
      version: '1.0',
    },
  });

  const onSubmit = async (data: CreateTestCaseFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create test case');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Test Case</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Test case title"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="preconditions" className="block text-sm font-medium text-foreground mb-2">
                Preconditions
              </label>
              <textarea
                id="preconditions"
                {...register('preconditions')}
                placeholder="Setup requirements and initial conditions"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label htmlFor="component" className="block text-sm font-medium text-foreground mb-2">
                  Component
                </label>
                <Input
                  id="component"
                  {...register('component')}
                  placeholder="Component or module"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="smoke, regression, api"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Test Case'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}