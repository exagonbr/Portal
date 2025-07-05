'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface EPUBViewerProps {
  book: {
    id: string;
    title: string;
    author: string;
    read_url: string;
    pages: number;
    reading_progress?: number;
  };
  isDarkMode: boolean;
  zoom: number;
  onProgressUpdate?: (progress: number) => void;
}

export default function EPUBViewer({ book, isDarkMode, zoom, onProgressUpdate }: EPUBViewerProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapters, setChapters] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Simular capítulos do EPUB baseado no livro
  useEffect(() => {
    let mockChapters: string[] = [];
    
    switch (book.title) {
      case 'Iracema':
        mockChapters = [
          'Capítulo I: A virgem dos lábios de mel',
          'Capítulo II: O guerreiro branco',
          'Capítulo III: O segredo da jurema',
          'Capítulo IV: O amor proibido',
          'Capítulo V: A fuga',
          'Capítulo VI: A vida na floresta',
          'Capítulo VII: O nascimento de Moacir',
          'Capítulo VIII: A despedida',
          'Capítulo IX: A morte de Iracema'
        ];
        break;
      case 'O Guarani':
        mockChapters = [
          'Parte I: Os Aventureiros',
          'Parte II: Peri',
          'Parte III: Os Aimorés',
          'Parte IV: A Catástrofe'
        ];
        break;
      case 'Senhora':
        mockChapters = [
          'Primeira Parte: O Preço',
          'Segunda Parte: Quitação',
          'Terceira Parte: Posse',
          'Quarta Parte: Resgate'
        ];
        break;
      default:
        mockChapters = [
          'Capítulo 1: Introdução',
          'Capítulo 2: Desenvolvimento',
          'Capítulo 3: Personagens',
          'Capítulo 4: Conflito',
          'Capítulo 5: Clímax',
          'Capítulo 6: Resolução',
          'Capítulo 7: Epílogo'
        ];
    }
    
    setChapters(mockChapters);
    loadChapter(0);
  }, [book.title]);

  const loadChapter = async (chapterIndex: number) => {
    setIsLoading(true);
    
    // Simular carregamento de conteúdo do capítulo
    setTimeout(() => {
      let chapterContent = '';
      
      // Conteúdo específico baseado no livro e capítulo
      if (book.title === 'Iracema' && chapterIndex === 0) {
        chapterContent = `
          <p>Verdes mares bravios de minha terra natal, ó auras frescas e saudosas que começais as manhãs da minha pátria, ó cajueiros floridos de meu sertão, quando me acorda a saudade de vós, eu quereria sentir-me transportado de novo às vossas margens...</p>
          
          <p>Além, muito além daquela serra, que ainda azula no horizonte, nasceu Iracema. Iracema, a virgem dos lábios de mel, que tinha os cabelos mais negros que a asa da graúna e mais longos que seu talhe de palmeira.</p>
          
          <p>O favo da jati não era doce como seu sorriso; nem a baunilha recendia no bosque como seu hálito perfumado. Mais rápida que a ema selvagem, a morena virgem corria o sertão e as matas do Ipu, onde campeava sua guerreira tribo, da grande nação tabajara.</p>
        `;
      } else if (book.title === 'O Guarani' && chapterIndex === 0) {
        chapterContent = `
          <p>Uma das mais belas e vastas regiões do Brasil é sem contestação a que se estende ao norte da província do Rio de Janeiro, confrontando com a do Espírito Santo.</p>
          
          <p>Ao tempo em que se passa a história que vamos narrar, esta região era povoada por uma grande tribo, da raça dos goitacases, que se estendia pelas margens do Paraíba até o cabo de São Tomé.</p>
          
          <p>Nas margens do Paquequer, rio que banha a província do Rio de Janeiro, levantava-se no tempo do governador Mem de Sá uma casa que, por sua arquitetura, revelava ser habitada por gente da raça branca e cristã.</p>
        `;
      } else if (book.title === 'Senhora' && chapterIndex === 0) {
        chapterContent = `
          <p>Há anos raiou no céu fluminense uma nova estrela. Desde o momento de sua ascensão ninguém lhe disputou o cetro; foi proclamada a rainha dos salões.</p>
          
          <p>Aurélia Camargo era órfã; tinha em sua companhia uma velha parenta, viúva, D. Firmina Mascarenhas, que sempre a acompanhava em sua vida social.</p>
          
          <p>A moça dezoito anos, e possuía uma beleza esplêndida. Era rica, muito rica, segundo se dizia; e esta circunstância realçava-lhe extraordinariamente os encantos.</p>
        `;
      } else {
        chapterContent = `
          <p>Este é o conteúdo do ${chapters[chapterIndex] || `Capítulo ${chapterIndex + 1}`}. Em uma implementação real, este conteúdo seria extraído do arquivo EPUB e renderizado com formatação adequada.</p>
          
          <p>Aqui você encontraria o texto completo do capítulo, com toda a narrativa, diálogos e descrições que compõem esta obra clássica da literatura brasileira.</p>
          
          <p>O leitor EPUB permite uma experiência de leitura otimizada, com controles de navegação, índice de capítulos e funcionalidades como marcadores e anotações para enriquecer sua experiência de leitura.</p>
        `;
      }

      const mockContent = `
        <style>
          .epub-content {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            color: inherit;
          }
          .epub-content h1 {
            font-size: 2.5em;
            margin-bottom: 1em;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5em;
          }
          .epub-content p {
            margin-bottom: 1.5em;
            text-align: justify;
            text-indent: 2em;
          }
          .epub-content p:first-of-type {
            text-indent: 0;
            font-weight: 500;
          }
        </style>
        <div class="epub-content">
          <h1>${chapters[chapterIndex] || `Capítulo ${chapterIndex + 1}`}</h1>
          ${chapterContent}
        </div>
      `;
      
      setContent(mockContent);
      setIsLoading(false);
      
      // Atualizar progresso
      const progress = Math.round(((chapterIndex + 1) / chapters.length) * 100);
      onProgressUpdate?.(progress);
    }, 500);
  };

  const goToNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      const nextChapter = currentChapter + 1;
      setCurrentChapter(nextChapter);
      loadChapter(nextChapter);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      const prevChapter = currentChapter - 1;
      setCurrentChapter(prevChapter);
      loadChapter(prevChapter);
    }
  };

  const goToChapter = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    loadChapter(chapterIndex);
  };

  return (
    <div className="flex-1 flex">
      {/* Índice de Capítulos */}
      <div className={`w-64 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-4 overflow-y-auto`}>
        <div className="flex items-center gap-2 mb-4">
          <ListBulletIcon className="w-5 h-5" />
          <h3 className="font-semibold">Índice</h3>
        </div>
        
        <div className="space-y-1">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => goToChapter(index)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                currentChapter === index
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {chapter}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo do EPUB */}
      <div className="flex-1 flex flex-col">
        {/* Área de Leitura */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div
              ref={contentRef}
              className={`max-w-4xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              style={{
                fontSize: `${zoom}%`,
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Controles de Navegação */}
        <div className={`flex items-center justify-between p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={goToPreviousChapter}
            disabled={currentChapter <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Capítulo Anterior
          </button>

          <div className="flex items-center gap-4">
            <BookOpenIcon className="w-5 h-5" />
            <span className="text-sm">
              Capítulo {currentChapter + 1} de {chapters.length}
            </span>
          </div>

          <button
            onClick={goToNextChapter}
            disabled={currentChapter >= chapters.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Próximo Capítulo
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 