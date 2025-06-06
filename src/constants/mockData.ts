import { Course } from '../types/education';
import { ForumThread, ForumTagCategory, ChatMessage } from '../types/communication';
import { User } from '../types/auth';
import { Annotation, Highlight } from '../components/books/BookViewer/types';

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

// Quiz interfaces
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // in minutes
  passingScore: number;
  questions: Question[];
  attempts: number;
  isGraded: boolean;
}

// Module interfaces
export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  xpReward: number;
  isCompleted: boolean;
  prerequisites?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: string;
  xpReward: number;
  isCompleted: boolean;
  content?: string;
  videoUrl?: string;
  requirements?: LessonRequirement[];
}

export interface LessonRequirement {
  type: 'lesson' | 'quiz' | 'assignment';
  lessonId: string;
  description: string;
}

// Annotations and Highlights interfaces
export interface AnnotationsMap {
  [bookId: string]: Annotation[];
}

export interface HighlightsMap {
  [bookId: string]: Highlight[];
}

// Dashboard interfaces
export interface TeacherMockData {
  totalStudents: number;
  activeClasses: number;
  averageAttendance: number;
  upcomingClasses: Array<{
    id: number;
    subject: string;
    time: string;
    date: string;
    students: number;
    room: string;
  }>;
  studentPerformance: Array<{
    month: string;
    average: number;
    approved: number;
    pending: number;
  }>;
  classAttendance: Array<{
    month: string;
    attendance: number;
    total: number;
    present: number;
  }>;
  subjectDistribution: Array<{
    subject: string;
    students: number;
    averageGrade: number;
    attendanceRate: number;
    completionRate: number;
  }>;
  classPerformance: Array<{
    class: string;
    students: number;
    averageGrade: number;
    attendanceRate: number;
    completionRate: number;
    subjects: Array<{
      name: string;
      average: number;
    }>;
  }>;
  recentActivities: Array<{
    id: number;
    type: string;
    subject: string;
    class: string;
    date: string;
    status: string;
    averageGrade?: number;
    submissions: number;
    totalStudents: number;
  }>;
}

export interface StudentMockData {
  currentGrade: number;
  attendanceRate: number;
  completedAssignments: number;
  totalAssignments: number;
  ranking: {
    position: number;
    totalStudents: number;
    improvement: number;
  };
  upcomingDeadlines: Array<{
    id: number;
    subject: string;
    task: string;
    deadline: string;
    type: string;
    weight: number;
    status: string;
  }>;
  gradeHistory: Array<{
    subject: string;
    grades: number[];
    weights: number[];
    average: number;
    ranking: number;
    teacher: string;
  }>;
  attendanceBySubject: Array<{
    subject: string;
    attendance: number;
    totalClasses: number;
    presentClasses: number;
    lastAbsence: string;
  }>;
  weeklyStudyHours: Array<{
    day: string;
    hours: number;
    subjects: string[];
  }>;
  performanceHistory: Array<{
    month: string;
    averageGrade: number;
    attendanceRate: number;
    completionRate: number;
    ranking: number;
  }>;
}

