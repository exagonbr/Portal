import { Course } from '../types/education';
import { ForumThread, ForumTagCategory, ChatMessage } from '../types/communication';
import { User, UserRole } from '../types/auth';
import { Annotation, Highlight } from '../components/books/BookViewer/types';
import { Collection } from '../types/collection';

export interface Book {
  id: string;
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
  {
    id: 'local-epub-1',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
    title: 'Livro EPUB Local - Teste 1',
    author: 'Autor Teste',
    publisher: 'Editora Teste',
    synopsis: 'Livro EPUB local para teste de funcionalidade. Este arquivo está disponível localmente.',
    duration: '2h 30min',
    format: 'epub',
    filePath: '/books/9786585208116.epub',
    pageCount: 300,
    progress: 15
  },
  {
    id: 'local-epub-2',
    thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
    title: 'Sample EPUB - Teste 2',
    author: 'Sample Author',
    publisher: 'Sample Publisher',
    synopsis: 'Arquivo EPUB de exemplo para testar o visualizador local.',
    duration: '1h 15min',
    format: 'epub',
    filePath: '/books/sample.epub',
    pageCount: 150,
    progress: 5
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
export const mockContentCollections: Collection[] = [
  {
    id: 'collection_1',
    name: 'Matemática Fundamental',
    synopsis: 'Coleção completa de matemática para ensino fundamental com conceitos básicos e exercícios práticos.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    supportMaterial: '/materials/matematica-fundamental.pdf',
    totalDuration: 7200, // 2 horas em segundos
    subject: 'Matemática',
    modules: [
      {
        id: 'module_1',
        name: 'Números e Operações',
        description: 'Introdução aos números naturais e operações básicas',
        coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
        videoIds: ['video-1', 'video-2'],
        order: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'module_2',
        name: 'Geometria Básica',
        description: 'Formas geométricas e suas propriedades',
        coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=450&fit=crop',
        videoIds: ['video-3', 'video-4'],
        order: 2,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      }
    ],
    tags: ['matemática', 'fundamental', 'básico'],
    createdBy: 'admin1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'collection_2',
    name: 'Ciências da Natureza',
    synopsis: 'Exploração do mundo natural através de experimentos e observações científicas.',
    coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop',
    supportMaterial: '/materials/ciencias-natureza.pdf',
    totalDuration: 5400, // 1.5 horas em segundos
    subject: 'Ciências',
    modules: [
      {
        id: 'module_3',
        name: 'O Corpo Humano',
        description: 'Sistemas do corpo humano e suas funções',
        coverImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=450&fit=crop',
        videoIds: ['video-5', 'video-6'],
        order: 1,
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      }
    ],
    tags: ['ciências', 'biologia', 'corpo humano'],
    createdBy: 'admin1',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'collection_3',
    name: 'História do Brasil',
    synopsis: 'Jornada através da história brasileira desde o descobrimento até os dias atuais.',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
    supportMaterial: '/materials/historia-brasil.pdf',
    totalDuration: 9000, // 2.5 horas em segundos
    subject: 'História',
    modules: [
      {
        id: 'module_4',
        name: 'Brasil Colônia',
        description: 'O período colonial brasileiro e suas características',
        coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
        videoIds: ['video-7', 'video-8'],
        order: 1,
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 'module_5',
        name: 'Independência',
        description: 'O processo de independência do Brasil',
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
        videoIds: ['video-9', 'video-10'],
        order: 2,
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19')
      }
    ],
    tags: ['história', 'brasil', 'colonial'],
    createdBy: 'admin1',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  }
];

// Mock Module Collection (for ModuleManager)
export const mockModuleCollection: Collection = mockContentCollections[0];

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

export const mockAnnotations: { [bookId: string]: Annotation[] } = {
  'local-epub-1': [
    {
      id: 'anno-1',
      pageNumber: 15,
      content: 'Este é um ponto crucial para a trama principal.',
      position: { x: 100, y: 250 },
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 'anno-2',
      pageNumber: 42,
      content: 'Achei a descrição do personagem muito detalhada aqui.',
      position: { x: 50, y: 150 },
      createdAt: '2024-01-22T15:00:00Z'
    }
  ]
};

export const mockHighlights: { [bookId: string]: Highlight[] } = {
  'local-epub-1': [
    {
      id: '1',
      pageNumber: 25,
      content: 'O sol se punha no horizonte, pintando o céu com cores de fogo e ouro.',
      color: 'yellow',
      position: {
        x: 120, y: 300,
        width: 200,
        height: 20
      },
      createdAt: '2024-01-21T18:00:00Z'
    },
    {
      id: '2',
      pageNumber: 25,
      content: 'Uma brisa suave soprava do leste, trazendo consigo o cheiro do mar.',
      color: 'blue',
      position: {
        x: 80, y: 350,
        width: 250,
        height: 20
      },
      createdAt: '2024-01-21T18:05:00Z'
    }
  ],
  'local-epub-2': [
    {
      id: '3',
      pageNumber: 10,
      content: 'A decisão foi tomada. Não havia mais volta.',
      color: 'green',
      position: {
        x: 200, y: 180,
        width: 180,
        height: 20
      },
      createdAt: '2024-01-23T11:45:00Z'
    }
  ]
};
