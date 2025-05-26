import React, { useEffect, useRef, useState } from 'react';
import { Book as Epub } from 'epubjs';

interface EPUBReaderProps {
  url: string;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

interface RenditionType {
  display: () => void;
  next: () => void;
  prev: () => void;
}

export default function EPUBReader({ url, onLoadSuccess, onLoadError }: EPUBReaderProps) {
  const [rendition, setRendition] = useState<RenditionType | null>(null);
  const [book, setBook] = useState<Epub | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const epubBook = new Epub(url);
      setBook(epubBook);
      
      epubBook.loaded.navigation
        .then(() => {
          if (!viewerRef.current) return;
          
          const rendition = epubBook.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'auto'
          });
          
          setRendition(rendition);
          rendition.display();
          onLoadSuccess?.();

          // Add keyboard navigation
          const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
              rendition.next();
            } else if (e.key === 'ArrowLeft') {
              rendition.prev();
            }
          };

          document.addEventListener('keyup', handleKeyPress);
          return () => document.removeEventListener('keyup', handleKeyPress);
        })
        .catch((err) => {
          onLoadError?.(err);
        });

      return () => {
        if (epubBook) {
          epubBook.destroy();
        }
      };
    } catch (err) {
      onLoadError?.(err as Error);
    }
  }, [url, onLoadSuccess, onLoadError]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 bg-white" ref={viewerRef} />
      {rendition && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={() => rendition.prev()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => rendition.next()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
