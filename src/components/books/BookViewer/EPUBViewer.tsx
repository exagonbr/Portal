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

    const newBook = new EpubBook(fileUrl);

    setBook(newBook);

    newBook.loaded.metadata.then((meta: { title: string }) => {

      console.log('Book loaded:', meta.title);
    });

    newBook.ready.then(() => {
      newBook.renderTo(viewerRef.current!, {
        width: '100%',
        height: '100%',
        spread: 'none'
      });
      
      newBook.locations.generate(1024).then(() => {
        setTotalPages(newBook.locations.length);
      });
    });

    return () => {
      newBook.destroy();
    };
  }, [fileUrl]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={viewerRef} 
        className="flex-1 overflow-auto"
      />
      
      {/* Controls will be in the sidebar */}
    </div>
  );
};

export default EPUBViewer;