// Mock user data
export const MOCK_USERS: Record<string, User> = {
  'admin@portal.com': {
    id: 'admin1',
    name: 'ADM',
    email: 'admin@portal.com',
    role: 'admin',
    institution: { id: 'portal-corp', name: 'Portal Corp' },
    courses: [],
    endereco: 'Rua Principal, 123',
    telefone: '(11) 99999-9999',
    usuario: 'adminuser',
    unidadeEnsino: 'Sede Administrativa'
  },
  'julia.c@edu.com': {
    id: '1',
    name: 'Julia Costa',
    email: 'julia.c@edu.com',
    role: 'student',
    institution: { id: 'escola-sao-jose', name: 'Escola Municipal São José' },
    courses: [
      { id: '1', name: 'Matemática Avançada', status: 'active' },
      { id: '2', name: 'História do Brasil Colônia', status: 'active' }
    ],
    endereco: 'Av. Brasil, 456',
    telefone: '(21) 98888-8888',
    usuario: 'juliac',
    unidadeEnsino: 'Unidade Centro'
  },
  'ricardo.oliveira@edu.com': {
    id: '2',
    name: 'Professor Ricardo',
    email: 'ricardo.oliveira@edu.com',
    role: 'teacher',
    institution: { id: 'escola-sao-jose', name: 'Escola Municipal São José' },
    courses: [
      { id: '1', name: 'Matemática Avançada', role: 'teacher', status: 'active' },
      { id: '2', name: 'História do Brasil Colônia', role: 'teacher', status: 'active' }
    ],
    endereco: 'Rua das Palmeiras, 789',
    telefone: '(31) 97777-7777',
    usuario: 'ricardoprof',
    unidadeEnsino: 'Unidade Centro'
  },
  'manager@portal.com': {
    id: 'manager1',
    name: 'Marina Silva',
    email: 'manager@portal.com',
    role: 'manager',
    institution: { id: 'portal-corp', name: 'Portal Corp' },
    courses: [],
    endereco: 'Alameda dos Anjos, 101',
    telefone: '(41) 96666-6666',
    usuario: 'usermanager',
    unidadeEnsino: 'Sede Operacional'
  },
  'ana.santos@edu.com': {
    id: '3',
    name: 'Ana Santos',
    email: 'ana.santos@edu.com',
    role: 'teacher',
    institution: { id: 'colegio-dom-pedro', name: 'Colégio Estadual Dom Pedro II' },
    courses: [
      { id: '3', name: 'Biologia', role: 'teacher', status: 'active' },
      { id: '4', name: 'Química', role: 'teacher', status: 'active' }
    ],
    endereco: 'Travessa da Paz, 202',
    telefone: '(51) 95555-5555',
    usuario: 'anasprof',
    unidadeEnsino: 'Unidade Norte'
  }, 'pedro.s@edu.com': {
    id: '4',
    name: 'Pedro Santos',
    email: 'pedro.s@edu.com',
    role: 'student',
    institution: { id: 'colegio-dom-pedro', name: 'Colégio Estadual Dom Pedro II' },
    courses: [
      { id: '1', name: 'Matemática Avançada', status: 'active' },
      { id: '3', name: 'Biologia', status: 'active' }
    ],
    endereco: 'Rua da Esperança, 303',
    telefone: '(61) 94444-4444',
    usuario: 'pedros',
    unidadeEnsino: 'Unidade Norte'
  }, 'carlos.m@edu.com': {
    id: '5',
    name: 'Carlos Moreira',
    email: 'carlos.m@edu.com',
    role: 'student',
    institution: { id: 'escola-sao-jose', name: 'Escola Municipal São José' },
    courses: [
      { id: '2', name: 'História do Brasil Colônia', status: 'active' }
    ],
    endereco: 'Avenida Central, 404',
    telefone: '(71) 93333-3333',
    usuario: 'carlosm',
    senha: 'password123',
    unidadeEnsino: 'Unidade Centro'
  }, 'lucia.f@edu.com': {
    id: '6',
    name: 'Lucia Ferreira',
    email: 'lucia.f@edu.com',
    role: 'teacher',
    institution: { id: 'universidade-xyz', name: 'Universidade Federal XYZ' },
    courses: [
      { id: '5', name: 'Física Quântica', role: 'teacher', status: 'active' }
    ],
    endereco: 'Praça da Liberdade, 505',
    telefone: '(81) 92222-2222',
    usuario: 'luciafprof',
    unidadeEnsino: 'Campus Principal'
  },
  'roberto.a@edu.com': {
    id: '7',
    name: 'Roberto Alves',
    email: 'roberto.a@edu.com',
    role: 'student',
    institution: { id: 'universidade-xyz', name: 'Universidade Federal XYZ' },
    courses: [
      { id: '5', name: 'Física Quântica', status: 'active' },
      { id: '6', name: 'Cálculo Avançado', status: 'active' }
    ],
    endereco: 'Rua Universitária, 606',
    telefone: '(91) 91111-1111',
    usuario: 'robertoa',
    unidadeEnsino: 'Campus Principal'
  }
}

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
  },
  {
    id: '2',
    name: 'História do Brasil Colônia',
    description: 'Curso sobre o período colonial brasileiro.',
    level: 'BASIC', // Corrected from 'INTERMEDIATE'
    cycle: 'Ensino Médio',
    stage: '1º ano',
    institution: {
      id: '2',
      name: 'Colégio Estadual Dom Pedro II',
      type: 'COLLEGE', // Corrected from 'SCHOOL'
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
  },
  {
    id: '3',
    name: 'Introdução à Programação com Python',
    description: 'Curso introdutório de programação utilizando a linguagem Python.',
    level: 'PROFESSIONAL', // Corrected from 'BASIC' to better fit 'Profissionalizante' cycle
    cycle: 'Profissionalizante',
    stage: 'N/A',
    institution: {
      id: '3',
      name: 'Centro de Treinamento TechDev',
      type: 'TECH_CENTER', // Corrected from 'TRAINING_CENTER'
      characteristics: ['Laboratórios equipados', 'Instrutores experientes']
    },
    duration: '3 meses',
    schedule: {
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      classDays: ['Segunda', 'Quarta'],
      classTime: '19:00 - 21:00'
    },
    teachers: ['t1', 't2'], // Assuming teachers can teach in multiple institutions or courses
    students: ['s1']
  },
  {
    id: '4',
    name: 'Inglês Instrumental',
    description: 'Curso de inglês focado em leitura e interpretação de textos técnicos.',
    level: 'SUPERIOR', // Corrected from 'INTERMEDIATE'
    cycle: 'Superior',
    stage: 'N/A',
    institution: {
      id: '4',
      name: 'Universidade Federal XYZ',
      type: 'UNIVERSITY',
      characteristics: ['Convênios internacionais', 'Professores nativos']
    },
    duration: '1 semestre',
    schedule: {
      startDate: '2024-02-10',
      endDate: '2024-06-30',
      classDays: ['Sexta'],
      classTime: '10:00 - 12:00'
    },
    teachers: ['t2'], // Assuming Lucia Ferreira (id:6 from MOCK_USERS) is t2 or a new teacher
    students: ['s1', 's2']
  },
  {
    id: '5',
    name: 'Gestão de Projetos Ágeis',
    description: 'Curso sobre metodologias ágeis para gerenciamento de projetos.',
    level: 'PROFESSIONAL', // Corrected from 'ADVANCED'
    cycle: 'Profissionalizante',
    stage: 'N/A',
    institution: {
      id: '5',
      name: 'Escola de Negócios Inova',
      type: 'TECH_CENTER', // Corrected from 'TRAINING_CENTER'
      characteristics: ['Cases reais', 'Networking com profissionais da área']
    },
    duration: '2 meses',
    schedule: {
      startDate: '2024-05-01',
      endDate: '2024-06-30',
      classDays: ['Terça', 'Quinta'],
      classTime: '18:30 - 20:30'
    },
    teachers: ['t1'],
    students: ['s1']
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
    id: 'local-epub-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/10001-L.jpg',
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
    thumbnail: 'https://covers.openlibrary.org/b/id/10002-L.jpg',
    title: 'Sample EPUB - Teste 2',
    author: 'Sample Author',
    publisher: 'Sample Publisher',
    synopsis: 'Arquivo EPUB de exemplo para testar o visualizador local.',
    duration: '1h 15min',
    format: 'epub',
    filePath: '/books/sample.epub',
    pageCount: 150,
    progress: 5
  },
  {
    id: 'external-pdf-1',
    thumbnail: 'https://covers.openlibrary.org/b/id/10003-L.jpg',
    title: 'PDF Externo - Teste 1',
    author: 'Autor Externo',
    publisher: 'Editora Externa',
    synopsis: 'Livro PDF externo para teste de funcionalidade com URLs externas.',
    duration: '3h 15min',
    format: 'pdf',
    filePath: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/740706609aa4939aa3c7930178bc516d4f5c2b905de7ab47637bec6bf91dcaa5.pdf',
    pageCount: 200,
    progress: 25
  },
  {
    id: 'external-pdf-2',
    thumbnail: 'https://covers.openlibrary.org/b/id/10004-L.jpg',
    title: 'PDF Externo - Teste 2',
    author: 'Segundo Autor',
    publisher: 'Segunda Editora',
    synopsis: 'Segundo PDF externo para validar múltiplos formatos e URLs.',
    duration: '2h 45min',
    format: 'pdf',
    filePath: 'https://editora-liberty.s3.sa-east-1.amazonaws.com/upload/51814c3b79838003d288662610734eb8c90dd05fb6b667ee8e2435ed1e794d4c.pdf',
    pageCount: 180,
    progress: 40
  },
  {
    id: 'fallback-test',
    thumbnail: 'https://covers.openlibrary.org/b/id/10005-L.jpg',
    title: 'Teste Fallback - Sem filePath',
    author: 'Teste Fallback',
    publisher: 'Teste Publisher',
    synopsis: 'Este livro não tem filePath definido para testar o sistema de fallback.',
    duration: '1h 30min',
    format: `pdf`,
    // filePath não definido propositalmente para testar fallback
    pageCount: 100,
    progress: 0,
    filePath: ''
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
    title: 'Acervo Completo - Globo Livros'
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

// Dashboard Mock Data
export const teacherMockData: TeacherMockData = {
  totalStudents: 156,
  activeClasses: 8,
  averageAttendance: 92,
  upcomingClasses: [
    { id: 1, subject: "Matemática", time: "14:00", date: "2024-01-20", students: 25, room: "Sala 101" },
    { id: 2, subject: "Física", time: "15:30", date: "2024-01-20", students: 22, room: "Lab Física" },
    { id: 3, subject: "Química", time: "09:00", date: "2024-01-21", students: 20, room: "Lab Química" },
    { id: 4, subject: "Biologia", time: "10:30", date: "2024-01-21", students: 23, room: "Lab Biologia" },
    { id: 5, subject: "História", time: "13:00", date: "2024-01-22", students: 28, room: "Sala 203" }
  ],
  studentPerformance: [
    { month: "Jan", average: 85, approved: 142, pending: 14 },
    { month: "Fev", average: 82, approved: 138, pending: 18 },
    { month: "Mar", average: 88, approved: 145, pending: 11 },
    { month: "Abr", average: 85, approved: 140, pending: 16 },
    { month: "Mai", average: 90, approved: 148, pending: 8 },
    { month: "Jun", average: 87, approved: 144, pending: 12 },
    { month: "Jul", average: 89, approved: 146, pending: 10 },
    { month: "Ago", average: 86, approved: 141, pending: 15 },
    { month: "Set", average: 88, approved: 143, pending: 13 },
    { month: "Out", average: 91, approved: 150, pending: 6 },
    { month: "Nov", average: 89, approved: 147, pending: 9 },
    { month: "Dez", average: 92, approved: 152, pending: 4 }
  ],
  classAttendance: [
    { month: "Jan", attendance: 95, total: 156, present: 148 },
    { month: "Fev", attendance: 93, total: 156, present: 145 },
    { month: "Mar", attendance: 91, total: 156, present: 142 },
    { month: "Abr", attendance: 94, total: 156, present: 147 },
    { month: "Mai", attendance: 92, total: 156, present: 144 },
    { month: "Jun", attendance: 90, total: 156, present: 140 },
    { month: "Jul", attendance: 93, total: 156, present: 145 },
    { month: "Ago", attendance: 91, total: 156, present: 142 },
    { month: "Set", attendance: 94, total: 156, present: 147 },
    { month: "Out", attendance: 96, total: 156, present: 150 },
    { month: "Nov", attendance: 95, total: 156, present: 148 },
    { month: "Dez", attendance: 97, total: 156, present: 151 }
  ],
  subjectDistribution: [
    { 
      subject: "Matemática", 
      students: 45,
      averageGrade: 8.5,
      attendanceRate: 94,
      completionRate: 92
    },
    { 
      subject: "Física", 
      students: 38,
      averageGrade: 8.2,
      attendanceRate: 91,
      completionRate: 88
    },
    { 
      subject: "Química", 
      students: 35,
      averageGrade: 8.7,
      attendanceRate: 93,
      completionRate: 90
    },
    { 
      subject: "Biologia", 
      students: 38,
      averageGrade: 8.9,
      attendanceRate: 95,
      completionRate: 94
    },
    { 
      subject: "História", 
      students: 42,
      averageGrade: 8.6,
      attendanceRate: 92,
      completionRate: 89
    },
    { 
      subject: "Geografia", 
      students: 40,
      averageGrade: 8.8,
      attendanceRate: 93,
      completionRate: 91
    }
  ],
  classPerformance: [
    {
      class: "9º Ano A",
      students: 32,
      averageGrade: 8.7,
      attendanceRate: 94,
      completionRate: 92,
      subjects: [
        { name: "Matemática", average: 8.5 },
        { name: "Física", average: 8.2 },
        { name: "Química", average: 8.8 },
        { name: "Biologia", average: 9.0 }
      ]
    },
    {
      class: "9º Ano B",
      students: 30,
      averageGrade: 8.5,
      attendanceRate: 92,
      completionRate: 90,
      subjects: [
        { name: "Matemática", average: 8.3 },
        { name: "Física", average: 8.0 },
        { name: "Química", average: 8.6 },
        { name: "Biologia", average: 8.8 }
      ]
    }
  ],
  recentActivities: [
    {
      id: 1,
      type: "Avaliação",
      subject: "Matemática",
      class: "9º Ano A",
      date: "2024-01-18",
      status: "Concluído",
      averageGrade: 8.5,
      submissions: 30,
      totalStudents: 32
    },
    {
      id: 2,
      type: "Trabalho em Grupo",
      subject: "Física",
      class: "9º Ano B",
      date: "2024-01-19",
      status: "Em Andamento",
      submissions: 25,
      totalStudents: 30
    }
  ]
};

export const studentMockData: StudentMockData = {
  currentGrade: 8.5,
  attendanceRate: 95,
  completedAssignments: 45,
  totalAssignments: 50,
  ranking: {
    position: 15,
    totalStudents: 156,
    improvement: 3
  },
  upcomingDeadlines: [
    { 
      id: 1, 
      subject: "Matemática", 
      task: "Trabalho de Álgebra", 
      deadline: "2024-01-22",
      type: "Trabalho",
      weight: 30,
      status: "Pendente"
    },
    { 
      id: 2, 
      subject: "Física", 
      task: "Relatório de Laboratório", 
      deadline: "2024-01-24",
      type: "Relatório",
      weight: 20,
      status: "Em Andamento"
    },
    { 
      id: 3, 
      subject: "Química", 
      task: "Questionário Online", 
      deadline: "2024-01-25",
      type: "Avaliação",
      weight: 25,
      status: "Não Iniciado"
    }
  ],
  gradeHistory: [
    { 
      subject: "Matemática", 
      grades: [8.5, 9.0, 8.0, 9.5],
      weights: [25, 25, 25, 25],
      average: 8.75,
      ranking: 8,
      teacher: "Prof. Silva"
    },
    { 
      subject: "Física", 
      grades: [7.5, 8.0, 8.5, 8.0],
      weights: [25, 25, 25, 25],
      average: 8.0,
      ranking: 12,
      teacher: "Prof. Santos"
    },
    { 
      subject: "Química", 
      grades: [9.0, 8.5, 9.0, 8.5],
      weights: [25, 25, 25, 25],
      average: 8.75,
      ranking: 5,
      teacher: "Profa. Lima"
    },
    { 
      subject: "Biologia", 
      grades: [8.0, 8.5, 9.0, 8.5],
      weights: [25, 25, 25, 25],
      average: 8.5,
      ranking: 10,
      teacher: "Profa. Costa"
    }
  ],
  attendanceBySubject: [
    { 
      subject: "Matemática", 
      attendance: 98,
      totalClasses: 40,
      presentClasses: 39,
      lastAbsence: "2024-01-10"
    },
    { 
      subject: "Física", 
      attendance: 95,
      totalClasses: 38,
      presentClasses: 36,
      lastAbsence: "2024-01-15"
    },
    { 
      subject: "Química", 
      attendance: 92,
      totalClasses: 36,
      presentClasses: 33,
      lastAbsence: "2024-01-12"
    },
    { 
      subject: "Biologia", 
      attendance: 94,
      totalClasses: 35,
      presentClasses: 33,
      lastAbsence: "2024-01-08"
    }
  ],
  weeklyStudyHours: [
    { day: "Segunda", hours: 3, subjects: ["Matemática", "Física"] },
    { day: "Terça", hours: 2.5, subjects: ["Química", "Biologia"] },
    { day: "Quarta", hours: 4, subjects: ["Matemática", "História"] },
    { day: "Quinta", hours: 3, subjects: ["Física", "Geografia"] },
    { day: "Sexta", hours: 2, subjects: ["Química", "Matemática"] }
  ],
  performanceHistory: [
    {
      month: "Janeiro",
      averageGrade: 8.5,
      attendanceRate: 95,
      completionRate: 90,
      ranking: 15
    },
    {
      month: "Fevereiro",
      averageGrade: 8.7,
      attendanceRate: 96,
      completionRate: 92,
      ranking: 12
    },
    {
      month: "Março",
      averageGrade: 8.9,
      attendanceRate: 97,
      completionRate: 94,
      ranking: 10
    }
  ]
};

// Annotations Mock Data
export const mockAnnotations: AnnotationsMap = {
  'local-epub-1': [
    {
      id: 'ann-1',
      pageNumber: 15,
      content: 'Importante conceito sobre metodologia científica que precisa ser revisado.',
      position: { x: 150, y: 200 },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'ann-2',
      pageNumber: 28,
      content: 'Definição fundamental para o entendimento do capítulo.',
      position: { x: 180, y: 350 },
      createdAt: '2024-01-16T14:20:00Z'
    }
  ],
  'local-epub-2': [
    {
      id: 'ann-3',
      pageNumber: 42,
      content: 'Referência importante para a bibliografia.',
      position: { x: 200, y: 150 },
      createdAt: '2024-01-14T09:15:00Z'
    }
  ],
  'external-pdf-1': [
    {
      id: 'ann-4',
      pageNumber: 67,
      content: 'Exemplo prático de aplicação da teoria.',
      position: { x: 250, y: 400 },
      createdAt: '2024-01-17T16:45:00Z'
    },
    {
      id: 'ann-5',
      pageNumber: 89,
      content: 'Conclusão relevante para o trabalho final.',
      position: { x: 300, y: 280 },
      createdAt: '2024-01-18T11:30:00Z'
    }
  ]
};

// Highlights Mock Data
export const mockHighlights: HighlightsMap = {
  'local-epub-1': [
    {
      id: 'hl-1',
      pageNumber: 15,
      content: 'A metodologia científica requer um processo sistemático de investigação e documentação dos resultados obtidos.',
      color: '#FFEB3B', // yellow
      position: { x: 150, y: 200, width: 400, height: 24 },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'hl-2',
      pageNumber: 28,
      content: 'Os resultados demonstram uma correlação significativa entre as variáveis estudadas, sugerindo uma forte relação causal.',
      color: '#4CAF50', // green
      position: { x: 180, y: 350, width: 380, height: 48 },
      createdAt: '2024-01-16T14:20:00Z'
    }
  ],
  'local-epub-2': [
    {
      id: 'hl-3',
      pageNumber: 42,
      content: 'Os princípios fundamentais da teoria podem ser resumidos em três aspectos principais que se interrelacionam.',
      color: '#2196F3', // blue
      position: { x: 200, y: 150, width: 420, height: 24 },
      createdAt: '2024-01-14T09:15:00Z'
    }
  ],
  'external-pdf-1': [
    {
      id: 'hl-4',
      pageNumber: 67,
      content: 'A aplicação prática destes conceitos demonstra a versatilidade da metodologia em diferentes contextos.',
      color: '#FFEB3B', // yellow
      position: { x: 250, y: 400, width: 390, height: 24 },
      createdAt: '2024-01-17T16:45:00Z'
    }
  ]
};

// Color mapping for UI display
export const highlightColorClasses = {
  '#FFEB3B': 'bg-yellow-100 border-yellow-400',
  '#4CAF50': 'bg-green-100 border-green-400',
  '#2196F3': 'bg-blue-100 border-blue-400'
};

// Quiz Mock Data
export const mockQuiz: Quiz = {
  id: '1',
  title: 'Avaliação: Números Naturais',
  description: 'Teste seus conhecimentos sobre números naturais e suas propriedades',
  timeLimit: 30,
  passingScore: 70,
  attempts: 2,
  isGraded: true,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      text: 'Qual dos seguintes números NÃO é um número natural?',
      options: ['0', '-1', '1', '2'],
      correctAnswer: '-1',
      points: 2,
      explanation: 'Números naturais são inteiros não negativos (0, 1, 2, 3, ...)'
    },
    {
      id: 'q2',
      type: 'true-false',
      text: 'Todo número natural tem um sucessor.',
      options: ['Verdadeiro', 'Falso'],
      correctAnswer: 'Verdadeiro',
      points: 1,
      explanation: 'Para qualquer número natural n, seu sucessor é n + 1'
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      text: 'Quais das seguintes propriedades se aplicam à adição de números naturais?',
      options: [
        'Comutativa e Associativa',
        'Apenas Comutativa',
        'Apenas Associativa',
        'Nenhuma das anteriores'
      ],
      correctAnswer: 'Comutativa e Associativa',
      points: 2,
      explanation: 'A adição de números naturais é tanto comutativa (a + b = b + a) quanto associativa ((a + b) + c = a + (b + c))'
    },
    {
      id: 'q4',
      type: 'short-answer',
      text: 'Qual é o menor número natural?',
      correctAnswer: ['0', 'zero'],
      points: 1,
      explanation: 'O conjunto dos números naturais começa em zero'
    }
  ]
};

