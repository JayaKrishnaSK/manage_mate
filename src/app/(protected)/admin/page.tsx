'use client';

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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  owner: z.string().min(1, {
    message: "Please select a project owner.",
  }),
  managers: z.array(z.string()).min(1, {
    message: "Please select at least one project manager.",
  }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      owner: "",
      managers: [],
    },
  });

  // Fetch users for owner/manager selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const userData = await response.json();
        setUsers(userData);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching users"
        );
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  async function onSubmit(data: ProjectFormValues) {
    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      toast.success("Project created successfully!");
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the project"
      );
    } finally {
      setIsCreating(false);
    }
  }

  // Handle manager selection
  const handleManagerChange = (userId: string, checked: boolean) => {
    const currentManagers = form.getValues("managers") || [];
    if (checked) {
      form.setValue("managers", [...currentManagers, userId]);
    } else {
      form.setValue(
        "managers",
        currentManagers.filter((id) => id !== userId)
      );
    }
  };

  if (session?.user?.systemRole !== "Admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Enter the details for your new project. Assign an owner and
                managers.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Name"
                          {...field}
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Description"
                          {...field}
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Owner</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCreating}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Project Managers</FormLabel>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={user._id}
                          checked={
                            form.watch("managers")?.includes(user._id) || false
                          }
                          onCheckedChange={(checked) =>
                            handleManagerChange(user._id, !!checked)
                          }
                          disabled={isCreating}
                        />
                        <label
                          htmlFor={user._id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {user.name} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage all projects in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Project list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}