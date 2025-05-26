'use client';

import { usePathname } from 'next/navigation';

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isReaderPage = pathname.includes('/portal/books/') && !pathname.endsWith('/books/');

  // If we're on a book reader page, render without padding to maximize space
  if (isReaderPage) {
    return <>{children}</>;
  }

  // For the main books portal pages, add padding and max-width
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
