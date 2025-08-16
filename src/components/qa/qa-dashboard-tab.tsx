'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Layers, Play, TrendingUp, AlertTriangle } from 'lucide-react';

interface QAStats {
  totalTestCases: number;
  totalTestSuites: number;
  totalTestRuns: number;
  passRate: number;
  failRate: number;
  recentRuns: Array<{
    _id: string;
    suiteId: string;
    suiteName: string;
    status: string;
    passCount: number;
    failCount: number;
    totalCount: number;
    executedAt: string;
  }>;
  topFailingTests: Array<{
    _id: string;
    title: string;
    failCount: number;
    project: string;
  }>;
}

export function QADashboardTab() {
  const [stats, setStats] = useState<QAStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/qa/dashboard');
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch QA stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading QA dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load QA statistics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Test Cases
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTestCases}</div>
            <p className="text-xs text-muted-foreground">Total test cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Test Suites
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTestSuites}</div>
            <p className="text-xs text-muted-foreground">Test suites created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Test Runs
            </CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTestRuns}</div>
            <p className="text-xs text-muted-foreground">Executions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Recent Test Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentRuns.length > 0 ? (
              stats.recentRuns.map((run) => (
                <div key={run._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{run.suiteName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(run.executedAt).toLocaleDateString()} at{' '}
                      {new Date(run.executedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {run.passCount}/{run.totalCount} passed
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((run.passCount / run.totalCount) * 100).toFixed(1)}% success
                      </div>
                    </div>
                    <Badge 
                      variant={run.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent test runs
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Failing Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Top Failing Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topFailingTests.length > 0 ? (
              stats.topFailingTests.map((test) => (
                <div key={test._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{test.title}</div>
                    <div className="text-sm text-muted-foreground">{test.project}</div>
                  </div>
                  <Badge variant="destructive">
                    {test.failCount} failures
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No failing tests found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}