// Course Materials Mock Data
export const mockModules: Module[] = [
  {
    id: 'mod1',
    title: 'Introdução à Matemática',
    description: 'Conceitos fundamentais de matemática',
    xpReward: 100,
    isCompleted: false,
    lessons: [
      {
        id: 'lesson1',
        title: 'Números Naturais',
        type: 'video',
        duration: '15 min',
        xpReward: 25,
        isCompleted: false,
        videoUrl: 'https://example.com/video1'
      },
      {
        id: 'lesson2',
        title: 'Operações Básicas',
        type: 'reading',
        duration: '20 min',
        xpReward: 30,
        isCompleted: false,
        content: 'Conteúdo sobre operações básicas...'
      },
      {
        id: 'lesson3',
        title: 'Quiz: Números Naturais',
        type: 'quiz',
        duration: '10 min',
        xpReward: 45,
        isCompleted: false,
        requirements: [
          {
            type: 'lesson',
            lessonId: 'lesson1',
            description: 'Completar Números Naturais'
          }
        ]
      }
    ]
  },
  {
    id: 'mod2',
    title: 'Álgebra Básica',
    description: 'Introdução aos conceitos algébricos',
    xpReward: 150,
    isCompleted: false,
    prerequisites: ['mod1'],
    lessons: [
      {
        id: 'lesson4',
        title: 'Variáveis e Expressões',
        type: 'video',
        duration: '25 min',
        xpReward: 35,
        isCompleted: false,
        videoUrl: 'https://example.com/video2'
      },
      {
        id: 'lesson5',
        title: 'Equações Lineares',
        type: 'reading',
        duration: '30 min',
        xpReward: 40,
        isCompleted: false,
        content: 'Conteúdo sobre equações lineares...'
      }
    ]
  }
];

