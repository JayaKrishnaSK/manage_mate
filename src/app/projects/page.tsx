import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Projects</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Projects functionality will be implemented in Phase 3.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}