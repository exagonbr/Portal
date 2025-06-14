'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Heart,
  Shield,
  Phone,
  Mail,
  Video,
  ChevronRight,
  Download,
  Star,
  Target,
  Briefcase,
  GraduationCap,
  Trophy,
  Zap,
  Brain,
  Smile,
  AlertTriangle,
  DollarSign,
  CreditCard,
  PieChart,
  LineChart,
  BarChart2,
  Filter,
  Search,
  Settings,
  RefreshCw,
  ExternalLink,
  Camera,
  MapPin,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Printer,
  FileDown,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, Area, AreaChart } from 'recharts';

interface Student {
  id: string;
  name: string;
  class: string;
  age: number;
  photo?: string;
  school: string;
  period: 'morning' | 'afternoon' | 'full-time';
  enrollmentDate: Date;
  emergencyContact: string;
  allergies?: string[];
  medicalConditions?: string[];
  favoriteSubjects: string[];
  extracurricularActivities: string[];
}

interface GuardianStats {
  totalStudents: number;
  averageGrade: number;
  averageAttendance: number;
  pendingTasks: number;
  upcomingMeetings: number;
  unreadMessages: number;
  totalSpent: number;
  achievementsThisMonth: number;
  disciplinaryIncidents: number;
  parentEngagementScore: number;
}

interface SubjectPerformance {
  subject: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  teacherName: string;
  lastAssignment: {
    name: string;
    grade: number;
    date: Date;
  };
  strengths: string[];
  improvements: string[];
}

interface AttendanceData {
  month: string;
  attendance: number;
  absences: number;
  tardiness: number;
}

interface GradeEvolution {
  month: string;
  grade: number;
  classAverage: number;
}

interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: 'academic' | 'behavioral' | 'sports' | 'arts' | 'leadership';
  date: Date;
  points: number;
  badge?: string;
}

interface DisciplinaryRecord {
  id: string;
  studentId: string;
  type: 'warning' | 'suspension' | 'detention' | 'positive';
  title: string;
  description: string;
  date: Date;
  actionTaken: string;
  resolved: boolean;
}

interface ParentEngagement {
  meetingsAttended: number;
  totalMeetings: number;
  messagesExchanged: number;
  volunteerHours: number;
  eventParticipation: number;
  score: number;
}

interface PhotoPost {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  studentIds: string[];
  studentNames: string[];
  imageUrl: string;
  caption: string;
  location?: string;
  activity: string;
  timestamp: Date;
  likes: number;
  comments: PhotoComment[];
  tags: string[];
  isLikedByParent: boolean;
}

interface PhotoComment {
  id: string;
  authorId: string;
  authorName: string;
  authorType: 'parent' | 'teacher' | 'admin';
  content: string;
  timestamp: Date;
  likes: number;
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  attendance: number;
  behavior: 'excellent' | 'good' | 'regular' | 'needs-attention';
  pendingTasks: number;
  completedTasks: number;
  strengths: string[];
  challenges: string[];
  lastUpdate: Date;
}

interface AcademicEvent {
  id: string;
  type: 'exam' | 'assignment' | 'meeting' | 'event' | 'holiday';
  title: string;
  description: string;
  date: Date;
  time?: string;
  studentId?: string;
  studentName?: string;
  location?: string;
  isImportant: boolean;
}

interface TeacherMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  studentId: string;
  studentName: string;
}

interface BehaviorReport {
  id: string;
  studentId: string;
  studentName: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  date: Date;
  reportedBy: string;
}

