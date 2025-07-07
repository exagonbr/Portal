import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookProgress,
  BookHighlight,
  BookBookmark,
  BookAnnotation,
  CreateBookHighlightDto,
  CreateBookBookmarkDto,
  CreateBookAnnotationDto,
  UpdateBookProgressDto
} from '@/types/book-reading';

interface UseBookReadingProps {
  bookId: number;
  totalPages: number;
}

export function useBookReading({ bookId, totalPages }: UseBookReadingProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([]);
  const [annotations, setAnnotations] = useState<BookAnnotation[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (!user?.id) return;
    
    fetchBookData();
  }, [bookId, user]);

  const fetchBookData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [progressRes, highlightsRes, bookmarksRes, annotationsRes, favoriteRes] = await Promise.all([
        fetch(`/api/books/${bookId}/progress`),
        fetch(`/api/books/${bookId}/highlights`),
        fetch(`/api/books/${bookId}/bookmarks`),
        fetch(`/api/books/${bookId}/annotations`),
        fetch(`/api/books/${bookId}/favorite`)
      ]);

      if (progressRes.ok) {
        const { progress } = await progressRes.json();
        setProgress(progress);
      }

      if (highlightsRes.ok) {
        const { highlights } = await highlightsRes.json();
        setHighlights(highlights);
      }

      if (bookmarksRes.ok) {
        const { bookmarks } = await bookmarksRes.json();
        setBookmarks(bookmarks);
      }

      if (annotationsRes.ok) {
        const { annotations } = await annotationsRes.json();
        setAnnotations(annotations);
      }

      if (favoriteRes.ok) {
        const { isFavorite } = await favoriteRes.json();
        setIsFavorite(isFavorite);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress tracking
  const updateProgress = useCallback(async (currentPage: number) => {
    if (!user?.id) return;

    const progressPercent = (currentPage / totalPages) * 100;
    const updateData: UpdateBookProgressDto = {
      currentPage,
      progressPercent,
      lastPosition: JSON.stringify({ page: currentPage })
    };

    // Mark as completed if reached last page
    if (currentPage >= totalPages) {
      updateData.completedAt = new Date();
    }

    try {
      const response = await fetch(`/api/books/${bookId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPage,
          totalPages,
          progressPercent,
          ...updateData
        })
      });

      if (response.ok) {
        const { progress } = await response.json();
        setProgress(progress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [bookId, totalPages, user]);

  // Start reading session
  const startReadingSession = useCallback(() => {
    setReadingStartTime(new Date());
  }, []);

  // End reading session and update reading time
  const endReadingSession = useCallback(async () => {
    if (!readingStartTime || !user?.id) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - readingStartTime.getTime()) / 1000);

    try {
      await fetch(`/api/books/${bookId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalSeconds: duration })
      });
    } catch (error) {
      console.error('Error updating reading time:', error);
    }

    setReadingStartTime(null);
  }, [bookId, readingStartTime, user]);

  // Highlights management
  const addHighlight = useCallback(async (highlightData: Omit<CreateBookHighlightDto, 'bookId' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highlightData)
      });

      if (response.ok) {
        const { highlight } = await response.json();
        setHighlights(prev => [...prev, highlight]);
        return highlight;
      }
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  }, [bookId, user]);

  const removeHighlight = useCallback(async (highlightId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/highlights`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId })
      });

      if (response.ok) {
        setHighlights(prev => prev.filter(h => h.id !== highlightId));
      }
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  }, [bookId, user]);

  // Bookmarks management
  const addBookmark = useCallback(async (bookmarkData: Omit<CreateBookBookmarkDto, 'bookId' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarkData)
      });

      if (response.ok) {
        const { bookmark } = await response.json();
        setBookmarks(prev => [...prev, bookmark]);
        return bookmark;
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  }, [bookId, user]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/bookmarks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId })
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }, [bookId, user]);

  // Annotations management
  const addAnnotation = useCallback(async (annotationData: Omit<CreateBookAnnotationDto, 'bookId' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotationData)
      });

      if (response.ok) {
        const { annotation } = await response.json();
        setAnnotations(prev => [...prev, annotation]);
        return annotation;
      }
    } catch (error) {
      console.error('Error adding annotation:', error);
    }
  }, [bookId, user]);

  const updateAnnotation = useCallback(async (annotationId: string, content: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/annotations/${annotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotation: content })
      });

      if (response.ok) {
        const { annotation } = await response.json();
        setAnnotations(prev => prev.map(a => a.id === annotationId ? annotation : a));
        return annotation;
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  }, [bookId, user]);

  const removeAnnotation = useCallback(async (annotationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/annotations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotationId })
      });

      if (response.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      }
    } catch (error) {
      console.error('Error removing annotation:', error);
    }
  }, [bookId, user]);

  // Favorite management
  const toggleFavorite = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/books/${bookId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const { isFavorite: newFavoriteStatus } = await response.json();
        setIsFavorite(newFavoriteStatus);
        return newFavoriteStatus;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [bookId, user]);

  return {
    // State
    progress,
    highlights,
    bookmarks,
    annotations,
    isFavorite,
    isLoading,
    
    // Actions
    updateProgress,
    startReadingSession,
    endReadingSession,
    addHighlight,
    removeHighlight,
    addBookmark,
    removeBookmark,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    toggleFavorite,
    
    // Utilities
    refetch: fetchBookData
  };
} 