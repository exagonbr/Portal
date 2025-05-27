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
  pageCount?: number;
}


export default function BookCard({ viewMode = 'grid', ...props }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { thumbnail, title, duration, progress, author, publisher, id, pageCount } = props;


  // Mock data for annotations and highlights
  // In a real app, this would come from a backend/database
  const hasAnnotations = id === 'book-1' || id === 'book-2';
  const hasHighlights = id === 'book-2' || id === 'book-3';

  interface ActionButtonsProps {
    size?: 'small' | 'default';
  }

  const ActionButtons: React.FC<ActionButtonsProps> = ({ size = 'default' }) => (
    <>
      <Link 
        href={`/portal/books/${id}`}
        className={`${
          size === 'small' 
            ? 'p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-md' 
            : 'p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg'
        }`}
        aria-label="Abrir livro"
      >
        <BookOpenIcon className={size === 'small' ? 'w-5 h-5 text-blue-600' : 'w-8 h-8 text-blue-600'} />
      </Link>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`${
          size === 'small' 
            ? 'p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-md' 
            : 'p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg'
        }`}
        aria-label="Mais informações"
      >
        <InformationCircleIcon className={size === 'small' ? 'w-5 h-5 text-blue-600' : 'w-8 h-8 text-blue-600'} />
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
      <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden hover:bg-gray-50 transition-all duration-200">
        <div className="p-3 flex gap-3">
          {/* Thumbnail */}
          <div className="relative w-20 h-28 flex-shrink-0">
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover object-center rounded-md"
              loading="lazy"
            />
            <div className={`absolute top-1 left-1 px-1.5 py-0.5 text-[0.65rem] rounded-full shadow-md ${
              progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress ? `${progress}%` : 'Não iniciado'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-semibold line-clamp-1 pr-16">{title}</h3>
                <div className="flex gap-1.5 -mt-1">
                  <StatusIcons />
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <p className="truncate"><span className="font-medium">Autor(a): </span>{author}</p>
                <p className="truncate"><span className="font-medium">Editora: </span>{publisher}</p>
                {pageCount && <p className="truncate"><span className="font-medium">Páginas: </span>{pageCount}</p>}
              </div>
            </div>

            <div className="mt-2">
              <ProgressBar />
              <div className="flex justify-end gap-1.5 mt-2">
                <ActionButtons size="small" />
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
        <div className="relative aspect-[2/3] rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-all duration-200">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          
          {/* Progress badge */}
          <div className={`absolute top-2 left-2 px-1.5 py-0.5 text-[0.65rem] rounded-full shadow-md ${
            progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {progress ? `${progress}%` : 'Não iniciado'}
          </div>

          {/* Overlay with book details */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xs font-medium text-white line-clamp-2">{title}</h3>
                <div className="flex gap-1 -mt-1">
                  <StatusIcons />
                </div>
              </div>
              
              <div className="space-y-0.5 mb-2">
                <p className="text-[0.65rem] text-gray-200 truncate">{author}</p>
                {pageCount && <p className="text-[0.65rem] text-gray-300">Páginas: {pageCount}</p>}
              </div>

              <div className="flex justify-end gap-1.5">
                <ActionButtons size="small" />
              </div>
            </div>
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
    <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-all duration-200 hover:scale-[1.01] min-h-[160px] lg:min-h-[150px]">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Thumbnail */}
        <div className="relative w-full lg:w-[34%] flex-shrink-0">
          <div className="relative aspect-[4/3] lg:aspect-[3/4] w-full">
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className={`absolute top-2 left-2 px-2 py-1 text-[0.65rem] sm:text-xs rounded-full shadow-md ${
              progress ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            } whitespace-nowrap`}>

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
        <div className="flex-1 min-w-0 flex flex-col p-3 sm:p-4">
          <div className="relative mb-2">
            <div className="absolute right-0 top-0 flex gap-1.5">
              <StatusIcons />
            </div>
            <h3 className="text-sm lg:text-base font-semibold line-clamp-2 hover:text-blue-600 transition-colors pr-16">
              {title}
            </h3>
          </div>

          <div className="flex-1 overflow-hidden mt-1">
            <div className="text-xs lg:text-sm text-gray-600 space-y-1">
              <p className="truncate"><span className="font-medium">Autor(a): </span>{author || 'Autor(a) desconhecido(a)'}</p>
              <p className="truncate"><span className="font-medium">Editora: </span>{publisher}</p>
              {pageCount && <p className="truncate"><span className="font-medium">Páginas: </span>{pageCount}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-auto pt-2">
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
