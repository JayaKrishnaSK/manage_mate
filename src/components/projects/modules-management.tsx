'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { CreateModuleModal } from './create-module-modal';

export interface Module {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
  owners: Array<{ _id: string; name: string; email: string }>;
  contributors: Array<{ _id: string; name: string; email: string }>;
  dependencies: Array<{ _id: string; name: string; description: string; status: string }>;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

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

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchModules();
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchModules();
      } else {
        const result = await response.json();
        alert(result.error?.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert('Failed to delete module');
    }
  };

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

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(search.toLowerCase()) ||
                         module.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                {['all', 'planning', 'in_progress', 'testing', 'completed', 'on_hold'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                  </Button>
                ))}
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
                {search || statusFilter !== 'all' 
                  ? 'No modules match your filters' 
                  : 'Start by creating your first module'
                }
              </p>
              {!search && statusFilter === 'all' && (
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
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getStatusColor(module.status)}>
                        {module.status.replace('_', ' ')}
                      </Badge>
                      {module.dependencies.length > 0 && (
                        <Badge variant="outline">
                          {module.dependencies.length} dep{module.dependencies.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedModule(module)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteModule(module._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>Owners: {module.owners.length}</p>
                    <p>Contributors: {module.contributors.length}</p>
                  </div>
                  {module.estimatedHours && (
                    <div>
                      <p>Est. Hours: {module.estimatedHours}</p>
                      {module.actualHours && (
                        <p>Actual: {module.actualHours}</p>
                      )}
                    </div>
                  )}
                </div>

                {module.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {module.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {module.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{module.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {(module.startDate || module.endDate) && (
                  <div className="text-xs text-muted-foreground">
                    {module.startDate && (
                      <p>Start: {new Date(module.startDate).toLocaleDateString()}</p>
                    )}
                    {module.endDate && (
                      <p>End: {new Date(module.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Module Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{modules.length}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {modules.filter(m => m.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {modules.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {modules.filter(m => m.status === 'testing').length}
              </div>
              <div className="text-sm text-muted-foreground">Testing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Module Modal */}
      {showCreateModal && (
        <CreateModuleModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedModule.name}</CardTitle>
                  <Badge className={getStatusColor(selectedModule.status)} style={{ marginTop: '8px' }}>
                    {selectedModule.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => setSelectedModule(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedModule.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{selectedModule.progress}%</span>
                    <span>{selectedModule.estimatedHours}h estimated</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${selectedModule.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {selectedModule.owners.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Owners</h3>
                  <div className="space-y-2">
                    {selectedModule.owners.map((owner) => (
                      <div key={owner._id} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{owner.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{owner.name}</p>
                          <p className="text-xs text-muted-foreground">{owner.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedModule.dependencies.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Dependencies</h3>
                  <div className="space-y-2">
                    {selectedModule.dependencies.map((dep) => (
                      <div key={dep._id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{dep.name}</p>
                          <p className="text-xs text-muted-foreground">{dep.description}</p>
                        </div>
                        <Badge className={getStatusColor(dep.status)}>
                          {dep.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedModule.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedModule.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}