export interface Annotation {
  id: string;
  pageNumber: number;
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
}

export interface Highlight {
  id: string;
  pageNumber: number;
  content: string;
  color: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  createdAt: string;
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
