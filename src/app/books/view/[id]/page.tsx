'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Book, Loader2 } from 'lucide-react';
import BookViewer from '@/components/books/BookViewer';

export default function BookViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extrair informações dos parâmetros
  const bookId = params?.id as string;
  const title = searchParams?.get('title') || 'Livro';
  
  // Determinar o tipo de arquivo a partir da extensão no título
  const getFileTypeFromTitle = (title: string) => {
    if (title.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (title.toLowerCase().endsWith('.epub')) return 'epub';
    return 'pdf'; // Default para PDF
  };
  
  const format = getFileTypeFromTitle(title);
  
  // Construir URL para o Cloudfront
  const filePath = `https://d1hxtyafwtqtm4.cloudfront.net/upload/${bookId}`;
  
  // Simular carregamento para melhor UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    // Navegar de volta para a página anterior
    window.history.back();
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando livro...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar o livro</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <BookViewer
      book={{
        id: bookId,
        title: title,
        filePath: filePath,
        format: format,
        thumbnail: '',
        author: 'Autor não informado',
        publisher: 'Editora não informada',
        synopsis: 'Descrição não disponível',
        duration: '0 min'
      }}
    />
  );
} 