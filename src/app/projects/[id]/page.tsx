import { AppLayout } from '@/components/layout/app-layout';
import { ProjectDetail } from '@/components/projects/project-detail';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  
  return (
    <AppLayout>
      <div className="p-8">
        <ProjectDetail projectId={id} />
      </div>
    </AppLayout>
  );
}