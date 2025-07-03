'use client';

import React, { useState } from 'react';
import { mockBooks } from '@/constants/mockData';
import Link from 'next/link';
import { MagnifyingGlassIcon, HeartIcon, BookOpenIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function BooksContentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShelf = selectedShelf === 'all' || 
                        (selectedShelf === 'favorites' && favorites.includes(book.id)) ||
                        (selectedShelf === 'in-progress' && book.progress && book.progress > 0 && book.progress < 100);
    return matchesSearch && matchesShelf;
  });

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-gray-300 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Portal de Literatura</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar livros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-300 text-white px-4 py-2 rounded-lg pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <button
            onClick={() => setSelectedShelf('all')}
            className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
              selectedShelf === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-300'
            }`}
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>Todos os Livros</span>
          </button>

          <button
            onClick={() => setSelectedShelf('favorites')}
            className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
              selectedShelf === 'favorites' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-300'
            }`}
          >
            <HeartIcon className="h-5 w-5" />
            <span>Favoritos</span>
          </button>

          <button
            onClick={() => setSelectedShelf('in-progress')}
            className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
              selectedShelf === 'in-progress' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-300'
            }`}
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>Em Progresso</span>
          </button>
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <button className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:bg-gray-300 rounded-lg transition-colors">
            <Cog6ToothIcon className="h-5 w-5" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative aspect-[3/4]">
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <Link
                      href={`/portal/books/${book.id}`}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <BookOpenIcon className="h-6 w-6 text-blue-600" />
                    </Link>
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {favorites.includes(book.id) ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </button>
                  </div>
                  {book.progress !== undefined && book.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 truncate">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Nenhum livro encontrado para os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
