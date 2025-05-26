'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    thumbnail: string;
    title: string;
    duration: string;
    progress?: number;
    author: string;
    publisher: string;
    synopsis: string;
    format?: string;
  };
}

export default function BookModal({ isOpen, onClose, book }: BookModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Portal container - positioned fixed relative to viewport */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop with blur */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
          aria-hidden="true" 
        />
        
        {/* Modal Container - centered in viewport */}
        <div 
          className="relative w-[95%] max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-modalSlideIn"
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold truncate">{book.title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fechar detalhes do livro"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Image and Quick Info */}
                <div className="w-full md:w-1/3 space-y-4 flex-shrink-0">
                  <img 
                    src={book.thumbnail} 
                    alt={book.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {book.duration}
                      </div>
                      <div className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        {book.format || 'Digital'}
                      </div>
                    </div>

                    {book.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-medium">{book.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex-1 space-y-6">
                  {/* Author & Publisher */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">AUTOR(A)</h3>
                      <p className="text-gray-900">{book.author}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">EDITORA</h3>
                      <p className="text-gray-900">{book.publisher}</p>
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">SINOPSE</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {book.synopsis || 'Não disponível'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Começar Leitura
                    </button>
                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Adicionar à Lista
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from { 
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
