'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mockBooks, Book as BookType, carouselBookImages } from '@/constants/mockData';
import dynamic from 'next/dynamic';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import BookModal from '@/components/BookModal';

// Importação dinâmica do KoodoViewer
const KoodoViewer = dynamic(
  () => import('@/components/books/BookViewer/KoodoViewer'),
  { ssr: false }
);

// Tipos para o sistema de roteamento (copiados do koodo-reader)
type RouteType = 'home' | 'pdf' | 'epub' | 'favorites' | 'highlights' | 'annotations' | 'bookmarks' | 'trash' | 'settings' | 'about';

interface RouteState {
  type: RouteType;
  id?: string;
  title?: string;
  file?: string;
  bookId?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  format: 'pdf' | 'epub';
  progress?: number;
  isFavorite?: boolean;
  size: string;
  category: string;
  lastRead?: string;
  filePath?: string;
  rating?: number;
  year?: string;
  pages?: number;
  synopsis?: string;
  isDeleted?: boolean;
}

// Array de capas válidas de livros usando Open Library Covers API e outras fontes
const bookCovers = [
  'https://covers.openlibrary.org/b/id/8739161-L.jpg', // O Senhor dos Anéis
  'https://covers.openlibrary.org/b/id/7883261-L.jpg', // Harry Potter
  'https://covers.openlibrary.org/b/id/8231916-L.jpg', // 1984
  'https://covers.openlibrary.org/b/id/7222246-L.jpg', // O Hobbit
  'https://covers.openlibrary.org/b/id/8438204-L.jpg', // Dom Casmurro
  'https://covers.openlibrary.org/b/id/240727-L.jpg', // Crime e Castigo
  'https://covers.openlibrary.org/b/id/7222161-L.jpg', // O Pequeno Príncipe
  'https://covers.openlibrary.org/b/id/8739162-L.jpg', // As Duas Torres
  'https://covers.openlibrary.org/b/id/8442016-L.jpg', // O Cortiço
  'https://covers.openlibrary.org/b/id/6121771-L.jpg', // Cem Anos de Solidão
  'https://covers.openlibrary.org/b/id/8225261-L.jpg', // A Metamorfose
  'https://covers.openlibrary.org/b/id/10521270-L.jpg', // O Código Da Vinci
  'https://covers.openlibrary.org/b/id/8419395-L.jpg', // Memórias Póstumas de Brás Cubas
  'https://covers.openlibrary.org/b/id/7884568-L.jpg', // A Menina que Roubava Livros
  'https://covers.openlibrary.org/b/id/8302844-L.jpg', // O Alquimista
  'https://covers.openlibrary.org/b/id/11291394-L.jpg', // A Culpa é das Estrelas
  'https://covers.openlibrary.org/b/id/7222269-L.jpg', // Alice no País das Maravilhas
  'https://covers.openlibrary.org/b/id/8739163-L.jpg', // O Retorno do Rei
  'https://covers.openlibrary.org/b/id/10519939-L.jpg', // Crepúsculo
  'https://covers.openlibrary.org/b/id/8486948-L.jpg', // O Nome da Rosa
  'https://covers.openlibrary.org/b/id/12648066-L.jpg', // A Cabana
  'https://covers.openlibrary.org/b/id/8596849-L.jpg', // Orgulho e Preconceito
  'https://covers.openlibrary.org/b/id/8479621-L.jpg', // O Morro dos Ventos Uivantes
  'https://covers.openlibrary.org/b/id/6424202-L.jpg', // Ensaio sobre a Cegueira
  'https://covers.openlibrary.org/b/id/12651446-L.jpg', // A Seleção
  'https://covers.openlibrary.org/b/id/11754386-L.jpg', // Divergente
  'https://covers.openlibrary.org/b/id/8224268-L.jpg', // O Processo
  'https://covers.openlibrary.org/b/id/8231917-L.jpg', // Admirável Mundo Novo
  'https://covers.openlibrary.org/b/id/7234667-L.jpg', // Fahrenheit 451
  'https://covers.openlibrary.org/b/id/8486949-L.jpg', // O Pêndulo de Foucault
];