// Chat Mock Data
export const mockChats = [
  {
    id: 'chat1',
    name: 'Matemática - 9º Ano A',
    participants: ['t1', 's1', 's2'],
    lastMessage: 'Boa tarde, turma!',
    lastMessageTime: '2024-01-20T14:30:00Z'
  },
  {
    id: 'chat2',
    name: 'Física - 9º Ano B',
    participants: ['t1', 's2'],
    lastMessage: 'Dúvida sobre a experiência',
    lastMessageTime: '2024-01-20T15:45:00Z'
  }
];

export const mockConversationPortugues: ChatMessage[] = [
  {
    id: '1',
    senderId: 't1',
    content: 'Boa tarde, turma! Como estão os estudos?',
    timestamp: '2024-01-20T14:30:00Z',
    readBy: ['t1', 's1', 's2']
  },
  {
    id: '2',
    senderId: 's1',
    content: 'Boa tarde, professor! Estou com uma dúvida sobre a matéria de hoje.',
    timestamp: '2024-01-20T14:32:00Z',
    readBy: ['t1', 's1']
  },
  {
    id: '3',
    senderId: 't1',
    content: 'Claro! Qual é a sua dúvida?',
    timestamp: '2024-01-20T14:33:00Z',
    readBy: ['t1', 's1']
  },
  {
    id: '4',
    senderId: 's1',
    content: 'É sobre as equações do segundo grau. Não entendi como resolver quando o discriminante é negativo.',
    timestamp: '2024-01-20T14:35:00Z',
    readBy: ['t1', 's1']
  },
  {
    id: '5',
    senderId: 't1',
    content: 'Ótima pergunta! Quando o discriminante (Δ) é negativo, a equação não possui raízes reais. Isso significa que o gráfico da função não toca o eixo x.',
    timestamp: '2024-01-20T14:37:00Z',
    readBy: ['t1', 's1']
  }
];

