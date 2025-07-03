'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function StudentGradesPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user || user.role !== 'student') {
    router.push('/forum')
    return null
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-800 mb-4">My Grades</h2>
      <p className="text-gray-600">
        View your grades and academic progress.
      </p>
      {/* TODO: Add grade display functionality */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">
          Grade tracking features coming soon.
        </p>
      </div>
    </div>
  )
}
