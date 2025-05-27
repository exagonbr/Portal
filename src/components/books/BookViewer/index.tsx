import React, { useState } from 'react';
import { Book } from '@/constants/mockData';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';
import { Annotation, Highlight, Bookmark } from './types';

interface BookViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
}

const BookViewer: React.FC<BookViewerProps> = ({
  book,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd
}) => {
  // Store annotations, highlights, and bookmarks at the parent level
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  const handleAnnotationAdd = (annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    onAnnotationAdd?.(annotation);
  };

  const handleHighlightAdd = (highlight: Highlight) => {
    setHighlights(prev => [...prev, highlight]);
    onHighlightAdd?.(highlight);
  };

  const handleBookmarkAdd = (bookmark: Bookmark) => {
    setBookmarks(prev => [...prev, bookmark]);
    onBookmarkAdd?.(bookmark);
  };

  const commonProps = {
    fileUrl: book.filePath || '',
    initialAnnotations: annotations,
    initialHighlights: highlights,
    initialBookmarks: bookmarks,
    onAnnotationAdd: handleAnnotationAdd,
    onHighlightAdd: handleHighlightAdd,
    onBookmarkAdd: handleBookmarkAdd
  };

  return (
    <div className="flex h-full w-full">
      {/* Main viewer area */}
      <div className="flex-1 overflow-auto">
        {book.format === 'pdf' ? (
          <PDFViewer {...commonProps} />
        ) : book.format === 'epub' ? (
          <EPUBViewer {...commonProps} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Unsupported format: {book.format}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookViewer;
