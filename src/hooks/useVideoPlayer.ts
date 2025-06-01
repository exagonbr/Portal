import { useState, useEffect, useCallback } from 'react';

interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface VideoPlayerState {
  progress: number;
  bookmarks: number[];
  notes: VideoNote[];
  rating: number;
  settings: {
    quality: string;
    speed: number;
    subtitles: string;
    volume: number;
  };
}

interface UseVideoPlayerProps {
  videoId: string;
  autoSave?: boolean;
  storageKey?: string;
}

export function useVideoPlayer({ 
  videoId, 
  autoSave = true, 
  storageKey = 'videoPlayerState' 
}: UseVideoPlayerProps) {
  const [state, setState] = useState<VideoPlayerState>({
    progress: 0,
    bookmarks: [],
    notes: [],
    rating: 0,
    settings: {
      quality: 'auto',
      speed: 1,
      subtitles: 'off',
      volume: 100
    }
  });

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && autoSave) {
      try {
        const saved = localStorage.getItem(`${storageKey}_${videoId}`);
        if (saved) {
          const parsedState = JSON.parse(saved);
          // Convert date strings back to Date objects for notes
          if (parsedState.notes) {
            parsedState.notes = parsedState.notes.map((note: any) => ({
              ...note,
              createdAt: new Date(note.createdAt)
            }));
          }
          setState(prevState => ({ ...prevState, ...parsedState }));
        }
      } catch (error) {
        console.warn('Failed to load video player state from localStorage:', error);
      }
    }
  }, [videoId, autoSave, storageKey]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && autoSave) {
      try {
        localStorage.setItem(`${storageKey}_${videoId}`, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save video player state to localStorage:', error);
      }
    }
  }, [state, videoId, autoSave, storageKey]);

  // Update progress
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  // Add note
  const addNote = useCallback((timestamp: number, content: string) => {
    const newNote: VideoNote = {
      id: Date.now().toString(),
      timestamp,
      content,
      createdAt: new Date()
    };
    setState(prev => ({
      ...prev,
      notes: [...prev.notes, newNote].sort((a, b) => a.timestamp - b.timestamp)
    }));
    return newNote;
  }, []);

  // Delete note
  const deleteNote = useCallback((noteId: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }));
  }, []);

  // Update note
  const updateNote = useCallback((noteId: string, content: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId ? { ...note, content } : note
      )
    }));
  }, []);

  // Add bookmark
  const addBookmark = useCallback((timestamp: number) => {
    setState(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, timestamp].sort((a, b) => a - b)
    }));
  }, []);

  // Remove bookmark
  const removeBookmark = useCallback((timestamp: number) => {
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(bookmark => Math.abs(bookmark - timestamp) > 1)
    }));
  }, []);

  // Toggle bookmark
  const toggleBookmark = useCallback((timestamp: number) => {
    const existingBookmark = state.bookmarks.find(
      bookmark => Math.abs(bookmark - timestamp) <= 1
    );
    
    if (existingBookmark) {
      removeBookmark(existingBookmark);
    } else {
      addBookmark(timestamp);
    }
  }, [state.bookmarks, addBookmark, removeBookmark]);

  // Update rating
  const updateRating = useCallback((rating: number) => {
    setState(prev => ({ ...prev, rating }));
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VideoPlayerState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  // Reset all data for the video
  const resetVideoData = useCallback(() => {
    setState({
      progress: 0,
      bookmarks: [],
      notes: [],
      rating: 0,
      settings: {
        quality: 'auto',
        speed: 1,
        subtitles: 'off',
        volume: 100
      }
    });
  }, []);

  // Export video data (for sharing or backup)
  const exportVideoData = useCallback(() => {
    return {
      videoId,
      ...state,
      exportedAt: new Date().toISOString()
    };
  }, [videoId, state]);

  // Import video data (from backup or shared data)
  const importVideoData = useCallback((data: any) => {
    try {
      // Validate and sanitize the imported data
      const validatedData: VideoPlayerState = {
        progress: typeof data.progress === 'number' ? data.progress : 0,
        bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks.filter((b: any) => typeof b === 'number') : [],
        notes: Array.isArray(data.notes) ? data.notes.map((note: any) => ({
          id: note.id || Date.now().toString(),
          timestamp: typeof note.timestamp === 'number' ? note.timestamp : 0,
          content: typeof note.content === 'string' ? note.content : '',
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date()
        })) : [],
        rating: typeof data.rating === 'number' ? Math.min(5, Math.max(0, data.rating)) : 0,
        settings: {
          quality: typeof data.settings?.quality === 'string' ? data.settings.quality : 'auto',
          speed: typeof data.settings?.speed === 'number' ? data.settings.speed : 1,
          subtitles: typeof data.settings?.subtitles === 'string' ? data.settings.subtitles : 'off',
          volume: typeof data.settings?.volume === 'number' ? Math.min(100, Math.max(0, data.settings.volume)) : 100
        }
      };
      
      setState(validatedData);
      return true;
    } catch (error) {
      console.error('Failed to import video data:', error);
      return false;
    }
  }, []);

  // Get notes for a specific timestamp range
  const getNotesInRange = useCallback((startTime: number, endTime: number) => {
    return state.notes.filter(note => 
      note.timestamp >= startTime && note.timestamp <= endTime
    );
  }, [state.notes]);

  // Get the nearest bookmark to a timestamp
  const getNearestBookmark = useCallback((timestamp: number) => {
    if (state.bookmarks.length === 0) return null;
    
    return state.bookmarks.reduce((nearest: number, bookmark: number) => {
      const currentDistance = Math.abs(timestamp - bookmark);
      const nearestDistance = Math.abs(timestamp - nearest);
      return currentDistance < nearestDistance ? bookmark : nearest;
    });
  }, [state.bookmarks]);

  return {
    // State
    ...state,
    
    // Actions
    updateProgress,
    addNote,
    deleteNote,
    updateNote,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    updateRating,
    updateSettings,
    resetVideoData,
    exportVideoData,
    importVideoData,
    
    // Utilities
    getNotesInRange,
    getNearestBookmark,
  };
} 