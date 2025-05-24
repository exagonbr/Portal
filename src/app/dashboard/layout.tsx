import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
}
