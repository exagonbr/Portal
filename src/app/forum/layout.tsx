'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ForumLayoutProps {
  children: ReactNode
}

export default function ForumLayout({ children }: ForumLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Navigation Sidebar */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                <Link 
                  href="/forum"
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/forum')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todos os Tópicos
                </Link>

                {(user?.role === 'teacher' ? 'Professor' : '') && (
                  <>
                    <Link 
                      href="/forum/teacher/assignments"
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/forum/teacher/assignments')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Atribuições
                    </Link>
                    <Link 
                      href="/forum/teacher/announcements"
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/forum/teacher/announcements')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anúncios
                    </Link>
                  </>
                )}

                {user?.role === 'student' && (
                  <>
                    <Link 
                      href="/forum/student/assignments"
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/forum/student/assignments')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      My Assignments
                    </Link>
                    <Link 
                      href="/forum/student/grades"
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/forum/student/grades')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      My Grades
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
