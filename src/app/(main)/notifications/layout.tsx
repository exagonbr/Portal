import DashboardLayout from "@/components/dashboard/DashboardLayout"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}