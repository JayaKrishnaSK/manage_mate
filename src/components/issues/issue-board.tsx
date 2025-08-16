'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface Issue {
  _id: string;
  title: string;
  description: string;
  type: 'bug' | 'incident' | 'improvement' | 'request';
  status: 'new' | 'triaged' | 'in_progress' | 'in_review' | 'qa_testing' | 'done' | 'wontfix' | 'duplicate';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  assignees: string[];
  reporterId: string;
  createdAt: string;
}

interface IssueBoardProps {
  refreshTrigger: number;
}

const statusColumns = [
  { id: 'new', title: 'New', color: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'triaged', title: 'Triaged', color: 'bg-yellow-50 dark:bg-yellow-950' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-orange-50 dark:bg-orange-950' },
  { id: 'in_review', title: 'In Review', color: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'qa_testing', title: 'QA Testing', color: 'bg-indigo-50 dark:bg-indigo-950' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-950' },
];

export function IssueBoard({ refreshTrigger }: IssueBoardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/issues');
      const result = await response.json();

      if (result.success) {
        setIssues(result.data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [refreshTrigger]);

  const getIssuesByStatus = (status: string) => {
    return issues.filter(issue => issue.status === status);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading issues...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statusColumns.map((column) => {
        const columnIssues = getIssuesByStatus(column.id);
        
        return (
          <div key={column.id} className={`rounded-lg border p-4 ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnIssues.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {columnIssues.map((issue) => (
                <div
                  key={issue._id}
                  className={`bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getSeverityColor(issue.severity)}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2">
                        {issue.title}
                      </h4>
                      <Badge variant="outline" className="text-xs ml-2 shrink-0">
                        {issue.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {issue.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.priority}
                        </Badge>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        #{issue._id.slice(-6)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {columnIssues.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No issues
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}