import DashboardLayout from '@/components/dashboard/DashboardLayout'
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
    <DashboardLayout>
    <div className="h-full w-full">
      {children}
    </div>
    </DashboardLayout>
  )
}
