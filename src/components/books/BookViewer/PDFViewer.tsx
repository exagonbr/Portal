import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ViewerControls } from './ViewerControls';
import { AnnotationLayer } from './AnnotationLayer';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark, ViewerState } from './types';
import { v4 as uuidv4 } from 'uuid';
import screenfull from 'screenfull';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  fileUrl: string;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileUrl,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  isDarkMode = false,
  onThemeToggle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({
    annotations: initialAnnotations,
    highlights: initialHighlights,
    bookmarks: initialBookmarks,
    isFullscreen: false,
    currentScale: 1.0,
    isDualPage: false,
    currentPage: 1
  });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [fitMode, setFitMode] = useState<'width' | 'height' | 'page'>('page');

  // Calculate optimal page dimensions based on container size
  useEffect(() => {
    const updatePageDimensions = () => {
      if (pageContainerRef.current) {
        const container = pageContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const padding = 40; // Total padding
        
        // Calculate available space
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;
        
        if (fitMode === 'width') {
          setPageWidth(availableWidth);
          setPageHeight(0); // Let height be auto
        } else if (fitMode === 'height') {
          setPageHeight(availableHeight);
          setPageWidth(0); // Let width be auto
        } else { // fit page
          // For dual page mode, divide width by 2
          const targetWidth = viewerState.isDualPage 
            ? (availableWidth - 20) / 2 
            : availableWidth;
          
          setPageWidth(Math.min(targetWidth, 900)); // Max width for readability
          setPageHeight(availableHeight);
        }
      }
    };

    updatePageDimensions();
    window.addEventListener('resize', updatePageDimensions);
    return () => window.removeEventListener('resize', updatePageDimensions);
  }, [viewerState.isDualPage, fitMode]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  }

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setViewerState(prev => ({ ...prev, currentPage: newPage }));
      
      // Smooth scroll to top when changing pages
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [numPages]);

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

  // Calculate pages to display based on current mode and page number
  const getPagesToDisplay = () => {
    if (!viewerState.isDualPage || viewerState.currentPage === 1) {
      return [viewerState.currentPage];
    }

    // For dual page view, show odd-even pairs (1-2, 3-4, etc)
    const isOddPage = viewerState.currentPage % 2 === 1;
    const firstPage = isOddPage ? viewerState.currentPage : viewerState.currentPage - 1;
    const secondPage = firstPage + 1;

    // Don't show a non-existent page
    if (secondPage > (numPages || 0)) {
      return [firstPage];
    }

    return [firstPage, secondPage];
  };

  const mockBook: Book = {
    id: 'pdf-viewer',
    title: pdfDocument?.info?.title || "PDF Document",
    author: pdfDocument?.info?.author || "Unknown Author",
    publisher: pdfDocument?.info?.producer || "Unknown Publisher",
    thumbnail: "",
    synopsis: pdfDocument?.info?.subject || "",
    duration: "N/A",
    pageCount: numPages || 0,
    format: 'pdf'
  };

  return (
    <div
      ref={containerRef}
      className={`h-full w-full flex flex-col ${viewerState.isFullscreen ? 'fixed inset-0 z-50' : ''} ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Controls - Fixed height header */}
      <div className="flex-shrink-0">
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
          onThemeToggle={onThemeToggle}
          isDarkMode={isDarkMode}
        />
      </div>
      
      {/* PDF Content - Flexible height container */}
      <div 
        ref={pageContainerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <Document
            file={fileUrl}
            onLoadSuccess={(pdf) => {
              setPdfDocument(pdf);
              onDocumentLoadSuccess(pdf);
            }}
            onLoadError={onDocumentLoadError}
            className="flex justify-center"
          >
            <div className={`flex ${viewerState.isDualPage ? 'space-x-4' : ''} justify-center py-4`}>
              {getPagesToDisplay().map((pageNum) => (
                <div 
                  key={pageNum} 
                  className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
                  style={{ 
                    transform: `scale(${viewerState.currentScale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth || undefined}
                    height={pageHeight || undefined}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="pdf-page"
                    loading={
                      <div className="flex items-center justify-center h-96 bg-gray-50">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    }
                  />
                  
                  {/* Page number overlay */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Page {pageNum}
                  </div>
                  
                  {/* Annotation layer */}
                  <AnnotationLayer
                    pageNumber={pageNum}
                    scale={viewerState.currentScale}
                    annotations={viewerState.annotations}
                    highlights={viewerState.highlights}
                    onAnnotationAdd={handleAnnotationAdd}
                    onAnnotationDelete={handleAnnotationDelete}
                    onHighlightAdd={handleHighlightAdd}
                    onHighlightDelete={handleHighlightDelete}
                  />
                </div>
              ))}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
