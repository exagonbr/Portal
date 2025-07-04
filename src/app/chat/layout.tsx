import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout>
    <div className="h-full w-full">
      {children}
    </div>
    </AuthenticatedLayout>
  )
}