// Forum Mock Data
export const mockForumThreads: ForumThread[] = [
  {
    id: 'thread1',
    classId: '1',
    title: 'Dúvidas sobre Equações Quadráticas',
    content: 'Estou com dificuldades para resolver equações do segundo grau. Alguém pode me ajudar?',
    authorId: 's1',
    tags: [ForumTagCategory.Question, ForumTagCategory.Technical],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    replies: [],
    pinned: false,
    locked: false,
    views: 25
  },
  {
    id: 'thread2',
    classId: '2',
    title: 'Experimento de Física - Resultados',
    content: 'Compartilhando os resultados do experimento sobre movimento retilíneo uniforme.',
    authorId: 't1',
    tags: [ForumTagCategory.Resource, ForumTagCategory.Assignment],
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z',
    replies: [],
    pinned: true,
    locked: false,
    views: 45
  }
];

// Institution Mock Data for forms
export const mockInstitutions = [
  { id: 'inst1', name: 'Portal Corp' },
  { id: 'inst2', name: 'Escola Municipal São José' },
  { id: 'inst3', name: 'Colégio Estadual Dom Pedro II' },
  { id: 'inst4', name: 'Universidade Federal XYZ' },
  { id: 'inst5', name: 'Centro de Treinamento TechDev' },
  { id: 'inst6', name: 'Escola de Negócios Inova' }
];

