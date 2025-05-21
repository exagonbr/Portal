'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { LoadingOverlay } from './loading'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="pt-BR">
      <head>
        <title>Portal Educacional</title>
        <meta name="description" content="Portal educacional com cursos, materiais e avaliações" />
      </head>
      <body>
        <AuthProvider>
          {isLoading ? (
            <LoadingOverlay message="Iniciando aplicação..." />
          ) : (
            <>
              <Navigation />
              <main className="min-h-screen bg-gray-50 pt-16">
                {children}
              </main>
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  )
}
