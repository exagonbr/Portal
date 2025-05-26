import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker with explicit version
const PDFJS_VERSION = '3.11.174'; // Use the version that matches your react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

interface PDFReaderProps {
  url: string;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  pageNumber: number;
}

export default function PDFReader({ url, onLoadSuccess, onLoadError, pageNumber }: PDFReaderProps) {
  const [isInitializing, setIsInitializing] = useState(true);

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
    <div className="flex justify-center">
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
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<LoadingSpinner />}
          scale={1.0}
        />
      </Document>
    </div>
  );
}
