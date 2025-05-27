'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockBooks } from '@/constants/mockData';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import BookViewer from '@/components/books/BookViewer';

const BookPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id;

  // Find the book by id
  const book = mockBooks.find((b) => b.id === bookId);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl font-semibold mb-4">Book not found</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Go Back
        </button>
      </div>
    );
  }

  const { filePath: fileUrl, format } = book;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-4 border-b border-gray-300">
        <Link 
          href="/portal/books" 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar para o acervo
        </Link>
      </header>
        {/* Main Content - Book Reader */}
        <div className="flex-1 h-full overflow-hidden">
          <BookViewer
            book={book}
            onAnnotationAdd={() => {}}
            onHighlightAdd={() => {}}
          />
        </div>
    </div>
  );
};

export default BookPage;
