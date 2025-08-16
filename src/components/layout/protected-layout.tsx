'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render the app layout with children
  return <AppLayout>{children}</AppLayout>;
}