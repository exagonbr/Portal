import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'

// Importar o ClientWrapper dinamicamente para evitar problemas de SSR
const ClientWrapperDynamic = dynamic(
  () => import('../components/ClientComponents').then(mod => mod.ClientWrapper)
)

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
      <body className={inter.className}>
        <ClientWrapperDynamic>
          {children}
        </ClientWrapperDynamic>
      </body>
    </html>
  )
}
