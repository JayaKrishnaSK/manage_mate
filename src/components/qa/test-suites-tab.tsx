'use client';

import { Button } from '@/components/ui/button';
import { Layers, Plus } from 'lucide-react';

export function TestSuitesTab() {
  return (
    <div className="text-center py-12">
      <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Test Suites</h3>
      <p className="text-muted-foreground mb-4">Create and manage test suites</p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Create Test Suite
      </Button>
    </div>
  );
}