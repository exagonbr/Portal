'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { mockBooks, mockAnnotations, mockHighlights } from '@/constants/mockData';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark } from '@/components/books/BookViewer/types';
import UnifiedBookViewer from '@/components/books/BookViewer/UnifiedBookViewer'

// Importação dinâmica do KoodoViewer
const KoodoViewer = dynamic(() => import('@/components/books/BookViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Carregando visualizador...</p>
      </div>
    </div>
  ),
});

export default function BookViewerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento do livro
    const loadBook = async () => {
      try {
        // Aqui você faria uma chamada à API real
        // Por enquanto, vamos usar os dados mockados
        const foundBook = mockBooks.find(b => b.id === params.id)
        if (foundBook) {
          setBook(foundBook)
        } else {
          // Livro não encontrado
          router.push('/portal/books')
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error)
        router.push('/portal/books')
      } finally {
        setLoading(false)
      }
    }

    loadBook()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  // Determinar a URL do livro
  const bookUrl = book.format === 'pdf' 
    ? book.url 
    : `/books/${book.url}` // Para EPUBs locais

  return (
    <UnifiedBookViewer
      bookUrl={bookUrl}
      bookType={book.format}
      bookTitle={book.title}
      onClose={() => router.push('/portal/books')}
    />
  )
} 