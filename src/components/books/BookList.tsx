'use client';

import React from 'react';
import BookCard from '@/components/BookCard';

interface Book {
  id: string;
  thumbnail?: string;
  title: string;
  duration?: string;
  progress?: number;
  author?: string;
  publisher?: string;
  synopsis?: string;
  format?: string;
}

interface BookListProps {
  books: Book[];
  title: string;
  emptyMessage: string;
}

export default function BookList({ books, title, emptyMessage }: BookListProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-600">{title}</h1>
      {books.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              thumbnail={book.thumbnail ?? ''}
              title={book.title}
              duration={book.duration ?? ''}
              progress={book.progress}
              author={book.author ?? ''}
              publisher={book.publisher ?? ''}
              synopsis={book.synopsis ?? ''}
              format={book.format ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
