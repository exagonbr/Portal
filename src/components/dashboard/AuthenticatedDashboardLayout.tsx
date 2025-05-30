'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from './DashboardLayout'

export default function AuthenticatedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?error=unauthorized')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
