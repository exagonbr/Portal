'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Announcements</h2>
      <p className="text-gray-600">
        Create and manage announcements for your classes.
      </p>
      {/* TODO: Add announcement management functionality */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">
          Announcement management features coming soon.
        </p>
      </div>
    </div>
  )
}
