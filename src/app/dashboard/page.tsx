'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.replace('/dashboard/admin')
          break
        case 'manager':
          router.replace('/dashboard/manager')
          break
        case 'teacher':
          router.replace('/dashboard/teacher')
          break
        case 'student':
          router.replace('/dashboard/student')
          break
        default:
          // Fallback to student dashboard if role is unknown
          router.replace('/dashboard/student')
      }
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner h-8 w-8"></div>
    </div>
  )
}
