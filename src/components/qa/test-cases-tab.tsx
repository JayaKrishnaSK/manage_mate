'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateTestCaseModal } from './create-test-case-modal';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';

interface TestCase {
  _id: string;
  title: string;
  preconditions: string;
  steps: Array<{
    step: number;
    action: string;
    expected: string;
  }>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  tags: string[];
  version: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export function TestCasesTab() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    component: '',
  });

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/test-cases?${params}`);
      const result = await response.json();

      if (result.success) {
        setTestCases(result.data.testCases || []);
      }
    } catch (error) {
      console.error('Failed to fetch test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [filters]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchTestCases();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading test cases...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-4">
          <Input
            placeholder="Search test cases..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Input
            placeholder="Filter by component..."
            value={filters.component}
            onChange={(e) => setFilters({ ...filters, component: e.target.value })}
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test Case
        </Button>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {testCases.map((testCase) => (
          <div key={testCase._id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium text-foreground line-clamp-2">{testCase.title}</h3>
                  <p className="text-sm text-muted-foreground">#{testCase._id.slice(-8)}</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(testCase.priority)}`}>
                    {testCase.priority}
                  </span>
                </div>
                
                {testCase.component && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Component:</span>
                    <Badge variant="outline">{testCase.component}</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Steps:</span>
                  <span className="text-sm font-medium text-foreground">{testCase.steps.length}</span>
                </div>
              </div>

              {testCase.preconditions && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-foreground">Preconditions:</span>
                  <p className="text-sm text-muted-foreground line-clamp-3">{testCase.preconditions}</p>
                </div>
              )}

              {testCase.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {testCase.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {testCase.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{testCase.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>v{testCase.version}</span>
                <span>{new Date(testCase.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testCases.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No test cases found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first test case</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Test Case
          </Button>
        </div>
      )}

      {/* Create Test Case Modal */}
      {showCreateModal && (
        <CreateTestCaseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}