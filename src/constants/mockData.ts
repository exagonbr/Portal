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

// Generate 100 mock books
export const mockBooks: Book[] = Array.from({ length: 100 }, (_, i) => ({
  id: `book-${i + 1}`,
  thumbnail: `https://d26a2wm7tuz2gu.cloudfront.net/upload/${Math.random().toString(36).substring(7)}.jpg`,
  title: [
    'A Arte da Guerra',
    'Dom Quixote',
    'O Pequeno Príncipe',
    'Cem Anos de Solidão',
    'O Senhor dos Anéis',
    'Harry Potter',
    'O Alquimista',
    'A Divina Comédia',
    'Crime e Castigo',
    'Orgulho e Preconceito'
  ][Math.floor(Math.random() * 10)] + ` - Volume ${Math.floor(Math.random() * 5) + 1}`,
  author: [
    'Sun Tzu',
    'Miguel de Cervantes',
    'Antoine de Saint-Exupéry',
    'Gabriel García Márquez',
    'J.R.R. Tolkien',
    'J.K. Rowling',
    'Paulo Coelho',
    'Dante Alighieri',
    'Fiódor Dostoiévski',
    'Jane Austen'
  ][Math.floor(Math.random() * 10)],
  publisher: [
    'Companhia das Letras',
    'Editora Intrínseca',
    'Editora Record',
    'Editora Rocco',
    'Editora Aleph',
    'Darkside Books',
    'Suma',
    'Harper Collins',
    'Penguin',
    'Globo Livros'
  ][Math.floor(Math.random() * 10)],
  synopsis: [
    'Uma jornada épica através de mundos fantásticos...',
    'Uma história de amor que transcende o tempo...',
    'Um mistério intrigante que precisa ser desvendado...',
    'Uma aventura emocionante cheia de descobertas...',
    'Uma narrativa profunda sobre a condição humana...',
    'Um relato histórico fascinante...',
    'Uma obra-prima da literatura contemporânea...',
    'Uma história inspiradora de superação...',
    'Um clássico atemporal da literatura mundial...',
    'Uma reflexão filosófica sobre a existência...'
  ][Math.floor(Math.random() * 10)],
  duration: `${Math.floor(Math.random() * 10) + 1}h ${Math.floor(Math.random() * 59)}min`,
  progress: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : undefined
}));

// Generate 100 mock videos
export const mockVideos: Video[] = Array.from({ length: 100 }, (_, i) => ({
  id: `video-${i + 1}`,
  thumbnail: `https://d26a2wm7tuz2gu.cloudfront.net/upload/${Math.random().toString(36).substring(7)}.jpg`,
  title: [
    'Matemática Aplicada',
    'Física Quântica',
    'Biologia Celular',
    'História Mundial',
    'Geografia Física',
    'Química Orgânica',
    'Literatura Brasileira',
    'Filosofia Antiga',
    'Artes Visuais',
    'Educação Física'
  ][Math.floor(Math.random() * 10)] + ` - Aula ${Math.floor(Math.random() * 20) + 1}`,
  duration: `${Math.floor(Math.random() * 59) + 1}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
  progress: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : undefined
}));
