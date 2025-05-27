'use client';

import React, { useState } from 'react';
import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/24/outline';
import BookCard from '../../../components/BookCard';
import { mockBooks } from '@/constants/mockData';

interface ViewState {
  mode: 'grid' | 'list';
  orderBy: string;
}

export default function BooksPage() {
  const [view, setView] = useState<ViewState>({
    mode: 'grid',
    orderBy: 'title'
  });

  // Sort books based on current order
  const sortedBooks = [...mockBooks].sort((a, b) => {
    switch (view.orderBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Minha Biblioteca</h1>
          
          {/* View Toggle & Sort */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView(prev => ({ ...prev, mode: 'grid' }))}
                className={`p-2 rounded-md ${view.mode === 'grid' ? 'bg-white shadow' : 'text-gray-500'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView(prev => ({ ...prev, mode: 'list' }))}
                className={`p-2 rounded-md ${view.mode === 'list' ? 'bg-white shadow' : 'text-gray-500'}`}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            <select
              value={view.orderBy}
              onChange={(e) => setView(prev => ({ ...prev, orderBy: e.target.value }))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="title">Título</option>
              <option value="author">Autor</option>
              <option value="progress">Progresso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="p-6">
        <div className={`grid ${
          view.mode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
            : 'grid-cols-1 gap-4'
        }`}>
          {sortedBooks.map(book => (
            <div key={book.id} className="h-full">
              <BookCard
                id={book.id}
                thumbnail={book.thumbnail}
                title={book.title}
                author={book.author}
                publisher={book.publisher}
                synopsis={book.synopsis}
                duration={book.duration}
                progress={book.progress}
                format={book.format}
              />
            </div>
          ))}
        </div>

        {/* No Books Message */}
        {sortedBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum livro encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
