import { Course } from '../types/education';
import { ForumThread, ForumTagCategory } from '../types/communication';
import { User } from '../types/auth';

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
  format?: 'pdf' | 'epub';
  filePath?: string;
  pageCount?: number;
}


export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
}

export interface SimplifiedStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  grades: {
    assignments: number;
    tests: number;
    participation: number;
  };
  enrolledCourses: string[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  courses: string[];
  department: string;
  availability: {
    days: string[];
    hours: string;
  };
}

// Mock user data
export const MOCK_USERS: Record<string, User> = {
  'admin@portal.com': {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@portal.com',
    role: 'admin',
    courses: []
  },
  'julia.c@edu.com': {
    id: '1',
    name: 'Julia Costa',
    email: 'julia.c@edu.com',
    role: 'student',
    courses: ['1', '2']
  },
  'ricardo.oliveira@edu.com': {
    id: '2',
    name: 'Professor Ricardo',
    email: 'ricardo.oliveira@edu.com',
    role: 'teacher',
    courses: ['1', '2']
  },
  'manager@portal.com': {
    id: 'manager1',
    name: 'User Manager',
    email: 'manager@portal.com',
    role: 'manager',
    courses: []
  }
};

// Mock teachers data
export const mockTeachers: Teacher[] = [
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

// Mock students data
export const mockStudents: SimplifiedStudent[] = [
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

// Mock courses data
export const mockCourses: Course[] = [
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
  }
];

// Book cover images from various educational publishers (100 unique covers)
const bookCovers = Array.from({ length: 100 }, (_, i) => 
  `https://covers.openlibrary.org/b/id/${10000 + i}-L.jpg`
);

// Educational video IDs and thumbnails (100 unique videos)
const videoIds = [
  // Math Videos
  'X_B7o4_wOAY', 'D7K1yXz5IgI', 'NybHckSEQBI', 'kjBOesZCoqc', 'fNk_zzaMoSs', // Khan Academy
  'pTnEG_WGd2Q', 'F3BR6q9_zEs', 'mH0oCDa74tE', 'sD0NjbwqlYw', 'PF5yfMfxI88', // 3Blue1Brown
  // Physics Videos
  'ZM8ECpBuQYE', 'jLJw_Aw-7Tc', 'AcX3IW00nNk', 'CKrqxq8DUA8', 'ZYQxsEpIqr8', // Minute Physics
  'JGO_fAjJlYk', 'au0QJYISrgg', 'Xc4xYacTu-E', 'M0r4hw6hXuM', 'Bg9MVRQYCzA', // Veritasium
  // Chemistry Videos
  'FSyAehMdpyI', 'bka20Q9TN6M', 'sQK3Yr4Sc_k', 'lJzmbqyWu0E', 'FSEMlWxEv_E', // Tyler DeWitt
  'FSyAehMdpyI', 'bka20Q9TN6M', 'sQK3Yr4Sc_k', 'lJzmbqyWu0E', 'FSEMlWxEv_E', // Crash Course Chemistry
  // Biology Videos
  'QnQe0xW_JY4', 'P3GagfbA2vo', '8kK2zwjRV0M', 'URUJD5NEXC8', 'vL8Dz4mRRB8', // Amoeba Sisters
  'H8WJ2KENlK0', 'QImCld9YubE', 'uqZUxphq6Gk', 'mRzxTzKIsp8', 'kRlkZLXLPHE', // Crash Course Biology
  // History Videos
  'Yocja_N5s1I', 'dHSQAEneGmM', 'n7ndRwqJYDM', 'WhtuC9dp0Hk', 'Vufba_ZvArI', // Crash Course History
  'dIQmcwSg1nU', 'Y88LVU7MAe4', '41N6bKO-NVI', 'Mw44wHG4KOc', 'rjhIzemLdos', // Extra History
  // Literature Videos
  'QEIGvn4-0P4', 'Z3pp3c8cB9Q', 'rERXrggl5pM', 'iJn0ZPd6kxg', 'rJk3YEhKv8I', // Crash Course Literature
  'MSYw502dJNY', 'iJn0ZPd6kxg', 'rERXrggl5pM', 'Z3pp3c8cB9Q', 'QEIGvn4-0P4', // TED-Ed Literature
  // Geography Videos
  'x5I_uHJvgGQ', 'GVmIqRb_1Pg', 'DmOCdZQrLVg', 'RY7z66NsCPA', '3HXlxhrcQpU', // National Geographic
  'kE_RJ0s9_jY', '3HgTkwoCC4I', 'GVmIqRb_1Pg', 'x5I_uHJvgGQ', 'DmOCdZQrLVg', // Crash Course Geography
  // Art Videos
  'qXbXFJdyGhM', 'J3ne7Udaetg', '2YfmkIJV7Oo', 'YDJGUqa0XaM', 'KRQv9QxlQn4', // Art History
  'ZDZNNzKGPaQ', 'qXbXFJdyGhM', 'J3ne7Udaetg', '2YfmkIJV7Oo', 'YDJGUqa0XaM', // Smarthistory
  // Computer Science Videos
  'O5nskjZ_GoI', 'tpIctyqH29Q', 'L1ung0wil9Y', 'Dxcc6ycZ73M', 'y62zj9ozPOM', // CS50
  'zOjov-2OZ0E', 'O5nskjZ_GoI', 'tpIctyqH29Q', 'L1ung0wil9Y', 'Dxcc6ycZ73M', // Code.org
  // Music Videos
  'kvGYl8SQBJ0', 'Gt2zubHcER4', 'IAWI6nMQhQI', '4niz8TfY794', 'rgaTLrZGlk0', // Music Theory
  'kvGYl8SQBJ0', 'Gt2zubHcER4', 'IAWI6nMQhQI', '4niz8TfY794', 'rgaTLrZGlk0'  // Musician's Guide
];

const videoThumbnails = videoIds.map(id => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`);

// Generate 100 mock books with real educational book titles
export const mockBooks: Book[] = [
  {
    id: 'test-book-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/10001-L.jpg',
    title: 'Test Book 1',
    author: 'Test Author 1',
    publisher: 'Test Publisher',
    synopsis: 'Test book for PDF reader functionality',
    duration: '2h 30min',
    format: 'pdf',
    filePath: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/740706609aa4939aa3c7930178bc516d4f5c2b905de7ab47637bec6bf91dcaa5.pdf',
    pageCount: 120

  },
  {
    id: 'test-book-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/10002-L.jpg',
    title: 'Test Book 2',
    author: 'Test Author 2',
    publisher: 'Test Publisher',
    synopsis: 'Test book for PDF reader functionality',
    duration: '1h 45min',
    format: 'pdf',
    filePath: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/c76a59abd394730dfde13cb51604cc8ad0dfedcfb34a931f61182b9338c84822.pdf',
    pageCount: 85

  },
  {
    id: 'test-book-3',
    thumbnail: 'https://covers.openlibrary.org/b/id/10003-L.jpg',
    title: 'Test Book 3',
    author: 'Test Author 3',
    publisher: 'Test Publisher',
    synopsis: 'Test book for PDF reader functionality',
    duration: '3h 15min',
    format: 'pdf',
    filePath: 'https://editora-liberty.s3.sa-east-1.amazonaws.com/upload/51814c3b79838003d288662610734eb8c90dd05fb6b667ee8e2435ed1e794d4c.pdf',
    pageCount: 200

  },
  {
    id: 'test-book-4',
    thumbnail: 'https://covers.openlibrary.org/b/id/10004-L.jpg',
    title: 'Test Book 4',
    author: 'Test Author 4',
    publisher: 'Test Publisher',
    synopsis: 'Test book for PDF reader functionality',
    duration: '2h 00min',
    format: 'pdf',
    filePath: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/9fc386ff25ee851125340c47d6462a1f0f4bf3a02e4db6bbb741e9ac5458d431.pdf',
    pageCount: 150

  }
];

// Generate 100 mock videos with educational content
export const mockVideos: Video[] = Array.from({ length: 100 }, (_, i) => ({
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
    'Programação: Algoritmos',
    'Estatística: Probabilidade',
    'Anatomia: Sistema Nervoso',
    'Ecologia: Sustentabilidade',
    'Sociologia: Movimentos Sociais',
    'Psicologia: Comportamento Humano',
    'Astronomia: Sistema Solar',
    'Economia: Macroeconomia',
    'Música: Teoria Musical',
    'Linguística: Fonética',
    'Arqueologia: Civilizações Antigas'
  ][Math.floor(i / 5)] + ` - Aula ${(i % 5) + 1}`,
  duration: `${Math.floor(Math.random() * 59) + 1}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
  progress: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : undefined
}));

// Carousel Video Images
export const carouselVideoImages = [
  {
    src: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Educação Online',
    title: 'Aprenda em Qualquer Lugar'
  },
  {
    src: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Aulas em Vídeo',
    title: 'Conteúdo Interativo'
  },
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Estudo em Grupo',
    title: 'Aprendizado Colaborativo'
  }
];

// Carousel Book Images
export const carouselBookImages = [
  {
    src: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Biblioteca Digital',
    title: 'Acervo Completo'
  },
  {
    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Livros Didáticos',
    title: 'Material Didático'
  },
  {
    src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    alt: 'Leitura e Aprendizado',
    title: 'Conhecimento ao seu Alcance'
  }
];
