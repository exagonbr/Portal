'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SystemAdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/system-admin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
    </div>
  )
} 