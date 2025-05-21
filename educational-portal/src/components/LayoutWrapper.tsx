'use client'

import { usePathname } from 'next/navigation'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return children
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="header-shadow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="logo-text">
              <span className="logo-text-primary">SABER</span>
              <span className="logo-text-secondary">CON</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
            <a href="/courses" className="text-gray-600 hover:text-gray-900 transition-colors">Courses</a>
            <a href="/assignments" className="text-gray-600 hover:text-gray-900 transition-colors">Assignments</a>
            <button className="button-primary">Get Started</button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
