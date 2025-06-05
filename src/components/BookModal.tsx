'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlayIcon, HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id?: string;
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

export default function BookModal({ isOpen, onClose, book }: BookModalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with enhanced blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden animate-modalSlideIn border border-gray-200">
        
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-6">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold mb-2 leading-tight">{book.title}</h2>
              <p className="text-blue-100 text-sm">📚 {book.format?.toUpperCase() || 'Digital'} • ⏱️ {book.duration}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
              aria-label="Fechar detalhes do livro"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column - Image and Quick Info */}
              <div className="w-full lg:w-1/3 space-y-6 flex-shrink-0">
                
                {/* Book Cover */}
                <div className="relative">
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Format Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-lg ${
                      book.format?.toUpperCase() === 'PDF' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    }`}>
                      {book.format?.toUpperCase() || 'DIGITAL'}
                    </span>
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-600 mb-4 flex items-center">
                    📊 <span className="ml-2">Estatísticas</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Duração</span>
                      <span className="font-bold text-gray-600">{book.duration}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Formato</span>
                      <span className="font-bold text-gray-600">{book.format?.toUpperCase() || 'Digital'}</span>
                    </div>

                    {/* Progress Section */}
                    {book.progress !== undefined && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Progresso</span>
                          <span className="font-bold text-blue-600">{book.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <PlayIcon className="w-5 h-5" />
                    Começar Leitura
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 ${
                        isFavorite
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isFavorite ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                      {isFavorite ? 'Favoritado' : 'Favoritar'}
                    </button>
                    
                    <button className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105">
                      <BookmarkIcon className="w-4 h-4" />
                      Salvar
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="flex-1 space-y-8">
                
                {/* Author & Publisher Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider flex items-center">
                      👤 <span className="ml-2">Autor</span>
                    </h3>
                    <p className="text-gray-600 font-semibold text-lg">{book.author}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-sm font-bold text-purple-600 mb-2 uppercase tracking-wider flex items-center">
                      🏢 <span className="ml-2">Editora</span>
                    </h3>
                    <p className="text-gray-600 font-semibold text-lg">{book.publisher}</p>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-600 mb-4 uppercase tracking-wider flex items-center">
                    📖 <span className="ml-2">Sinopse</span>
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {book.synopsis || 'Esta é uma obra fascinante que explora temas profundos e oferece insights únicos sobre o assunto abordado. Uma leitura essencial para quem busca conhecimento e entretenimento de qualidade.'}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="text-sm font-bold text-green-600 mb-4 uppercase tracking-wider flex items-center">
                    ℹ️ <span className="ml-2">Informações Adicionais</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Disponibilidade:</span>
                      <p className="text-gray-600 font-semibold">Disponível</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Categoria:</span>
                      <p className="text-gray-600 font-semibold">Educacional</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Idioma:</span>
                      <p className="text-gray-600 font-semibold">Português</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Última atualização:</span>
                      <p className="text-gray-600 font-semibold">Hoje</p>
                    </div>
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
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
