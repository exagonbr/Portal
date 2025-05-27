'use client';

import { useState } from 'react';
import BookCard from '@/components/BookCard';
import { mockBooks } from '@/constants/mockData';

export default function FavoritesPage() {
  // Using local state since mockBooks doesn't track favorites
  const [books] = useState(mockBooks.slice(0, 5)); // Taking first 5 books as example favorites

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Meus Livros Favoritos</h1>
      
      {books.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Você ainda não tem livros favoritos.</p>
          <p className="text-gray-400 text-sm mt-2">Marque livros como favoritos para vê-los aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              thumbnail={book.thumbnail}
              title={book.title}
              duration={book.duration}
              progress={book.progress}
              author={book.author}
              publisher={book.publisher}
              synopsis={book.synopsis}
              format={book.format}
            />
          ))}
        </div>
      )}
    </div>
  );
}