export const mockUnidadesEnsino = [
  { id: 'ue1', name: 'Sede Administrativa' },
  { id: 'ue2', name: 'Sede Operacional' },
  { id: 'ue3', name: 'Unidade Centro' },
  { id: 'ue4', name: 'Unidade Norte' },
  { id: 'ue5', name: 'Campus Principal' }
];

// Additional Mock Data from various components

// Student Portal Videos Mock Data
export const dummyVideos = [
  {
    id: 'video-dummy-1',
    thumbnail: 'https://img.youtube.com/vi/X_B7o4_wOAY/maxresdefault.jpg',
    title: 'Matemática: Introdução à Álgebra',
    duration: '25:30',
    progress: 45
  },
  {
    id: 'video-dummy-2',
    thumbnail: 'https://img.youtube.com/vi/D7K1yXz5IgI/maxresdefault.jpg',
    title: 'Física: Leis de Newton',
    duration: '18:45',
    progress: 78
  },
  {
    id: 'video-dummy-3',
    thumbnail: 'https://img.youtube.com/vi/NybHckSEQBI/maxresdefault.jpg',
    title: 'Química: Tabela Periódica',
    duration: '22:15',
    progress: 23
  },
  {
    id: 'video-dummy-4',
    thumbnail: 'https://img.youtube.com/vi/kjBOesZCoqc/maxresdefault.jpg',
    title: 'Biologia: Células',
    duration: '30:00',
    progress: 67
  },
  {
    id: 'video-dummy-5',
    thumbnail: 'https://img.youtube.com/vi/fNk_zzaMoSs/maxresdefault.jpg',
    title: 'História: Brasil Colonial',
    duration: '28:20',
    progress: 12
  },
  {
    id: 'video-dummy-6',
    thumbnail: 'https://img.youtube.com/vi/pTnEG_WGd2Q/maxresdefault.jpg',
    title: 'Geografia: Relevo Brasileiro',
    duration: '24:10',
    progress: 89
  },
  {
    id: 'video-dummy-7',
    thumbnail: 'https://img.youtube.com/vi/F3BR6q9_zEs/maxresdefault.jpg',
    title: 'Literatura: Modernismo',
    duration: '26:45',
    progress: 34
  },
  {
    id: 'video-dummy-8',
    thumbnail: 'https://img.youtube.com/vi/mH0oCDa74tE/maxresdefault.jpg',
    title: 'Filosofia: Ética',
    duration: '32:15',
    progress: 56
  },
  {
    id: 'video-dummy-9',
    thumbnail: 'https://img.youtube.com/vi/sD0NjbwqlYw/maxresdefault.jpg',
    title: 'Sociologia: Classes Sociais',
    duration: '27:30',
    progress: 78
  },
  {
    id: 'video-dummy-10',
    thumbnail: 'https://img.youtube.com/vi/PF5yfMfxI88/maxresdefault.jpg',
    title: 'Artes: Renascimento',
    duration: '29:40',
    progress: 91
  }
];

