import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiBookmark,
  FiEdit,
  FiSearch,
  FiMaximize,
  FiMinimize,
  FiColumns,
  FiX,
  FiBook
} from 'react-icons/fi';
import { Book } from '@/constants/mockData';
import { Bookmark } from './types';
import Image from 'next/image';

interface ViewerControlsProps {
  book: Book;
  currentPage?: number;
  zoom?: number;
  isDualPage?: boolean;
  isFullscreen?: boolean;
  bookmarks?: Bookmark[];
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onDualPageToggle?: () => void;
  onFullscreenToggle?: () => void;
  onBookmarkAdd?: (title: string) => void;
  onBookmarkDelete?: (id: string) => void;
  onAnnotationAdd: (annotation: any) => void;
  onHighlightAdd: (highlight: any) => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({ 
  book,
  currentPage = 1,
  zoom = 100,
  isDualPage = false,
  isFullscreen = false,
  bookmarks = [],
  onPageChange,
  onZoomChange,
  onDualPageToggle,
  onFullscreenToggle,
  onBookmarkAdd,
  onBookmarkDelete,
  onAnnotationAdd,
  onHighlightAdd
}) => {
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  // Default placeholder for book thumbnail
  const defaultThumbnail = '/icons/icon-192x192.png';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPageChange?.(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        onPageChange?.(currentPage + 1);
      } else if (e.key === '+' || e.key === '=') {
        handleZoom('in');
      } else if (e.key === '-') {
        handleZoom('out');
      } else if (e.key === 'f') {
        onFullscreenToggle?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, onPageChange, onFullscreenToggle]);

  // Simulate thumbnail loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingThumbnails(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (onZoomChange) {
      const step = zoom < 100 ? 5 : 10;
      const newZoom = direction === 'in' ? zoom + step : zoom - step;
      onZoomChange(Math.min(Math.max(newZoom, 50), 200));
    }
  }, [zoom, onZoomChange]);

  const handleBookmarkSubmit = () => {
    if (newBookmarkTitle.trim() && onBookmarkAdd) {
      onBookmarkAdd(newBookmarkTitle.trim());
      setNewBookmarkTitle('');
      setIsAddingBookmark(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 w-full max-w-xs">
      {/* Book Info */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-3">
          <div className="relative w-24 h-36 mb-3 sm:mb-0">
            {book.thumbnail ? (
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="rounded shadow-lg object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded shadow-lg flex items-center justify-center">
                <FiBook size={48} className="text-gray-600" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-bold truncate max-w-[180px]">{book.title}</h1>
            <p className="text-xs text-gray-400">by {book.author}</p>
            <p className="mt-1 text-xs text-gray-300 line-clamp-2 max-w-[180px]">{book.synopsis}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 flex-wrap gap-2">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Previous Page (Left Arrow)"
            aria-label="Go to previous page"
          >
            <FiChevronLeft size={18} />
          </button>
          
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => onPageChange?.(parseInt(e.target.value))}
              className="w-12 px-1 py-0.5 text-xs bg-gray-700 rounded border border-gray-600 text-center"
              min={1}
              max={book.pageCount || 1}
            />
            <span className="text-xs text-gray-400">
              of {book.pageCount || '?'}
            </span>
          </div>
          
          <button 
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= (book.pageCount || 1)}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Next Page (Right Arrow)"
            aria-label="Go to next page"
          >
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onDualPageToggle}
            className={`p-1.5 rounded transition-colors duration-200 ${
              isDualPage ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            title="Toggle Dual Page View"
          >
            <FiColumns size={16} />
          </button>

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded transition-colors duration-200 ${
              showThumbnails ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            title="Toggle Thumbnails"
          >
            <FiSearch size={16} />
          </button>
          
          <button
            onClick={() => setShowMarks(!showMarks)}
            className={`p-1.5 rounded transition-colors duration-200 ${
              showMarks ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            title="Toggle Marks"
          >
            <FiBookmark size={16} />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onFullscreenToggle}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-200"
            title="Toggle Fullscreen (F)"
            aria-label="Toggle fullscreen mode"
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-center space-x-2 p-1.5 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => handleZoom('out')}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-200"
          title="Zoom Out (-)"
          aria-label="Zoom out"
        >
          <FiMinus size={16} />
        </button>
        <span className="text-xs text-gray-400 mx-2">{zoom}%</span>
        <button
          onClick={() => handleZoom('in')}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-200"
          title="Zoom In (+)"
          aria-label="Zoom in"
        >
          <FiPlus size={16} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-2 flex w-full">
        {/* Thumbnails Section */}
        {showThumbnails && (
          <div className="w-full sm:w-100 border-r border-gray-700 overflow-y-auto bg-gray-800">
            {/* Quick Actions Section */}
            {showMarks && (
              <div className="mb-3 px-2 py-1">
                <h3 className="text-xs font-medium mb-2 text-gray-400">Quick Actions</h3>
                <div className="flex flex-col space-y-1">
                  <button 
                    onClick={() => onAnnotationAdd({ page: currentPage })}
                    className="flex items-center gap-1.5 text-xs p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
                    title="Add a note to this page"
                  >
                    <FiEdit size={14} />
                    <span>Add Note</span>
                  </button>
                  <button 
                    onClick={() => onHighlightAdd({ page: currentPage })}
                    className="flex items-center gap-1.5 text-xs p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
                    title="Highlight text on this page"
                  >
                    <FiBookmark size={14} />
                    <span>Highlight</span>
                  </button>
                </div>
              </div>
            )}

            <div className="px-2 py-1">
              <h3 className="text-xs font-medium mb-2 text-gray-400">Pages</h3>
              <div className="space-y-1.5">
                {loadingThumbnails ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className="animate-pulse bg-gray-700 rounded h-20 w-full"
                    />
                  ))
                ) : (
                  // Actual thumbnails
                  Array.from({ length: book.pageCount || 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        currentPage === i + 1 
                          ? 'ring-2 ring-blue-500' 
                          : 'hover:ring-2 hover:ring-gray-500'
                      }`}
                      onClick={() => onPageChange?.(i + 1)}
                    >
                      <div className="bg-gray-700 h-20 w-full" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1">
                        <span className="text-xs text-gray-300">Page {i + 1}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" />
      </div>
    </div>
  );
};

export default ViewerControls;
