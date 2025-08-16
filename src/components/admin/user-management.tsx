'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteUserModal } from './invite-user-modal';
import { UserList } from './user-list';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchUsers = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, search);
  };

  const handleUserUpdate = () => {
    // Refresh the user list after updates
    fetchUsers(pagination.page, search);
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    // Optionally refresh the list or show success message
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-muted-foreground">Loading...</div>
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
          <CardTitle>Search & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <form onSubmit={handleSearch} className="flex space-x-2 flex-1">
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            
            <Button onClick={() => setShowInviteModal(true)}>
              Invite User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <UserList 
        users={users}
        onUserUpdate={handleUserUpdate}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {users.length} of {pagination.total} users
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}
