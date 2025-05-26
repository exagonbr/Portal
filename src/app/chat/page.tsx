'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mockCourses } from '@/constants/mockData'
import ChatRoom from '@/components/chat/ChatRoom'

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  if (!user) return null // Will be handled by AuthenticatedDashboardLayout

  // Get classes based on user's courses
  const userClasses = mockCourses.filter(course => {
    if (user.type === 'teacher') {
      return course.teachers?.includes(user.id)
    } else {
      return course.students?.includes(user.id)
    }
  })

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Classes Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {user.type === 'teacher' ? 'Your Classes' : 'My Classes'}
          </h2>
        </div>
        <div className="space-y-1 p-2">
          {userClasses.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No classes available</p>
            </div>
          ) : (
            userClasses.map(classItem => (
              <button
                key={classItem.id}
                onClick={() => setSelectedClass(classItem.id)}
                className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                  selectedClass === classItem.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{classItem.name}</div>
                <div className="text-sm text-gray-500">
                  {classItem.schedule.classDays.join(', ')}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50">
        {selectedClass ? (
          <ChatRoom
            classId={selectedClass}
            className={userClasses.find(c => c.id === selectedClass)?.name || ''}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-2">
                chat
              </span>
              <p>Select a class to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
