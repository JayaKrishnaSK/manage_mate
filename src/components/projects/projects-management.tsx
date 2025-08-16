'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsList } from './projects-list';
import { CreateProjectModal } from './create-project-modal';
import { Plus } from 'lucide-react';

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  template: 'agile' | 'waterfall' | 'kanban' | 'custom';
  owners: Array<{ _id: string; name: string; email: string }>;
  managers: Array<{ _id: string; name: string; email: string }>;
  members: Array<{ _id: string; name: string; email: string }>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async (page = 1, searchQuery = '', status = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(status !== 'all' && { status }),
      });

      const response = await fetch(`/api/projects?${params}`);
      const result = await response.json();

      if (result.success) {
        setProjects(result.data.projects || []);
        setPagination(result.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // For demo purposes, use mock data when API fails
      setProjects([]);
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects(1, search, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchProjects(1, search, status);
  };

  const handlePageChange = (newPage: number) => {
    fetchProjects(newPage, search, statusFilter);
  };

  const handleProjectUpdate = () => {
    // Refresh the projects list after updates
    fetchProjects(pagination.page, search, statusFilter);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    handleProjectUpdate();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-muted-foreground">Loading projects...</div>
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
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
              
              <div className="flex gap-2">
                {['all', 'active', 'on_hold', 'completed', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <ProjectsList 
        projects={projects}
        onProjectUpdate={handleProjectUpdate}
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
        Showing {projects.length} of {pagination.total} projects
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}