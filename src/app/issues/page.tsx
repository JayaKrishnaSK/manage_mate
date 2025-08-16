import { AppLayout } from '@/components/layout/app-layout';
import { IssuesManagement } from '@/components/issues/issues-management';

export default function IssuesPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Issues</h1>
        <IssuesManagement />
      </div>
    </AppLayout>
  );
}