// Links válidos para PDFs e EPUBs de domínio público
const bookFiles = [
  'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm', // Pride and Prejudice
  'https://www.gutenberg.org/files/11/11-h/11-h.htm', // Alice's Adventures
  'https://www.gutenberg.org/files/84/84-h/84-h.htm', // Frankenstein
  'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm', // Sherlock Holmes
  'https://www.gutenberg.org/files/2701/2701-h/2701-h.htm', // Moby Dick
  'https://www.gutenberg.org/files/98/98-h/98-h.htm', // A Tale of Two Cities
  'https://www.gutenberg.org/files/1232/1232-h/1232-h.htm', // The Prince
  'https://www.gutenberg.org/files/345/345-h/345-h.htm', // Dracula
  'https://www.gutenberg.org/files/174/174-h/174-h.htm', // The Picture of Dorian Gray
  'https://www.gutenberg.org/files/2542/2542-h/2542-h.htm', // A Doll's House
];

// Dados mockados estendidos com mais informações
const extendedMockBooks: Book[] = mockBooks.map((book, index) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  cover: bookCovers[index % bookCovers.length], // Garante que sempre terá uma capa válida
  format: (book.format || (index % 2 === 0 ? 'pdf' : 'epub')) as 'pdf' | 'epub',
  progress: book.progress || 0,
  isFavorite: index < 3,
  size: book.duration || `${(Math.random() * 5 + 1).toFixed(1)} MB`,
  category: book.categories?.[0] || 'Literatura',
  lastRead: book.progress && book.progress > 0 ? '2024-03-20' : undefined,
  filePath: bookFiles[index % bookFiles.length], // Garante que sempre terá um link válido
  rating: 4.5 + (Math.random() * 0.5),
  year: book.publishDate || '2024',
  pages: book.pageCount || book.pages || Math.floor(Math.random() * 300) + 100,
  synopsis: book.synopsis || `Uma obra fascinante de ${book.author} que explora temas profundos e cativantes. Esta história envolvente promete prender o leitor do início ao fim.`,
  isDeleted: false
}));

// Itens da sidebar (copiados do koodo-reader)
const sidebarMenuItems = [
  { id: 'home', label: 'Biblioteca', icon: '📚', count: 0 },
  { id: 'favorites', label: 'Favoritos', icon: '❤️', count: 0 },
  { id: 'highlights', label: 'Destaques', icon: '🎨', count: 23 },
  { id: 'annotations', label: 'Anotações', icon: '📝', count: 15 },
  { id: 'bookmarks', label: 'Marcadores', icon: '🔖', count: 8 },
  { id: 'trash', label: 'Lixeira', icon: '🗑️', count: 0 },
  { id: 'settings', label: 'Configurações', icon: '⚙️', count: 0 },
  { id: 'about', label: 'Sobre', icon: '❓', count: 0 }
];

