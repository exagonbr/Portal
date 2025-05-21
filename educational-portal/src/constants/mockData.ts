import { Course } from '../types/education';

interface SimplifiedStudent {
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

interface Teacher {
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

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  type: 'homework' | 'project' | 'quiz';
  status: 'active' | 'past' | 'draft';
}

interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'document' | 'video' | 'presentation' | 'exercise';
  url: string;
  description: string;
  uploadDate: string;
  unit: string;
}

interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  meetingUrl: string;
  description?: string;
  materials?: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  participants: string[];
  messages: ChatMessage[];
}

interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  topic: string;
  attendance: Record<string, boolean>;
  notes: string;
}

export const mockTeachers: Teacher[] = [
  {
    id: 't3',
    name: 'Prof. Ricardo Oliveira',
    email: 'ricardo.oliveira@edu.com',
    subjects: ['Biologia', 'Química'],
    courses: ['1', '2'],
    department: 'Ciências Naturais',
    availability: {
      days: ['Segunda', 'Quarta', 'Sexta'],
      hours: '13:00 - 22:00'
    }
  },
  {
    id: 't1',
    name: 'Prof. Carlos Silva',
    email: 'carlos.silva@edu.com',
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
    subjects: ['Física', 'Química'],
    courses: ['2'],
    department: 'Ciências Exatas',
    availability: {
      days: ['Terça', 'Quinta'],
      hours: '10:00 - 19:00'
    }
  }
];

export const mockStudents: SimplifiedStudent[] = [
  {
    id: 's4',
    name: 'Julia Costa',
    email: 'julia.c@edu.com',
    progress: 92,
    grades: {
      assignments: 95,
      tests: 88,
      participation: 98
    },
    enrolledCourses: ['1', '2']
  },
  {
    id: 's1',
    name: 'Sarah Johnson',
    email: 'sarah.j@edu.com',
    progress: 75,
    grades: {
      assignments: 85,
      tests: 78,
      participation: 90
    },
    enrolledCourses: ['1', '2']
  },
  {
    id: 's2',
    name: 'Pedro Santos',
    email: 'pedro.s@edu.com',
    progress: 82,
    grades: {
      assignments: 88,
      tests: 85,
      participation: 95
    },
    enrolledCourses: ['1']
  },
  {
    id: 's3',
    name: 'Maria Oliveira',
    email: 'maria.o@edu.com',
    progress: 68,
    grades: {
      assignments: 75,
      tests: 70,
      participation: 85
    },
    enrolledCourses: ['2']
  }
];

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
    }
  },
  {
    id: '2',
    name: 'Física Básica',
    description: 'Introdução aos conceitos fundamentais de física',
    level: 'BASIC',
    cycle: 'Anos Finais',
    stage: '9º ano',
    institution: {
      id: '1',
      name: 'Escola Municipal São José',
      type: 'UNIVERSITY',
      characteristics: [
        'Ensino fundamental completo',
        'Laboratório de física',
        'Professores especializados'
      ]
    },
    duration: '1 ano letivo',
    schedule: {
      startDate: '2024-02-01',
      endDate: '2024-12-15',
      classDays: ['Terça', 'Quinta'],
      classTime: '10:00 - 11:30'
    }
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    courseId: '1',
    title: 'Lista de Exercícios - Funções Quadráticas',
    description: 'Resolver os exercícios 1-10 sobre funções quadráticas',
    dueDate: '2024-03-10',
    totalPoints: 100,
    type: 'homework',
    status: 'active'
  },
  {
    id: 'a2',
    courseId: '1',
    title: 'Projeto - Aplicações de Trigonometria',
    description: 'Desenvolver um projeto prático aplicando conceitos de trigonometria',
    dueDate: '2024-03-20',
    totalPoints: 200,
    type: 'project',
    status: 'active'
  },
  {
    id: 'a3',
    courseId: '2',
    title: 'Quiz - Leis de Newton',
    description: 'Avaliação sobre as três leis de Newton',
    dueDate: '2024-03-15',
    totalPoints: 50,
    type: 'quiz',
    status: 'active'
  }
];

export const mockMaterials: CourseMaterial[] = [
  {
    id: 'm1',
    courseId: '1',
    title: 'Introdução às Funções Quadráticas',
    type: 'document',
    url: '/materials/math/quadratic-functions.pdf',
    description: 'Material teórico sobre funções quadráticas',
    uploadDate: '2024-02-01',
    unit: 'Unidade 1'
  },
  {
    id: 'm2',
    courseId: '1',
    title: 'Vídeo - Resolução de Equações',
    type: 'video',
    url: '/materials/math/equation-solving.mp4',
    description: 'Videoaula sobre métodos de resolução de equações',
    uploadDate: '2024-02-05',
    unit: 'Unidade 1'
  },
  {
    id: 'm3',
    courseId: '2',
    title: 'Apresentação - Leis de Newton',
    type: 'presentation',
    url: '/materials/physics/newton-laws.pptx',
    description: 'Slides sobre as três leis de Newton',
    uploadDate: '2024-02-03',
    unit: 'Unidade 1'
  }
];

export const mockLiveClasses: LiveClass[] = [
  {
    id: 'l1',
    courseId: '1',
    title: 'Resolução de Exercícios - Cálculo',
    date: '2024-03-05',
    time: '14:00 - 15:30',
    status: 'scheduled',
    meetingUrl: 'https://meet.example.com/calc-class',
    description: 'Sessão de resolução de exercícios sobre funções quadráticas',
    materials: ['m1']
  },
  {
    id: 'l2',
    courseId: '2',
    title: 'Revisão - Leis de Newton',
    date: '2024-03-06',
    time: '10:00 - 11:30',
    status: 'scheduled',
    meetingUrl: 'https://meet.example.com/physics-class',
    description: 'Aula de revisão sobre as leis de Newton',
    materials: ['m3']
  }
];

export const mockClassSessions: ClassSession[] = [
  {
    id: 'cs1',
    courseId: '1',
    date: '2024-02-01',
    topic: 'Introdução às Funções Quadráticas',
    attendance: {
      's1': true,
      's2': true,
      's3': false
    },
    notes: 'Apresentação do conteúdo e exercícios iniciais'
  },
  {
    id: 'cs2',
    courseId: '2',
    date: '2024-02-01',
    topic: 'Introdução às Leis de Newton',
    attendance: {
      's1': true,
      's3': true
    },
    notes: 'Conceitos básicos e exemplos práticos'
  }
];

export const mockChats: Chat[] = [
  {
    id: 'c1',
    participants: ['t1', 's1'],
    messages: [
      {
        id: 'm1',
        sender: 't1',
        content: 'Olá! Como posso ajudar com o exercício?',
        timestamp: '2024-03-01T14:00:00Z'
      },
      {
        id: 'm2',
        sender: 's1',
        content: 'Professor, tenho uma dúvida sobre a questão 3',
        timestamp: '2024-03-01T14:01:00Z'
      }
    ]
  },
  {
    id: 'c2',
    participants: ['t2', 's3'],
    messages: [
      {
        id: 'm3',
        sender: 's3',
        content: 'Professora, posso remarcar a apresentação?',
        timestamp: '2024-03-02T10:00:00Z'
      },
      {
        id: 'm4',
        sender: 't2',
        content: 'Claro, podemos agendar para a próxima semana',
        timestamp: '2024-03-02T10:05:00Z'
      }
    ]
  }
];
