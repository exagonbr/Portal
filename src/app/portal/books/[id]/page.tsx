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
  const [isLoading, setIsLoading] = React.useState(true);
  const [book, setBook] = React.useState<typeof mockBooks[0] | null>(null);
  const [annotations, setAnnotations] = React.useState<number>(0);
  const [highlights, setHighlights] = React.useState<number>(0);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const foundBook = mockBooks.find(b => b.id === bookId);
      setBook(foundBook || null);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando livro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Livro não encontrado</h1>
          <Link 
            href="/portal/books"
            className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2"
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
  const format = book.format || 'pdf';

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

        {/* Book Stats */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Estatísticas</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Anotações</span>
              <span className="text-sm text-white">{annotations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Destaques</span>
              <span className="text-sm text-white">{highlights}</span>
            </div>
          </div>
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
          format={format as 'pdf' | 'epub' | 'html'}
          onAnnotationsChange={setAnnotations}
          onHighlightsChange={setHighlights}
        />
      </div>
    </div>
  );
}
