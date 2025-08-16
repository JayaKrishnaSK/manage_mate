'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'Active' | 'Archived';
  createdAt: string;
}

interface Member {
  _id: string;
  userId: string;
  projectId: string;
  role: 'Manager' | 'BA' | 'Developer' | 'QA' | 'Guest';
  user: {
    name: string;
    email: string;
  };
}

interface Module {
  _id: string;
  name: string;
  projectId: string;
  flowType: 'Waterfall' | 'Agile';
  ownerId: string;
  contributorIds: string[];
}

export default function ProjectDashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Member['role']>('Developer');
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleFlowType, setNewModuleFlowType] = useState<'Waterfall' | 'Agile'>('Waterfall');

  useEffect(() => {
    const fetchProject = async () => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Fetch project details
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching the project');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching members');
      }
    };

    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/modules`);
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data = await response.json();
        setModules(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while fetching modules');
      }
    };

    fetchProject();
    fetchMembers();
    fetchModules();
  }, [session, status, projectId, router]);

  const handleAddMember = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      const newMember = await response.json();
      setMembers([...members, newMember]);
      setNewMemberEmail('');
      setIsAddMemberOpen(false);
      toast.success('Member added successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while adding the member');
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${membershipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      setMembers(members.filter(member => member._id !== membershipId));
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while removing the member');
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: Member['role']) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${membershipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member role');
      }

      const updatedMember = await response.json();
      setMembers(members.map(member => 
        member._id === membershipId ? { ...member, ...updatedMember } : member
      ));
      toast.success('Member role updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while updating the member role');
    }
  };

  const handleCreateModule = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newModuleName,
          description: newModuleDescription,
          flowType: newModuleFlowType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create module');
      }

      const newModule = await response.json();
      setModules([...modules, newModule]);
      setNewModuleName('');
      setNewModuleDescription('');
      setIsCreateModuleOpen(false);
      toast.success('Module created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the module');
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null; // Router will redirect to login
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The requested project could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          {/* Add action buttons here, like "Edit Project", "Archive Project", etc. */}
          <Button variant="outline">Edit Project</Button>
          <Button>Manage Members</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Key information about this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-semibold">Status:</span> {project.status}</p>
              <p><span className="font-semibold">Created:</span> {new Date(project.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Owner:</span> {/* Owner name would be fetched separately */}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Manage project modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p>Modules organize your project work into manageable sections.</p>
              <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
                <DialogTrigger asChild>
                  <Button>Create Module</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Module</DialogTitle>
                    <DialogDescription>
                      Create a new module for this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="moduleName">Module Name</Label>
                      <Input
                        id="moduleName"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        placeholder="Module Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="moduleDescription">Description</Label>
                      <Textarea
                        id="moduleDescription"
                        value={newModuleDescription}
                        onChange={(e) => setNewModuleDescription(e.target.value)}
                        placeholder="Module Description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="flowType">Flow Type</Label>
                      <Select value={newModuleFlowType} onValueChange={(value) => setNewModuleFlowType(value as 'Waterfall' | 'Agile')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Waterfall">Waterfall</SelectItem>
                          <SelectItem value="Agile">Agile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateModule}>Create Module</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {modules.length === 0 ? (
              <p className="text-muted-foreground">No modules created yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module._id}>
                      <TableCell>{module.name}</TableCell>
                      <TableCell>{module.flowType}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${projectId}/modules/${module._id}`)}>
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p>Invite team members to collaborate on this project.</p>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button>Add Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to join this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as Member['role'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="Guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddMember}>Add Member</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {members.length === 0 ? (
              <p className="text-muted-foreground">No members added yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>{member.user.name}</TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => handleRoleChange(member._id, value as Member['role'])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="BA">BA</SelectItem>
                            <SelectItem value="Developer">Developer</SelectItem>
                            <SelectItem value="QA">QA</SelectItem>
                            <SelectItem value="Guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in this project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}