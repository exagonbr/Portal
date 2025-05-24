import './globals.css'
import { AppProviders } from '../providers/AppProviders'
import { Header } from '../components/Header'

export const metadata = {
  title: 'Educational Portal',
  description: 'A modern platform for education management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ptBR">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <AppProviders>
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  )
}
