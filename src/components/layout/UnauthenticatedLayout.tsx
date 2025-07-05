'use client'

import { ReactNode } from 'react'

interface UnauthenticatedLayoutProps {
  children: ReactNode
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}