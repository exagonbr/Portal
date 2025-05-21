'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const studentNavigation = [
  { name: 'Dashboard', href: '../dashboard' },
  { name: 'Meus Cursos', href: '../courses' },
  { name: 'Aulas ao Vivo', href: '../live' },
  { name: 'Materiais', href: '../lessons' },
  { name: 'Chat', href: '../chat' }
]

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Minhas Turmas', href: '/classes' },
  { name: 'Aulas ao Vivo', href: '/live' },
  { name: 'Material Didático', href: '/materials' },
  { name: 'Chat', href: '/chat' }
]

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = user 
    ? user.type === 'student' 
      ? studentNavigation 
      : teacherNavigation
    : []

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors" aria-label="Home">
                Sabercon
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      ${isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } 
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sr-only">{isActive ? 'Current page:' : 'Go to'}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center">
            {/* Notifications */}
            <button
              type="button"
              className="touch-target p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="View notifications"
            >
              <span className="sr-only">Ver notificações</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <button
                type="button"
                className="touch-target bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="User menu"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden ml-3">
              <button
                type="button"
                className="touch-target inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">
                  {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                </span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium
                  ${isActive 
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
