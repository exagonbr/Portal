'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="">
    {/* Conteúdo Principal */}
    <main className="w-full h-full">
        {children}
      </main>
    </div>
  )
}