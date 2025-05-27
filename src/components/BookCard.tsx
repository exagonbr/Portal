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
  viewMode?: 'grid' | 'list' | 'cover';
}

export default function BookCard({ viewMode = 'grid', ...props }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { thumbnail, title, duration, progress, author, publisher, id } = props;

  // Mock data for annotations and highlights
  // In a real app, this would come from a backend/database
  const hasAnnotations = id === 'book-1' || id === 'book-2';
  const hasHighlights = id === 'book-2' || id === 'book-3';

  const ActionButtons = () => (
    <>
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
    </>
  );

  const StatusIcons = () => (
    <>
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
    </>
  );

  const ProgressBar = () => (
    progress !== undefined && progress > 0 ? (
      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>
    ) : null
  );

  if (viewMode === 'list') {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden hover:bg-gray-50 transition-colors">
        <div className="p-4 flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-32 flex-shrink-0">
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            <div className={`absolute top-1 left-1 px-2 py-0.5 text-xs rounded-full shadow-md ${
              progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress ? `${progress}%` : 'Não iniciado'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold truncate">{title}</h3>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Autor(a): </span>{author}</p>
                <p><span className="font-medium">Editora: </span>{publisher}</p>
              </div>
              <ProgressBar />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <StatusIcons />
              </div>
              <div className="flex gap-2">
                <ActionButtons />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'cover') {
    return (
      <div className="relative group">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] rounded-lg shadow-lg overflow-hidden">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay with book details */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold truncate mb-1">{title}</h3>
              <p className="text-sm text-gray-200 truncate">{author}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {progress ? `${progress}%` : 'Não iniciado'}
                </span>
                <div className="flex gap-2">
                  <StatusIcons />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ActionButtons />
          </div>

          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default grid view - Modified to show info on the side
  return (
    <div className="w-full h-[240px] bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="flex h-full">
        {/* Thumbnail */}
        <div className="relative w-[100%] max-w-[160px] flex-shrink-0">
          <div className="relative aspect-[2/3] w-full">
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full shadow-md ${
              progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress ? `${progress}%` : 'Não iniciado'}
            </div>
            
            {/* Progress bar */}
            {progress !== undefined && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col p-5">
          <div className="relative mb-3">
            <div className="absolute right-0 -top-1 flex gap-2">
              <StatusIcons />
            </div>
            <h3 
              className="text-lg font-semibold truncate hover:text-blue-600 transition-colors pr-24" 
              title={title}
            >
              {title}
            </h3>
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">Autor(a): </span>{author || 'Autor(a) desconhecido(a)'}</p>
              <p><span className="font-medium">Editora: </span>{publisher}</p>
              {duration && <p><span className="font-medium">Duração: </span>{duration}</p>}
            </div>
            <div className="mt-4">
              <ProgressBar />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-auto pt-4">
            <ActionButtons />
          </div>
        </div>
      </div>

      <BookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={props}
      />
    </div>
  );
}
