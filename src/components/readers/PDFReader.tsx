import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker with explicit version
const PDFJS_VERSION = '3.11.174'; // Use the version that matches your react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

interface PDFReaderProps {
  url: string;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  pageNumber: number;
  onTextSelect?: (text: string) => void;
}

export default function PDFReader({ 
  url, 
  onLoadSuccess, 
  onLoadError, 
  pageNumber,
  onTextSelect 
}: PDFReaderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [scale, setScale] = useState(1.0);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && onTextSelect) {
      onTextSelect(selectedText);
    }
  }, [onTextSelect]);

  // Handle zoom controls
  const handleZoom = useCallback((delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.min(Math.max(0.5, newScale), 2.0); // Limit scale between 0.5 and 2.0
    });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus/Minus for zoom
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoom(0.1);
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoom(-0.1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleZoom]);

  useEffect(() => {
    // Ensure PDF.js worker is loaded
    const initializePdfJs = async () => {
      try {
        await pdfjs.getDocument(url).promise;
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing PDF.js:', error);
        onLoadError?.(error as Error);
      }
    };

    initializePdfJs();
  }, [url, onLoadError]);

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Zoom Controls */}
      <div className="sticky top-0 z-10 mb-4 flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-lg">
        <button
          onClick={() => handleZoom(-0.1)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Diminuir zoom"
        >
          -
        </button>
        <span className="text-white text-sm">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(0.1)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Aumentar zoom"
        >
          +
        </button>
      </div>

      {/* PDF Document */}
      <div 
        className="flex justify-center w-full"
        onMouseUp={handleTextSelection}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => onLoadSuccess?.(numPages)}
          onLoadError={onLoadError}
          loading={<LoadingSpinner />}
          className="max-w-full"
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
          }}
        >
          <Page
            key={`page_${pageNumber}`}
            pageNumber={pageNumber}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<LoadingSpinner />}
            scale={scale}
            onLoadSuccess={() => {
              // Wait for text layer to be added to DOM
              const observer = new MutationObserver((mutations, obs) => {
                const textLayer = document.querySelector('.react-pdf__Page__textContent');
                if (textLayer) {
                  (textLayer as HTMLElement).style.userSelect = 'text';
                  (textLayer as HTMLElement).style.pointerEvents = 'auto';
                  obs.disconnect();
                }
              });

              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
            }}
          />
        </Document>
      </div>
    </div>
  );
}
