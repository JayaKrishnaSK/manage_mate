"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, X } from "lucide-react";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  _id: string;
  name: string;
}

// Custom Multi-Select Component
interface MultiSelectProps {
  options: User[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hasError?: boolean;
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select users...",
  hasError = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (userId: string) => {
    const newValue = value.includes(userId)
      ? value.filter((id) => id !== userId)
      : [...value, userId];
    onChange(newValue);
  };

  const removeUser = (userId: string) => {
    onChange(value.filter((id) => id !== userId));
  };

  const selectedUsers = options.filter((user) => value.includes(user._id));

  return (
    <div className="relative">
      <div
        className={`
          flex min-h-[48px] w-full rounded-md border bg-white px-3 py-2 text-sm cursor-pointer
          focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
          ${
            hasError
              ? "border-red-500 ring-red-500"
              : "border-input hover:border-gray-400"
          }
          transition-colors
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedUsers.length > 0 ? (
            selectedUsers.map((user) => (
              <span
                key={user._id}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium"
              >
                {user.name}
                <X
                  size={12}
                  className="cursor-pointer hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user._id);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ml-2 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No users available
            </div>
          ) : (
            options.map((user) => (
              <div
                key={user._id}
                className={`
                  px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors
                  ${
                    value.includes(user._id)
                      ? "bg-gray-50 text-gray-900 font-medium"
                      : "text-gray-700"
                  }
                `}
                onClick={() => handleToggle(user._id)}
              >
                <div className="flex items-center justify-between">
                  <span>{user.name}</span>
                  {value.includes(user._id) && (
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users on mount
  useState(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(({ data }) => {
        setUsers(Array.isArray(data.users) ? data.users : []);
      })
      .catch(() => {
        setUsers([]);
      });
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      template: "agile" as const,
      priority: "medium" as const,
      components: "",
      startDate: "",
      endDate: "",
      owners: [] as string[],
      managers: [] as string[],
      qaLeads: [] as string[],
      members: [] as string[],
      guestUsers: [] as string[],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to create project");
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (formErrors) => {
              console.error("Form validation errors:", formErrors);
            })}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Basic Information
              </h3>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Project Name *
                </label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Project name is required",
                  })}
                  placeholder="Enter project name"
                  className={
                    errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  rows={3}
                  className={`
                    flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background 
                    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                    disabled:cursor-not-allowed disabled:opacity-50 transition-colors
                    ${
                      errors.description
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input focus-visible:ring-ring hover:border-gray-400"
                    }
                  `}
                  placeholder="Enter project description"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Owners */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Owners *
                </label>
                <MultiSelect
                  options={users}
                  value={watchedValues.owners}
                  onChange={(value) => setValue("owners", value)}
                  placeholder="Select project owners..."
                  hasError={!!errors.owners}
                />
                {errors.owners && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.owners.message}
                  </p>
                )}
              </div>

              {/* Managers */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Managers
                </label>
                <MultiSelect
                  options={users}
                  value={watchedValues.managers}
                  onChange={(value) => setValue("managers", value)}
                  placeholder="Select project managers..."
                  hasError={!!errors.managers}
                />
                {errors.managers && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.managers.message}
                  </p>
                )}
              </div>

              {/* Members */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Members
                </label>
                <MultiSelect
                  options={users}
                  value={watchedValues.members}
                  onChange={(value) => setValue("members", value)}
                  placeholder="Select project members..."
                  hasError={!!errors.members}
                />
                {errors.members && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.members.message}
                  </p>
                )}
              </div>

              {/* Guest Users */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Guest Users
                </label>
                <MultiSelect
                  options={users}
                  value={watchedValues.guestUsers}
                  onChange={(value) => setValue("guestUsers", value)}
                  placeholder="Select guest users..."
                  hasError={!!errors.guestUsers}
                />
                {errors.guestUsers && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.guestUsers.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="template"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Template
                  </label>
                  <select
                    id="template"
                    {...register("template")}
                    className={`
                      flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors 
                      focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50
                      cursor-pointer hover:border-gray-400
                      ${
                        errors.template
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-input focus-visible:ring-ring"
                      }
                    `}
                  >
                    <option value="agile">Agile</option>
                    <option value="waterfall">Waterfall</option>
                    <option value="kanban">Kanban</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.template && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.template.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    {...register("priority")}
                    className={`
                      flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors 
                      focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50
                      cursor-pointer hover:border-gray-400
                      ${
                        errors.priority
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-input focus-visible:ring-ring"
                      }
                    `}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className={
                      errors.startDate
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className={
                      errors.endDate
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.endDate && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Components
              </h3>
              <div>
                <label
                  htmlFor="components"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Project Components (comma-separated)
                </label>
                <Input
                  id="components"
                  placeholder="Frontend, Backend, API, Database"
                  {...register("components")}
                  className={
                    errors.components
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter component names separated by commas
                </p>
                {errors.components && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.components.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-600">{error}</div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}