import { redirect } from 'next/navigation';
import { auth } from '@/../auth';
import { UserManagement } from '@/components/admin/user-management';
import { AppLayout } from '@/components/layout/app-layout';

export default async function AdminUsersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user has admin role
  const userRoles = session.user.roles || [];
  if (!userRoles.includes('admin')) {
    redirect('/dashboard');
  }

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">User Management</h1>
        <UserManagement />
      </div>
    </AppLayout>
  );
}
