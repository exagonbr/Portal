import React, { useState } from 'react';
import { Book } from '@/constants/mockData';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';
import { Annotation, Highlight, Bookmark } from './types';

interface BookViewerProps {
  book: Book;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
}

const BookViewer: React.FC<BookViewerProps> = ({ 
  book, 
  onAnnotationAdd,
}) => {
  return (
    <div className="flex h-full w-full">
      {/* Main viewer area */}
      <div className="flex-1 overflow-auto">
        {book.format === 'pdf' ? (
          <PDFViewer fileUrl={book.filePath || ''} />
        ) : (
          <EPUBViewer fileUrl={book.filePath || ''} />
        )}
      </div>
    </div>
  );
};

export default BookViewer;
