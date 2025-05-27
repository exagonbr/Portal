import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBookmark,
  FiEdit,
  FiSearch,
  FiMaximize,
  FiMinimize,
  FiColumns,
  FiX,
  FiBook,
  FiInfo,
  FiList,
  FiFileText,
  FiGrid,
  FiSidebar,
  FiEye,
  FiEyeOff,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiDownload,
  FiShare2,
  FiSettings,
  FiMenu,
  FiMoon,
  FiSun,
  FiChevronsLeft,
  FiChevronsRight,
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiHash,
  FiLayers,
  FiBookOpen,
  FiPlus
} from 'react-icons/fi';
import { Book } from '@/constants/mockData';
import { Annotation, Bookmark, Highlight } from './types';
import Image from 'next/image';
import { calculateZoom, filterByPage } from './utils';

interface ViewerControlsProps {
  book: Book;
  currentPage?: number;
  zoom?: number;
  isDualPage?: boolean;
  isFullscreen?: boolean;
  bookmarks?: Bookmark[];
  annotations?: Annotation[];
  highlights?: Highlight[];
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onDualPageToggle?: () => void;
  onFullscreenToggle?: () => void;
  onBookmarkAdd?: (title: string) => void;
  onBookmarkDelete?: (id: string) => void;
  onAnnotationAdd: (annotation: any) => void;
  onHighlightAdd: (highlight: any) => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  book,
  currentPage = 1,
  zoom = 100,
  isDualPage = false,
  isFullscreen = false,
  bookmarks = [],
  annotations = [],
  highlights = [],
  onPageChange,
  onZoomChange,
  onDualPageToggle,
  onFullscreenToggle,
  onBookmarkAdd,
  onBookmarkDelete,
  onAnnotationAdd,
  onHighlightAdd,
  onThemeToggle,
  isDarkMode = false
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'bookmarks' | 'annotations' | 'toc'>('thumbnails');
  const [showMetadata, setShowMetadata] = useState(false);
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'fit' | 'width' | 'height'>('fit');
  const [showControls, setShowControls] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [searchResults, setSearchResults] = useState<{page: number, text: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        onPageChange?.(Math.max(1, currentPage - (isDualPage ? 2 : 1)));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        onPageChange?.(Math.min(book.pageCount || 1, currentPage + (isDualPage ? 2 : 1)));
      } else if (e.key === 'Home') {
        e.preventDefault();
        onPageChange?.(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        onPageChange?.(book.pageCount || 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        handleZoom('in');
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoom('out');
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onFullscreenToggle?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(!showSearch);
      } else if (e.key === 'b') {
        e.preventDefault();
        setActiveTab('bookmarks');
        setShowSidebar(true);
      } else if (e.key === 't') {
        e.preventDefault();
        setActiveTab('thumbnails');
        setShowSidebar(true);
      } else if (e.key === 's') {
        e.preventDefault();
        setShowSidebar(!showSidebar);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, onPageChange, onFullscreenToggle, isDualPage, showSearch]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  // Generate enhanced thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      setLoadingThumbnails(true);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate thumbnails based on book format
      const generatedThumbnails = Array.from({ length: book.pageCount || 5 }, (_, i) => {
        const pageNum = i + 1;
        const isCurrentPage = pageNum === currentPage;
        
        // For PDF books, we would ideally use actual page thumbnails
        // This is a more visually appealing placeholder
        const bgColor = isCurrentPage ? '3b82f6' : (isDarkMode ? '374151' : 'f3f4f6');
        const textColor = isCurrentPage ? 'ffffff' : (isDarkMode ? 'e5e7eb' : '6b7280');
        const borderColor = isCurrentPage ? '2563eb' : (isDarkMode ? '4b5563' : 'd1d5db');
        
        // Create a more visually appealing SVG thumbnail
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='170' viewBox='0 0 120 170'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23${bgColor};stop-opacity:0.7' /%3E%3Cstop offset='100%25' style='stop-color:%23${bgColor};stop-opacity:0.9' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='170' fill='url(%23grad)' rx='6' stroke='%23${borderColor}' stroke-width='${isCurrentPage ? '3' : '1'}' /%3E%3Crect x='15' y='15' width='90' height='120' fill='white' rx='3' opacity='0.9' /%3E%3Ctext x='60' y='85' font-family='Arial' font-size='24' fill='%23${isCurrentPage ? '3b82f6' : '6b7280'}' text-anchor='middle' font-weight='${isCurrentPage ? 'bold' : 'normal'}'%3E${pageNum}%3C/text%3E%3Ctext x='60' y='155' font-family='Arial' font-size='12' fill='%23${textColor}' text-anchor='middle'%3EPage ${pageNum}%3C/text%3E%3C/svg%3E`;
      });
      
      setThumbnails(generatedThumbnails);
      setLoadingThumbnails(false);
    };

    generateThumbnails();
  }, [book.pageCount, book.format, currentPage, isDarkMode]);

  // Scroll to current page in thumbnails
  useEffect(() => {
    if (thumbnailsContainerRef.current && !loadingThumbnails && activeTab === 'thumbnails') {
      const container = thumbnailsContainerRef.current;
      const thumbnailElements = container.querySelectorAll('[data-page]');
      const currentThumbnail = container.querySelector(`[data-page="${currentPage}"]`);
      
      if (currentThumbnail) {
        currentThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentPage, loadingThumbnails, activeTab]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (onZoomChange) {
      const newZoom = calculateZoom(zoom, direction);
      onZoomChange(newZoom);
    }
  }, [zoom, onZoomChange]);
  
  // Mock search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      // Mock search results - in a real implementation, this would search the actual document
      const results = Array.from({ length: Math.min(5, book.pageCount || 0) }, (_, i) => {
        const randomPage = Math.floor(Math.random() * (book.pageCount || 10)) + 1;
        return {
          page: randomPage,
          text: `...${searchQuery} found in context on page ${randomPage}...`
        };
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery, book.pageCount]);

  const handleBookmarkSubmit = () => {
    if (newBookmarkTitle.trim() && onBookmarkAdd) {
      onBookmarkAdd(newBookmarkTitle.trim());
      setNewBookmarkTitle('');
      setIsAddingBookmark(false);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (book.pageCount || 1)) {
      onPageChange?.(value);
    }
  };

  const handleQuickJump = (percentage: number) => {
    const targetPage = Math.ceil((book.pageCount || 1) * percentage);
    onPageChange?.(targetPage);
  };

  // Format for display
  const formatType = book.format?.toUpperCase() || 'UNKNOWN';
  
  // Get current page annotations and highlights
  const currentAnnotations = annotations.filter(a => a.pageNumber === currentPage);
  const currentHighlights = highlights.filter(h => h.pageNumber === currentPage);
  
  // Calculate reading progress
  const readingProgress = book.pageCount ? (currentPage / book.pageCount) * 100 : 0;
  
  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 relative">
        {/* Top Toolbar - conditionally shown in fullscreen mode */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-gray-900/90 backdrop-blur-sm' : 'bg-white dark:bg-gray-800'} border-b border-gray-200 dark:border-gray-700 shadow-sm transition-opacity duration-300 ${isFullscreen && !showControls ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Left Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Sidebar (S)"
            >
              {showSidebar ? <FiSidebar className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-1">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => onPageChange?.(1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First Page (Home)"
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onPageChange?.(currentPage - (isDualPage ? 2 : 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page (←)"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center space-x-1 px-2">
                  <input
                    type="number"
                    value={currentPage}
                    onChange={handlePageInputChange}
                    className="w-14 px-2 py-1 text-center bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    min={1}
                    max={book.pageCount || 1}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / {book.pageCount || '?'}
                  </span>
                </div>
                
                <button
                  onClick={() => onPageChange?.(currentPage + (isDualPage ? 2 : 1))}
                  disabled={currentPage >= (book.pageCount || 1)}
                  className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page (→)"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onPageChange?.(book.pageCount || 1)}
                  disabled={currentPage >= (book.pageCount || 1)}
                  className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last Page (End)"
                >
                  <FiChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(readingProgress)}%
              </span>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Zoom Out (Ctrl+-)"
              >
                <FiZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-medium min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Zoom In (Ctrl++)"
              >
                <FiZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                onClick={() => onZoomChange?.(100)}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Reset Zoom"
              >
                <FiRotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={onDualPageToggle}
                className={`p-2 rounded transition-colors ${
                  isDualPage
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                }`}
                title="Toggle Dual Page View"
              >
                <FiColumns className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'fit' ? 'width' : viewMode === 'width' ? 'height' : 'fit')}
                className={`p-2 rounded transition-colors hover:bg-white dark:hover:bg-gray-600`}
                title={`View Mode: ${viewMode}`}
              >
                {viewMode === 'fit' ? <FiGrid className="w-4 h-4" /> :
                 viewMode === 'width' ? <FiSidebar className="w-4 h-4 rotate-90" /> :
                 <FiSidebar className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowMiniMap(!showMiniMap)}
                className={`p-2 rounded transition-colors ${
                  showMiniMap
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                }`}
                title="Toggle Mini Map"
              >
                <FiLayers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded transition-colors ${
                  showSearch
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                }`}
                title="Search (Ctrl+F)"
              >
                <FiSearch className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const bookmark = bookmarks.find(b => b.pageNumber === currentPage);
                  if (bookmark) {
                    onBookmarkDelete?.(bookmark.id);
                  } else {
                    setIsAddingBookmark(true);
                    setActiveTab('bookmarks');
                    setShowSidebar(true);
                  }
                }}
                className={`p-2 rounded transition-colors ${
                  bookmarks.some(b => b.pageNumber === currentPage)
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'hover:bg-white dark:hover:bg-gray-600'
                }`}
                title="Toggle Bookmark"
              >
                <FiBookmark className="w-4 h-4" fill={bookmarks.some(b => b.pageNumber === currentPage) ? 'currentColor' : 'none'} />
              </button>
              
              {currentAnnotations.length > 0 || currentHighlights.length > 0 ? (
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <span className="text-xs font-medium">{currentAnnotations.length + currentHighlights.length}</span>
                </div>
              ) : null}
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => {/* Implement download */}}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Download"
              >
                <FiDownload className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {/* Implement share */}}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Share"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={onThemeToggle}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={onFullscreenToggle}
                className="p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search in document..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search Results</h4>
                  <div className="space-y-2">
                    {searchResults.map((result, i) => (
                      <div
                        key={i}
                        onClick={() => onPageChange?.(result.page)}
                        className="p-2 bg-white dark:bg-gray-700 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Page {result.page}</span>
                          <button className="text-xs text-gray-500 hover:text-gray-700">Go to page</button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Jump Bar */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Navigation</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">Page {currentPage} of {book.pageCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                {[0, 0.25, 0.5, 0.75, 1].map((percentage) => {
                  const pageNum = Math.ceil((book.pageCount || 1) * percentage);
                  const isActive = Math.abs(currentPage - pageNum) <= 2;
                  return (
                    <button
                      key={percentage}
                      onClick={() => handleQuickJump(percentage)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      {percentage === 0 ? 'Start' : percentage === 1 ? 'End' : `${percentage * 100}%`}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FiBookOpen className="w-4 h-4 text-blue-500" />
                <span>Reading time left:</span>
                <span className="font-medium">~{Math.ceil(((book.pageCount || 0) - currentPage) * 1.5)} min</span>
              </div>
              
              {/* Mini progress bar */}
              <div className="hidden md:block w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className={`w-80 ${isFullscreen ? 'bg-gray-900' : 'bg-white dark:bg-gray-800'} border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl`}>
          {/* Book Info Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-start space-x-4">
              <div className="relative w-20 h-28 flex-shrink-0">
                {book.thumbnail ? (
                  <Image
                    src={book.thumbnail}
                    alt={book.title}
                    fill
                    className="rounded-md object-cover shadow-lg"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-md shadow-lg flex items-center justify-center">
                    {book.format === 'pdf' ? (
                      <FiFileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                    ) : (
                      <FiBook className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base truncate text-gray-800 dark:text-gray-100">{book.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{book.author}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                    {formatType}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {book.pageCount} pages
                  </span>
                </div>
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center"
                >
                  <FiInfo className="w-3 h-3 mr-1" />
                  {showMetadata ? 'Hide' : 'Show'} details
                </button>
              </div>
            </div>

            {/* Metadata */}
            {showMetadata && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm space-y-2 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Publisher</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{book.publisher || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Reading Time</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{book.duration || `~${Math.ceil((book.pageCount || 0) * 1.5)} min`}</p>
                  </div>
                </div>
                
                {book.synopsis && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Synopsis</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                      {book.synopsis}
                    </p>
                    <button className="text-xs text-blue-500 hover:text-blue-600 mt-1">
                      Read more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['thumbnails', 'toc', 'bookmarks', 'annotations'] as const).map((tab) => {
              // Calculate badge counts
              let badgeCount = 0;
              if (tab === 'bookmarks') badgeCount = bookmarks.length;
              if (tab === 'annotations') badgeCount = annotations.length + highlights.length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-2 py-3 text-sm font-medium transition-all relative ${
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    {tab === 'thumbnails' && <FiGrid className={`w-5 h-5 mb-1 ${activeTab === tab ? 'text-blue-500' : ''}`} />}
                    {tab === 'toc' && <FiList className={`w-5 h-5 mb-1 ${activeTab === tab ? 'text-blue-500' : ''}`} />}
                    {tab === 'bookmarks' && <FiBookmark className={`w-5 h-5 mb-1 ${activeTab === tab ? 'text-blue-500' : ''}`} />}
                    {tab === 'annotations' && <FiEdit className={`w-5 h-5 mb-1 ${activeTab === tab ? 'text-blue-500' : ''}`} />}
                    
                    <span>
                      {tab === 'thumbnails' && 'Pages'}
                      {tab === 'toc' && 'Contents'}
                      {tab === 'bookmarks' && 'Bookmarks'}
                      {tab === 'annotations' && 'Notes'}
                    </span>
                    
                    {badgeCount > 0 && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                  
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Thumbnails Tab */}
            {/* Thumbnails Tab */}
            {activeTab === 'thumbnails' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pages</h3>
                    <div className="flex items-center space-x-2">
                      <select
                        className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        defaultValue="grid"
                      >
                        <option value="grid">Grid View</option>
                        <option value="list">List View</option>
                      </select>
                      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        <FiSearch className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div ref={thumbnailsContainerRef} className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {loadingThumbnails ? (
                      // Loading skeleton
                      Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-36 w-full" />
                          <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
                        </div>
                      ))
                    ) : (
                      // Actual thumbnails
                      thumbnails.map((thumbnail, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = pageNum === currentPage;
                        const hasAnnotations = annotations.some(a => a.pageNumber === pageNum);
                        const hasHighlights = highlights.some(h => h.pageNumber === pageNum);
                        const hasBookmark = bookmarks.some(b => b.pageNumber === pageNum);
                        
                        return (
                          <div
                            key={i}
                            data-page={pageNum}
                            onClick={() => onPageChange?.(pageNum)}
                            className={`cursor-pointer transition-all duration-200 group ${
                              isCurrentPage
                                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-105 z-10'
                                : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 hover:scale-105'
                            } rounded-lg overflow-hidden shadow-sm hover:shadow-md`}
                          >
                            <div className="relative bg-gray-100 dark:bg-gray-700">
                              <img
                                src={thumbnail}
                                alt={`Page ${pageNum}`}
                                className="w-full h-36 object-contain"
                                loading="lazy"
                              />
                              {isCurrentPage && (
                                <div className="absolute inset-0 bg-blue-500 bg-opacity-10" />
                              )}
                              
                              {/* Indicators */}
                              <div className="absolute top-1 right-1 flex space-x-1">
                                {hasBookmark && (
                                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <FiBookmark className="w-2 h-2 text-white" />
                                  </div>
                                )}
                                {hasAnnotations && (
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <FiEdit className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-gray-800">
                              <p className={`text-xs ${
                                isCurrentPage ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                Page {pageNum}
                              </p>
                              <button
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPageChange?.(pageNum);
                                }}
                              >
                                <FiArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Table of Contents Tab */}
            {activeTab === 'toc' && (
              <div className="p-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table of Contents</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate through chapters and sections of the book.
                  </p>
                </div>
                
                <div className="space-y-2">
                  {/* Mock TOC items */}
                  {[
                    { title: 'Introduction', page: 1 },
                    { title: 'Chapter 1: Getting Started', page: 5 },
                    { title: 'Chapter 2: Core Concepts', page: 15 },
                    { title: 'Chapter 3: Advanced Techniques', page: 30 },
                    { title: 'Conclusion', page: 45 }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => onPageChange?.(item.page)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        item.page === currentPage
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                      }`}
                    >
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Page {item.page}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmarks</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsAddingBookmark(true)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3">
                  {/* Add bookmark form */}
                  {isAddingBookmark && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">New Bookmark</h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                          Page {currentPage}
                        </span>
                      </div>
                      
                      <input
                        type="text"
                        value={newBookmarkTitle}
                        onChange={(e) => setNewBookmarkTitle(e.target.value)}
                        placeholder="Enter bookmark title..."
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        autoFocus
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleBookmarkSubmit}
                          disabled={!newBookmarkTitle.trim()}
                          className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <FiBookmark className="w-3 h-3" />
                          Save Bookmark
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingBookmark(false);
                            setNewBookmarkTitle('');
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bookmarks list */}
                  <div className="space-y-2">
                    {bookmarks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <FiBookmark className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          No bookmarks yet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                          Add bookmarks to quickly jump to important pages in this document.
                        </p>
                        <button
                          onClick={() => setIsAddingBookmark(true)}
                          className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Your First Bookmark
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                          </p>
                          <button className="text-xs text-blue-500 hover:text-blue-600">
                            Sort by page
                          </button>
                        </div>
                        
                        {bookmarks.map((bookmark) => (
                          <div
                            key={bookmark.id}
                            className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              bookmark.pageNumber === currentPage
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 border-l-4 border-transparent shadow-sm'
                            }`}
                            onClick={() => onPageChange?.(bookmark.pageNumber)}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium truncate ${bookmark.pageNumber === currentPage ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                                  {bookmark.title}
                                </p>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full ml-2">
                                  p.{bookmark.pageNumber}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Added {new Date(bookmark.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookmarkDelete?.(bookmark.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                              title="Remove bookmark"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Annotations Tab */}
            {activeTab === 'annotations' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes & Highlights</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Page {currentPage}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => onAnnotationAdd({ pageNumber: currentPage })}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg hover:shadow-md transition-all border border-amber-200 dark:border-amber-800/30"
                    >
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <FiEdit className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-amber-800 dark:text-amber-300">Add Note</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">Click on page</span>
                    </button>
                    
                    <button
                      onClick={() => onHighlightAdd({ pageNumber: currentPage })}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg hover:shadow-md transition-all border border-emerald-200 dark:border-emerald-800/30"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <FiEye className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-emerald-800 dark:text-emerald-300">Highlight</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Select text</span>
                    </button>
                  </div>
                  
                  {/* Current page annotations */}
                  {currentAnnotations.length > 0 || currentHighlights.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <span className="mr-2">On this page</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {currentAnnotations.length + currentHighlights.length}
                        </span>
                      </h4>
                      
                      {currentAnnotations.map(annotation => (
                        <div key={annotation.id} className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800/30">
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-amber-600 dark:text-amber-400">Note</span>
                            <span className="text-xs text-gray-500">{new Date(annotation.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm mt-1">{annotation.content}</p>
                        </div>
                      ))}
                      
                      {currentHighlights.map(highlight => (
                        <div key={highlight.id} className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">Highlight</span>
                            <span className="text-xs text-gray-500">{new Date(highlight.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm mt-1 italic">"{highlight.content}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <FiEdit className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        No notes or highlights on this page
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                        Click on the page to add notes or select text to highlight important passages.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="mb-3 md:mb-0">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">←/→</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Navigate pages</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">F</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Fullscreen</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">Ctrl+F</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Search</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">S</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Toggle sidebar</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">B</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Bookmarks</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono mr-2">T</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Thumbnails</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Reading time left:</span>
                  <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    ~{Math.ceil(((book.pageCount || 0) - currentPage) * 1.5)} min
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Current position:</span>
                  <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 ml-2">
                    {Math.round(readingProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerControls;
