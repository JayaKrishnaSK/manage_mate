'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateIssueFormData {
  title: string;
  description: string;
  type: 'bug' | 'incident' | 'improvement' | 'request';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  environment: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
}

interface CreateIssueModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateIssueModal({ onClose, onSuccess }: CreateIssueModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIssueFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'bug',
      severity: 'medium',
      priority: 'p2',
      environment: '',
      stepsToReproduce: '',
      expectedResult: '',
      actualResult: '',
    },
  });

  const onSubmit = async (data: CreateIssueFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create issue');
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
          <CardTitle>Create New Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the issue"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Issue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="bug">Bug</option>
                  <option value="incident">Incident</option>
                  <option value="improvement">Improvement</option>
                  <option value="request">Request</option>
                </select>
                {errors.type && (
                  <p className="mt-2 text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-foreground mb-2">
                  Severity *
                </label>
                <select
                  id="severity"
                  {...register('severity')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                {errors.severity && (
                  <p className="mt-2 text-sm text-destructive">{errors.severity.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="p0">P0 (Critical)</option>
                  <option value="p1">P1 (High)</option>
                  <option value="p2">P2 (Medium)</option>
                  <option value="p3">P3 (Low)</option>
                </select>
                {errors.priority && (
                  <p className="mt-2 text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="environment" className="block text-sm font-medium text-foreground mb-2">
                  Environment
                </label>
                <select
                  id="environment"
                  {...register('environment')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select environment</option>
                  <option value="prod">Production</option>
                  <option value="staging">Staging</option>
                  <option value="dev">Development</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-foreground mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  id="stepsToReproduce"
                  {...register('stepsToReproduce')}
                  placeholder="1. Step one
2. Step two
3. Step three"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="expectedResult" className="block text-sm font-medium text-foreground mb-2">
                  Expected Result
                </label>
                <textarea
                  id="expectedResult"
                  {...register('expectedResult')}
                  placeholder="What should happen"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="actualResult" className="block text-sm font-medium text-foreground mb-2">
                  Actual Result
                </label>
                <textarea
                  id="actualResult"
                  {...register('actualResult')}
                  placeholder="What actually happens"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
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
                {isLoading ? 'Creating...' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}