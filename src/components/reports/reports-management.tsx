'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, TrendingUp, Calendar, Users, CheckCircle } from 'lucide-react';

export function ReportsManagement() {
  const reportTypes = [
    {
      id: 'project-summary',
      title: 'Project Summary',
      description: 'Overview of all projects with status and progress',
      icon: BarChart3,
      available: true,
    },
    {
      id: 'task-completion',
      title: 'Task Completion',
      description: 'Task completion rates by project and team member',
      icon: CheckCircle,
      available: true,
    },
    {
      id: 'team-performance',
      title: 'Team Performance',
      description: 'Performance metrics and productivity analysis',
      icon: Users,
      available: true,
    },
    {
      id: 'time-tracking',
      title: 'Time Tracking',
      description: 'Time spent analysis by project, module, and user',
      icon: Calendar,
      available: false,
    },
    {
      id: 'qa-metrics',
      title: 'QA Metrics',
      description: 'Test execution, pass rates, and defect analysis',
      icon: TrendingUp,
      available: true,
    },
    {
      id: 'issue-analytics',
      title: 'Issue Analytics',
      description: 'Issue trends, resolution times, and SLA compliance',
      icon: BarChart3,
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Generate and export various reports to track project progress, team performance, and quality metrics.
          </p>
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className={!report.available ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{report.description}</p>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!report.available}
                    className="flex-1"
                  >
                    Generate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!report.available}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                
                {!report.available && (
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">23</div>
              <div className="text-sm text-muted-foreground">Open Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">89%</div>
              <div className="text-sm text-muted-foreground">QA Pass Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}