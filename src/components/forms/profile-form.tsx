'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string | null;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name,
      avatar: user.avatar || '',
      preferences: user.preferences,
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Basic Information</h2>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 bg-muted"
          />
          <p className="mt-1 text-sm text-muted-foreground">Email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-foreground">
            Avatar URL
          </label>
          <Input
            id="avatar"
            type="url"
            {...register('avatar')}
            className="mt-1"
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar && (
            <p className="mt-2 text-sm text-destructive">{errors.avatar.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Roles</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {role.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Preferences</h2>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="notifications"
              type="checkbox"
              {...register('preferences.notifications')}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-foreground">
              Receive in-app notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="emailUpdates"
              type="checkbox"
              {...register('preferences.emailUpdates')}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="emailUpdates" className="ml-2 block text-sm text-foreground">
              Receive email updates
            </label>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-foreground">
              Theme
            </label>
            <select
              id="theme"
              {...register('preferences.theme')}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            {errors.preferences?.theme && (
              <p className="mt-2 text-sm text-destructive">{errors.preferences.theme.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 p-4">
          <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
