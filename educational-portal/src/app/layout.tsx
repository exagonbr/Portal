'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {isAuthPage ? (
          // Auth pages have their own layout
          children
        ) : (
          // Main app layout
          <div className="min-h-screen bg-[#F7FAFC]">
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Image
                    src="/sabercon-logo.png"
                    alt="Sabercon"
                    width={150}
                    height={40}
                    priority
                  />
                </div>
              </div>
            </header>
            {children}
          </div>
        )}
      </body>
    </html>
  )
}