// Agrupar livros por categoria
const groupBooksByCategory = (books: Book[]) => {
  // Obter todas as categorias únicas dos livros
  const uniqueCategories = Array.from(new Set(books.map(book => book.category)));
  
  return uniqueCategories.map(category => ({
    category,
    books: books.filter(book => book.category === category && !book.isDeleted)
  })).filter(group => group.books.length > 0);
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Netflix-style Hero Section para Livros
const HeroSection = ({ onOpenBook, onOpenDetails }: { onOpenBook: (book: Book) => void; onOpenDetails: (book: Book) => void }) => {
  const [currentBook, setCurrentBook] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const featuredBooks = extendedMockBooks.filter(book => book.isFavorite && !book.isDeleted);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBook((prev) => (prev + 1) % featuredBooks.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredBooks.length]);

  const current = featuredBooks[currentBook];

  if (!current) return null;

  return (
    <div className="relative h-[50vh] sm:h-[70vh] lg:h-screen w-full overflow-hidden">
      {/* Background com capa do livro */}
      <div className="absolute inset-0">
        {featuredBooks.map((book, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentBook 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <div className="relative w-full h-full">
              {/* Blur background */}
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover blur-xl scale-110"
              />
              {/* Book cover showcase - Hidden on mobile */}
              <div className="hidden lg:flex absolute inset-0 items-center justify-end pr-32">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-[70%] w-auto rounded-lg shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onOpenDetails(book)}
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Gradientes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="relative h-full flex items-center">
        <div className="px-6 sm:px-12 lg:px-20 max-w-full lg:max-w-3xl">
          <div className={`transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl line-clamp-2">
              {current.title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-3 sm:mb-6">
              por {current.author}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
              <span className="text-green-400 font-bold text-sm sm:text-base">★ {current.rating?.toFixed(1)}</span>
              <span className="text-gray-400 text-sm sm:text-base">{current.year}</span>
              <span className="text-gray-400 text-sm sm:text-base">{current.pages} páginas</span>
              <span className="bg-blue-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{current.format.toUpperCase()}</span>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-full lg:max-w-2xl">
              {current.synopsis || 'Mergulhe nesta incrível obra e descubra um mundo de conhecimento e imaginação.'}
            </p>
            
            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <button 
                onClick={() => onOpenBook(current)}
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2 sm:py-3 bg-white text-black rounded hover:bg-gray-200 transition-all duration-300 text-sm sm:text-lg font-semibold shadow-2xl hover:shadow-white/20 hover:scale-105"
              >
                <BookOpenIcon className="w-4 sm:w-6 h-4 sm:h-6" />
                Ler Agora
              </button>
              <button 
                onClick={() => onOpenDetails(current)}
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2 sm:py-3 bg-gray-500/70 text-white rounded hover:bg-gray-500/50 transition-all duration-300 text-sm sm:text-lg font-semibold backdrop-blur-sm shadow-xl hover:shadow-gray-500/20 hover:scale-105"
              >
                <InformationCircleIcon className="w-4 sm:w-6 h-4 sm:h-6" />
                Mais informações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
        {featuredBooks.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentBook(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentBook 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/80 hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Netflix-style Book Card
const NetflixBookCard = ({ book, onOpen }: { book: Book; onOpen: (book: Book) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const progressPercentage = book.progress || 0;

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(book)}
    >
      <div className={`relative transition-all duration-300 h-full ${isHovered ? 'scale-105 z-50' : 'scale-100'}`}>
        {/* Card Container */}
        <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col shadow-lg">
          {/* Book Cover */}
          <div className="relative w-full h-64 bg-gray-700 flex-shrink-0">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            
            {/* Progress Bar */}
            {progressPercentage > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-600">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Hover Overlay */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-white" />
              </div>
            )}

            {/* Deleted Badge */}
            {book.isDeleted && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                Na lixeira
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-400 text-xs mb-2">{book.author}</p>
            </div>
            
            <div className="flex items-center justify-between text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">★ {book.rating?.toFixed(1)}</span>
                <span className="text-gray-500">{book.pages}p</span>
              </div>
              {progressPercentage > 0 && (
                <span className="text-blue-400 font-medium">{progressPercentage}%</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Netflix-style Carousel Row
const CarouselRow = ({ title, books, onOpenBook }: { title: string; books: Book[]; onOpenBook: (book: Book) => void }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="relative group mb-12">
      <h2 className="text-2xl font-semibold text-white mb-4 px-12">{title}</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-40 w-10 h-16 bg-black/80 hover:bg-black/95 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Books Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => (
          <div key={book.id} className="flex-shrink-0 w-48 h-80">
            <NetflixBookCard book={book} onOpen={onOpenBook} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-40 w-10 h-16 bg-black/80 hover:bg-black/95 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

// Trash Section Component
const TrashSection = ({ books, onOpenBook, onRestore, onPermanentDelete }: { 
  books: Book[]; 
  onOpenBook: (book: Book) => void;
  onRestore: (bookId: string) => void;
  onPermanentDelete: (bookId: string) => void;
}) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <div className="text-6xl mb-4">🗑️</div>
        <h3 className="text-xl font-semibold mb-2">Lixeira vazia</h3>
        <p className="text-gray-400">Livros excluídos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="px-12">
      <h2 className="text-2xl font-semibold text-white mb-6">Lixeira</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">{book.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onRestore(book.id)}
                  className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => onPermanentDelete(book.id)}
                  className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NetflixBooksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>(extendedMockBooks);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookForDetails, setBookForDetails] = useState<Book | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu sempre começa fechado
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'highlights' | 'annotations' | 'bookmarks' | 'trash' | 'settings' | 'about'>('home');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid'); // Modo de visualização

  // Contadores
  const activeBooks = books.filter(book => !book.isDeleted);
  const deletedBooks = books.filter(book => book.isDeleted);
  const favoriteBooks = activeBooks.filter(book => book.isFavorite);
  const continueReadingBooks = activeBooks.filter(book => book.progress && book.progress > 0 && book.progress < 100);

  // Menu items com contadores atualizados
  const menuItems = [
    { id: 'home', label: 'Biblioteca', icon: '📚', count: activeBooks.length },
    { id: 'favorites', label: 'Favoritos', icon: '❤️', count: favoriteBooks.length },
    { id: 'highlights', label: 'Destaques', icon: '🎨', count: 23 }, // Mock
    { id: 'annotations', label: 'Anotações', icon: '📝', count: 15 }, // Mock
    { id: 'bookmarks', label: 'Marcadores', icon: '🔖', count: 8 }, // Mock
    { id: 'trash', label: 'Lixeira', icon: '🗑️', count: deletedBooks.length },
    { id: 'settings', label: 'Configurações', icon: '⚙️', count: 0 },
    { id: 'about', label: 'Sobre', icon: '❓', count: 0 }
  ];

  // Efeito para fazer a página completamente fullscreen
  useEffect(() => {
    // Esconder sidebar e header
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const sidebarContainer = document.querySelector('[class*="sidebar"]');
    
    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    if (sidebarContainer) {
      (sidebarContainer as HTMLElement).style.display = 'none';
    }

    // Forçar body para fullscreen
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // Cleanup
    return () => {
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      if (sidebarContainer) {
        (sidebarContainer as HTMLElement).style.display = '';
      }
      
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedBook(null);
  };

  // Abrir modal de detalhes
  const handleOpenDetails = (book: Book) => {
    setBookForDetails(book);
    setIsDetailsModalOpen(true);
  };

  // Fechar modal de detalhes
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setBookForDetails(null);
  };

  // Abrir livro do modal
  const handleOpenBookFromModal = () => {
    if (bookForDetails) {
      handleCloseDetails();
      handleOpenBook(bookForDetails);
    }
  };

  // Toggle favorito
  const toggleFavorite = (bookId: string) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
    ));
  };

  // Deletar livro (mover para lixeira)
  const handleDeleteBook = (bookId: string) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, isDeleted: true } : book
    ));
  };

  // Restaurar livro da lixeira
  const handleRestoreBook = (bookId: string) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, isDeleted: false } : book
    ));
  };

  // Deletar permanentemente
  const handlePermanentDelete = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId));
  };

  // Se o viewer está aberto, renderizar apenas ele
  if (isViewerOpen && selectedBook) {
    return (
      <KoodoViewer
        book={{
          ...selectedBook,
          thumbnail: selectedBook.cover,
          publisher: selectedBook.author,
          synopsis: selectedBook.synopsis || selectedBook.title,
          duration: selectedBook.size,
          filePath: selectedBook.filePath
        } as BookType}
        onClose={handleCloseViewer}
      />
    );
  }

  // Organizar livros
  const newBooks = activeBooks.slice(0, 8);
  const booksByCategory = groupBooksByCategory(activeBooks);

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-gray-900 overflow-hidden z-50 flex">
        {/* Conteúdo Principal - sem margem quando menu fechado */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isMenuOpen ? 'mr-80' : 'mr-0'
        }`}>
          {/* Botões do Header - Responsivos */}
          <div className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50 flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
              <span className="sm:hidden">Voltar</span>
            </button>
          </div>

          {/* Botão Toggle Menu - Responsivo e mais visível */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`fixed top-3 sm:top-6 z-50 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 text-sm sm:text-base shadow-lg ${
              isMenuOpen ? 'right-[21rem]' : 'right-3 sm:right-6'
            }`}
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
            <span className="hidden sm:inline">{isMenuOpen ? 'Fechar' : 'Menu'}</span>
          </button>

          {showTrash || currentView === 'trash' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <TrashSection
                books={deletedBooks}
                onOpenBook={handleOpenDetails}
                onRestore={handleRestoreBook}
                onPermanentDelete={handlePermanentDelete}
              />
            </div>
          ) : currentView === 'favorites' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Seus Favoritos</h2>
                {favoriteBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {favoriteBooks.map((book) => (
                      <div key={book.id} className="w-full h-80">
                        <NetflixBookCard book={book} onOpen={handleOpenDetails} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-white">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
                    <p className="text-gray-400">Marque livros como favoritos para vê-los aqui</p>
                  </div>
                )}
              </div>
            </div>
          ) : currentView === 'highlights' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center h-64 text-white">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Destaques</h3>
                <p className="text-gray-400">Seus destaques aparecerão aqui</p>
              </div>
            </div>
          ) : currentView === 'annotations' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center h-64 text-white">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Anotações</h3>
                <p className="text-gray-400">Suas anotações aparecerão aqui</p>
              </div>
            </div>
          ) : currentView === 'bookmarks' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center h-64 text-white">
                <div className="text-6xl mb-4">🔖</div>
                <h3 className="text-xl font-semibold mb-2">Marcadores</h3>
                <p className="text-gray-400">Seus marcadores aparecerão aqui</p>
              </div>
            </div>
          ) : currentView === 'settings' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Configurações</h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Preferências de Leitura</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tema Padrão</label>
                        <select className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg">
                          <option>Claro</option>
                          <option>Escuro</option>
                          <option>Automático</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tamanho da Fonte</label>
                        <input type="range" className="w-full" min="12" max="24" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Sincronização</h3>
                    <div className="space-y-3">
                      <label className="flex items-center text-gray-300">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Sincronizar progresso de leitura</span>
                      </label>
                      <label className="flex items-center text-gray-300">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Sincronizar anotações e destaques</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'about' ? (
            <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-6xl mb-6">📚</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Biblioteca Netflix Style</h2>
                <p className="text-gray-300 mb-8">Versão 1.0.0</p>
                <div className="bg-gray-800 rounded-lg p-4 sm:p-6 text-left">
                  <p className="text-gray-300 mb-6">
                    Uma experiência de leitura moderna e elegante, inspirada na interface da Netflix.
                  </p>
                  <h3 className="text-lg font-semibold text-white mb-4">Funcionalidades:</h3>
                  <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                    <li>• Interface estilo Netflix</li>
                    <li>• Suporte para PDF e EPUB</li>
                    <li>• Anotações e destaques</li>
                    <li>• Sincronização de progresso</li>
                    <li>• Temas personalizáveis</li>
                    <li>• Organização inteligente</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <HeroSection onOpenBook={handleOpenBook} onOpenDetails={handleOpenDetails} />

              {/* Book Rows */}
              <div className="relative -mt-20 z-20 pb-20 bg-gray-900">
                {/* Continue Lendo */}
                {continueReadingBooks.length > 0 && (
                  <div className="pt-16">
                    <CarouselRow
                      title="Continue lendo"
                      books={continueReadingBooks}
                      onOpenBook={handleOpenDetails}
                    />
                  </div>
                )}

                {/* Favoritos */}
                {favoriteBooks.length > 0 && (
                  <CarouselRow
                    title="Seus favoritos"
                    books={favoriteBooks}
                    onOpenBook={handleOpenDetails}
                  />
                )}

                {/* Novidades */}
                <CarouselRow
                  title="Acabaram de chegar"
                  books={newBooks}
                  onOpenBook={handleOpenDetails}
                />

                {/* Por Categoria */}
                {booksByCategory.map(({ category, books: categoryBooks }) => (
                  categoryBooks.length > 0 && (
                    <CarouselRow
                      key={category}
                      title={category}
                      books={categoryBooks}
                      onOpenBook={handleOpenDetails}
                    />
                  )
                ))}

                {/* Mais Populares */}
                <CarouselRow
                  title="Mais populares"
                  books={activeBooks.slice(0, 10)}
                  onOpenBook={handleOpenDetails}
                />
              </div>
            </>
          )}
        </div>

        {/* Menu Lateral Direito - Responsivo */}
        <div className={`fixed right-0 top-0 h-full w-full sm:w-80 bg-gray-900/95 backdrop-blur-md transform transition-transform duration-300 z-[60] flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 sm:p-6 h-full flex flex-col">
            {/* Header do Menu */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Biblioteca</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Menu - Flex para distribuir espaço */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Menu Items - Compacto */}
              <nav className="space-y-1 mb-4 flex-shrink-0">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'trash') {
                        setShowTrash(true);
                        setCurrentView('home');
                      } else {
                        setCurrentView(item.id as any);
                        setShowTrash(false);
                      }
                      // Fechar menu em mobile após selecionar
                      if (window.innerWidth < 1024) {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${
                      (currentView === item.id && !showTrash) || (item.id === 'trash' && showTrash)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Estatísticas - Compacto */}
              <div className="p-3 bg-gray-800 rounded-lg mb-4 flex-shrink-0">
                <h3 className="text-white font-semibold mb-2 text-sm">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-300">
                    <span className="block text-gray-400">Total</span>
                    <span className="font-medium text-white">{activeBooks.length} livros</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="block text-gray-400">Lendo</span>
                    <span className="font-medium text-white">{continueReadingBooks.length} livros</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="block text-gray-400">Concluídos</span>
                    <span className="font-medium text-white">{activeBooks.filter(b => b.progress === 100).length} livros</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="block text-gray-400">Favoritos</span>
                    <span className="font-medium text-white">{favoriteBooks.length} livros</span>
                  </div>
                </div>
              </div>

              {/* Filtros Rápidos - Compacto */}
              <div className="mb-4 flex-shrink-0">
                <h3 className="text-white font-semibold mb-2 text-sm">Filtros</h3>
                <div className="flex flex-wrap gap-1">
                  <button className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-gray-700">
                    PDF
                  </button>
                  <button className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-gray-700">
                    EPUB
                  </button>
                  <button className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-gray-700">
                    Recentes
                  </button>
                  <button className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-gray-700">
                    A-Z
                  </button>
                </div>
              </div>

              {/* Espaçador flexível */}
              <div className="flex-1"></div>

              {/* Ações Rápidas - No final */}
              <div className="space-y-2 mt-auto flex-shrink-0">
                <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Importar Livro
                </button>
                <button className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay para fechar menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[59]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Book Details Modal */}
        {isDetailsModalOpen && bookForDetails && (
          <BookModal
            book={{
              ...bookForDetails,
              thumbnail: bookForDetails.cover,
              duration: bookForDetails.size,
              publisher: bookForDetails.author,
              synopsis: bookForDetails.synopsis || bookForDetails.title
            }}
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetails}
            onBookOpen={handleOpenBookFromModal}
          />
        )}

        {/* CSS Global para forçar fullscreen completo */}
        <style jsx global>{`
          /* Remover scrollbar mas manter scroll funcional */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
          
          /* Esconder todos elementos de navegação */
          aside,
          header,
          [class*="sidebar"],
          [class*="header"] {
            display: none !important;
          }
          
          /* Forçar fullscreen completo */
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          #__next,
          #__next > div,
          main,
          [class*="dashboard"],
          [class*="page"],
          [class*="content"],
          [class*="container"] {
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            overflow: hidden !important;
          }
          
          /* Garantir que nosso conteúdo esteja no topo */
          main > div {
            z-index: 50 !important;
          }
          
          /* Responsividade para o menu */
          @media (max-width: 1024px) {
            .lg\:mr-80 {
              margin-right: 0 !important;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
