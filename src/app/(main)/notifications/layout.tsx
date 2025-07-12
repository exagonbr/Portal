import DashboardLayout from "@/components/dashboard/DashboardLayout"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-white text-color-black">{children}</div>
}