'use client';

import React, { useState } from 'react';
import { Book } from '../../constants/mockData';
import BookViewer from './BookViewer';
import Link from 'next/link';

interface BookListProps {
  books: Book[];
  showViewer?: boolean;
}

const BookList: React.FC<BookListProps> = ({ books, showViewer = true }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const handleBookClick = (book: Book) => {
    if (showViewer) {
      setSelectedBook(book);
    }
  };
  
  const handleCloseViewer = () => {
    setSelectedBook(null);
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div 
            key={book.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            {showViewer ? (
              <div onClick={() => handleBookClick(book)}>
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 relative">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-tl-md">
                    {book.format.toUpperCase()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {book.author}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Link href={`/books/view/${book.id}?title=${encodeURIComponent(book.title)}`}>
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 relative">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-tl-md">
                    {book.format.toUpperCase()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {book.author}
                    </p>
                  )}
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {selectedBook && showViewer && (
        <BookViewer 
          book={selectedBook}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default BookList;
