'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export interface Module {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
  owners: Array<{ _id: string; name: string; email: string }>;
  contributors: Array<{ _id: string; name: string; email: string }>;
  progress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ModulesManagementProps {
  projectId: string;
}

export function ModulesManagement({ projectId }: ModulesManagementProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/modules?projectId=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setModules(result.data.modules || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on_hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(search.toLowerCase()) ||
    module.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-muted-foreground">Loading modules...</div>
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
            <CardTitle>Project Modules</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Modules List */}
      {filteredModules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? 'No modules match your search criteria' : 'Start by creating your first module'}
              </p>
              {!search && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{module.name}</CardTitle>
                    <Badge className={getStatusColor(module.status)}>
                      {module.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Owners: {module.owners.length}</p>
                  <p>Contributors: {module.contributors.length}</p>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Module Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Module</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Create module functionality will be implemented.</p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}