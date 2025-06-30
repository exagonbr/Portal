'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { mockBooks, mockAnnotations, mockHighlights } from '@/constants/mockData';
import { Book } from '@/constants/mockData';
import { Annotation, Highlight, Bookmark } from '@/components/books/BookViewer/types';
import UnifiedBookViewer from '@/components/books/BookViewer/UnifiedBookViewer'

// Importação dinâmica sem telas de erro problemáticas
const KoodoViewer = dynamic(
  () => import('@/components/books/BookViewer').catch(error => {
    console.error('Erro ao carregar BookViewer:', error);
    // Retornar um componente vazio em caso de erro
    return {
      default: () => null
    };
  }),
  {
    ssr: false,
    loading: () => null
  }
);

export default function BookViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookId, setBookId] = useState<string | null>(null)

  useEffect(() => {
    // Resolver os parâmetros assíncronos
    const resolveParams = async () => {
      const resolvedParams = await params
      setBookId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!bookId) return

    // Simular carregamento do livro
    const loadBook = async () => {
      try {
        console.log('Carregando livro com ID:', bookId)
        // Aqui você faria uma chamada à API real
        // Por enquanto, vamos usar os dados mockados
        const foundBook = mockBooks.find(b => b.id === bookId)
        console.log('Livro encontrado:', foundBook)
        
        if (foundBook) {
          // Verificar se o livro tem filePath
          if (!foundBook.filePath) {
            console.error('Livro não tem filePath definido:', foundBook)
            setError('Este livro não está disponível para leitura no momento.')
            return
          }
          setBook(foundBook)
        } else {
          // Livro não encontrado
          console.error('Livro não encontrado com ID:', bookId)
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
  }, [bookId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/portal/books')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para a biblioteca
          </button>
        </div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  // Determinar a URL do livro
  const bookUrl = book.format === 'pdf' 
    ? book.filePath 
    : book.filePath.startsWith('http') 
      ? book.filePath 
      : `/books/${book.filePath}` // Para EPUBs locais

  console.log('Renderizando visualizador:', {
    bookUrl,
    bookType: book.format,
    bookTitle: book.title
  })

  return (
    <UnifiedBookViewer
      bookUrl={bookUrl}
      bookType={book.format || 'pdf'}
      bookTitle={book.title}
      onClose={() => router.push('/portal/books')}
    />
  )
} 