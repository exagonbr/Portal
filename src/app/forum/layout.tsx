'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface ForumLayoutProps {
  children: React.ReactNode
}

export default function ForumLayout({ children }: ForumLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navigationItems = [
    { href: '/forum', label: 'Todos os Tópicos' },
    ...(user?.role === 'teacher' ? [
      { href: '/forum/teacher/assignments', label: 'Atribuições' },
      { href: '/forum/teacher/announcements', label: 'Anúncios' }
    ] : [])
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="md:hidden px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        <div className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 lg:gap-8">
            {/* Navigation Sidebar */}
            <nav className={`
              fixed md:relative inset-0 z-40 bg-white md:bg-transparent w-64 md:w-48 lg:w-64 transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              md:flex-shrink-0 md:transform-none
              border-r border-gray-200 md:border-none
            `}>
              <div className="h-full overflow-y-auto p-4 md:p-0 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0 pt-4 md:pt-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
