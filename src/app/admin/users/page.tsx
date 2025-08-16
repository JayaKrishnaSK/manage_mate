import { redirect } from 'next/navigation';
import { auth } from '@/../auth';
import { UserManagement } from '@/components/admin/user-management';

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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-gray-900 mb-6">User Management</h1>
          <UserManagement />
        </div>
      </div>
    </div>
  );
}
