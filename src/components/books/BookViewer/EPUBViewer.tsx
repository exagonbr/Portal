import React, { useEffect, useRef, useState } from 'react';
import { Book as EpubBook } from 'epubjs';

interface EPUBViewerProps {
  fileUrl: string;
}

const EPUBViewer: React.FC<EPUBViewerProps> = ({ fileUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EpubBook | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Convert relative path to absolute URL if needed
    const absoluteUrl = fileUrl.startsWith('https') 
      ? fileUrl 
      : `${window.location.origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
    console.log('Loading EPUB from:', absoluteUrl);

    const newBook = new EpubBook(absoluteUrl, {
      openAs: 'epub',
      requestHeaders: {
        'Accept': 'application/epub+zip',
        'Access-Control-Allow-Origin': '*'
      }
    });

    setBook(newBook);

    const loadBook = async () => {
      try {
        // Wait for initial book loading
        await newBook.ready;
        
        // Render the book
        await newBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none'
        });

        // Load metadata
        const meta = await newBook.loaded.metadata;
        console.log('Book loaded:', meta.title);

        // Generate locations if not already generated
        await newBook.locations.generate(1024);
        setTotalPages(newBook.locations.length());
      } catch (error) {
        console.error('Error loading book:', error);
        console.error('Failed to load EPUB from:', absoluteUrl);
      }
    };

    loadBook();

    return () => {
      if (newBook) {
        newBook.destroy();
      }
    };
  }, [fileUrl]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={viewerRef} 
        className="flex-1 overflow-auto"
      />
    </div>
  );
};

export default EPUBViewer;
