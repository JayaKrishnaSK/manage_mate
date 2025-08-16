'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, UserMinus, Edit } from 'lucide-react';

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'manager' | 'qa_lead' | 'member' | 'guest';
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TeamManagementProps {
  projectId: string;
}

export function TeamManagement({ projectId }: TeamManagementProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'qa_lead' | 'member' | 'guest'>('member');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMembers(result.data.members || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAllUsers(result.data.users || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, [projectId]);

  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole) {
      alert('Please select a user and role');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddMemberModal(false);
        setSelectedUser('');
        setSelectedRole('member');
        fetchMembers();
      } else {
        alert(result.error?.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        fetchMembers();
      } else {
        alert(result.error?.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'qa_lead':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'guest':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'qa_lead' ? 'QA Lead' : role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Filter available users (not already members)
  const availableUsers = allUsers.filter(user => 
    !members.some(member => member._id === user._id)
  );

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                         member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-muted-foreground">Loading team members...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <CardTitle>Team Members</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              
              {/* Role Filter */}
              <div className="flex gap-2">
                {['all', 'owner', 'manager', 'qa_lead', 'member', 'guest'].map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                  >
                    {role === 'all' ? 'All' : getRoleLabel(role)}
                  </Button>
                ))}
              </div>
              
              <Button onClick={() => setShowAddMemberModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                {search || roleFilter !== 'all' 
                  ? 'No members match your filters' 
                  : 'Start by adding team members to your project'
                }
              </p>
              {!search && roleFilter === 'all' && (
                <Button onClick={() => setShowAddMemberModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{member.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <Badge className={getRoleColor(member.role)} style={{ marginTop: '4px' }}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {member.role !== 'owner' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{members.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {members.filter(m => m.role === 'owner').length}
              </div>
              <div className="text-sm text-muted-foreground">Owners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {members.filter(m => m.role === 'manager').length}
              </div>
              <div className="text-sm text-muted-foreground">Managers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.role === 'member').length}
              </div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {members.filter(m => m.role === 'qa_lead').length}
              </div>
              <div className="text-sm text-muted-foreground">QA Leads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Team Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                >
                  <option value="member">Member</option>
                  <option value="qa_lead">QA Lead</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUser('');
                    setSelectedRole('member');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!selectedUser}>
                  Add Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}