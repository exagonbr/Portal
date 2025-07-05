import { Course } from '../types/education';
import { ForumThread, ForumTagCategory, ChatMessage } from '../types/communication';
import { User, UserRole } from '../types/auth';
import { Annotation, Highlight } from '../components/books/BookViewer/types';
import { CollectionDto } from '../types/collection';

// Interfaces
export interface Book {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  duration: string;
  progress?: number;
  pageCount?: number;
  description?: string;
  format: string;
  filePath: string;
  coverImage?: string;
  publishDate?: string;
  language?: string;
  pages?: number;
  categories?: string[];
  tags?: string[];
}

export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
}

// Educational video thumbnails using reliable placeholder images
const videoThumbnails = [
  // Matemática
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1635070041409-e363dbe005cb?w=800&h=450&fit=crop',
  
  // Física
  'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop',
  
  // Biologia
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop',
  
  // História
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
  
  // Geografia
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1502780402662-acc01917e4e6?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop',
  
  // Química
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  
  // Literatura
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
  
  // Filosofia
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  
  // Artes
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
  
  // Programação
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1635070041409-e363dbe005cb?w=800&h=450&fit=crop'
];

// Generate 50 mock videos with educational content (reduced from 100 for better performance)
export const mockVideos: Video[] = Array.from({ length: 50 }, (_, i) => ({
  id: `video-${i + 1}`,
  thumbnail: videoThumbnails[i],
  title: [
    'Matemática: Cálculo Diferencial',
    'Física: Mecânica Quântica',
    'Biologia: Genética Molecular',
    'História: Revolução Industrial',
    'Geografia: Geopolítica Mundial',
    'Química: Química Orgânica',
    'Literatura: Modernismo',
    'Filosofia: Epistemologia',
    'Artes: Renascimento',
    'Programação: Algoritmos'
  ][Math.floor(i / 5)] + ` - Aula ${(i % 5) + 1}`,
  duration: `${Math.floor(Math.random() * 59) + 1}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
  progress: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : undefined
}));

// Carousel Video Images
export const carouselVideoImages = [
  {
    src: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1350&h=600&fit=crop',
    alt: 'Educação Online',
    title: 'Aprenda em Qualquer Lugar'
  },
  {
    src: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=1350&h=600&fit=crop',
    alt: 'Aulas em Vídeo',
    title: 'Conteúdo Interativo'
  },
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1350&h=600&fit=crop',
    alt: 'Estudo em Grupo',
    title: 'Aprendizado Colaborativo'
  }
];

// Rest of the mock data...
export const MOCK_USERS = {
  'admin@portal.com': {
    id: 'admin1',
    name: 'ADM',
    email: 'admin@portal.com',
    role: 'SYSTEM_ADMIN',
    institution: { id: 'portal-corp', name: 'Portal Corp' },
    courses: [],
    endereco: 'Rua Principal, 123',
    telefone: '(11) 99999-9999',
    usuario: 'adminuser',
    unidadeEnsino: 'Sede Administrativa'
  },
  // ... other users
};

// Mock Books
export const mockBooks: Book[] = [
  // Livros em PDF - Domínio Público e Educacionais
  {
    id: 'pdf-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/8438204-L.jpg',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    publisher: 'Domínio Público',
    synopsis: 'A obra-prima de Machado de Assis narra a história de Bentinho e Capitu, explorando temas como ciúme, amor e traição em uma narrativa envolvente que questiona a própria confiabilidade do narrador.',
    duration: '4h 30min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00180a.pdf',
    pageCount: 256,
    progress: 45,
    language: 'pt-BR',
    categories: ['Literatura', 'Clássicos Brasileiros'],
    publishDate: '1899'
  },
  {
    id: 'pdf-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/8442016-L.jpg',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    publisher: 'Domínio Público',
    synopsis: 'Romance naturalista que retrata a vida em um cortiço do Rio de Janeiro, explorando as relações sociais e os conflitos humanos em um ambiente de pobreza e degradação.',
    duration: '5h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00026a.pdf',
    pageCount: 280,
    progress: 0,
    language: 'pt-BR',
    categories: ['Literatura', 'Naturalismo'],
    publishDate: '1890'
  },
  {
    id: 'pdf-3',
    thumbnail: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    title: 'Os Lusíadas',
    author: 'Luís de Camões',
    publisher: 'Domínio Público',
    synopsis: 'Epopeia portuguesa que narra as aventuras de Vasco da Gama e as grandes navegações portuguesas, considerada uma das maiores obras da literatura em língua portuguesa.',
    duration: '6h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00001a.pdf',
    pageCount: 420,
    progress: 12,
    language: 'pt-BR',
    categories: ['Literatura', 'Poesia Épica'],
    publishDate: '1572'
  },
  {
    id: 'pdf-4',
    thumbnail: 'https://covers.openlibrary.org/b/id/8225261-L.jpg',
    title: 'A Metamorfose',
    author: 'Franz Kafka',
    publisher: 'Domínio Público',
    synopsis: 'A história surreal de Gregor Samsa, que acorda transformado em um inseto gigante, explorando temas de alienação, família e a condição humana moderna.',
    duration: '2h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/ua00106a.pdf',
    pageCount: 96,
    progress: 75,
    language: 'pt-BR',
    categories: ['Literatura', 'Ficção'],
    publishDate: '1915'
  },
  {
    id: 'pdf-5',
    thumbnail: 'https://covers.openlibrary.org/b/id/8419395-L.jpg',
    title: 'Memórias Póstumas de Brás Cubas',
    author: 'Machado de Assis',
    publisher: 'Domínio Público',
    synopsis: 'Romance revolucionário narrado por um defunto autor, que conta sua vida com ironia e humor, criticando a sociedade brasileira do século XIX.',
    duration: '4h 45min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00164a.pdf',
    pageCount: 240,
    progress: 30,
    language: 'pt-BR',
    categories: ['Literatura', 'Realismo'],
    publishDate: '1881'
  },
  {
    id: 'pdf-6',
    thumbnail: 'https://covers.openlibrary.org/b/id/8419396-L.jpg',
    title: 'O Alienista',
    author: 'Machado de Assis',
    publisher: 'Domínio Público',
    synopsis: 'Novela satírica sobre o médico Simão Bacamarte e sua obsessão em definir a loucura, questionando os limites entre sanidade e insanidade.',
    duration: '2h 30min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00231a.pdf',
    pageCount: 120,
    progress: 90,
    language: 'pt-BR',
    categories: ['Literatura', 'Contos'],
    publishDate: '1882'
  },
  {
    id: 'pdf-7',
    thumbnail: 'https://covers.openlibrary.org/b/id/8442017-L.jpg',
    title: 'Iracema',
    author: 'José de Alencar',
    publisher: 'Domínio Público',
    synopsis: 'Romance indianista que conta a história de amor entre Iracema, a virgem dos lábios de mel, e o colonizador português Martim.',
    duration: '3h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00136a.pdf',
    pageCount: 150,
    progress: 0,
    language: 'pt-BR',
    categories: ['Literatura', 'Romantismo'],
    publishDate: '1865'
  },
  {
    id: 'pdf-8',
    thumbnail: 'https://covers.openlibrary.org/b/id/12648067-L.jpg',
    title: 'A Moreninha',
    author: 'Joaquim Manuel de Macedo',
    publisher: 'Domínio Público',
    synopsis: 'Romance romântico que narra o amor juvenil entre Augusto e Carolina, conhecida como A Moreninha, em uma ilha paradisíaca.',
    duration: '3h 30min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00189a.pdf',
    pageCount: 180,
    progress: 25,
    language: 'pt-BR',
    categories: ['Literatura', 'Romance'],
    publishDate: '1844'
  },

  // Livros em EPUB - Literatura Internacional e Técnicos
  {
    id: 'epub-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/8596849-L.jpg',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisher: 'Project Gutenberg',
    synopsis: 'A classic novel of manners that follows Elizabeth Bennet as she navigates issues of marriage, morality, and misunderstandings in 19th century England.',
    duration: '6h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm',
    pageCount: 432,
    progress: 60,
    language: 'en',
    categories: ['Literature', 'Classic Fiction'],
    publishDate: '1813'
  },
  {
    id: 'epub-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/10389270-L.jpg',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    publisher: 'Project Gutenberg',
    synopsis: 'The story of Victor Frankenstein, a young scientist who creates a grotesque creature in an unorthodox scientific experiment.',
    duration: '5h 30min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/84/84-h/84-h.htm',
    pageCount: 280,
    progress: 0,
    language: 'en',
    categories: ['Literature', 'Gothic Fiction', 'Science Fiction'],
    publishDate: '1818'
  },
  {
    id: 'epub-3',
    thumbnail: 'https://covers.openlibrary.org/b/id/7222269-L.jpg',
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    publisher: 'Project Gutenberg',
    synopsis: 'A young girl falls through a rabbit hole into a fantasy world populated by peculiar creatures and anthropomorphic playing cards.',
    duration: '2h 30min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/11/11-h/11-h.htm',
    pageCount: 150,
    progress: 80,
    language: 'en',
    categories: ['Literature', 'Fantasy', 'Children\'s Literature'],
    publishDate: '1865'
  },
  {
    id: 'epub-4',
    thumbnail: 'https://covers.openlibrary.org/b/id/8224266-L.jpg',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    publisher: 'Project Gutenberg',
    synopsis: 'A collection of twelve short stories featuring the famous detective Sherlock Holmes and his companion Dr. Watson.',
    duration: '4h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm',
    pageCount: 320,
    progress: 35,
    language: 'en',
    categories: ['Literature', 'Mystery', 'Detective Fiction'],
    publishDate: '1892'
  },
  {
    id: 'epub-5',
    thumbnail: 'https://covers.openlibrary.org/b/id/7222270-L.jpg',
    title: 'Moby Dick',
    author: 'Herman Melville',
    publisher: 'Project Gutenberg',
    synopsis: 'The narrative of Ishmael\'s voyage on the whaling ship Pequod, commanded by Captain Ahab who seeks revenge on the white whale.',
    duration: '8h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/2701/2701-h/2701-h.htm',
    pageCount: 635,
    progress: 15,
    language: 'en',
    categories: ['Literature', 'Adventure', 'American Literature'],
    publishDate: '1851'
  },
  {
    id: 'epub-6',
    thumbnail: 'https://covers.openlibrary.org/b/id/8224265-L.jpg',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    publisher: 'Project Gutenberg',
    synopsis: 'The story of Ebenezer Scrooge, a miserly old man who is visited by the ghosts of Christmas Past, Present, and Future.',
    duration: '2h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/46/46-h/46-h.htm',
    pageCount: 110,
    progress: 100,
    language: 'en',
    categories: ['Literature', 'Christmas Stories', 'Victorian Literature'],
    publishDate: '1843'
  },
  {
    id: 'epub-7',
    thumbnail: 'https://covers.openlibrary.org/b/id/8739164-L.jpg',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    publisher: 'Project Gutenberg',
    synopsis: 'The adventures of a mischievous boy growing up along the Mississippi River in the mid-19th century.',
    duration: '4h 30min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/74/74-h/74-h.htm',
    pageCount: 260,
    progress: 50,
    language: 'en',
    categories: ['Literature', 'Adventure', 'Young Adult'],
    publishDate: '1876'
  },
  {
    id: 'epub-8',
    thumbnail: 'https://covers.openlibrary.org/b/id/10521271-L.jpg',
    title: 'Dracula',
    author: 'Bram Stoker',
    publisher: 'Project Gutenberg',
    synopsis: 'The Gothic horror novel that introduced Count Dracula and established many conventions of subsequent vampire fantasy.',
    duration: '6h 30min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/345/345-h/345-h.htm',
    pageCount: 420,
    progress: 20,
    language: 'en',
    categories: ['Literature', 'Horror', 'Gothic Fiction'],
    publishDate: '1897'
  },

  // Livros Técnicos e Educacionais
  {
    id: 'pdf-tech-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/8739165-L.jpg',
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    publisher: 'No Starch Press',
    synopsis: 'A modern introduction to programming and JavaScript, covering language fundamentals, the browser, and Node.js.',
    duration: '7h 00min',
    format: 'pdf',
    filePath: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
    pageCount: 450,
    progress: 40,
    language: 'en',
    categories: ['Tecnologia', 'Programação', 'JavaScript'],
    publishDate: '2018'
  },
  {
    id: 'pdf-tech-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/10389271-L.jpg',
    title: 'Pro Git',
    author: 'Scott Chacon and Ben Straub',
    publisher: 'Apress',
    synopsis: 'The entire Pro Git book, written by Scott Chacon and Ben Straub and published by Apress, is available here.',
    duration: '5h 30min',
    format: 'pdf',
    filePath: 'https://github.com/progit/progit2/releases/download/2.1.360/progit.pdf',
    pageCount: 500,
    progress: 0,
    language: 'en',
    categories: ['Tecnologia', 'Git', 'Controle de Versão'],
    publishDate: '2014'
  },
  {
    id: 'pdf-tech-3',
    thumbnail: 'https://covers.openlibrary.org/b/id/12648068-L.jpg',
    title: 'Automate the Boring Stuff with Python',
    author: 'Al Sweigart',
    publisher: 'No Starch Press',
    synopsis: 'Learn how to use Python to write programs that do in minutes what would take you hours to do by hand.',
    duration: '6h 00min',
    format: 'pdf',
    filePath: 'https://automatetheboringstuff.com/2e/automatetheboringstuff2ndedition.pdf',
    pageCount: 500,
    progress: 25,
    language: 'en',
    categories: ['Tecnologia', 'Python', 'Automação'],
    publishDate: '2019'
  },

  // Mais livros em português
  {
    id: 'pdf-br-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/8419397-L.jpg',
    title: 'Quincas Borba',
    author: 'Machado de Assis',
    publisher: 'Domínio Público',
    synopsis: 'Romance que narra a história de Rubião, que herda a fortuna do filósofo Quincas Borba e sua filosofia do Humanitismo.',
    duration: '5h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00220a.pdf',
    pageCount: 300,
    progress: 10,
    language: 'pt-BR',
    categories: ['Literatura', 'Realismo'],
    publishDate: '1891'
  },
  {
    id: 'pdf-br-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/8442018-L.jpg',
    title: 'Senhora',
    author: 'José de Alencar',
    publisher: 'Domínio Público',
    synopsis: 'Romance urbano que critica a sociedade através da história de Aurélia, que compra seu marido em um casamento por interesse.',
    duration: '4h 30min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00201a.pdf',
    pageCount: 250,
    progress: 0,
    language: 'pt-BR',
    categories: ['Literatura', 'Romantismo'],
    publishDate: '1875'
  },
  {
    id: 'pdf-br-3',
    thumbnail: 'https://covers.openlibrary.org/b/id/8479622-L.jpg',
    title: 'O Primo Basílio',
    author: 'Eça de Queirós',
    publisher: 'Domínio Público',
    synopsis: 'Romance realista que retrata o adultério e a hipocrisia da sociedade lisboeta do século XIX.',
    duration: '5h 30min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00159a.pdf',
    pageCount: 350,
    progress: 5,
    language: 'pt-BR',
    categories: ['Literatura', 'Realismo Português'],
    publishDate: '1878'
  },

  // Adicionando mais livros clássicos com capas bonitas
  {
    id: 'pdf-br-4',
    thumbnail: 'https://covers.openlibrary.org/b/id/11754387-L.jpg',
    title: 'Grande Sertão: Veredas',
    author: 'Guimarães Rosa',
    publisher: 'Domínio Público',
    synopsis: 'Uma das maiores obras da literatura brasileira, narra a história do jagunço Riobaldo e suas reflexões sobre o sertão, o amor e o diabo.',
    duration: '8h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00054a.pdf',
    pageCount: 600,
    progress: 5,
    language: 'pt-BR',
    categories: ['Literatura', 'Modernismo'],
    publishDate: '1956'
  },
  {
    id: 'pdf-br-5',
    thumbnail: 'https://covers.openlibrary.org/b/id/8302845-L.jpg',
    title: 'Capitães da Areia',
    author: 'Jorge Amado',
    publisher: 'Domínio Público',
    synopsis: 'Romance que retrata a vida de meninos de rua em Salvador, explorando temas de abandono, amizade e esperança.',
    duration: '4h 00min',
    format: 'pdf',
    filePath: 'https://www.dominiopublico.gov.br/download/texto/bv00292a.pdf',
    pageCount: 280,
    progress: 70,
    language: 'pt-BR',
    categories: ['Literatura', 'Romance Social'],
    publishDate: '1937'
  },
  {
    id: 'epub-br-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/8231916-L.jpg',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Project Gutenberg',
    synopsis: 'Distopia clássica que retrata um futuro totalitário onde o Grande Irmão vigia todos os cidadãos e o pensamento independente é crime.',
    duration: '6h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/11/11-h/11-h.htm',
    pageCount: 328,
    progress: 85,
    language: 'en',
    categories: ['Literatura', 'Ficção Científica', 'Distopia'],
    publishDate: '1949'
  },
  {
    id: 'epub-br-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/8486950-L.jpg',
    title: 'Don Quixote',
    author: 'Miguel de Cervantes',
    publisher: 'Project Gutenberg',
    synopsis: 'A história do fidalgo que enlouquece lendo romances de cavalaria e sai pelo mundo com seu fiel escudeiro Sancho Pança.',
    duration: '10h 00min',
    format: 'epub',
    filePath: 'https://www.gutenberg.org/files/996/996-h/996-h.htm',
    pageCount: 863,
    progress: 20,
    language: 'en',
    categories: ['Literatura', 'Clássicos', 'Aventura'],
    publishDate: '1605'
  }
];

// Carousel Book Images
export const carouselBookImages = [
  {
    src: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1350&h=600&fit=crop',
    alt: 'Biblioteca Digital',
    title: 'Acervo Completo'
  },
  {
    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=600&fit=crop',
    alt: 'Livros Didáticos',
    title: 'Material Didático'
  },
  {
    src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1350&h=600&fit=crop',
    alt: 'Leitura e Aprendizado',
    title: 'Conhecimento ao seu Alcance'
  }
];

// Mock Teachers
export const mockTeachers = [
  {
    id: 't1',
    name: 'Prof. Ricardo Oliveira',
    email: 'ricardo.oliveira@edu.com',
    subjects: ['Matemática', 'Física'],
    courses: ['1', '2'],
    department: 'Ciências Exatas',
    availability: {
      days: ['Segunda', 'Quarta', 'Sexta'],
      hours: '08:00 - 17:00'
    }
  },
  {
    id: 't2',
    name: 'Profa. Ana Santos',
    email: 'ana.santos@edu.com',
    subjects: ['Biologia', 'Química'],
    courses: ['3', '4'],
    department: 'Ciências Naturais',
    availability: {
      days: ['Terça', 'Quinta'],
      hours: '13:00 - 22:00'
    }
  }
];

// Mock Students
export const mockStudents = [
  {
    id: 's1',
    name: 'Julia Costa',
    email: 'julia.c@edu.com',
    progress: 85,
    grades: {
      assignments: 90,
      tests: 85,
      participation: 95
    },
    enrolledCourses: ['1', '2']
  },
  {
    id: 's2',
    name: 'Pedro Santos',
    email: 'pedro.s@edu.com',
    progress: 78,
    grades: {
      assignments: 75,
      tests: 80,
      participation: 85
    },
    enrolledCourses: ['1', '3']
  }
];

// Mock Courses
export const mockCourses = [
  {
    id: '1',
    name: 'Matemática Avançada',
    description: 'Curso de matemática avançada para ensino médio',
    level: 'BASIC',
    cycle: 'Anos Finais',
    stage: '9º ano',
    institution: {
      id: '1',
      name: 'Escola Municipal São José',
      type: 'UNIVERSITY',
      characteristics: [
        'Ensino fundamental completo',
        'Laboratório de matemática',
        'Professores especializados'
      ]
    },
    duration: '1 ano letivo',
    schedule: {
      startDate: '2024-02-01',
      endDate: '2024-12-15',
      classDays: ['Segunda', 'Quarta', 'Sexta'],
      classTime: '14:00 - 15:30'
    },
    teachers: ['t1'],
    students: ['s1', 's2']
  },
  {
    id: '2',
    name: 'História do Brasil Colônia',
    description: 'Curso sobre o período colonial brasileiro.',
    level: 'BASIC',
    cycle: 'Ensino Médio',
    stage: '1º ano',
    institution: {
      id: '2',
      name: 'Colégio Estadual Dom Pedro II',
      type: 'COLLEGE',
      characteristics: ['Foco em humanidades', 'Biblioteca especializada']
    },
    duration: '6 meses',
    schedule: {
      startDate: '2024-03-01',
      endDate: '2024-08-30',
      classDays: ['Terça', 'Quinta'],
      classTime: '09:00 - 10:30'
    },
    teachers: ['t2'],
    students: ['s2']
  }
];

// Mock Content Collections
export const mockContentCollections: CollectionDto[] = [
  {
    id: 'collection_1',
    name: 'Matemática Fundamental',
    synopsis: 'Coleção completa de matemática para ensino fundamental com conceitos básicos e exercícios práticos.',
    cover_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    support_material: '/materials/matematica-fundamental.pdf',
    total_duration: 7200, // 2 horas em segundos
    subject: 'Matemática',
    tags: ['matemática', 'fundamental', 'básico'],
    created_by: 'admin1',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'collection_2',
    name: 'Ciências da Natureza',
    synopsis: 'Exploração do mundo natural através de experimentos e observações científicas.',
    cover_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
    support_material: '/materials/ciencias-natureza.pdf',
    total_duration: 5400, // 1.5 horas em segundos
    subject: 'Ciências',
    tags: ['ciências', 'biologia', 'corpo humano'],
    created_by: 'admin1',
    created_at: '2024-01-17T00:00:00.000Z',
    updated_at: '2024-01-17T00:00:00.000Z'
  },
  {
    id: 'collection_3',
    name: 'História do Brasil',
    synopsis: 'Jornada através da história brasileira desde o descobrimento até os dias atuais.',
    cover_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
    support_material: '/materials/historia-brasil.pdf',
    total_duration: 9000, // 2.5 horas em segundos
    subject: 'História',
    tags: ['história', 'brasil', 'colonial'],
    created_by: 'admin1',
    created_at: '2024-01-18T00:00:00.000Z',
    updated_at: '2024-01-18T00:00:00.000Z'
  }
];

// Mock Module Collection (for ModuleManager)
export const mockModuleCollection: CollectionDto = mockContentCollections[0];

// Mock Content Videos (for ModuleManager)
export const mockContentVideos = mockVideos.map(video => ({
  id: video.id,
  name: video.title,
  moduleId: '',
  videoUrl: `/videos/${video.id}.mp4`,
  duration: parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]),
  authors: ['Prof. Exemplo'],
  educationCycle: {
    level: 'FUNDAMENTAL' as const,
    cycle: 'ANOS_INICIAIS'
  },
  createdAt: new Date(),
  updatedAt: new Date()
}));

// Dados mockados para anotações e destaques
export const mockAnnotations: { [bookId: string]: any[] } = {
  '1747075735459': [
    {
      id: 1,
      bookId: '1747075735459',
      pageNumber: 15,
      content: 'Conceito muito importante sobre estruturas de dados',
      position: { x: 200, y: 300 },
      createdAt: '2024-03-15T10:30:00Z'
    },
    {
      id: 2,
      bookId: '1747075735459',
      pageNumber: 28,
      content: 'Lembrar de revisar este algoritmo',
      position: { x: 150, y: 450 },
      createdAt: '2024-03-16T14:20:00Z'
    }
  ],
  '1747075735460': [
    {
      id: 3,
      bookId: '1747075735460',
      pageNumber: 42,
      content: 'Excelente explicação sobre o tema',
      position: { x: 180, y: 250 },
      createdAt: '2024-03-17T09:15:00Z'
    }
  ]
};

export const mockHighlights: { [bookId: string]: any[] } = {
  '1747075735459': [
    {
      id: 1,
      bookId: '1747075735459',
      pageNumber: 12,
      content: 'A complexidade computacional é um conceito fundamental na ciência da computação',
      color: 'yellow',
      createdAt: '2024-03-15T08:45:00Z'
    },
    {
      id: 2,
      bookId: '1747075735459',
      pageNumber: 25,
      content: 'Os algoritmos de ordenação são essenciais para o desenvolvimento de software eficiente',
      color: 'green',
      createdAt: '2024-03-16T11:30:00Z'
    }
  ],
  '1747075735460': [
    {
      id: 3,
      bookId: '1747075735460',
      pageNumber: 8,
      content: 'A literatura brasileira do século XIX apresenta características únicas',
      color: 'blue',
      createdAt: '2024-03-17T16:20:00Z'
    }
  ]
};

export const mockBookmarks: { [bookId: string]: any[] } = {
  '1747075735459': [
    {
      id: 1,
      bookId: '1747075735459',
      pageNumber: 50,
      title: 'Capítulo sobre Grafos',
      createdAt: '2024-03-15T12:00:00Z'
    },
    {
      id: 2,
      bookId: '1747075735459',
      pageNumber: 75,
      title: 'Algoritmos de Busca',
      createdAt: '2024-03-16T15:45:00Z'
    }
  ]
};
