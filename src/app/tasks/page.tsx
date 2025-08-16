import { AppLayout } from '@/components/layout/app-layout';
import { TasksBoard } from '@/components/tasks/tasks-board';

export default function TasksPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Tasks</h1>
        <TasksBoard />
      </div>
    </AppLayout>
  );
}