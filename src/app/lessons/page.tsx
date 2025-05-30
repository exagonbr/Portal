'use client'

import { useAuth } from '@/contexts/AuthContext'

interface Lesson {
  id: number
  title: string
  description: string
  course: string
  module: number
  duration: string
  status: 'available' | 'in_progress' | 'completed' | 'locked'
  progress: number
  thumbnail: string
  instructor: {
    name: string
    avatar: string
  }
  resources: number
  views: number
  lastViewed?: string
  quiz?: {
    questions: number
    completed: boolean
    score?: number
  }
}

const MOCK_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introdução aos Números Complexos',
    description: 'Fundamentos dos números complexos, operações básicas e representação geométrica',
    course: 'Matemática Avançada',
    module: 1,
    duration: '45min',
    status: 'completed',
    progress: 100,
    thumbnail: '/thumbnails/math-complex.jpg',
    instructor: {
      name: 'Dr. João Silva',
      avatar: '/avatars/joao.jpg'
    },
    resources: 3,
    views: 245,
    lastViewed: '2024-01-14',
    quiz: {
      questions: 10,
      completed: true,
      score: 90
    }
  },
  {
    id: 2,
    title: 'Funções de Variável Complexa',
    description: 'Estudo das funções analíticas, condições de Cauchy-Riemann e aplicações',
    course: 'Matemática Avançada',
    module: 1,
    duration: '60min',
    status: 'in_progress',
    progress: 45,
    thumbnail: '/thumbnails/math-functions.jpg',
    instructor: {
      name: 'Dr. João Silva',
      avatar: '/avatars/joao.jpg'
    },
    resources: 5,
    views: 180,
    lastViewed: '2024-01-15',
    quiz: {
      questions: 12,
      completed: false
    }
  },
  {
    id: 3,
    title: 'Integração no Plano Complexo',
    description: 'Teoria da integração complexa, teorema de Cauchy e fórmula integral',
    course: 'Matemática Avançada',
    module: 1,
    duration: '55min',
    status: 'available',
    progress: 0,
    thumbnail: '/thumbnails/math-integration.jpg',
    instructor: {
      name: 'Dr. João Silva',
      avatar: '/avatars/joao.jpg'
    },
    resources: 4,
    views: 150,
    quiz: {
      questions: 8,
      completed: false
    }
  },
  {
    id: 4,
    title: 'Séries de Laurent',
    description: 'Expansão em séries de Laurent, classificação de singularidades',
    course: 'Matemática Avançada',
    module: 2,
    duration: '50min',
    status: 'locked',
    progress: 0,
    thumbnail: '/thumbnails/math-series.jpg',
    instructor: {
      name: 'Dr. João Silva',
      avatar: '/avatars/joao.jpg'
    },
    resources: 3,
    views: 0,
    quiz: {
      questions: 10,
      completed: false
    }
  }
]

const STATUS_COLORS = {
  available: { 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    text: 'text-emerald-700', 
    icon: 'bg-emerald-100',
    label: 'Disponível' 
  },
  in_progress: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    text: 'text-blue-700', 
    icon: 'bg-blue-100',
    label: 'Em Andamento' 
  },
  completed: { 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    text: 'text-purple-700', 
    icon: 'bg-purple-100',
    label: 'Concluída' 
  },
  locked: { 
    bg: 'bg-gray-50', 
    border: 'border-gray-200',
    text: 'text-gray-600', 
    icon: 'bg-gray-100',
    label: 'Bloqueada' 
  }
}

export default function LessonsPage() {
  const { user } = useAuth()

  return (
    <div className="container-responsive spacing-y-responsive">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2 sm:gap-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Minhas Aulas
            </h1>
            <p className="page-subtitle">Acesse suas aulas e materiais de estudo</p>
          </div>
          <div className="flex gap-3">
            <button className="button-secondary flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hide-mobile">Filtrar</span>
            </button>
            <button className="button-primary flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hide-mobile">Salvos</span>
            </button>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs-responsive text-emerald-600 font-medium">60%</span>
            </div>
            <div className="stat-value">12/20</div>
            <div className="stat-label">Aulas Concluídas</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs-responsive text-emerald-600 font-medium">+2h</span>
            </div>
            <div className="stat-value">8h 30min</div>
            <div className="stat-label">Tempo de Estudo</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-xs-responsive text-emerald-600 font-medium">+5%</span>
            </div>
            <div className="stat-value">85%</div>
            <div className="stat-label">Média nos Quizzes</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="text-xs-responsive text-blue-600 font-medium">1 pendente</span>
            </div>
            <div className="stat-value">2</div>
            <div className="stat-label">Certificados</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar aulas..."
                className="input-field pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select className="input-field">
                <option value="">Todos os Cursos</option>
                <option value="math">Matemática Avançada</option>
                <option value="physics">Física Fundamental</option>
                <option value="chemistry">Química Orgânica</option>
              </select>
              <select className="input-field">
                <option value="">Todos os Módulos</option>
                <option value="1">Módulo 1</option>
                <option value="2">Módulo 2</option>
                <option value="3">Módulo 3</option>
              </select>
              <select className="input-field">
                <option value="">Ordenar por</option>
                <option value="recent">Mais Recentes</option>
                <option value="title">Título</option>
                <option value="progress">Progresso</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="badge bg-primary/10 text-primary">
          Todas (4)
        </button>
        <button className="badge hover:bg-gray-100 transition-colors">
          Em Andamento (1)
        </button>
        <button className="badge hover:bg-gray-100 transition-colors">
          Concluídas (1)
        </button>
        <button className="badge hover:bg-gray-100 transition-colors">
          Disponíveis (1)
        </button>
      </div>

      {/* Lessons List */}
      <div className="space-y-4 sm:space-y-6">
        {MOCK_LESSONS.map((lesson) => (
          <div key={lesson.id} className="card hover:shadow-md transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="md:w-48 lg:w-64 h-32 sm:h-48 md:h-auto bg-gradient-to-br from-blue-100 to-indigo-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-base-responsive font-semibold text-gray-900">{lesson.title}</h3>
                      {lesson.status === 'completed' && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm-responsive text-gray-600 mb-4">{lesson.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs-responsive text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{lesson.course}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{lesson.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Módulo {lesson.module}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{lesson.views} visualizações</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 sm:gap-4">
                    <span className={`badge ${STATUS_COLORS[lesson.status].bg} ${STATUS_COLORS[lesson.status].border} ${STATUS_COLORS[lesson.status].text} border`}>
                      {STATUS_COLORS[lesson.status].label}
                    </span>
                    {lesson.status !== 'locked' && (
                      <button 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm-responsive ${
                          lesson.status === 'completed'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                      >
                        {lesson.status === 'completed' ? (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Revisar
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Continuar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress and Additional Info */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs-responsive text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>{lesson.resources} recursos</span>
                      </div>
                      {lesson.quiz && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          <span>
                            {lesson.quiz.completed 
                              ? `${lesson.quiz.score}% no quiz` 
                              : `${lesson.quiz.questions} questões`}
                          </span>
                        </div>
                      )}
                      {lesson.lastViewed && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Visto em {new Date(lesson.lastViewed).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                    {lesson.progress > 0 && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="flex-1 sm:w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs-responsive text-gray-600 font-medium">{lesson.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
