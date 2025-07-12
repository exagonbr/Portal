import { Inter } from 'next/font/google'
import { ClientWrapper } from '../components/ClientComponents'
import { HydrationProvider } from '../components/HydrationProvider'

const inter = Inter({ 
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientWrapper />
        <HydrationProvider>
          {children}
        </HydrationProvider>
      </body>
    </html>
  )
}
