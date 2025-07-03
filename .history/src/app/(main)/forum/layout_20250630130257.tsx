'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { UserRole } from '@prisma/client'

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
    ...(user?.role === UserRole.TEACHER ? [
      { href: '/forum/teacher/assignments', label: 'Atribuições' },
      { href: '/forum/teacher/announcements', label: 'Anúncios' }
    ] : [])
  ]

  return (
    <main className="container w-full h-full">
      <div className="mb-8">

            {/* Main Content */}
            <div className="flex-1 min-w-0 pt-4 md:pt-0">
              {children}
            </div>
      </div>
    </main>
  )
}
