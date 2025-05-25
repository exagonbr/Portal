'use client'

import { useAuth } from '@/contexts/AuthContext'

interface Grade {
  id: number
  student: {
    id: number
    name: string
    avatar: string
    registration: string
    class: string
  }
  activity: {
    id: number
    title: string
    type: 'assignment' | 'quiz' | 'exam' | 'project'
    maxScore: number
    weight: number
    dueDate: string
    image: string
  }
  score: number
  submittedDate: string
  feedback?: string
  status: 'graded' | 'pending' | 'late' | 'missing'
}

const MOCK_GRADES: Grade[] = [
  {
    id: 1,
    student: {
      id: 1,
      name: 'Ana Silva',
      avatar: 'https://i.pravatar.cc/150?img=1',
      registration: '2024001',
      class: 'Turma A'
    },
    activity: {
      id: 1,
      title: 'Prova de Números Complexos',
      type: 'exam',
      maxScore: 100,
      weight: 0.4,
      dueDate: '2024-01-15',
      image: '/images/math-exam.jpg'
    },
    score: 85,
    submittedDate: '2024-01-15',
    feedback: 'Excelente compreensão dos conceitos fundamentais',
    status: 'graded'
  },
  {
    id: 2,
    student: {
      id: 2,
      name: 'Pedro Santos',
      avatar: 'https://i.pravatar.cc/150?img=2',
      registration: '2024002',
      class: 'Turma A'
    },
    activity: {
      id: 2,
      title: 'Trabalho de Funções Complexas',
      type: 'project',
      maxScore: 100,
      weight: 0.3,
      dueDate: '2024-01-20',
      image: '/images/math-project.jpg'
    },
    score: 0,
    submittedDate: '2024-01-14',
    status: 'pending'
  },
  {
    id: 3,
    student: {
      id: 3,
      name: 'Maria Costa',
      avatar: 'https://i.pravatar.cc/150?img=3',
      registration: '2024003',
      class: 'Turma B'
    },
    activity: {
      id: 3,
      title: 'Quiz de Integração',
      type: 'quiz',
      maxScore: 50,
      weight: 0.15,
      dueDate: '2024-01-10',
      image: '/images/math-quiz.jpg'
    },
    score: 45,
    submittedDate: '2024-01-10',
    feedback: 'Ótimo desempenho no quiz',
    status: 'graded'
  }
]

const STATUS_COLORS = {
  graded: { bg: 'bg-green-100', text: 'text-green-800', label: 'Corrigido' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
  late: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Atrasado' },
  missing: { bg: 'bg-red-100', text: 'text-red-800', label: 'Não Entregue' }
}

const ACTIVITY_TYPE_ICONS = {
  assignment: 'assignment',
  quiz: 'quiz',
  exam: 'note_alt',
  project: 'science'
}

export default function TeacherGradesPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notas e Avaliações</h1>
            <p className="text-gray-600">Gerencie as notas e avaliações dos seus alunos</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <span className="material-icons text-sm mr-2">file_download</span>
              Exportar
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <span className="material-icons text-sm mr-2">add</span>
              Nova Avaliação
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média Geral</div>
            <div className="text-2xl font-bold text-gray-800">8.2</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.3</span>
              <span className="text-gray-500 text-sm ml-2">vs. último período</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Avaliações</div>
            <div className="text-2xl font-bold text-blue-600">24</div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">15 corrigidas</span>
              <span className="text-gray-500 text-sm ml-2">9 pendentes</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Aprovação</div>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 5%</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Alunos em Recuperação</div>
            <div className="text-2xl font-bold text-red-600">12</div>
            <div className="mt-4 flex items-center">
              <span className="text-red-500 text-sm">9.5%</span>
              <span className="text-gray-500 text-sm ml-2">da turma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Pesquisar avaliações..."
            aria-label="Pesquisar avaliações"
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Filtrar por turma">
            <option value="">Todas as Turmas</option>
            <option value="A">Turma A</option>
            <option value="B">Turma B</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Filtrar por tipo de avaliação">
            <option value="">Tipo de Avaliação</option>
            <option value="exam">Provas</option>
            <option value="quiz">Quizzes</option>
            <option value="assignment">Trabalhos</option>
            <option value="project">Projetos</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Filtrar por status">
            <option value="">Status</option>
            <option value="graded">Corrigidas</option>
            <option value="pending">Pendentes</option>
            <option value="late">Atrasadas</option>
          </select>
        </div>
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GRADES.map((grade) => (
          <div key={grade.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Activity Image Header */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-icons text-white text-6xl">
                  {ACTIVITY_TYPE_ICONS[grade.activity.type]}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={grade.student.avatar}
                    alt={grade.student.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="text-white">
                    <p className="font-medium">{grade.student.name}</p>
                    <p className="text-sm opacity-90">{grade.student.registration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{grade.activity.title}</h3>
                  <p className="text-sm text-gray-500">Peso: {(grade.activity.weight * 100)}%</p>
                </div>
                <span className={`px-3 py-1 ${STATUS_COLORS[grade.status].bg} ${STATUS_COLORS[grade.status].text} rounded-full text-sm`}>
                  {STATUS_COLORS[grade.status].label}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Nota</span>
                    <span className="font-medium">
                      {grade.status === 'graded' ? `${grade.score}/${grade.activity.maxScore}` : '--'}
                    </span>
                  </div>
                  {grade.status === 'graded' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (grade.score / grade.activity.maxScore) >= 0.7 
                            ? 'bg-green-600' 
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${(grade.score / grade.activity.maxScore) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Data de Entrega</p>
                    <p className="font-medium">{new Date(grade.activity.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Enviado em</p>
                    <p className="font-medium">{new Date(grade.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {grade.feedback && (
                  <div className="text-sm">
                    <p className="text-gray-500">Feedback</p>
                    <p className="text-gray-700 mt-1">{grade.feedback}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                <button className="text-gray-600 hover:text-gray-800">
                  <span className="material-icons">more_vert</span>
                </button>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                    Ver Detalhes
                  </button>
                  {grade.status === 'pending' && (
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Corrigir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
