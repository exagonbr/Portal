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
}

interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  meetingUrl: string;
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

export const mockStudents: SimplifiedStudent[] = [
  {
    id: 's1',
    name: 'Sarah Johnson',
    email: 'student@edu.com',
    progress: 75,
    grades: {
      assignments: 85,
      tests: 78,
      participation: 90
    }
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
    meetingUrl: 'https://meet.example.com/calc-class'
  },
  {
    id: 'l2',
    courseId: '2',
    title: 'Revisão - Leis de Newton',
    date: '2024-03-06',
    time: '10:00 - 11:30',
    status: 'scheduled',
    meetingUrl: 'https://meet.example.com/physics-class'
  }
];

export const mockChats: Chat[] = [
  {
    id: 'c1',
    participants: ['p1', 's1'],
    messages: [
      {
        id: 'm1',
        sender: 'p1',
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
  }
];
