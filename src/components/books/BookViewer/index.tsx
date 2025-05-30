import React from 'react';
import { Book } from '@/constants/mockData';
import OptimizedViewer from './OptimizedViewer';
import { Annotation, Highlight, Bookmark } from './types';

interface BookViewerProps {
  book: Book;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBack?: () => void;
  standalone?: boolean;
}

const BookViewer: React.FC<BookViewerProps> = ({
  book,
  initialAnnotations = [],
  initialHighlights = [],
  initialBookmarks = [],
  onAnnotationAdd,
  onHighlightAdd,
  onBookmarkAdd,
  onBack,
  standalone = true
}) => {
  return (
    <OptimizedViewer
      book={book}
      initialAnnotations={initialAnnotations}
      initialHighlights={initialHighlights}
      initialBookmarks={initialBookmarks}
      onAnnotationAdd={onAnnotationAdd}
      onHighlightAdd={onHighlightAdd}
      onBookmarkAdd={onBookmarkAdd}
      onBack={onBack}
    />
  );
};

export default BookViewer;
