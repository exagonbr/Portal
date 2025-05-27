'use client';

import React, { useState } from 'react';
import { 
  BookOpenIcon, 
  InformationCircleIcon,
  HeartIcon,
  PencilSquareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  PencilSquareIcon as PencilSquareSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import BookModal from './BookModal';

interface BookCardProps {
  id: string;
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
  const [isFavorite, setIsFavorite] = useState(false);
  const { thumbnail, title, duration, progress, author, publisher, id } = props;

  // Mock data for annotations and highlights
  // In a real app, this would come from a backend/database
  const hasAnnotations = id === 'book-1' || id === 'book-2';
  const hasHighlights = id === 'book-2' || id === 'book-3';

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
            <Link 
              href={`/portal/books/${id}`}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
              aria-label="Abrir livro"
            >
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
              aria-label="Mais informações"
            >
              <InformationCircleIcon className="w-8 h-8 text-blue-600" />
            </button>
          </div>
          
          {/* Status Icons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
              )}
            </button>
            {hasAnnotations && (
              <div className="p-1.5 rounded-full bg-white/90 shadow-lg">
                <PencilSquareSolidIcon className="w-5 h-5 text-blue-500" />
              </div>
            )}
            {hasHighlights && (
              <div className="p-1.5 rounded-full bg-white/90 shadow-lg">
                <StarSolidIcon className="w-5 h-5 text-yellow-500" />
              </div>
            )}
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
