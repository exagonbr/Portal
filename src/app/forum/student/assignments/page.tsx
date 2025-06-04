'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function StudentAssignmentsPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">My Assignments</h2>
      <p className="text-gray-600">
        View and submit your assignments.
      </p>
      {/* TODO: Add assignment list and submission functionality */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">
          Assignment submission features coming soon.
        </p>
      </div>
    </div>
  )
}