// Roles and Permissions Mock Data
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export const mockPermissions: Permission[] = [
  // User Management
  { id: 'user_create', name: 'Criar Usuários', resource: 'users', action: 'create', description: 'Permite criar novos usuários no sistema' },
  { id: 'user_read', name: 'Visualizar Usuários', resource: 'users', action: 'read', description: 'Permite visualizar informações dos usuários' },
  { id: 'user_update', name: 'Editar Usuários', resource: 'users', action: 'update', description: 'Permite editar informações dos usuários' },
  { id: 'user_delete', name: 'Excluir Usuários', resource: 'users', action: 'delete', description: 'Permite excluir usuários do sistema' },
  
  // Course Management
  { id: 'course_create', name: 'Criar Cursos', resource: 'courses', action: 'create', description: 'Permite criar novos cursos' },
  { id: 'course_read', name: 'Visualizar Cursos', resource: 'courses', action: 'read', description: 'Permite visualizar cursos' },
  { id: 'course_update', name: 'Editar Cursos', resource: 'courses', action: 'update', description: 'Permite editar cursos existentes' },
  { id: 'course_delete', name: 'Excluir Cursos', resource: 'courses', action: 'delete', description: 'Permite excluir cursos' },
  
  // Content Management
  { id: 'content_create', name: 'Criar Conteúdo', resource: 'content', action: 'create', description: 'Permite criar novo conteúdo educacional' },
  { id: 'content_read', name: 'Visualizar Conteúdo', resource: 'content', action: 'read', description: 'Permite visualizar conteúdo educacional' },
  { id: 'content_update', name: 'Editar Conteúdo', resource: 'content', action: 'update', description: 'Permite editar conteúdo existente' },
  { id: 'content_delete', name: 'Excluir Conteúdo', resource: 'content', action: 'delete', description: 'Permite excluir conteúdo' },
  
  // Reports
  { id: 'reports_read', name: 'Visualizar Relatórios', resource: 'reports', action: 'read', description: 'Permite visualizar relatórios do sistema' },
  { id: 'reports_create', name: 'Gerar Relatórios', resource: 'reports', action: 'create', description: 'Permite gerar novos relatórios' },
  
  // System Administration
  { id: 'system_admin', name: 'Administração do Sistema', resource: 'system', action: 'update', description: 'Acesso total às configurações do sistema' },
  { id: 'roles_manage', name: 'Gerenciar Funções', resource: 'roles', action: 'update', description: 'Permite gerenciar funções e permissões' },
  
  // Grades and Assessments
  { id: 'grades_create', name: 'Lançar Notas', resource: 'grades', action: 'create', description: 'Permite lançar notas dos alunos' },
  { id: 'grades_read', name: 'Visualizar Notas', resource: 'grades', action: 'read', description: 'Permite visualizar notas' },
  { id: 'grades_update', name: 'Editar Notas', resource: 'grades', action: 'update', description: 'Permite editar notas existentes' },
  
  // Attendance
  { id: 'attendance_create', name: 'Registrar Presença', resource: 'attendance', action: 'create', description: 'Permite registrar presença dos alunos' },
  { id: 'attendance_read', name: 'Visualizar Presença', resource: 'attendance', action: 'read', description: 'Permite visualizar registros de presença' },
];

export const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    type: 'system',
    permissions: mockPermissions.map(p => p.id),
    userCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    status: 'active'
  },
  {
    id: 'manager',
    name: 'Gestor',
    description: 'Gerenciamento de cursos e usuários',
    type: 'system',
    permissions: [
      'user_read', 'user_update', 'course_create', 'course_read', 'course_update',
      'content_create', 'content_read', 'content_update', 'reports_read', 'reports_create',
      'grades_read', 'attendance_read'
    ],
    userCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'teacher',
    name: 'Professor',
    description: 'Ensino e avaliação de alunos',
    type: 'system',
    permissions: [
      'course_read', 'content_read', 'content_create', 'content_update',
      'grades_create', 'grades_read', 'grades_update',
      'attendance_create', 'attendance_read', 'reports_read'
    ],
    userCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    status: 'active'
  },
  {
    id: 'student',
    name: 'Aluno',
    description: 'Acesso ao conteúdo educacional',
    type: 'system',
    permissions: [
      'course_read', 'content_read', 'grades_read', 'attendance_read'
    ],
    userCount: 1247,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    status: 'active'
  },
  {
    id: 'coordinator',
    name: 'Coordenador',
    description: 'Coordenação pedagógica e administrativa',
    type: 'custom',
    permissions: [
      'user_read', 'course_create', 'course_read', 'course_update',
      'content_read', 'content_update', 'reports_read', 'reports_create',
      'grades_read', 'attendance_read'
    ],
    userCount: 12,
    createdAt: '2024-01-15T16:45:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
    status: 'active'
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description: 'Suporte e orientação aos alunos',
    type: 'custom',
    permissions: [
      'course_read', 'content_read', 'grades_read', 'attendance_read'
    ],
    userCount: 23,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-25T15:45:00Z',
    status: 'active'
  },
  {
    id: 'content_creator',
    name: 'Criador de Conteúdo',
    description: 'Criação e edição de material educacional',
    type: 'custom',
    permissions: [
      'content_create', 'content_read', 'content_update', 'course_read'
    ],
    userCount: 7,
    createdAt: '2024-02-01T10:15:00Z',
    updatedAt: '2024-02-05T14:30:00Z',
    status: 'active'
  },
  {
    id: 'guest',
    name: 'Visitante',
    description: 'Acesso limitado para demonstração',
    type: 'custom',
    permissions: [
      'course_read', 'content_read'
    ],
    userCount: 0,
    createdAt: '2024-02-10T12:00:00Z',
    updatedAt: '2024-02-10T12:00:00Z',
    status: 'inactive'
  }
];

// Resources for permission matrix
export const mockResources = [
  { id: 'users', name: 'Usuários', description: 'Gerenciamento de usuários do sistema' },
  { id: 'courses', name: 'Cursos', description: 'Gerenciamento de cursos e disciplinas' },
  { id: 'content', name: 'Conteúdo', description: 'Material educacional (livros, vídeos, etc.)' },
  { id: 'grades', name: 'Notas', description: 'Sistema de avaliação e notas' },
  { id: 'attendance', name: 'Presença', description: 'Controle de frequência' },
  { id: 'reports', name: 'Relatórios', description: 'Relatórios e analytics' },
  { id: 'system', name: 'Sistema', description: 'Configurações gerais do sistema' },
  { id: 'roles', name: 'Funções', description: 'Gerenciamento de funções e permissões' }
];

