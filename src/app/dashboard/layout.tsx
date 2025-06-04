'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O AuthenticatedDashboardLayout já cuida da autenticação e do StandardLayout
  return <>{children}</>;
}
