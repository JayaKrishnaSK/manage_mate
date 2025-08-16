import { AppLayout } from '@/components/layout/app-layout';
import { SettingsManagement } from '@/components/settings/settings-management';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
        <SettingsManagement />
      </div>
    </AppLayout>
  );
}