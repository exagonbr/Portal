'use client'

import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'
import ChatSection from '@/components/dashboard/ChatSection'

export default function Chat() {
  const { user } = useAuth()

  if (!user || user.type !== 'student') {
    redirect('/dashboard')
  }

  return (
    <AuthenticatedDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
        </div>

        <ChatSection userId={user.id} />
      </div>
    </AuthenticatedDashboardLayout>
  )
}
