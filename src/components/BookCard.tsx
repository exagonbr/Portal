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
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

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
  const { theme } = useTheme();
  const { thumbnail, title, duration, progress, author, publisher, id, pageCount, format } = props;

  // Mock data for annotations and highlights
  const hasAnnotations = id === 'book-1' || id === 'book-2';
  const hasHighlights = id === 'book-2' || id === 'book-3';

  interface ActionButtonsProps {
    size?: 'small' | 'default';
  }

  const ActionButtons: React.FC<ActionButtonsProps> = ({ size = 'default' }) => (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBookOpen}
        className={`${
          size === 'small' ? 'p-2' : 'p-3'
        } rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200`}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`
        }}
        aria-label="Abrir livro"
      >
        <BookOpenIcon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className={`${
          size === 'small' ? 'p-2' : 'p-3'
        } rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200`}
        style={{
          backgroundColor: theme.colors.text.secondary
        }}
        aria-label="Mais informações"
      >
        <InformationCircleIcon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
      </motion.button>
    </>
  );

  const StatusIcons = () => (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsFavorite(!isFavorite)}
        className="p-2 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
        style={{
          backgroundColor: theme.colors.background.card + 'E6'
        }}
      >
        {isFavorite ? (
          <HeartSolidIcon className="w-4 h-4" style={{ color: theme.colors.status.error }} />
        ) : (
          <HeartIcon className="w-4 h-4" style={{ color: theme.colors.text.secondary }} />
        )}
      </motion.button>
      {hasAnnotations && (
        <div 
          className="p-2 rounded-xl backdrop-blur-sm shadow-lg"
          style={{
            backgroundColor: theme.colors.background.card + 'E6'
          }}
        >
          <PencilSquareSolidIcon className="w-4 h-4" style={{ color: theme.colors.accent.DEFAULT }} />
        </div>
      )}
      {hasHighlights && (
        <div 
          className="p-2 rounded-xl backdrop-blur-sm shadow-lg"
          style={{
            backgroundColor: theme.colors.background.card + 'E6'
          }}
        >
          <StarSolidIcon className="w-4 h-4" style={{ color: theme.colors.secondary.DEFAULT }} />
        </div>
      )}
    </>
  );

  const ProgressBar = () => (
    progress !== undefined && progress > 0 ? (
      <div className="h-2 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: theme.colors.background.secondary }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.secondary.DEFAULT})`
          }}
        />
      </div>
    ) : null
  );

  const FormatBadge = ({ className = "" }: { className?: string }) => (
    format && (
      <div className={`absolute top-3 right-3 ${className}`}>
        <span 
          className="px-2 py-1 text-xs font-semibold rounded-lg shadow-lg text-white"
          style={{
            background: format?.toUpperCase() === 'PDF' 
              ? `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.error}DD)`
              : `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}DD)`
          }}
        >
          {format?.toUpperCase()}
        </span>
      </div>
    )
  );

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="w-full rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 border"
        style={{
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.light
        }}
      >
        <div className="p-4 flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-32 flex-shrink-0">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover object-center rounded-xl shadow-lg"
              loading="lazy"
            />
            <div 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-lg shadow-lg text-white"
              style={{
                background: progress 
                  ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`
                  : theme.colors.background.secondary,
                color: progress ? 'white' : theme.colors.text.secondary
              }}
            >
              {progress ? `${progress}%` : 'Novo'}
            </div>
            <FormatBadge className="top-2 right-2 left-auto" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="text-lg font-bold line-clamp-2 pr-4 transition-colors"
                  style={{ color: theme.colors.text.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary.DEFAULT}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.text.primary}
                >
                  {title}
                </h3>
                <div className="flex gap-2 -mt-1">
                  <StatusIcons />
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                  <span className="font-semibold mr-2">👤 Autor:</span>
                  <span className="truncate">{author}</span>
                </p>
                <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                  <span className="font-semibold mr-2">🏢 Editora:</span>
                  <span className="truncate">{publisher}</span>
                </p>
                {pageCount && (
                  <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                    <span className="font-semibold mr-2">📖 Páginas:</span>
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
      </motion.div>
    );
  }

  if (viewMode === 'cover') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="relative group"
      >
        <div className="relative aspect-[2/3] rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />

          {/* Progress badge */}
          <div 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-lg shadow-lg"
            style={{
              background: progress
                ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`
                : theme.colors.background.card + 'E6',
              color: progress ? 'white' : theme.colors.text.primary
            }}
          >
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
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.primary.light}, ${theme.colors.primary.dark})`
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default grid view
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 min-h-[180px] lg:min-h-[170px] border"
      style={{
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border.light
      }}
    >
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
            
            <div 
              className="absolute top-3 left-3 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-lg backdrop-blur-sm"
              style={{
                background: progress
                  ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}E6, ${theme.colors.primary.dark}E6)`
                  : theme.colors.background.card + 'E6',
                color: progress ? 'white' : theme.colors.text.primary
              }}
            >
              {progress ? `${progress}%` : 'Novo'}
            </div>

            <FormatBadge />

            {/* Progress bar */}
            {progress !== undefined && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.colors.primary.light}, ${theme.colors.primary.dark})`
                  }}
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
            <h3 
              className="text-base lg:text-lg font-bold line-clamp-2 transition-colors pr-20"
              style={{ color: theme.colors.text.primary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary.DEFAULT}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.text.primary}
            >
              {title}
            </h3>
          </div>

          <div className="flex-1 overflow-hidden mt-1">
            <div className="text-sm space-y-2">
              <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                <span className="font-semibold mr-2">👤</span>
                <span className="truncate">{author || 'Autor desconhecido'}</span>
              </p>
              <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                <span className="font-semibold mr-2">🏢</span>
                <span className="truncate">{publisher}</span>
              </p>
              {pageCount && (
                <p className="flex items-center" style={{ color: theme.colors.text.secondary }}>
                  <span className="font-semibold mr-2">📖</span>
                  <span>{pageCount} páginas</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t" style={{ borderColor: theme.colors.border.light }}>
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
    </motion.div>
  );
}
