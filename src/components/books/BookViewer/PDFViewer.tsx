import React, { useState, useCallback, useRef } from 'react';
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
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileUrl,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setViewerState(prev => ({ ...prev, currentPage: newPage }));
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

    // For dual page view, show pairs of pages (2-3, 4-5, etc)
    const isEvenPage = viewerState.currentPage % 2 === 0;
    const firstPage = isEvenPage ? viewerState.currentPage : viewerState.currentPage - 1;
    const secondPage = isEvenPage ? viewerState.currentPage + 1 : viewerState.currentPage;

    // Don't show a non-existent page
    if (secondPage > (numPages || 0)) {
      return [firstPage];
    }

    return [firstPage, secondPage];
  };

  const mockBook: Book = {
    id: 'pdf-viewer',
    title: "PDF Document",
    author: "Unknown",
    publisher: "Unknown",
    thumbnail: "",
    synopsis: "",
    duration: "N/A",
    pageCount: numPages || 0,
    format: 'pdf'
  };

  return (
    <div 
      ref={containerRef}
      className={`flex h-full ${viewerState.isFullscreen ? 'bg-gray-900' : ''}`}
    >
      <div className="flex-1 overflow-auto relative">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-white">Loading PDF...</div>}
          error={<div className="text-red-500">Failed to load PDF</div>}
        >
          <div className="flex justify-center">
            {getPagesToDisplay().map((pageNum) => (
              <div key={pageNum} className="relative mx-1">
                <Page
                  pageNumber={pageNum}
                  scale={viewerState.currentScale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                />
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
      </div>

      <ViewerControls
        book={mockBook}
        currentPage={viewerState.currentPage}
        zoom={viewerState.currentScale * 100}
        isDualPage={viewerState.isDualPage}
        isFullscreen={viewerState.isFullscreen}
        bookmarks={viewerState.bookmarks}
        onPageChange={handlePageChange}
        onZoomChange={handleZoomChange}
        onDualPageToggle={handleDualPageToggle}
        onFullscreenToggle={handleFullscreenToggle}
        onBookmarkAdd={handleBookmarkAdd}
        onBookmarkDelete={handleBookmarkDelete}
        onAnnotationAdd={handleAnnotationAdd}
        onHighlightAdd={handleHighlightAdd}
      />
    </div>
  );
};

export default PDFViewer;
