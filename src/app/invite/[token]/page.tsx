import { notFound } from 'next/navigation';
import { InviteForm } from '@/components/forms/invite-form';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

async function getInviteData(token: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/invites/${token}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch invite data:', error);
    return null;
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const inviteData = await getInviteData(token);

  if (!inviteData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Account Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You&apos;ve been invited to join as: {inviteData.roles.join(', ')}
          </p>
          <p className="text-center text-sm text-gray-600">
            Email: <span className="font-medium">{inviteData.email}</span>
          </p>
        </div>
        <InviteForm token={token} />
      </div>
    </div>
  );
}
