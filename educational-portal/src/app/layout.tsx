import './globals.css'
import { AppProviders } from '@/providers/AppProviders'
import MainNavigation from '@/components/MainNavigation'

export const metadata = {
  title: 'Portal Educacional',
  description: 'Portal educacional com cursos, materiais e avaliações',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>
          <MainNavigation />
          <main className="min-h-screen bg-gray-50 pt-16">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  )
}
