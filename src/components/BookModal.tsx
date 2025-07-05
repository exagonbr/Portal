'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlayIcon, HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { theme } = useTheme();

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

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden border"
            style={{ 
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            
            {/* Header with gradient */}
            <div 
              className="relative text-white px-8 py-6"
              style={{ 
                background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.secondary.DEFAULT})`
              }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">{book.title}</h2>
                  <p className="text-white/80 text-sm">📚 {book.format?.toUpperCase() || 'Digital'} • ⏱️ {book.duration}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2.5 rounded-xl backdrop-blur-sm transition-all duration-200"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  aria-label="Fechar detalhes do livro"
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Left Column - Image and Quick Info */}
                  <div className="w-full lg:w-1/3 space-y-6 flex-shrink-0">
                    
                    {/* Book Cover */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Format Badge */}
                      <div className="absolute top-4 right-4">
                        <span 
                          className="px-3 py-1.5 text-xs font-bold rounded-xl shadow-lg text-white"
                          style={{
                            background: book.format?.toUpperCase() === 'PDF' 
                              ? `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.error}DD)`
                              : `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}DD)`
                          }}
                        >
                          {book.format?.toUpperCase() || 'DIGITAL'}
                        </span>
                      </div>
                    </motion.div>

                    {/* Quick Stats Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl p-6 border"
                      style={{ 
                        backgroundColor: theme.colors.background.secondary,
                        borderColor: theme.colors.border.light
                      }}
                    >
                      <h4 className="font-bold mb-4 flex items-center" style={{ color: theme.colors.text.primary }}>
                        📊 <span className="ml-2">Estatísticas</span>
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Duração</span>
                          <span className="font-bold" style={{ color: theme.colors.text.primary }}>{book.duration}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Formato</span>
                          <span className="font-bold" style={{ color: theme.colors.text.primary }}>{book.format?.toUpperCase() || 'Digital'}</span>
                        </div>

                        {/* Progress Section */}
                        {book.progress !== undefined && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Progresso</span>
                              <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>{book.progress}%</span>
                            </div>
                            <div className="w-full rounded-full h-3 shadow-inner" style={{ backgroundColor: theme.colors.background.primary }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${book.progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-3 rounded-full shadow-sm"
                                style={{
                                  background: `linear-gradient(90deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.secondary.DEFAULT})`
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.secondary.DEFAULT})`
                        }}
                      >
                        <PlayIcon className="w-5 h-5" />
                        Começar Leitura
                      </motion.button>
                      
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsFavorite(!isFavorite)}
                          className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                            isFavorite ? 'text-white shadow-lg' : ''
                          }`}
                          style={{
                            backgroundColor: isFavorite ? theme.colors.status.error : theme.colors.background.secondary,
                            color: isFavorite ? 'white' : theme.colors.text.primary
                          }}
                        >
                          {isFavorite ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                          {isFavorite ? 'Favoritado' : 'Favoritar'}
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                          style={{
                            backgroundColor: theme.colors.background.secondary,
                            color: theme.colors.text.primary
                          }}
                        >
                          <BookmarkIcon className="w-4 h-4" />
                          Salvar
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="flex-1 space-y-8">
                    
                    {/* Author & Publisher Cards */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div 
                        className="rounded-2xl p-6 border"
                        style={{ 
                          backgroundColor: theme.colors.primary.light + '10',
                          borderColor: theme.colors.primary.light + '30'
                        }}
                      >
                        <h3 className="text-sm font-bold mb-2 uppercase tracking-wider flex items-center" style={{ color: theme.colors.primary.DEFAULT }}>
                          👤 <span className="ml-2">Autor</span>
                        </h3>
                        <p className="font-semibold text-lg" style={{ color: theme.colors.text.primary }}>{book.author}</p>
                      </div>
                      
                      <div 
                        className="rounded-2xl p-6 border"
                        style={{ 
                          backgroundColor: theme.colors.secondary.light + '10',
                          borderColor: theme.colors.secondary.light + '30'
                        }}
                      >
                        <h3 className="text-sm font-bold mb-2 uppercase tracking-wider flex items-center" style={{ color: theme.colors.secondary.DEFAULT }}>
                          🏢 <span className="ml-2">Editora</span>
                        </h3>
                        <p className="font-semibold text-lg" style={{ color: theme.colors.text.primary }}>{book.publisher}</p>
                      </div>
                    </motion.div>

                    {/* Synopsis */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl p-6 border"
                      style={{ 
                        backgroundColor: theme.colors.accent.light + '10',
                        borderColor: theme.colors.accent.light + '30'
                      }}
                    >
                      <h3 className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center" style={{ color: theme.colors.accent.DEFAULT }}>
                        📖 <span className="ml-2">Sinopse</span>
                      </h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="leading-relaxed text-base" style={{ color: theme.colors.text.primary }}>
                          {book.synopsis || 'Esta é uma obra fascinante que explora temas profundos e oferece insights únicos sobre o assunto abordado. Uma leitura essencial para quem busca conhecimento e entretenimento de qualidade.'}
                        </p>
                      </div>
                    </motion.div>

                    {/* Additional Info */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-2xl p-6 border"
                      style={{ 
                        backgroundColor: theme.colors.status.success + '10',
                        borderColor: theme.colors.status.success + '30'
                      }}
                    >
                      <h3 className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center" style={{ color: theme.colors.status.success }}>
                        ℹ️ <span className="ml-2">Informações Adicionais</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Disponibilidade:</span>
                          <p className="font-semibold" style={{ color: theme.colors.text.primary }}>Disponível</p>
                        </div>
                        <div>
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Categoria:</span>
                          <p className="font-semibold" style={{ color: theme.colors.text.primary }}>Educacional</p>
                        </div>
                        <div>
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Idioma:</span>
                          <p className="font-semibold" style={{ color: theme.colors.text.primary }}>Português</p>
                        </div>
                        <div>
                          <span className="font-medium" style={{ color: theme.colors.text.secondary }}>Última atualização:</span>
                          <p className="font-semibold" style={{ color: theme.colors.text.primary }}>Hoje</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
