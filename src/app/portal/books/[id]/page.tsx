'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { mockBooks } from '@/constants/mockData';
import BookReader from '@/components/BookReader';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export default function BookPage() {
  const params = useParams();
  const bookId = params.id as string;
  
  // Find the book from mock data
  const book = mockBooks.find(b => b.id === bookId);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Livro não encontrado</h1>
          <Link 
            href="/portal/books"
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Voltar para Biblioteca
          </Link>
        </div>
      </div>
    );
  }

  // Use sample files for demonstration
  const fileUrl = book.filePath || `/books/MahaMamo.pdf`;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        {/* Book Info */}
        <div className="mb-6">
          <div className="relative w-full aspect-[3/4] mb-4">
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
          <h2 className="text-lg font-semibold mb-1">{book.title}</h2>
          <p className="text-sm text-gray-400 mb-4">{book.author}</p>
        </div>

        {/* Navigation */}
        <div className="flex-1">
          {/* Add page navigation here if needed */}
        </div>

        {/* Back to Library Button */}
        <Link
          href="/portal/books"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-auto"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retornar para Biblioteca
        </Link>
      </div>

      {/* Main Content - Book Reader */}
      <div className="flex-1 h-full overflow-hidden">
        <BookReader 
          url={fileUrl}
          format={book.format as 'pdf' | 'epub' || 'pdf'} 
        />
      </div>
    </div>
  );
}
