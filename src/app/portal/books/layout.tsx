import { Viewport } from 'next'
import BookSidebar from '@/components/books/BookSidebar'

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
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-0">
        {children}
      </main>
      <aside className="w-64 border-0 border-gray-300">
        <BookSidebar />
      </aside>
    </div>
  )
}
