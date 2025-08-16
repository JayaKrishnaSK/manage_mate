import { redirect } from 'next/navigation';
import { auth } from '@/../auth';
import { ProfileForm } from '@/components/forms/profile-form';

async function getUserProfile() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/profile`, {
      cache: 'no-store',
      headers: {
        'Cookie': 'TODO: Pass session cookie', // This needs to be handled properly
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.user : null;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // For now, we'll use the session data directly since the API call needs proper authentication
  const userProfile = {
    _id: session.user.id!,
    name: session.user.name || 'Unknown User',
    email: session.user.email!,
    roles: session.user.roles || ['team_member'],
    avatar: session.user.image || null,
    preferences: {
      notifications: true,
      emailUpdates: true,
      theme: 'system' as const,
    },
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h1>
          <ProfileForm user={userProfile} />
        </div>
      </div>
    </div>
  );
}
