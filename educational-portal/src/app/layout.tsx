import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import MainNavigation from '@/components/MainNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portal Educacional',
  description: 'Plataforma de ensino online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <MainNavigation />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
