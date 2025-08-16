import { AppLayout } from '@/components/layout/app-layout';
import { ReportsManagement } from '@/components/reports/reports-management';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Reports</h1>
        <ReportsManagement />
      </div>
    </AppLayout>
  );
}