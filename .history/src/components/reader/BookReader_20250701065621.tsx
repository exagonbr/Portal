'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  BookmarkIcon,
  PencilSquareIcon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DocumentIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';

interface BookReaderProps {
  book: {
    id: string;
    title: string;
    author: string;
    read_url: string;
    pages: number;
    reading_progress?: number;
    file_type: 'pdf' | 'epub' | 'mobi';
  };
  onClose: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function BookReader({ book, onClose, onProgressUpdate }: BookReaderProps) {
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [notes, setNotes] = useState<{[key: number]: string}>({});
  const [newNote, setNewNote] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(book.reading_progress || 0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Simular progresso baseado no tempo de leitura
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Date.now() - startTime;
      const minutesSpent = timeSpent / (1000 * 60);
      
      // Simular progresso: 1% a cada 30 segundos de leitura
      const progressIncrement = Math.floor(minutesSpent / 0.5);
      const newProgress = Math.min(readingProgress + progressIncrement, 100);
      
      if (newProgress !== readingProgress) {
        setReadingProgress(newProgress);
        onProgressUpdate?.(newProgress);
      }
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [startTime, readingProgress, onProgressUpdate]);

  // Inicializar progresso salvo
  useEffect(() => {
    if (book.reading_progress) {
      setReadingProgress(book.reading_progress);
    }
  }, [book.reading_progress]);

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const toggleBookmark = () => {
    const currentPosition = readingProgress;
    if (bookmarks.includes(currentPosition)) {
      setBookmarks(bookmarks.filter(pos => pos !== currentPosition));
    } else {
      setBookmarks([...bookmarks, currentPosition]);
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes({
        ...notes,
        [readingProgress]: newNote
      });
      setNewNote('');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            {book.file_type === 'pdf' ? (
              <DocumentIcon className="w-6 h-6 text-red-500" />
            ) : (
              <BookOpenIcon className="w-6 h-6 text-blue-500" />
            )}
            <div>
              <h1 className="text-lg font-semibold">{book.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                por {book.author} • {book.file_type.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de Zoom */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={zoom <= 50}
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={resetZoom}
            className="text-sm min-w-[60px] text-center hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
            title="Resetar zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={zoom >= 200}
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>

          {/* Marcador */}
          <button
            onClick={toggleBookmark}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Adicionar marcador"
          >
            {bookmarks.includes(readingProgress) ? (
              <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </button>

          {/* Anotações */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Anotações"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>

          {/* Marcadores */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Ver marcadores"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>

          {/* Modo Escuro */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Alternar modo escuro"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {/* Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Tela cheia"
          >
            {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Marcadores */}
        {showBookmarks && (
          <div className={`w-64 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-4 overflow-y-auto`}>
            <h3 className="font-semibold mb-4">Marcadores</h3>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum marcador adicionado</p>
            ) : (
              <div className="space-y-2">
                {bookmarks.sort((a, b) => a - b).map((position, index) => (
                  <button
                    key={position}
                    className={`w-full text-left p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      readingProgress === position ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    Marcador {index + 1} ({position}%)
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sidebar - Anotações */}
        {showNotes && (
          <div className={`w-80 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-4 overflow-y-auto`}>
            <h3 className="font-semibold mb-4">Anotações</h3>
            
            {/* Nova Anotação */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nova anotação (progresso: {readingProgress}%)
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className={`w-full p-2 border rounded-lg resize-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={3}
                placeholder="Digite sua anotação..."
              />
              <button
                onClick={addNote}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={!newNote.trim()}
              >
                Adicionar
              </button>
            </div>

            {/* Lista de Anotações */}
            <div className="space-y-3">
              {Object.entries(notes).map(([position, note]) => (
                <div key={position} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">Progresso {position}%</span>
                  </div>
                  <p className="text-sm">{note}</p>
                </div>
              ))}
              {Object.keys(notes).length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma anotação adicionada</p>
              )}
            </div>
          </div>
        )}

        {/* Área Principal - Conteúdo */}
        <div className="flex-1 flex flex-col">
          {/* Renderizar visualizador baseado no tipo de arquivo */}
          {book.file_type === 'pdf' ? (
            <PDFViewer
              book={book}
              isDarkMode={isDarkMode}
              zoom={zoom}
              onProgressUpdate={(progress) => {
                setReadingProgress(progress);
                onProgressUpdate?.(progress);
              }}
            />
          ) : (
            <EPUBViewer
              book={book}
              isDarkMode={isDarkMode}
              zoom={zoom}
              onProgressUpdate={(progress) => {
                setReadingProgress(progress);
                onProgressUpdate?.(progress);
              }}
            />
          )}

          {/* Barra de Progresso */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progresso de leitura</span>
              <span className="text-sm font-medium">{readingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 