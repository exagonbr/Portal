'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockBooks } from '@/constants/mockData';
import IntegratedViewer from '@/components/books/BookViewer/IntegratedViewer';

const BookPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id;

  // Encontrar o livro pelo id
  const book = mockBooks.find((b) => b.id === bookId);

  // Se o livro não for encontrado, criar um objeto de fallback
  const bookToDisplay = book || {
    id: 'not-found',
    title: 'Livro Não Encontrado',
    author: 'Autor Desconhecido',
    format: 'pdf' as const,
    filePath: '',
    thumbnail: '',
    pageCount: 0,
    publisher: 'Editora Desconhecida',
    synopsis: 'Este livro não pôde ser encontrado.',
    duration: 'N/A'
  };

  const handleBack = () => {
    router.push('/portal/books');
  };

  return (
    <div className="h-screen w-full">
      <IntegratedViewer
        book={bookToDisplay}
        onBack={handleBack}
        onAnnotationAdd={(annotation) => {
          // Aqui você salvaria a anotação no backend
          console.log('Anotação adicionada:', annotation);
        }}
        onHighlightAdd={(highlight) => {
          // Aqui você salvaria o destaque no backend
          console.log('Destaque adicionado:', highlight);
        }}
        onBookmarkAdd={(bookmark) => {
          // Aqui você salvaria o marcador no backend
          console.log('Marcador adicionado:', bookmark);
        }}
      />
    </div>
  );
};

export default BookPage;
