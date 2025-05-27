import { v4 as uuidv4 } from 'uuid';
import { Annotation, Highlight, Bookmark } from './types';

export const createAnnotation = (
  annotation: Omit<Annotation, 'id' | 'createdAt'>
): Annotation => ({
  ...annotation,
  id: uuidv4(),
  createdAt: new Date().toISOString()
});

export const createHighlight = (
  highlight: Omit<Highlight, 'id' | 'createdAt'>
): Highlight => ({
  ...highlight,
  id: uuidv4(),
  createdAt: new Date().toISOString()
});

export const createBookmark = (
  pageNumber: number,
  title: string
): Bookmark => ({
  id: uuidv4(),
  pageNumber,
  title,
  createdAt: new Date().toISOString()
});

export const filterByPage = <T extends { pageNumber: number }>(
  items: T[],
  pageNumber: number
): T[] => items.filter(item => item.pageNumber === pageNumber);

export const removeById = <T extends { id: string }>(
  items: T[],
  id: string
): T[] => items.filter(item => item.id !== id);

// Keyboard shortcut handler
export const createKeyboardHandler = (handlers: {
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFullscreen?: () => void;
}) => {
  return (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlers.onPrevPage?.();
        break;
      case 'ArrowRight':
        handlers.onNextPage?.();
        break;
      case '+':
      case '=':
        handlers.onZoomIn?.();
        break;
      case '-':
        handlers.onZoomOut?.();
        break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          handlers.onFullscreen?.();
        }
        break;
    }
  };
};

// Calculate zoom level with constraints
export const calculateZoom = (
  currentZoom: number,
  direction: 'in' | 'out',
  min: number = 50,
  max: number = 200
): number => {
  const step = currentZoom < 100 ? 5 : 10;
  const newZoom = direction === 'in' ? currentZoom + step : currentZoom - step;
  return Math.min(Math.max(newZoom, min), max);
};