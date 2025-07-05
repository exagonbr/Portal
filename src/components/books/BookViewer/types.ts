export interface Annotation {
  id: number;
  bookId: string;
  pageNumber: number;
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
}

export interface Highlight {
  id: number;
  bookId: string;
  pageNumber: number;
  content: string;
  color: string;
  createdAt: string;
}

export interface Bookmark {
  id: number;
  bookId: string;
  pageNumber: number;
  title: string;
  createdAt: string;
}

export interface ReaderSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  readingMode: 'single' | 'double' | 'scroll';
  autoScroll: boolean;
  speechRate: number;
  speechVoice: string;
  highlightColor: string;
}

export interface BookViewerProps {
  book: any;
  onClose?: () => void;
  initialAnnotations?: Annotation[];
  initialHighlights?: Highlight[];
  initialBookmarks?: Bookmark[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onHighlightAdd?: (highlight: Highlight) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
}

export interface TextSelection {
  text: string;
  rect: DOMRect;
  pageNumber: number;
}

export interface SearchResult {
  page: number;
  excerpt: string;
  position: number;
}

export interface TableOfContentsItem {
  label: string;
  href: string;
  subitems?: TableOfContentsItem[];
}

export interface ViewerState {
  annotations: Annotation[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  isFullscreen: boolean;
  currentScale: number;
  isDualPage: boolean;
  currentPage: number;
}
