'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import ePub from 'epubjs'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  BookOpenIcon,
  BookmarkIcon,
  PencilSquareIcon as HighlightIcon,
  ChatBubbleBottomCenterTextIcon as AnnotationIcon,
  CogIcon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassPlusIcon as ZoomInIcon,
  MagnifyingGlassMinusIcon as ZoomOutIcon,
  ArrowsPointingOutIcon as ArrowsExpandIcon,
  XMarkIcon as XIcon,
  Bars3Icon as MenuIcon,
  HomeIcon,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline'
import { 
  PencilSquareIcon as SolidHighlightIcon
} from '@heroicons/react/24/solid'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface UnifiedBookViewerProps {
  bookUrl: string
  bookType: 'pdf' | 'epub'
  bookTitle?: string
  onClose?: () => void
}

interface Annotation {
  id: string
  text: string
  page?: number
  cfi?: string
  color: string
  note?: string
  createdAt: Date
}

interface Bookmark {
  id: string
  page?: number
  cfi?: string
  title: string
  createdAt: Date
}

export default function UnifiedBookViewer({ 
  bookUrl, 
  bookType, 
  bookTitle = 'Livro',
  onClose 
}: UnifiedBookViewerProps) {
  // Estados gerais
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [activeLeftTab, setActiveLeftTab] = useState('contents')
  const [activeRightTab, setActiveRightTab] = useState('reading')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Estados do PDF
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfWidth, setPdfWidth] = useState(600)

  // Estados do EPUB
  const [epubBook, setEpubBook] = useState<any>(null)
  const [rendition, setRendition] = useState<any>(null)
  const [toc, setToc] = useState<any[]>([])
  const [currentLocation, setCurrentLocation] = useState<any>(null)

  // Estados de anotações
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [highlights, setHighlights] = useState<Annotation[]>([])

  // Refs
  const viewerRef = useRef<HTMLDivElement>(null)
  const epubViewRef = useRef<HTMLDivElement>(null)

  // Carregar PDF
  const onPdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onPdfLoadError = (error: Error) => {
    console.error('Erro ao carregar PDF:', error)
    setError('Erro ao carregar o PDF')
    setLoading(false)
  }

  // Carregar EPUB
  useEffect(() => {
    if (bookType === 'epub' && epubViewRef.current) {
      const book = ePub(bookUrl)
      setEpubBook(book)

      const rendition = book.renderTo(epubViewRef.current, {
        width: '100%',
        height: '100%',
        spread: 'always'
      })

      rendition.display().then(() => {
        setLoading(false)
      })

      book.loaded.navigation.then((nav: any) => {
        setToc(nav.toc)
      })

      rendition.on('relocated', (location: any) => {
        setCurrentLocation(location)
      })

      setRendition(rendition)

      return () => {
        book.destroy()
      }
    }
  }, [bookUrl, bookType])

  // Navegação PDF
  const goToPreviousPage = () => {
    if (bookType === 'pdf' && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    } else if (bookType === 'epub' && rendition) {
      rendition.prev()
    }
  }

  const goToNextPage = () => {
    if (bookType === 'pdf' && numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1)
    } else if (bookType === 'epub' && rendition) {
      rendition.next()
    }
  }

  // Zoom
  const zoomIn = () => {
    if (bookType === 'pdf') {
      setScale(scale + 0.1)
    } else if (bookType === 'epub' && rendition) {
      rendition.themes.fontSize('120%')
    }
  }

  const zoomOut = () => {
    if (bookType === 'pdf' && scale > 0.5) {
      setScale(scale - 0.1)
    } else if (bookType === 'epub' && rendition) {
      rendition.themes.fontSize('80%')
    }
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (bookType === 'epub' && rendition) {
      rendition.themes.override('background', isDarkMode ? '#fff' : '#1a1a1a')
      rendition.themes.override('color', isDarkMode ? '#000' : '#fff')
    }
  }

  // Adicionar bookmark
  const addBookmark = () => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      page: bookType === 'pdf' ? currentPage : undefined,
      cfi: bookType === 'epub' ? currentLocation?.start?.cfi : undefined,
      title: `Página ${currentPage}`,
      createdAt: new Date()
    }
    setBookmarks([...bookmarks, newBookmark])
  }

  // Renderizar painel lateral esquerdo
  const renderLeftPanel = () => (
    <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-40 ${
      leftPanelOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold dark:text-white">Navegação</h3>
        <button
          onClick={() => setLeftPanelOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <XIcon className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <div className="flex border-b dark:border-gray-700">
        {['contents', 'bookmarks', 'highlights', 'annotations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveLeftTab(tab)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeLeftTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'contents' && 'Conteúdo'}
            {tab === 'bookmarks' && 'Favoritos'}
            {tab === 'highlights' && 'Destaques'}
            {tab === 'annotations' && 'Anotações'}
          </button>
        ))}
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
        {activeLeftTab === 'contents' && (
          <div>
            {bookType === 'epub' && toc.length > 0 ? (
              <ul className="space-y-2">
                {toc.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => rendition?.display(item.href)}
                      className="text-left w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <span className="text-sm dark:text-white">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : bookType === 'pdf' && numPages ? (
              <div className="space-y-2">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      currentPage === page ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <span className="text-sm dark:text-white">Página {page}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Sem conteúdo disponível</p>
            )}
          </div>
        )}

        {activeLeftTab === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarks.length > 0 ? (
              bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    if (bookType === 'pdf' && bookmark.page) {
                      setCurrentPage(bookmark.page)
                    } else if (bookType === 'epub' && bookmark.cfi) {
                      rendition?.display(bookmark.cfi)
                    }
                  }}
                >
                  <p className="text-sm font-medium dark:text-white">{bookmark.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum favorito adicionado</p>
            )}
          </div>
        )}

        {activeLeftTab === 'highlights' && (
          <div className="space-y-2">
            {highlights.length > 0 ? (
              highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded"
                >
                  <p className="text-sm dark:text-white">{highlight.text}</p>
                  {highlight.note && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Nota: {highlight.note}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum destaque adicionado</p>
            )}
          </div>
        )}

        {activeLeftTab === 'annotations' && (
          <div className="space-y-2">
            {annotations.length > 0 ? (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="p-3 bg-blue-50 dark:bg-blue-900 rounded"
                >
                  <p className="text-sm dark:text-white">{annotation.text}</p>
                  {annotation.note && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {annotation.note}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhuma anotação adicionada</p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar painel lateral direito
  const renderRightPanel = () => (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-40 ${
      rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold dark:text-white">Configurações</h3>
        <button
          onClick={() => setRightPanelOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <XIcon className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 dark:text-white">Tema</h4>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <span className="text-sm dark:text-white">
              {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            {isDarkMode ? (
              <MoonIcon className="w-5 h-5 dark:text-white" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 dark:text-white">Zoom</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <ZoomOutIcon className="w-5 h-5 dark:text-white" />
            </button>
            <span className="flex-1 text-center text-sm dark:text-white">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <ZoomInIcon className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 dark:text-white">Visualização</h4>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <span className="text-sm dark:text-white">Tela Cheia</span>
            <ArrowsExpandIcon className="w-5 h-5 dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div 
      ref={viewerRef}
      className={`fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <MenuIcon className="w-6 h-6 dark:text-white" />
          </button>
          <h2 className="text-lg font-semibold dark:text-white">{bookTitle}</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={addBookmark}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Adicionar aos favoritos"
          >
            <BookmarkIcon className="w-5 h-5 dark:text-white" />
          </button>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <CogIcon className="w-6 h-6 dark:text-white" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ml-2"
            >
              <XIcon className="w-6 h-6 dark:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 pb-16 h-full overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando livro...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full flex items-center justify-center">
            {bookType === 'pdf' ? (
              <Document
                file={bookUrl}
                onLoadSuccess={onPdfLoadSuccess}
                onLoadError={onPdfLoadError}
                className="flex justify-center"
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  width={pdfWidth}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <div 
                ref={epubViewRef} 
                className="w-full h-full max-w-4xl mx-auto"
                style={{ padding: '0 20px' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-50 flex items-center justify-between px-4">
        <button
          onClick={goToPreviousPage}
          disabled={bookType === 'pdf' && currentPage === 1}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-6 h-6 dark:text-white" />
        </button>

        <div className="flex items-center space-x-4">
          {bookType === 'pdf' && numPages && (
            <span className="text-sm dark:text-white">
              Página {currentPage} de {numPages}
            </span>
          )}
          {bookType === 'epub' && currentLocation && (
            <span className="text-sm dark:text-white">
              {Math.round(currentLocation.percentage * 100)}% concluído
            </span>
          )}
        </div>

        <button
          onClick={goToNextPage}
          disabled={bookType === 'pdf' && numPages !== null && currentPage === numPages}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-6 h-6 dark:text-white" />
        </button>
      </div>

      {/* Panels */}
      {renderLeftPanel()}
      {renderRightPanel()}

      {/* Overlay */}
      {(leftPanelOpen || rightPanelOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setLeftPanelOpen(false)
            setRightPanelOpen(false)
          }}
        />
      )}
    </div>
  )
} 