// Content Management Mock Data
// Importando as interfaces corretas do projeto
import {
  Collection as ContentCollection,
  Module as ContentModule,
  Video as ContentVideo
} from '@/types/collection';

// Mock Collections Data
export const mockContentCollections: ContentCollection[] = [
  {
    id: '1',
    name: 'Matemática Básica',
    synopsis: 'Coleção de vídeos sobre matemática básica para o ensino fundamental',
    coverImage: '/placeholder-thumbnail.png',
    supportMaterial: 'https://example.com/math-support-material.pdf',
    totalDuration: 12240, // 3H24 em segundos
    subject: 'Matemática',
    modules: [],
    tags: ['matemática', 'fundamental'],
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Física Experimental',
    synopsis: 'Coleção de experimentos práticos de física para o ensino médio',
    coverImage: '/placeholder-thumbnail.png',
    supportMaterial: 'https://example.com/physics-support-material.pdf',
    totalDuration: 15300, // 4H15 em segundos
    subject: 'Física',
    modules: [],
    tags: ['física', 'experimentos', 'médio'],
    createdBy: 'user-2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Química Orgânica',
    synopsis: 'Introdução aos compostos orgânicos e suas reações',
    coverImage: '/placeholder-thumbnail.png',
    supportMaterial: 'https://example.com/chemistry-support-material.pdf',
    totalDuration: 19800, // 5H30 em segundos
    subject: 'Química',
    modules: [],
    tags: ['química', 'orgânica', 'médio'],
    createdBy: 'user-3',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock Videos Data for Content Management
export const mockContentVideos: ContentVideo[] = [
  {
    id: 'video-1',
    name: 'Introdução à Álgebra - Parte 1',
    moduleId: 'module-1',
    videoUrl: 'https://example.com/videos/algebra-intro-1.mp4',
    duration: 600, // 10 minutos
    authors: ['Prof. João Silva'],
    educationCycle: {
      level: 'FUNDAMENTAL',
      cycle: 'ANOS_FINAIS',
      grade: 'SEXTO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-2',
    name: 'Introdução à Álgebra - Parte 2',
    moduleId: 'module-1',
    videoUrl: 'https://example.com/videos/algebra-intro-2.mp4',
    duration: 720, // 12 minutos
    authors: ['Prof. João Silva'],
    educationCycle: {
      level: 'FUNDAMENTAL',
      cycle: 'ANOS_FINAIS',
      grade: 'SEXTO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-3',
    name: 'Leis de Newton - Experimento Prático',
    moduleId: 'module-2',
    videoUrl: 'https://example.com/videos/newton-laws-experiment.mp4',
    duration: 900, // 15 minutos
    authors: ['Prof. Maria Santos', 'Dr. Carlos Lima'],
    educationCycle: {
      level: 'MEDIO',
      cycle: 'PRIMEIRO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-4',
    name: 'Movimento Retilíneo Uniforme',
    moduleId: 'module-2',
    videoUrl: 'https://example.com/videos/uniform-motion.mp4',
    duration: 780, // 13 minutos
    authors: ['Prof. Maria Santos'],
    educationCycle: {
      level: 'MEDIO',
      cycle: 'PRIMEIRO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-5',
    name: 'Alcanos e suas Propriedades',
    moduleId: 'module-3',
    videoUrl: 'https://example.com/videos/alkanes-properties.mp4',
    duration: 840, // 14 minutos
    authors: ['Prof. Ana Química', 'Dr. Pedro Orgânico'],
    educationCycle: {
      level: 'MEDIO',
      cycle: 'TERCEIRO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-6',
    name: 'Reações de Substituição',
    moduleId: 'module-3',
    videoUrl: 'https://example.com/videos/substitution-reactions.mp4',
    duration: 960, // 16 minutos
    authors: ['Prof. Ana Química'],
    educationCycle: {
      level: 'MEDIO',
      cycle: 'TERCEIRO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-7',
    name: 'Geometria Plana - Triângulos',
    moduleId: 'module-1',
    videoUrl: 'https://example.com/videos/plane-geometry-triangles.mp4',
    duration: 660, // 11 minutos
    authors: ['Prof. João Silva', 'Prof. Matemática Avançada'],
    educationCycle: {
      level: 'FUNDAMENTAL',
      cycle: 'ANOS_FINAIS',
      grade: 'SETIMO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video-8',
    name: 'Energia Cinética e Potencial',
    moduleId: 'module-2',
    videoUrl: 'https://example.com/videos/kinetic-potential-energy.mp4',
    duration: 1020, // 17 minutos
    authors: ['Prof. Maria Santos', 'Dr. Física Experimental'],
    educationCycle: {
      level: 'MEDIO',
      cycle: 'SEGUNDO_ANO'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock Collection for Module Manager (single collection example)
export const mockModuleCollection: ContentCollection = {
  id: 'collection-math-basic',
  name: 'Matemática Básica',
  synopsis: 'Coleção de vídeos sobre matemática básica para o ensino fundamental',
  coverImage: '/placeholder-thumbnail.png',
  supportMaterial: 'https://example.com/math-support-material.pdf',
  totalDuration: 3600, // 1 hora em segundos
  subject: 'Matemática',
  modules: [
    {
      id: 'module-1',
      name: 'Introdução à Álgebra',
      description: 'Conceitos básicos de álgebra',
      coverImage: '/placeholder-thumbnail.png',
      videoIds: ['video-1', 'video-2'],
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  tags: ['matemática', 'fundamental'],
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date()
};
