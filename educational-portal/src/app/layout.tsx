import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import { AppProviders } from '@/providers/AppProviders'

export const metadata = {
  title: 'Educational Portal',
  description: 'A platform for online education',
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
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
      </body>
    </html>
  )
}
