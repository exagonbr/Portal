'use client'

import { useState } from 'react'
import UnifiedBookViewer from '@/components/books/BookViewer/UnifiedBookViewer'

export default function TestBookViewer() {
  const [showViewer, setShowViewer] = useState(false)
  const [bookType, setBookType] = useState<'pdf' | 'epub'>('pdf')
  const [bookUrl, setBookUrl] = useState('')

  const testBooks = [
    {
      title: 'PDF de Teste (Externo)',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'pdf' as const
    },
    {
      title: 'EPUB de Teste (Local)',
      url: '/books/sample.epub',
      type: 'epub' as const
    },
    {
      title: 'PDF Grande (Externo)',
      url: 'https://www.africau.edu/images/default/sample.pdf',
      type: 'pdf' as const
    }
  ]

  const openBook = (url: string, type: 'pdf' | 'epub') => {
    setBookUrl(url)
    setBookType(type)
    setShowViewer(true)
  }

  if (showViewer) {
    return (
      <UnifiedBookViewer
        bookUrl={bookUrl}
        bookType={bookType}
        bookTitle="Livro de Teste"
        onClose={() => setShowViewer(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste do Visualizador de Livros</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Livros de Teste</h2>
          <div className="space-y-4">
            {testBooks.map((book, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => openBook(book.url, book.type)}
              >
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-600">Tipo: {book.type.toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{book.url}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Abrir
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Teste com URL Personalizada</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Digite a URL do livro"
              className="w-full p-3 border rounded-lg"
              value={bookUrl}
              onChange={(e) => setBookUrl(e.target.value)}
            />
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="pdf"
                  checked={bookType === 'pdf'}
                  onChange={() => setBookType('pdf')}
                  className="mr-2"
                />
                PDF
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="epub"
                  checked={bookType === 'epub'}
                  onChange={() => setBookType('epub')}
                  className="mr-2"
                />
                EPUB
              </label>
            </div>
            <button
              onClick={() => bookUrl && setShowViewer(true)}
              disabled={!bookUrl}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              Abrir Livro Personalizado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 