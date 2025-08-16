'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestCasesTab } from './test-cases-tab';
import { TestSuitesTab } from './test-suites-tab';
import { TestRunsTab } from './test-runs-tab';
import { QADashboardTab } from './qa-dashboard-tab';
import { FileText, Layers, Play, BarChart3 } from 'lucide-react';

type TabType = 'dashboard' | 'test-cases' | 'test-suites' | 'test-runs';

export function QAManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'test-cases' as TabType, label: 'Test Cases', icon: FileText },
    { id: 'test-suites' as TabType, label: 'Test Suites', icon: Layers },
    { id: 'test-runs' as TabType, label: 'Test Runs', icon: Play },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <QADashboardTab />;
      case 'test-cases':
        return <TestCasesTab />;
      case 'test-suites':
        return <TestSuitesTab />;
      case 'test-runs':
        return <TestRunsTab />;
      default:
        return <QADashboardTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
}