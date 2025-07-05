'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Download,
  Upload,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  maxGrade: number;
  submissionDate?: string;
  attachments: string[];
  instructions: string;
  weight: number;
  type: 'homework' | 'project' | 'exam' | 'essay';
  teacherName: string;
  feedback?: string;
}

export default function ViewAllAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'status' | 'subject'>('dueDate');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Exercícios de Frações',
          subject: 'Matemática',
          description: 'Resolver exercícios do capítulo 5 sobre frações e operações básicas',
          dueDate: '2025-02-05',
          status: 'pending',
          maxGrade: 10,
          attachments: ['exercicios_fracoes.pdf'],
          instructions: 'Complete todos os exercícios e mostre os cálculos',
          weight: 15,
          type: 'homework',
          teacherName: 'Prof. Maria Santos'
        },
        {
          id: '2',
          title: 'Redação sobre Meio Ambiente',
          subject: 'Português',
          description: 'Escrever uma redação dissertativa sobre preservação ambiental',
          dueDate: '2025-02-03',
          status: 'submitted',
          maxGrade: 10,
          submissionDate: '2025-02-02',
          attachments: [],
          instructions: 'Mínimo de 25 linhas, máximo de 30 linhas',
          weight: 25,
          type: 'essay',
          teacherName: 'Prof. Ana Lima'
        },
        {
          id: '3',
          title: 'Pesquisa sobre Sistema Solar',
          subject: 'Ciências',
          description: 'Pesquisar e apresentar informações sobre os planetas do sistema solar',
          dueDate: '2025-02-01',
          status: 'graded',
          grade: 9.0,
          maxGrade: 10,
          submissionDate: '2025-01-31',
          attachments: ['sistema_solar.pptx'],
          instructions: 'Apresentação de 10 slides com imagens e dados',
          weight: 30,
          type: 'project',
          teacherName: 'Prof. Carlos Silva',
          feedback: 'Excelente trabalho! Muito bem organizado e informativo.'
        },
        {
          id: '4',
          title: 'Prova de História - Período Colonial',
          subject: 'História',
          description: 'Avaliação sobre o período colonial brasileiro',
          dueDate: '2025-01-25',
          status: 'overdue',
          maxGrade: 10,
          attachments: [],
          instructions: 'Prova presencial - duração de 2 horas',
          weight: 40,
          type: 'exam',
          teacherName: 'Prof. Roberto Oliveira'
        },
        {
          id: '5',
          title: 'Relatório de Experimento - Densidade',
          subject: 'Ciências',
          description: 'Relatório sobre o experimento de medição de densidade',
          dueDate: '2025-02-10',
          status: 'pending',
          maxGrade: 10,
          attachments: ['roteiro_experimento.pdf'],
          instructions: 'Incluir metodologia, resultados e conclusões',
          weight: 20,
          type: 'project',
          teacherName: 'Prof. Carlos Silva'
        }
      ];

      setAssignments(mockAssignments);
    } catch (error) {
      console.log('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'submitted':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'graded':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'submitted':
        return 'Enviada';
      case 'graded':
        return 'Corrigida';
      case 'overdue':
        return 'Atrasada';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: Assignment['type']) => {
    switch (type) {
      case 'homework':
        return <BookOpen className="w-4 h-4" />;
      case 'project':
        return <FileText className="w-4 h-4" />;
      case 'exam':
        return <AlertCircle className="w-4 h-4" />;
      case 'essay':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: Assignment['type']) => {
    switch (type) {
      case 'homework':
        return 'Exercício';
      case 'project':
        return 'Projeto';
      case 'exam':
        return 'Prova';
      case 'essay':
        return 'Redação';
      default:
        return 'Tarefa';
    }
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesSubject = subjectFilter === 'all' || assignment.subject === subjectFilter;
      
      return matchesSearch && matchesStatus && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

  const subjects = Array.from(new Set(assignments.map(a => a.subject)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-700 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Todas as Minhas Tarefas
        </h1>
        <p className="text-gray-600">
          Visualize e gerencie todas as suas tarefas e atividades acadêmicas
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="submitted">Enviadas</option>
            <option value="graded">Corrigidas</option>
            <option value="overdue">Atrasadas</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todas as Matérias</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'status' | 'subject')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="dueDate">Ordenar por Data</option>
            <option value="status">Ordenar por Status</option>
            <option value="subject">Ordenar por Matéria</option>
          </select>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
                ? 'Tente ajustar os filtros para encontrar suas tarefas.'
                : 'Você não possui tarefas no momento.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getTypeIcon(assignment.type)}
                      <span className="text-sm font-medium">{getTypeText(assignment.type)}</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-medium text-primary">{assignment.subject}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Peso: {assignment.weight}%</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">{assignment.title}</h3>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Entrega: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Prof. {assignment.teacherName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                    {getStatusText(assignment.status)}
                  </span>
                  
                  {assignment.grade !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {assignment.grade.toFixed(1)}/{assignment.maxGrade}
                      </div>
                      <div className="text-xs text-gray-500">Nota</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Anexos */}
              {assignment.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Anexos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {assignment.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        {attachment}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {assignment.feedback && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Feedback do Professor:</h4>
                  <p className="text-sm text-green-700">{assignment.feedback}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </button>
                  
                  {assignment.status === 'pending' && (
                    <button className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      Enviar Tarefa
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {assignment.submissionDate && (
                    <span>Enviado em: {new Date(assignment.submissionDate).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão de Nova Tarefa */}
      <div className="fixed bottom-6 right-6">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors">
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>
    </div>
  );
} 