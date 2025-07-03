'use client';

import React from 'react';

interface PDFViewerProps {
  book: {
    id: string;
    title: string;
    author: string;
    read_url: string;
    pages: number;
    reading_progress?: number;
  };
  isDarkMode: boolean;
  zoom: number;
  onProgressUpdate?: (progress: number) => void;
}

export default function PDFViewer({ book, isDarkMode, zoom, onProgressUpdate }: PDFViewerProps) {
  return (
    <div className="flex-1 overflow-hidden relative">
      <iframe
        id="pdf-iframe"
        src={`${book.read_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
        className={`w-full h-full border-0 ${isDarkMode ? 'filter invert hue-rotate-180' : ''}`}
        title={`${book.title} - Leitor PDF`}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center top',
          width: `${100 / (zoom / 100)}%`,
          height: `${100 / (zoom / 100)}%`
        }}
        allow="fullscreen"
      />
      
      {/* Overlay para capturar eventos de scroll (fallback) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />
    </div>
  );
} 