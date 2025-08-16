'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateIssueModal } from './create-issue-modal';
import { IssuesList } from './issues-list';
import { IssueBoard } from './issue-board';
import { Plus, List, Kanban } from 'lucide-react';

export function IssuesManagement() {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
            variant={view === 'board' ? 'default' : 'outline'}
            onClick={() => setView('board')}
            size="sm"
          >
            <Kanban className="h-4 w-4 mr-2" />
            Board View
          </Button>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Main Content */}
      {view === 'list' ? (
        <IssuesList refreshTrigger={refreshTrigger} />
      ) : (
        <IssueBoard refreshTrigger={refreshTrigger} />
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}