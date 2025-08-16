import ProtectedLayout from '@/components/layout/protected-layout';

export default function ProtectedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}