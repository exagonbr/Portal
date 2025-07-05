// Types for book reading tracking system

export interface BookProgress {
  id: string;
  bookId: number;
  userId: bigint;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastPosition?: string;
  readingTime: number; // in seconds
  lastReadAt: Date;
  completedAt?: Date;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookHighlight {
  id: string;
  bookId: number;
  userId: bigint;
  pageNumber: number;
  startPosition: string;
  endPosition: string;
  highlightedText: string;
  color: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookBookmark {
  id: string;
  bookId: number;
  userId: bigint;
  pageNumber: number;
  position: string;
  title?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookAnnotation {
  id: string;
  bookId: number;
  userId: bigint;
  pageNumber: number;
  position?: string;
  referencedText?: string;
  annotation: string;
  type: 'note' | 'question' | 'comment' | string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookFavorite {
  id: string;
  bookId: number;
  userId: bigint;
  createdAt: Date;
}

// DTOs for creating/updating records

export interface CreateBookProgressDto {
  bookId: number;
  userId: bigint;
  currentPage: number;
  totalPages: number;
  progressPercent?: number;
  lastPosition?: string;
}

export interface UpdateBookProgressDto {
  currentPage?: number;
  progressPercent?: number;
  lastPosition?: string;
  readingTime?: number;
  completedAt?: Date;
}

export interface CreateBookHighlightDto {
  bookId: number;
  userId: bigint;
  pageNumber: number;
  startPosition: string;
  endPosition: string;
  highlightedText: string;
  color?: string;
  note?: string;
}

export interface CreateBookBookmarkDto {
  bookId: number;
  userId: bigint;
  pageNumber: number;
  position: string;
  title?: string;
  note?: string;
}

export interface CreateBookAnnotationDto {
  bookId: number;
  userId: bigint;
  pageNumber: number;
  position?: string;
  referencedText?: string;
  annotation: string;
  type?: string;
  isPrivate?: boolean;
}

export interface CreateBookFavoriteDto {
  bookId: number;
  userId: bigint;
}

// Position tracking interfaces

export interface ReadingPosition {
  page: number;
  paragraph?: number;
  line?: number;
  word?: number;
  percentage?: number;
}

export interface ReadingSession {
  startTime: Date;
  endTime?: Date;
  pagesRead: number;
  duration: number; // in seconds
} 