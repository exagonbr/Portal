'use client';

import React, { useState } from 'react';
import BookReader from '@/components/BookReader';

export default function TestReaderPage() {
  const [format, setFormat] = useState<'pdf' | 'epub' | 'html'>('pdf');
  
  const testFiles = {
    pdf: '/books/primeiro_ultimo_verao.pdf',
    epub: '/books/sample.epub',
    html: 'www.google.com.br'
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="mb-4 flex gap-4">
        <select 
          value={format}
          onChange={(e) => setFormat(e.target.value as 'pdf' | 'epub' | 'html')}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
        >
          <option value="pdf">PDF</option>
          <option value="epub">EPUB</option>
          <option value="html">HTML</option>
        </select>
      </div>
      
      <div className="h-[800px] bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <BookReader 
          url={testFiles[format]}
          format={format}
        />
      </div>
    </div>
  );
}
