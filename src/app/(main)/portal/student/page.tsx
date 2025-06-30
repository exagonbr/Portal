'use client';

import React, { useState } from 'react'
import { 
  Users, BookOpen, Video, Calendar, MessageSquare, Award, 
  TrendingUp, Clock, Bell, FileText, Download, Search,
  Filter, ChevronRight, Star, Activity, Target, BarChart3
} from 'lucide-react'

interface StudentResource {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment'
  subject: string
  grade: string
  views: number
  completions: number
  rating: number
  createdAt: string
  updatedAt: string
}

interface StudentActivity {
  id: string
  studentName: string
  action: string
  resource: string
  timestamp: string
  duration?: number
  score?: number
}

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  author: string
  date: string
  targetGrades: string[]
  views: number
}

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'activities' | 'announcements'>('overview')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const resources: StudentResource[] = [
    {
      id: '1',
      title: 'Introdução à Álgebra - Videoaula',
      type: 'video',
      subject: 'Matemática',
      grade: '8º ano',
      views: 1234,
      completions: 890,
      rating: 4.5,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'Exercícios de Gramática',
      type: 'assignment',
      subject: 'Português',
      grade: '7º ano',
      views: 856,
      completions: 623,
      rating: 4.2,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-19'
    },
    {
      id: '3',
      title: 'Quiz - Revolução Industrial',
      type: 'quiz',
      subject: 'História',
      grade: '9º ano',
      views: 567,
      completions: 445,
      rating: 4.7,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    }
  ]

  const recentActivities: StudentActivity[] = [
    {
      id: '1',
      studentName: 'João Silva',
      action: 'completou',
      resource: 'Quiz - Revolução Industrial',
      timestamp: '2024-01-20T14:30:00',
      score: 85
    },
    {
      id: '2',
      studentName: 'Maria Santos',
      action: 'assistiu',
      resource: 'Introdução à Álgebra - Videoaula',
      timestamp: '2024-01-20T13:45:00',
      duration: 25
    },
    {
      id: '3',
      studentName: 'Pedro Costa',
      action: 'enviou',
      resource: 'Exercícios de Gramática',
      timestamp: '2024-01-20T12:20:00'
    }
  ]

  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Nova Biblioteca Digital Disponível',
      content: 'Informamos que a nova biblioteca digital está disponível para todos os alunos...',
      priority: 'high',
      author: 'Coordenação Pedagógica',
      date: '2024-01-20',
      targetGrades: ['7º ano', '8º ano', '9º ano'],
      views: 1523
    },
    {
      id: '2',
      title: 'Semana de Avaliações - Cronograma',
      content: 'Confira o cronograma completo das avaliações do primeiro bimestre...',
      priority: 'medium',
      author: 'Secretaria Acadêmica',
      date: '2024-01-19',
      targetGrades: ['todos'],
      views: 2341
    }
  ]

  const grades = ['6º ano', '7º ano', '8º ano', '9º ano', 'Ensino Médio']
  const subjects = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês']

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'quiz': return <Target className="w-4 h-4" />
      case 'assignment': return <BookOpen className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} horas`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal do Aluno</h1>
        <p className="text-gray-600">Gerencie recursos educacionais e acompanhe o progresso dos alunos</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alunos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-xs text-green-600 mt-1">+5.2% este mês</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recursos Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">456</p>
              <p className="text-xs text-blue-600 mt-1">+12 novos</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
              <p className="text-xs text-green-600 mt-1">+3.5% este mês</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engajamento Médio</p>
              <p className="text-2xl font-bold text-gray-900">4.2/5</p>
              <p className="text-xs text-yellow-600 mt-1">Muito Bom</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recursos Educacionais
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Atividades Recentes
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'announcements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Comunicados
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Desempenho por Disciplina
                </h3>
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{subject}</span>
                        <span className="text-gray-600">{Math.floor(Math.random() * 30 + 70)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Resources */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recursos Mais Acessados
                </h3>
                <div className="space-y-3">
                  {resources.slice(0, 5).map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                          <p className="text-xs text-gray-600">{resource.subject} • {resource.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{resource.views}</p>
                        <p className="text-xs text-gray-600">visualizações</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar recursos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as Séries</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as Disciplinas</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar
                </button>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{resource.rating}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <span>{resource.subject}</span>
                      <span>•</span>
                      <span>{resource.grade}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{resource.views} visualizações</span>
                      <span className="text-green-600">{resource.completions} conclusões</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1">
                        Ver detalhes
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Atividades em Tempo Real</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  Ver todas
                </button>
              </div>
              
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.studentName}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.resource}</span>
                        </p>
                        <p className="text-xs text-gray-600">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <p className="text-sm font-medium text-green-600">{activity.score}%</p>
                      )}
                      {activity.duration && (
                        <p className="text-sm text-gray-600">{activity.duration} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Comunicados Ativos</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Novo Comunicado
                </button>
              </div>
              
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{announcement.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority === 'high' ? 'Alta Prioridade' : 
                             announcement.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                          </span>
                          <span className="text-xs text-gray-600">Por {announcement.author}</span>
                          <span className="text-xs text-gray-600">{announcement.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{announcement.views} visualizações</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {announcement.targetGrades.map((grade) => (
                          <span key={grade} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {grade}
                          </span>
                        ))}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}