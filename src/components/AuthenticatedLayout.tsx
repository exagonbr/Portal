'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Header } from './Header'

export default function AuthenticatedLayout({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requiredRole && user.role !== requiredRole) {
        router.push(user.role === 'student' ? '/dashboard/student' : '/dashboard/teacher')
      }
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen min-w-screen bg-background-secondary flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[95%] md:max-w-[90%] lg:max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
