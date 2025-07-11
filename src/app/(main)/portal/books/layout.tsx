import { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-fit w-full">
      {children}
    </div>
  )
}
