import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Book as EpubBook, Rendition } from 'epubjs';
import { ViewerControls } from './ViewerControls';
import { AnnotationLayer } from './AnnotationLayer';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import { FiX } from 'react-icons/fi';

interface EPUBViewerProps {
  fileUrl: string;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
}

const EPUBViewer: React.FC<EPUBViewerProps> = ({ 
  fileUrl,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: 1.0,
    isDualPage: false,
    currentPage: 1
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [bookMetadata, setBookMetadata] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Convert relative path to absolute URL if needed
    const absoluteUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${window.location.origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;

    const newBook = new EpubBook(absoluteUrl, {
      openAs: 'epub',
      requestHeaders: {
        'Accept': 'application/epub+zip',
        'Access-Control-Allow-Origin': '*'
      }
    });

    setBook(newBook);

    const loadBook = async () => {
      try {
        // Wait for initial book loading
        await newBook.ready;
        
        // Load metadata
        const meta = await newBook.loaded.metadata;
        setBookMetadata(meta);
        
        // Render the book
        const newRendition = newBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: viewerState.isDualPage ? 'auto' : 'none',
          flow: 'paginated'
        });
        
        setRendition(newRendition);

        // Display the first page
        await newRendition.display();

        // Generate locations for pagination
        await newBook.locations.generate(1024);
        const total = newBook.locations.length();
        setTotalPages(total);

        // Set up event listeners
        newRendition.on('relocated', (location: any) => {
          const currentLocation = newBook.locations.locationFromCfi(location.start.cfi);
          if (typeof currentLocation === 'number') {
            setViewerState(prev => ({ ...prev, currentPage: currentLocation + 1 }));
          }
        });

        // Handle text selection for highlights
        newRendition.on('selected', (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection().toString();
          if (text) {
            handleTextSelection(cfiRange, text);
          }
        });

      } catch (error) {
        console.error('Error loading EPUB:', error);
      }
    };

    loadBook();

    return () => {
      if (newBook) {
        newBook.destroy();
      }
    };
  }, [fileUrl]);

  // Update rendition when dual page mode changes
  useEffect(() => {
    if (rendition) {
      rendition.spread(viewerState.isDualPage ? 'auto' : 'none');
    }
  }, [viewerState.isDualPage, rendition]);

  // Update rendition scale
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${viewerState.currentScale * 100}%`);
    }
  }, [viewerState.currentScale, rendition]);

  const handlePageChange = useCallback((newPage: number) => {
    if (book && rendition && newPage >= 1 && newPage <= totalPages) {
      const cfi = book.locations.cfiFromLocation(newPage - 1);
      rendition.display(cfi);
    }
  }, [book, rendition, totalPages]);

  const handleZoomChange = useCallback((zoomLevel: number) => {
    setViewerState(prev => ({ ...prev, currentScale: zoomLevel / 100 }));
  }, []);

  const handleDualPageToggle = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDualPage: !prev.isDualPage }));
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current).then(() => {
        setViewerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
      });
    }
  }, []);

  // Annotation handlers
  const handleAnnotationAdd = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation]
    }));
    onAnnotationAdd?.(newAnnotation);
  }, [onAnnotationAdd]);

  const handleAnnotationDelete = useCallback((id: string) => {
    setViewerState(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== id)
    }));
  }, []);

  // Highlight handlers
  const handleTextSelection = useCallback((cfiRange: string, text: string) => {
    if (!rendition) return;

    const highlight: Omit<Highlight, 'id' | 'createdAt'> = {
      pageNumber: viewerState.currentPage,
      content: text,
      color: '#ffeb3b',
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    };

    handleHighlightAdd(highlight);

    // Add highlight to EPUB rendition
    rendition.annotations.highlight(cfiRange, {}, (e: MouseEvent) => {
      console.log('Highlight clicked:', text);
    }, '', { fill: '#ffeb3b', 'fill-opacity': '0.3' });
  }, [rendition, viewerState.currentPage]);

  const handleHighlightAdd = useCallback((highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight]
    }));
    onHighlightAdd?.(newHighlight);
  }, [onHighlightAdd]);

  const handleHighlightDelete = useCallback((id: string) => {
    setViewerState(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== id)
    }));
  }, []);

  // Bookmark handlers
  const handleBookmarkAdd = useCallback((title: string) => {
    const newBookmark: Bookmark = {
      id: uuidv4(),
      pageNumber: viewerState.currentPage,
      title,
      createdAt: new Date().toISOString()
    };
    setViewerState(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newBookmark]
    }));
    onBookmarkAdd?.(newBookmark);
  }, [viewerState.currentPage, onBookmarkAdd]);

  const handleBookmarkDelete = useCallback((id: string) => {
    setViewerState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id)
    }));
  }, []);

  const mockBook: Book = {
    id: 'epub-viewer',
    title: bookMetadata?.title || "EPUB Document",
    author: bookMetadata?.creator || "Unknown",
    publisher: bookMetadata?.publisher || "Unknown",
    thumbnail: "",
    synopsis: bookMetadata?.description || "",
    duration: "N/A",
    pageCount: totalPages,
    format: 'epub'
  };

  // Toggle dark mode
  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
    
    // Apply dark mode to EPUB renderer if needed
    if (rendition) {
      rendition.themes.register('dark', {
        'body': { 'color': '#e5e7eb !important', 'background-color': '#1f2937 !important' },
        'a': { 'color': '#60a5fa !important' }
      });
      rendition.themes.register('light', {
        'body': { 'color': '#1f2937 !important', 'background-color': '#ffffff !important' },
        'a': { 'color': '#3b82f6 !important' }
      });
      
      rendition.themes.select(isDarkMode ? 'light' : 'dark');
    }
  }, [rendition, isDarkMode]);

  return (
    <div
      ref={containerRef}
      className={`flex h-full ${viewerState.isFullscreen ? 'bg-gray-900' : ''} ${isDarkMode ? 'dark' : ''}`}
    >
      <div className="flex-1 overflow-auto relative">
        <div
          ref={viewerRef}
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        />
        
        {/* Overlay for annotations on current page */}
        {viewerState.annotations
          .filter(a => a.pageNumber === viewerState.currentPage)
          .map(annotation => (
            <div
              key={annotation.id}
              className="absolute bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-800/30"
              style={{
                left: `${annotation.position.x}px`,
                top: `${annotation.position.y}px`,
                zIndex: 10,
                maxWidth: '250px'
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Note</span>
                <span className="text-xs text-gray-500">{new Date(annotation.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">{annotation.content}</p>
              <button
                onClick={() => handleAnnotationDelete(annotation.id)}
                className="text-xs text-red-500 hover:text-red-600 mt-2 flex items-center"
              >
                <FiX className="w-3 h-3 mr-1" /> Remove
              </button>
            </div>
          ))}
      </div>

      <ViewerControls
        book={mockBook}
        currentPage={viewerState.currentPage}
        zoom={viewerState.currentScale * 100}
        isDualPage={viewerState.isDualPage}
        isFullscreen={viewerState.isFullscreen}
        bookmarks={viewerState.bookmarks}
        annotations={viewerState.annotations}
        highlights={viewerState.highlights}
        onPageChange={handlePageChange}
        onZoomChange={handleZoomChange}
        onDualPageToggle={handleDualPageToggle}
        onFullscreenToggle={handleFullscreenToggle}
        onBookmarkAdd={handleBookmarkAdd}
        onBookmarkDelete={handleBookmarkDelete}
        onAnnotationAdd={handleAnnotationAdd}
        onHighlightAdd={handleHighlightAdd}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default EPUBViewer;
