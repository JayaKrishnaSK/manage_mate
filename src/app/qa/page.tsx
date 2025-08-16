import { AppLayout } from '@/components/layout/app-layout';
import { QAManagement } from '@/components/qa/qa-management';

export default function QAPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">QA Test Management</h1>
        <QAManagement />
      </div>
    </AppLayout>
  );
}