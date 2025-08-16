'use client';

import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';

export function TestRunsTab() {
  return (
    <div className="text-center py-12">
      <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Test Runs</h3>
      <p className="text-muted-foreground mb-4">Execute and track test runs</p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Start Test Run
      </Button>
    </div>
  );
}