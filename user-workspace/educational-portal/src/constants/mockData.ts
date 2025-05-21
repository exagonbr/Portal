export interface Course {
  id: string;
  name: string;
  description: string;
  professor: string;
  schedule: {
    days: string[];
    time: string;
  };
  materials: Material[];
  students: Student[];
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'assignment';
  url: string;
  dueDate?: string;
}

export interface Student {
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

export interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  courses: string[]; // Course IDs
}

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Matemática Avançada',
    description: 'Curso de matemática avançada para ensino médio',
    professor: 'John Smith',
    schedule: {
      days: ['Segunda', 'Quarta'],
      time: '14:00 - 15:30'
    },
    materials: [
      {
        id: 'm1',
        title: 'Introdução a Cálculo',
        type: 'pdf',
        url: '/materials/calc-intro.pdf'
      },
      {
        id: 'm2',
        title: 'Exercícios Semana 1',
        type: 'assignment',
        url: '/assignments/week1',
        dueDate: '2024-03-10'
      }
    ],
    students: [
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
    ]
  },
  {
    id: '2',
    name: 'Física Básica',
    description: 'Introdução aos conceitos fundamentais de física',
    professor: 'John Smith',
    schedule: {
      days: ['Terça', 'Quinta'],
      time: '10:00 - 11:30'
    },
    materials: [
      {
        id: 'm3',
        title: 'Leis de Newton',
        type: 'pdf',
        url: '/materials/newton-laws.pdf'
      }
    ],
    students: [
      {
        id: 's1',
        name: 'Sarah Johnson',
        email: 'student@edu.com',
        progress: 60,
        grades: {
          assignments: 75,
          tests: 82,
          participation: 85
        }
      }
    ]
  }
];

export const mockProfessors: Professor[] = [
  {
    id: 'p1',
    name: 'John Smith',
    email: 'teacher@edu.com',
    department: 'Ciências Exatas',
    courses: ['1', '2']
  }
];

export const mockLiveClasses = [
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

export const mockChats = [
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
