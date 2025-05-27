'use client';

import { usePathname } from 'next/navigation';
import BookshelfSidebar from '@/components/books/BookshelfSidebar';

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isReaderPage = pathname.includes('/portal/books/') && pathname.match(/\/books\/[^/]+$/);

  // If we're on a book reader page, render without padding to maximize space
  if (isReaderPage) {
    return <>{children}</>;
  }

  // For the main books portal pages, add sidebar and layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <BookshelfSidebar />
        <main className="flex-1 max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
