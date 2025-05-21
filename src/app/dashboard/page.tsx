'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace(user.type === 'student' ? '/dashboard/student' : '/dashboard/teacher')
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner h-8 w-8"></div>
    </div>
  )
}
