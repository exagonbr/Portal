'use client';

import React, { useState } from 'react';
import { BookOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import BookModal from './BookModal';

interface BookCardProps {
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
  author: string;
  publisher: string;
  synopsis: string;
  format?: string;
}

export default function BookCard(props: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { thumbnail, title, duration, progress, author, publisher } = props;

  return (
    <>
      <div className="w-full h-full max-w-[13rem] bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative aspect-[3/4]">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover rounded-t-lg"
            loading="lazy"
          />
          
          {/* Action buttons overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
            <button 
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
              aria-label="Abrir livro"
            >
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
              aria-label="Mais informações"
            >
              <InformationCircleIcon className="w-8 h-8 text-blue-600" />
            </button>
          </div>
          
          {/* Reading time badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full shadow-md">
            {duration}
          </div>

          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gray-200">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 
            className="text-sm font-semibold truncate hover:text-blue-600 transition-colors" 
            title={title}
          >
            {title}
          </h3>

          {/* Author */}
          <div className="text-xs text-gray-600">
            <span className="font-medium">Autor(a): </span>
            <span>{author || 'Autor(a) desconhecido(a)'}</span>
          </div>

          {/* Publisher */}
          <div className="text-xs text-gray-600">
            <span className="font-medium">Editora: </span>
            <span>{publisher}</span>
          </div>
        </div>
      </div>

      <BookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={props}
      />
    </>
  );
}
