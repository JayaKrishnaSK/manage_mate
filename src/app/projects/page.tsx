import { AppLayout } from '@/components/layout/app-layout';
import { ProjectsManagement } from '@/components/projects/projects-management';

export default function ProjectsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Projects</h1>
        <ProjectsManagement />
      </div>
    </AppLayout>
  );
}