import React from 'react';
import { Book } from '@/constants/mockData';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';
import ViewerControls from './ViewerControls';

interface BookViewerProps {
  book: Book;
  onAnnotationAdd: (annotation: any) => void;
  onHighlightAdd: (highlight: any) => void;
}

const BookViewer: React.FC<BookViewerProps> = ({ 
  book, 
  onAnnotationAdd, 
  onHighlightAdd 
}) => {
  return (
    <div className="flex h-full w-full">
      {/* Sidebar with thumbnails, pages, and marks */}
      
      <div className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
        <ViewerControls 
          book={book}
          onAnnotationAdd={onAnnotationAdd}
          onHighlightAdd={onHighlightAdd}
        />
      </div>

      {/* Main viewer area */}
      <div className="flex-1 overflow-auto">
        {book.format === 'pdf' ? (
          <PDFViewer fileUrl={book.filePath} />
        ) : (
          <EPUBViewer fileUrl={book.filePath} />
        )}
      </div>
    </div>
  );
};

export default BookViewer;
