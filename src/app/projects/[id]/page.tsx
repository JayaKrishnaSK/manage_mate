import { AppLayout } from '@/components/layout/app-layout';
import { ProjectDetail } from '@/components/projects/project-detail';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <AppLayout>
      <div className="p-8">
        <ProjectDetail projectId={params.id} />
      </div>
    </AppLayout>
  );
}