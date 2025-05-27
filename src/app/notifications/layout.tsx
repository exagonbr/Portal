import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedDashboardLayout>
      {children}
    </AuthenticatedDashboardLayout>
  )
}