interface FinancialInfo {
  studentId: string;
  studentName: string;
  monthlyFee: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  additionalCharges?: {
    description: string;
    amount: number;
  }[];
}

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [stats, setStats] = useState<GuardianStats>({
    totalStudents: 0,
    averageGrade: 0,
    averageAttendance: 0,
    pendingTasks: 0,
    upcomingMeetings: 0,
    unreadMessages: 0,
    totalSpent: 0,
    achievementsThisMonth: 0,
    disciplinaryIncidents: 0,
    parentEngagementScore: 0
  });
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [behaviorReports, setBehaviorReports] = useState<BehaviorReport[]>([]);
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'academic' | 'communication' | 'financial' | 'analytics' | 'photos'>('overview');
  
  // Novos estados para dados enriquecidos
  const [subjectPerformances, setSubjectPerformances] = useState<{[studentId: string]: SubjectPerformance[]}>({});
  const [attendanceData, setAttendanceData] = useState<{[studentId: string]: AttendanceData[]}>({});
  const [gradeEvolution, setGradeEvolution] = useState<{[studentId: string]: GradeEvolution[]}>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
  const [parentEngagement, setParentEngagement] = useState<ParentEngagement | null>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'semester' | 'year'>('month');
  
  // Estados para o feed de fotos
  const [photoPosts, setPhotoPosts] = useState<PhotoPost[]>([]);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'my-children'>('all');

  useEffect(() => {
    loadDashboardData();
  }, [selectedStudent]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados dos filhos - mais detalhados
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'João Silva',
          class: '5º Ano A',
          age: 11,
          school: 'Colégio Esperança',
          period: 'morning',
          enrollmentDate: new Date('2023-02-01'),
          emergencyContact: '(11) 99999-9999',
          allergies: ['Amendoim', 'Leite'],
          favoriteSubjects: ['Matemática', 'Ciências', 'Educação Física'],
          extracurricularActivities: ['Futebol', 'Robótica']
        },
        {
          id: '2',
          name: 'Maria Silva',
          class: '3º Ano B',
          age: 9,
          school: 'Colégio Esperança',
          period: 'afternoon',
          enrollmentDate: new Date('2022-02-01'),
          emergencyContact: '(11) 99999-9999',
          medicalConditions: ['Asma leve'],
          favoriteSubjects: ['Português', 'Artes', 'História'],
          extracurricularActivities: ['Ballet', 'Pintura']
        }
      ];
      setStudents(mockStudents);

      // Estatísticas gerais - expandidas
      setStats({
        totalStudents: 2,
        averageGrade: 8.7,
        averageAttendance: 96.2,
        pendingTasks: 3,
        upcomingMeetings: 2,
        unreadMessages: 4,
        totalSpent: 2840.50,
        achievementsThisMonth: 8,
        disciplinaryIncidents: 0,
        parentEngagementScore: 92
      });

      // Desempenho dos alunos
      setPerformances([
        {
          studentId: '1',
          studentName: 'João Silva',
          currentGrade: 8.9,
          previousGrade: 8.5,
          trend: 'up',
          attendance: 97,
          behavior: 'excellent',
          pendingTasks: 2,
          completedTasks: 32,
          strengths: ['Matemática', 'Ciências', 'Lógica'],
          challenges: ['Redação', 'Interpretação de texto'],
          lastUpdate: new Date()
        },
        {
          studentId: '2',
          studentName: 'Maria Silva',
          currentGrade: 8.4,
          previousGrade: 8.1,
          trend: 'up',
          attendance: 95,
          behavior: 'excellent',
          pendingTasks: 1,
          completedTasks: 35,
          strengths: ['Português', 'Artes', 'Criatividade'],
          challenges: ['Matemática', 'Concentração'],
          lastUpdate: new Date()
        }
      ]);

      // Desempenho por matéria
      setSubjectPerformances({
        '1': [
          {
            subject: 'Matemática',
            currentGrade: 9.2,
            previousGrade: 8.8,
            trend: 'up',
            teacherName: 'Prof. Ana Silva',
            lastAssignment: { name: 'Frações e Decimais', grade: 9.5, date: new Date() },
            strengths: ['Cálculo mental', 'Resolução de problemas'],
            improvements: ['Interpretação de enunciados']
          },
          {
            subject: 'Português',
            currentGrade: 8.1,
            previousGrade: 7.9,
            trend: 'up',
            teacherName: 'Prof. Carlos Santos',
            lastAssignment: { name: 'Redação Narrativa', grade: 7.8, date: new Date() },
            strengths: ['Vocabulário', 'Ortografia'],
            improvements: ['Coesão textual', 'Criatividade']
          },
          {
            subject: 'Ciências',
            currentGrade: 9.0,
            previousGrade: 8.7,
            trend: 'up',
            teacherName: 'Prof. Maria Oliveira',
            lastAssignment: { name: 'Sistema Solar', grade: 9.2, date: new Date() },
            strengths: ['Curiosidade científica', 'Experimentação'],
            improvements: ['Registro de observações']
          },
          {
            subject: 'História',
            currentGrade: 8.5,
            previousGrade: 8.3,
            trend: 'up',
            teacherName: 'Prof. João Pereira',
            lastAssignment: { name: 'Brasil Colonial', grade: 8.7, date: new Date() },
            strengths: ['Memorização', 'Análise crítica'],
            improvements: ['Contextualização temporal']
          }
        ],
        '2': [
          {
            subject: 'Português',
            currentGrade: 9.1,
            previousGrade: 8.9,
            trend: 'up',
            teacherName: 'Prof. Lucia Fernandes',
            lastAssignment: { name: 'Poesia Infantil', grade: 9.3, date: new Date() },
            strengths: ['Criatividade', 'Expressão oral'],
            improvements: ['Caligrafia']
          },
          {
            subject: 'Matemática',
            currentGrade: 7.2,
            previousGrade: 7.0,
            trend: 'up',
            teacherName: 'Prof. Roberto Lima',
            lastAssignment: { name: 'Tabuada do 7', grade: 7.5, date: new Date() },
            strengths: ['Esforço', 'Persistência'],
            improvements: ['Cálculo mental', 'Concentração']
          },
          {
            subject: 'Artes',
            currentGrade: 9.5,
            previousGrade: 9.2,
            trend: 'up',
            teacherName: 'Prof. Sandra Costa',
            lastAssignment: { name: 'Pintura Abstrata', grade: 9.8, date: new Date() },
            strengths: ['Criatividade excepcional', 'Técnica'],
            improvements: ['Organização do material']
          },
          {
            subject: 'Ciências',
            currentGrade: 8.3,
            previousGrade: 8.1,
            trend: 'up',
            teacherName: 'Prof. Maria Oliveira',
            lastAssignment: { name: 'Plantas e Animais', grade: 8.5, date: new Date() },
            strengths: ['Observação', 'Curiosidade'],
            improvements: ['Registro científico']
          }
        ]
      });

      // Dados de frequência
      setAttendanceData({
        '1': [
          { month: 'Jan', attendance: 95, absences: 2, tardiness: 1 },
          { month: 'Fev', attendance: 96, absences: 1, tardiness: 2 },
          { month: 'Mar', attendance: 98, absences: 1, tardiness: 0 },
          { month: 'Abr', attendance: 97, absences: 1, tardiness: 1 },
          { month: 'Mai', attendance: 99, absences: 0, tardiness: 0 }
        ],
        '2': [
          { month: 'Jan', attendance: 93, absences: 3, tardiness: 2 },
          { month: 'Fev', attendance: 95, absences: 2, tardiness: 1 },
          { month: 'Mar', attendance: 96, absences: 2, tardiness: 1 },
          { month: 'Abr', attendance: 94, absences: 2, tardiness: 2 },
          { month: 'Mai', attendance: 97, absences: 1, tardiness: 1 }
        ]
      });

      // Evolução das notas
      setGradeEvolution({
        '1': [
          { month: 'Jan', grade: 8.2, classAverage: 7.8 },
          { month: 'Fev', grade: 8.4, classAverage: 7.9 },
          { month: 'Mar', grade: 8.6, classAverage: 8.0 },
          { month: 'Abr', grade: 8.7, classAverage: 8.1 },
          { month: 'Mai', grade: 8.9, classAverage: 8.2 }
        ],
        '2': [
          { month: 'Jan', grade: 7.9, classAverage: 7.5 },
          { month: 'Fev', grade: 8.0, classAverage: 7.6 },
          { month: 'Mar', grade: 8.2, classAverage: 7.7 },
          { month: 'Abr', grade: 8.3, classAverage: 7.8 },
          { month: 'Mai', grade: 8.4, classAverage: 7.9 }
        ]
      });

      // Conquistas e medalhas
      setAchievements([
        {
          id: '1',
          studentId: '1',
          title: 'Destaque em Matemática',
          description: 'Melhor nota da turma na prova de frações',
          category: 'academic',
          date: new Date(Date.now() - 86400000 * 2),
          points: 50,
          badge: '🏆'
        },
        {
          id: '2',
          studentId: '1',
          title: 'Participação Exemplar',
          description: 'Liderou o projeto de robótica da turma',
          category: 'leadership',
          date: new Date(Date.now() - 86400000 * 5),
          points: 30,
          badge: '👑'
        },
        {
          id: '3',
          studentId: '2',
          title: 'Artista do Mês',
          description: 'Obra selecionada para exposição da escola',
          category: 'arts',
          date: new Date(Date.now() - 86400000 * 3),
          points: 40,
          badge: '🎨'
        },
        {
          id: '4',
          studentId: '2',
          title: 'Ajudante Solidária',
          description: 'Ajudou colegas com dificuldades em português',
          category: 'behavioral',
          date: new Date(Date.now() - 86400000 * 1),
          points: 25,
          badge: '❤️'
        }
      ]);

      // Engajamento dos pais
      setParentEngagement({
        meetingsAttended: 8,
        totalMeetings: 10,
        messagesExchanged: 45,
        volunteerHours: 12,
        eventParticipation: 85,
        score: 92
      });

      // Feed de fotos dos eventos
      setPhotoPosts([
        {
          id: '1',
          teacherId: 'teacher1',
          teacherName: 'Prof. Ana Silva',
          teacherAvatar: '👩‍🏫',
          studentIds: ['1', '2'],
          studentNames: ['João Silva', 'Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=500&fit=crop',
          caption: 'Projeto de robótica em andamento! Os alunos estão construindo seus próprios robôs e aprendendo programação básica. 🤖✨',
          location: 'Laboratório de Ciências',
          activity: 'Robótica',
          timestamp: new Date(Date.now() - 86400000 * 1), // 1 dia atrás
          likes: 24,
          comments: [
            {
              id: 'c1',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'Que orgulho! João chegou em casa super animado falando do projeto! 🥰',
              timestamp: new Date(Date.now() - 86400000 * 1 + 3600000),
              likes: 5
            },
            {
              id: 'c2',
              authorId: 'teacher1',
              authorName: 'Prof. Ana Silva',
              authorType: 'teacher',
              content: 'Ele realmente se destacou hoje! Muito criativo na programação! 👏',
              timestamp: new Date(Date.now() - 86400000 * 1 + 7200000),
              likes: 3
            }
          ],
          tags: ['#robótica', '#ciências', '#tecnologia', '#aprendizado'],
          isLikedByParent: true
        },
        {
          id: '2',
          teacherId: 'teacher2',
          teacherName: 'Prof. Sandra Costa',
          teacherAvatar: '👩‍🎨',
          studentIds: ['2'],
          studentNames: ['Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
          caption: 'Exposição de arte da turma! Maria criou uma obra incrível sobre a natureza. Cores vibrantes e muita criatividade! 🎨🌿',
          location: 'Sala de Artes',
          activity: 'Artes Visuais',
          timestamp: new Date(Date.now() - 86400000 * 2),
          likes: 31,
          comments: [
            {
              id: 'c3',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Linda demais! Ela tem muito talento mesmo! ❤️',
              timestamp: new Date(Date.now() - 86400000 * 2 + 1800000),
              likes: 8
            }
          ],
          tags: ['#arte', '#criatividade', '#exposição', '#natureza'],
          isLikedByParent: true
        },
        {
          id: '3',
          teacherId: 'teacher3',
          teacherName: 'Prof. Carlos Santos',
          teacherAvatar: '👨‍🏫',
          studentIds: ['1'],
          studentNames: ['João Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&h=500&fit=crop',
          caption: 'Aula de campo no parque! Estudando a biodiversidade local e coletando amostras para nosso projeto de ciências. 🌱🔬',
          location: 'Parque Municipal',
          activity: 'Ciências Naturais',
          timestamp: new Date(Date.now() - 86400000 * 3),
          likes: 18,
          comments: [
            {
              id: 'c4',
              authorId: 'parent3',
              authorName: 'Pai da Ana',
              authorType: 'parent',
              content: 'Que experiência rica! Aprender na prática é muito melhor! 🌿',
              timestamp: new Date(Date.now() - 86400000 * 3 + 3600000),
              likes: 4
            }
          ],
          tags: ['#ciências', '#natureza', '#auladecampo', '#biodiversidade'],
          isLikedByParent: false
        },
        {
          id: '4',
          teacherId: 'teacher4',
          teacherName: 'Prof. Roberto Lima',
          teacherAvatar: '👨‍🏫',
          studentIds: ['1', '2'],
          studentNames: ['João Silva', 'Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=500&fit=crop',
          caption: 'Competição de matemática! Nossos alunos se saíram muito bem resolvendo problemas em equipe. Parabéns a todos! 🏆📊',
          location: 'Auditório',
          activity: 'Matemática',
          timestamp: new Date(Date.now() - 86400000 * 4),
          likes: 42,
          comments: [
            {
              id: 'c5',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'João adorou a competição! Já está pedindo mais desafios! 🤓',
              timestamp: new Date(Date.now() - 86400000 * 4 + 1800000),
              likes: 6
            },
            {
              id: 'c6',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Maria disse que trabalhar em equipe foi o melhor! 👥',
              timestamp: new Date(Date.now() - 86400000 * 4 + 3600000),
              likes: 4
            }
          ],
          tags: ['#matemática', '#competição', '#trabalhoequipe', '#desafio'],
          isLikedByParent: true
        },
        {
          id: '5',
          teacherId: 'teacher5',
          teacherName: 'Prof. Lucia Fernandes',
          teacherAvatar: '👩‍🏫',
          studentIds: ['2'],
          studentNames: ['Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
          caption: 'Apresentação de poesia! Maria recitou um poema lindo sobre amizade. A turma toda ficou emocionada! 📚💕',
          location: 'Biblioteca',
          activity: 'Português',
          timestamp: new Date(Date.now() - 86400000 * 5),
          likes: 28,
          comments: [
            {
              id: 'c7',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Ela treinou tanto em casa! Que orgulho! 🥺❤️',
              timestamp: new Date(Date.now() - 86400000 * 5 + 900000),
              likes: 12
            }
          ],
          tags: ['#poesia', '#português', '#apresentação', '#amizade'],
          isLikedByParent: true
        },
        {
          id: '6',
          teacherId: 'teacher6',
          teacherName: 'Prof. Maria Oliveira',
          teacherAvatar: '👩‍🔬',
          studentIds: ['1'],
          studentNames: ['João Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&h=500&fit=crop',
          caption: 'Experimento de vulcão! Os alunos aprenderam sobre reações químicas de forma super divertida! 🌋⚗️',
          location: 'Laboratório',
          activity: 'Química',
          timestamp: new Date(Date.now() - 86400000 * 6),
          likes: 35,
          comments: [
            {
              id: 'c8',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'João não parava de falar sobre o vulcão! Quer fazer em casa agora! 😄',
              timestamp: new Date(Date.now() - 86400000 * 6 + 2700000),
              likes: 7
            }
          ],
          tags: ['#química', '#experimento', '#vulcão', '#ciência'],
          isLikedByParent: true
        }
      ]);

      // Eventos acadêmicos
      setEvents([
        {
          id: '1',
          type: 'meeting',
          title: 'Reunião de Pais - 5º Ano',
          description: 'Discussão sobre o progresso do bimestre',
          date: new Date(Date.now() + 86400000 * 3),
          time: '19:00',
          studentId: '1',
          studentName: 'João Silva',
          location: 'Sala 201',
          isImportant: true
        },
        {
          id: '2',
          type: 'exam',
          title: 'Prova de Matemática',
          description: 'Avaliação mensal',
          date: new Date(Date.now() + 86400000 * 5),
          time: '08:00',
          studentId: '1',
          studentName: 'João Silva',
          isImportant: true
        },
        {
          id: '3',
          type: 'event',
          title: 'Feira de Ciências',
          description: 'Apresentação dos projetos',
          date: new Date(Date.now() + 86400000 * 10),
          time: '14:00',
          location: 'Quadra Esportiva',
          isImportant: false
        }
      ]);

      // Mensagens dos professores
      setMessages([
        {
          id: '1',
          from: 'Prof. Ana Silva',
          subject: 'Desempenho em Matemática',
          preview: 'Gostaria de conversar sobre o progresso do João...',
          date: new Date(),
          isRead: false,
          priority: 'high',
          studentId: '1',
          studentName: 'João Silva'
        },
        {
          id: '2',
          from: 'Prof. Carlos Santos',
          subject: 'Participação exemplar',
          preview: 'Maria tem se destacado nas aulas de Português...',
          date: new Date(Date.now() - 86400000),
          isRead: false,
          priority: 'medium',
          studentId: '2',
          studentName: 'Maria Silva'
        },
        {
          id: '3',
          from: 'Coordenação',
          subject: 'Calendário de Provas',
          preview: 'Segue o calendário atualizado das avaliações...',
          date: new Date(Date.now() - 86400000 * 2),
          isRead: true,
          priority: 'low',
          studentId: '1',
          studentName: 'João Silva'
        }
      ]);

      // Relatórios comportamentais
      setBehaviorReports([
        {
          id: '1',
          studentId: '2',
          studentName: 'Maria Silva',
          type: 'positive',
          title: 'Liderança em trabalho em grupo',
          description: 'Maria demonstrou excelente liderança no projeto de ciências',
          date: new Date(Date.now() - 86400000),
          reportedBy: 'Prof. Ana Silva'
        },
        {
          id: '2',
          studentId: '1',
          studentName: 'João Silva',
          type: 'neutral',
          title: 'Atenção nas aulas',
          description: 'João tem demonstrado distração em algumas aulas',
          date: new Date(Date.now() - 86400000 * 3),
          reportedBy: 'Prof. Carlos Santos'
        }
      ]);

      // Informações financeiras
      setFinancialInfo([
        {
          studentId: '1',
          studentName: 'João Silva',
          monthlyFee: 850.00,
          status: 'paid',
          dueDate: new Date(Date.now() + 86400000 * 5)
        },
        {
          studentId: '2',
          studentName: 'Maria Silva',
          monthlyFee: 850.00,
          status: 'pending',
          dueDate: new Date(Date.now() + 86400000 * 5),
          additionalCharges: [
            {
              description: 'Material didático',
              amount: 120.00
            }
          ]
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBehaviorColor = (behavior: StudentPerformance['behavior']) => {
    switch (behavior) {
      case 'excellent': return 'text-accent-green bg-green-100';
      case 'good': return 'text-primary bg-primary/10';
      case 'regular': return 'text-accent-yellow bg-yellow-100';
      case 'needs-attention': return 'text-red-600 bg-red-100';
    }
  };

  const getBehaviorLabel = (behavior: StudentPerformance['behavior']) => {
    switch (behavior) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'regular': return 'Regular';
      case 'needs-attention': return 'Requer Atenção';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const handleLikePost = (postId: string) => {
    setPhotoPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLikedByParent: !post.isLikedByParent,
          likes: post.isLikedByParent ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const getFinancialStatusColor = (status: FinancialInfo['status']) => {
    switch (status) {
      case 'paid': return 'text-accent-green bg-green-100';
      case 'pending': return 'text-accent-yellow bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  const filteredStudents = selectedStudent === 'all' ? students : students.filter(s => s.id === selectedStudent);
  const currentStudentPerformances = selectedStudent === 'all' ? 
    Object.values(subjectPerformances).flat() : 
    subjectPerformances[selectedStudent] || [];

  return (
    <ProtectedRoute requiredRole={[UserRole.GUARDIAN, UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="🏠 Painel do Responsável"
        subtitle="Acompanhe o desenvolvimento dos seus filhos com dados em tempo real"
      >
        <div className="space-y-8">
          {/* Header com filtros e ações */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os filhos</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="week">Esta semana</option>
                  <option value="month">Este mês</option>
                  <option value="semester">Este semestre</option>
                  <option value="year">Este ano</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Relatório
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Contatar Escola
              </button>
            </div>
          </div>

          {/* Cards de Estatísticas Principais - Mais Atrativo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={TrendingUp}
              title="Média Geral"
              value={stats.averageGrade.toFixed(1)}
              subtitle="↗️ +0.5 este mês"
              color="bg-gradient-to-br from-green-400 to-green-600"
              textColor="text-white"
              trend="up"
            />
            <StatCard
              icon={Activity}
              title="Frequência"
              value={`${stats.averageAttendance.toFixed(1)}%`}
              subtitle="🎯 Meta: 95%"
              color="bg-gradient-to-br from-blue-400 to-blue-600"
              textColor="text-white"
              trend="up"
            />
            <StatCard
              icon={Trophy}
              title="Conquistas"
              value={stats.achievementsThisMonth}
              subtitle="🏆 Este mês"
              color="bg-gradient-to-br from-yellow-400 to-orange-500"
              textColor="text-white"
              trend="up"
            />
            <StatCard
              icon={Heart}
              title="Engajamento"
              value={`${stats.parentEngagementScore}%`}
              subtitle="👨‍👩‍👧‍👦 Seu score"
              color="bg-gradient-to-br from-pink-400 to-red-500"
              textColor="text-white"
              trend="stable"
            />
          </div>

          {/* Navegação por abas */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
                  { key: 'academic', label: 'Desempenho', icon: GraduationCap },
                  { key: 'analytics', label: 'Análises', icon: LineChart },
                  { key: 'photos', label: 'Momentos', icon: Camera },
                  { key: 'communication', label: 'Comunicação', icon: MessageSquare },
                  { key: 'financial', label: 'Financeiro', icon: DollarSign }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedView(tab.key as any)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      selectedView === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6">
              {selectedView === 'overview' && (
                <div className="space-y-8">
                  {/* Resumo dos Filhos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredStudents.map(student => (
                      <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                              <p className="text-gray-600">{student.class} • {student.age} anos</p>
                              <p className="text-sm text-gray-500">{student.school}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600 mb-1">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-semibold">
                                {performances.find(p => p.studentId === student.id)?.currentGrade.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Média atual</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {performances.find(p => p.studentId === student.id)?.attendance || 0}%
                            </div>
                            <div className="text-xs text-gray-500">Frequência</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {performances.find(p => p.studentId === student.id)?.completedTasks || 0}
                            </div>
                            <div className="text-xs text-gray-500">Tarefas OK</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {achievements.filter(a => a.studentId === student.id).length}
                            </div>
                            <div className="text-xs text-gray-500">Conquistas</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {student.favoriteSubjects.slice(0, 3).map(subject => (
                            <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              performances.find(p => p.studentId === student.id)?.behavior === 'excellent' ? 'bg-green-500' :
                              performances.find(p => p.studentId === student.id)?.behavior === 'good' ? 'bg-blue-500' :
                              performances.find(p => p.studentId === student.id)?.behavior === 'regular' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                              {getBehaviorLabel(performances.find(p => p.studentId === student.id)?.behavior || 'regular')}
                            </span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Ver detalhes →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conquistas Recentes */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      <h2 className="text-xl font-bold text-gray-800">🏆 Conquistas Recentes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {achievements.slice(0, 4).map(achievement => (
                        <div key={achievement.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className="text-3xl mb-2">{achievement.badge}</div>
                            <h3 className="font-semibold text-gray-800 mb-1">{achievement.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {students.find(s => s.id === achievement.studentId)?.name}
                              </span>
                              <span className="text-xs font-medium text-yellow-600">
                                +{achievement.points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agenda da Semana */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">📅 Agenda da Semana</h2>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver calendário completo
                      </button>
                    </div>
                    <div className="space-y-4">
                      {events.slice(0, 3).map(event => (
                        <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            event.type === 'exam' ? 'bg-red-100 text-red-600' :
                            event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                            event.type === 'event' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {event.type === 'exam' ? <FileText className="w-5 h-5" /> :
                             event.type === 'meeting' ? <Users className="w-5 h-5" /> :
                             event.type === 'event' ? <Star className="w-5 h-5" /> :
                             <Calendar className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {event.date.toLocaleDateString('pt-BR')} {event.time && `• ${event.time}`}
                              </span>
                              {event.studentName && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {event.studentName}
                                </span>
                              )}
                            </div>
                          </div>
                          {event.isImportant && (
                            <div className="text-red-500">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                             )}

              {selectedView === 'analytics' && (
                <div className="space-y-8">
                  {/* Gráficos de Desempenho */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Evolução das Notas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <LineChart className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-800">📈 Evolução das Notas</h3>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={selectedStudent === 'all' ? gradeEvolution['1'] : gradeEvolution[selectedStudent] || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="grade" stroke="#3B82F6" strokeWidth={3} name="Nota do Aluno" />
                            <Line type="monotone" dataKey="classAverage" stroke="#94A3B8" strokeWidth={2} name="Média da Turma" />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Frequência Mensal */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <BarChart2 className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-800">📊 Frequência Mensal</h3>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={selectedStudent === 'all' ? attendanceData['1'] : attendanceData[selectedStudent] || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendance" fill="#10B981" name="Presença %" />
                            <Bar dataKey="absences" fill="#EF4444" name="Faltas" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Desempenho por Matéria */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <PieChart className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-800">🎯 Desempenho por Matéria</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={currentStudentPerformances.map(perf => ({
                                name: perf.subject,
                                value: perf.currentGrade,
                                fill: COLORS[currentStudentPerformances.indexOf(perf) % COLORS.length]
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, value}) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {currentStudentPerformances.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        {currentStudentPerformances.slice(0, 4).map((perf, index) => (
                          <div key={perf.subject} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="font-medium text-gray-700">{perf.subject}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">{perf.currentGrade.toFixed(1)}</div>
                              <div className={`text-xs ${
                                perf.trend === 'up' ? 'text-green-600' : 
                                perf.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {perf.trend === 'up' ? '↗️' : perf.trend === 'down' ? '↘️' : '→'} 
                                {perf.previousGrade.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Radar de Habilidades */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Target className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-800">🎯 Análise de Competências</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {filteredStudents.map(student => {
                        const studentPerf = performances.find(p => p.studentId === student.id);
                        return (
                          <div key={student.id} className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-700">{student.name}</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Desempenho Acadêmico</span>
                                  <span>{studentPerf?.currentGrade.toFixed(1)}/10</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(studentPerf?.currentGrade || 0) * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Frequência</span>
                                  <span>{studentPerf?.attendance}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${studentPerf?.attendance || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Comportamento</span>
                                  <span>{getBehaviorLabel(studentPerf?.behavior || 'regular')}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      studentPerf?.behavior === 'excellent' ? 'bg-green-600' :
                                      studentPerf?.behavior === 'good' ? 'bg-blue-600' :
                                      studentPerf?.behavior === 'regular' ? 'bg-yellow-600' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${
                                      studentPerf?.behavior === 'excellent' ? 100 :
                                      studentPerf?.behavior === 'good' ? 80 :
                                      studentPerf?.behavior === 'regular' ? 60 : 40
                                    }%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Tarefas Concluídas</span>
                                  <span>{studentPerf?.completedTasks}/{(studentPerf?.completedTasks || 0) + (studentPerf?.pendingTasks || 0)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${((studentPerf?.completedTasks || 0) / ((studentPerf?.completedTasks || 0) + (studentPerf?.pendingTasks || 1))) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedView === 'photos' && (
                <div className="space-y-6">
                  {/* Header do Feed */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-pink-600" />
                      <h2 className="text-2xl font-bold text-gray-800">📸 Momentos Especiais</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={photoFilter} 
                        onChange={(e) => setPhotoFilter(e.target.value as any)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="all">Todas as fotos</option>
                        <option value="my-children">Apenas meus filhos</option>
                      </select>
                      <button className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrar
                      </button>
                    </div>
                  </div>

                  {/* Feed de Fotos estilo Instagram */}
                  <div className="space-y-6">
                    {photoPosts
                      .filter(post => photoFilter === 'all' || post.studentIds.some(id => students.some(s => s.id === id)))
                      .map(post => (
                      <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        {/* Header do Post */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
                              {post.teacherAvatar || post.teacherName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{post.teacherName}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>{post.location}</span>
                                <span>•</span>
                                <span>{post.activity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimeAgo(post.timestamp)}
                          </div>
                        </div>

                        {/* Imagem do Post */}
                        <div className="relative">
                          <img 
                            src={post.imageUrl} 
                            alt={post.caption}
                            className="w-full h-80 object-cover"
                          />
                          {/* Tags dos Estudantes */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {post.studentNames.map(name => (
                              <span key={name} className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                👤 {name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Ações do Post */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <button 
                                className={`flex items-center gap-2 transition-colors ${
                                  post.isLikedByParent ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                                onClick={() => handleLikePost(post.id)}
                              >
                                <Heart className={`w-5 h-5 ${post.isLikedByParent ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.comments.length}</span>
                              </button>
                              <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Compartilhar</span>
                              </button>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700 transition-colors">
                              <Bookmark className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Caption */}
                          <div className="mb-3">
                            <p className="text-gray-800 leading-relaxed">{post.caption}</p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map(tag => (
                              <span key={tag} className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Comentários */}
                          {post.comments.length > 0 && (
                            <div className="space-y-3 border-t border-gray-100 pt-3">
                              <div className="text-sm font-medium text-gray-600">
                                {post.comments.length} comentário{post.comments.length !== 1 ? 's' : ''}
                              </div>
                              {post.comments.slice(0, 2).map(comment => (
                                <div key={comment.id} className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                    comment.authorType === 'parent' ? 'bg-blue-100 text-blue-700' :
                                    comment.authorType === 'teacher' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {comment.authorType === 'parent' ? '👨‍👩‍👧‍👦' :
                                     comment.authorType === 'teacher' ? '👩‍🏫' : '👤'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-800 text-sm">{comment.authorName}</span>
                                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <button className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                                        ❤️ {comment.likes}
                                      </button>
                                      <button className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                        Responder
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {post.comments.length > 2 && (
                                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                  Ver todos os {post.comments.length} comentários
                                </button>
                              )}
                            </div>
                          )}

                          {/* Adicionar Comentário */}
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              👨‍👩‍👧‍👦
                            </div>
                            <input 
                              type="text" 
                              placeholder="Adicione um comentário..."
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                            <button className="text-pink-600 hover:text-pink-700 transition-colors">
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão para carregar mais */}
                  <div className="text-center">
                    <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-lg">
                      📸 Carregar mais momentos
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">⚡ Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Agendar Reunião</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Falar com Professor</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">Ver Boletim</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-700">Financeiro</span>
              </button>
            </div>
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  );
}

// Componente de Card de Estatística - Mais Atrativo
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  textColor: string;
  trend: 'up' | 'down' | 'stable';
}

function StatCard({ icon: Icon, title, value, subtitle, color, textColor, trend }: StatCardProps) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div className={`text-right ${textColor}`}>
          {trend === 'up' && <TrendingUp className="w-5 h-5" />}
          {trend === 'down' && <TrendingUp className="w-5 h-5 rotate-180" />}
          {trend === 'stable' && <Activity className="w-5 h-5" />}
        </div>
      </div>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>
        {value}
      </div>
      <div className={`text-sm ${textColor} opacity-90 mb-1`}>{title}</div>
      <div className={`text-xs ${textColor} opacity-75`}>{subtitle}</div>
    </div>
  );
}