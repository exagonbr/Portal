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
  available: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: 'Disponível' },
  in_progress: { bg: 'bg-accent-blue/20', text: 'text-accent-blue', label: 'Em Andamento' },
  completed: { bg: 'bg-accent-purple/20', text: 'text-accent-purple', label: 'Concluída' },
  locked: { bg: 'bg-accent-yellow/20', text: 'text-accent-yellow', label: 'Bloqueada' }
}

export default function LessonsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Aulas</h1>
            <p className="text-gray-600">Acesse suas aulas e materiais de estudo</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <span className="material-icons text-sm mr-2">filter_list</span>
              Filtrar
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
              <span className="material-icons text-sm mr-2">bookmark</span>
              Salvos
            </button>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Aulas Concluídas</div>
            <div className="text-2xl font-bold text-gray-800">12/20</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">60%</span>
              <span className="text-gray-500 text-sm ml-2">concluído</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Tempo de Estudo</div>
            <div className="text-2xl font-bold text-gray-800">8h 30min</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 2h</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média nos Quizzes</div>
            <div className="text-2xl font-bold text-gray-800">85%</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 5%</span>
              <span className="text-gray-500 text-sm ml-2">vs. média anterior</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Certificados</div>
            <div className="text-2xl font-bold text-gray-800">2</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-blue text-sm">1 pendente</span>
              <span className="text-gray-500 text-sm ml-2">para emissão</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Pesquisar aulas..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
            <option value="">Todos os Cursos</option>
            <option value="math">Matemática Avançada</option>
            <option value="physics">Física Fundamental</option>
            <option value="chemistry">Química Orgânica</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
            <option value="">Todos os Módulos</option>
            <option value="1">Módulo 1</option>
            <option value="2">Módulo 2</option>
            <option value="3">Módulo 3</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
            <option value="">Ordenar por</option>
            <option value="recent">Mais Recentes</option>
            <option value="title">Título</option>
            <option value="progress">Progresso</option>
          </select>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex space-x-2 mb-6">
        <button className="px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary font-medium">
          Todas (4)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100">
          Em Andamento (1)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100">
          Concluídas (1)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100">
          Disponíveis (1)
        </button>
      </div>

      {/* Lessons List */}
      <div className="space-y-6">
        {MOCK_LESSONS.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="md:w-64 h-48 md:h-auto bg-gray-200"></div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold">{lesson.title}</h3>
                      {lesson.status === 'completed' && (
                        <span className="material-icons text-accent-green ml-2">check_circle</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 text-base mr-2">school</span>
                        <span>{lesson.course}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 text-base mr-2">schedule</span>
                        <span>{lesson.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 text-base mr-2">folder</span>
                        <span>Módulo {lesson.module}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 text-base mr-2">visibility</span>
                        <span>{lesson.views} visualizações</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-4">
                    <span className={`px-3 py-1 ${STATUS_COLORS[lesson.status].bg} ${STATUS_COLORS[lesson.status].text} rounded-full text-sm`}>
                      {STATUS_COLORS[lesson.status].label}
                    </span>
                    {lesson.status !== 'locked' && (
                      <button 
                        className={`px-6 py-2 rounded-lg ${
                          lesson.status === 'completed'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                            : 'bg-primary text-white hover:bg-primary-dark transition-colors duration-200'
                        }`}
                      >
                        {lesson.status === 'completed' ? 'Rever' : 'Continuar'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress and Additional Info */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 text-base mr-1">description</span>
                        <span>{lesson.resources} recursos</span>
                      </div>
                      {lesson.quiz && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 text-base mr-1">quiz</span>
                          <span>
                            {lesson.quiz.completed 
                              ? `${lesson.quiz.score}% no quiz` 
                              : `${lesson.quiz.questions} questões`}
                          </span>
                        </div>
                      )}
                      {lesson.lastViewed && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 text-base mr-1">history</span>
                          <span>Visto em {new Date(lesson.lastViewed).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {lesson.progress > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${lesson.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{lesson.progress}%</span>
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
