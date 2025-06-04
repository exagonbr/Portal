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
  onBookOpen?: () => void;
}

export default function BookCard({ viewMode = 'grid', onBookOpen, ...props }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { thumbnail, title, duration, progress, author, publisher, id, pageCount, format } = props;

  // Mock data for annotations and highlights
  const hasAnnotations = id === 'book-1' || id === 'book-2';
  const hasHighlights = id === 'book-2' || id === 'book-3';

  interface ActionButtonsProps {
    size?: 'small' | 'default';
  }

  const ActionButtons: React.FC<ActionButtonsProps> = ({ size = 'default' }) => (
    <>
      <button
        onClick={onBookOpen}
        className={`${
          size === 'small'
            ? 'p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            : 'p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
        }`}
        aria-label="Abrir livro"
      >
        <BookOpenIcon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${
          size === 'small'
            ? 'p-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            : 'p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
        }`}
        aria-label="Mais informações"
      >
        <InformationCircleIcon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    </>
  );

  const StatusIcons = () => (
    <>
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="p-2 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
      >
        {isFavorite ? (
          <HeartSolidIcon className="w-4 h-4 text-red-500" />
        ) : (
          <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500" />
        )}
      </button>
      {hasAnnotations && (
        <div className="p-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg">
          <PencilSquareSolidIcon className="w-4 h-4 text-amber-500" />
        </div>
      )}
      {hasHighlights && (
        <div className="p-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg">
          <StarSolidIcon className="w-4 h-4 text-yellow-500" />
        </div>
      )}
    </>
  );

  const ProgressBar = () => (
    progress !== undefined && progress > 0 ? (
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    ) : null
  );

  const FormatBadge = ({ className = "" }: { className?: string }) => (
    format && (
      <div className={`absolute top-3 right-3 ${className}`}>
        <span className={`px-2 py-1 text-xs font-semibold rounded-lg shadow-lg ${
          format?.toUpperCase() === 'PDF' 
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
        }`}>
          {format?.toUpperCase()}
        </span>
      </div>
    )
  );

  if (viewMode === 'list') {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
        <div className="p-4 flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-32 flex-shrink-0">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover object-center rounded-xl shadow-lg"
              loading="lazy"
            />
            <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-lg shadow-lg ${
              progress ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress ? `${progress}%` : 'Novo'}
            </div>
            <FormatBadge className="top-2 right-2 left-auto" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-700 line-clamp-2 pr-4 hover:text-blue-600 transition-colors">{title}</h3>
                <div className="flex gap-2 -mt-1">
                  <StatusIcons />
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <span className="font-semibold text-gray-600 mr-2">👤 Autor:</span>
                  <span className="truncate">{author}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-gray-600 mr-2">🏢 Editora:</span>
                  <span className="truncate">{publisher}</span>
                </p>
                {pageCount && (
                  <p className="flex items-center">
                    <span className="font-semibold text-gray-600 mr-2">📖 Páginas:</span>
                    <span>{pageCount}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar />
              <div className="flex justify-end gap-3 mt-3">
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
        <div className="relative aspect-[2/3] rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-105">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />

          {/* Progress badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-lg shadow-lg ${
            progress ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/90 text-gray-700'
          }`}>
            {progress ? `${progress}%` : 'Novo'}
          </div>

          <FormatBadge />

          {/* Overlay with book details */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-white line-clamp-2 flex-1">{title}</h3>
                <div className="flex gap-1.5 -mt-1">
                  <StatusIcons />
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-200 truncate">{author}</p>
                {pageCount && <p className="text-xs text-gray-300">{pageCount} páginas</p>}
              </div>

              <div className="flex justify-end gap-2">
                <ActionButtons size="small" />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default grid view
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] min-h-[180px] lg:min-h-[170px] border border-gray-100">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Thumbnail */}
        <div className="relative w-full lg:w-[38%] flex-shrink-0">
          <div className="relative aspect-[4/3] lg:aspect-[3/4] w-full">
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            <div className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-lg backdrop-blur-sm ${
              progress ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white' : 'bg-white/90 text-gray-700'
            }`}>
              {progress ? `${progress}%` : 'Novo'}
            </div>

            <FormatBadge />

            {/* Progress bar */}
            {progress !== undefined && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col p-4 lg:p-5">
          <div className="relative mb-3">
            <div className="absolute right-0 top-0 flex gap-2">
              <StatusIcons />
            </div>
            <h3 className="text-base lg:text-lg font-bold text-gray-700 line-clamp-2 hover:text-blue-600 transition-colors pr-20">
              {title}
            </h3>
          </div>

          <div className="flex-1 overflow-hidden mt-1">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center">
                <span className="font-semibold text-gray-600 mr-2">👤</span>
                <span className="truncate">{author || 'Autor desconhecido'}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-600 mr-2">🏢</span>
                <span className="truncate">{publisher}</span>
              </p>
              {pageCount && (
                <p className="flex items-center">
                  <span className="font-semibold text-gray-600 mr-2">📖</span>
                  <span>{pageCount} páginas</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-end gap-3">
              <ActionButtons />
            </div>
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
