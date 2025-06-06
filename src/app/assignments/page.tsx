'use client'

import { useAuth } from '@/contexts/AuthContext'

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'late'
type PriorityLevel = 'high' | 'medium' | 'low'

interface Assignment {
  id: number
  title: string
  description: string
  course: string
  dueDate: string
  status: AssignmentStatus
  type: string
  points: number
  timeEstimate: string
  attachments: number
  submissions: number
  grade?: number
  priority: PriorityLevel
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: 'Resolução de Equações Diferenciais',
    description: 'Resolver os exercícios propostos sobre equações diferenciais de primeira ordem',
    course: 'Matemática Avançada',
    dueDate: '2024-01-25',
    status: 'pending',
    type: 'Exercício',
    points: 100,
    timeEstimate: '2 horas',
    attachments: 2,
    submissions: 0,
    priority: 'high'
  },
  {
    id: 2,
    title: 'Relatório de Experimento de Física',
    description: 'Elaborar relatório detalhado sobre o experimento de pêndulo simples realizado em laboratório',
    course: 'Física Fundamental',
    dueDate: '2024-01-23',
    status: 'in_progress',
    type: 'Relatório',
    points: 150,
    timeEstimate: '3 horas',
    attachments: 1,
    submissions: 1,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Análise de Compostos Orgânicos',
    description: 'Identificar e classificar os compostos orgânicos apresentados nas imagens',
    course: 'Química Orgânica',
    dueDate: '2024-01-20',
    status: 'completed',
    type: 'Questionário',
    points: 80,
    timeEstimate: '1 hora',
    attachments: 3,
    submissions: 2,
    grade: 90,
    priority: 'low'
  },
  {
    id: 4,
    title: 'Microscopia de Células Vegetais',
    description: 'Desenhar e identificar as estruturas celulares observadas no microscópio',
    course: 'Biologia Celular',
    dueDate: '2024-01-28',
    status: 'pending',
    type: 'Prática',
    points: 120,
    timeEstimate: '2.5 horas',
    attachments: 0,
    submissions: 0,
    priority: 'medium'
  },
  {
    id: 5,
    title: 'Análise de Obra Modernista',
    description: 'Analisar a obra "Abaporu" de Tarsila do Amaral e seu contexto histórico',
    course: 'História da Arte',
    dueDate: '2024-01-22',
    status: 'in_progress',
    type: 'Ensaio',
    points: 100,
    timeEstimate: '4 horas',
    attachments: 1,
    submissions: 1,
    priority: 'high'
  }
]

const STATUS_COLORS: Record<AssignmentStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-accent-yellow/20', text: 'text-accent-yellow', label: 'Pendente' },
  in_progress: { bg: 'bg-primary/20', text: 'text-primary', label: 'Em Andamento' },
  completed: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: 'Concluída' },
  late: { bg: 'bg-error/20', text: 'text-error', label: 'Atrasada' }
}

const PRIORITY_ICONS: Record<PriorityLevel, { icon: string; color: string }> = {
  high: { icon: 'priority_high', color: 'text-error' },
  medium: { icon: 'remove', color: 'text-primary' },
  low: { icon: 'arrow_downward', color: 'text-accent-green' }
}

export default function AssignmentsPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800-dark">Minhas Atividades</h1>
            <p className="text-gray-600">Acompanhe e gerencie suas atividades acadêmicas</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <span className="material-icon text-sm mr-2">filter_list</span>
              Filtros
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
              <span className="material-icons text-sm mr-2">add</span>
              Adicionar Atividade
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Atividades</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800-dark">5</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">nesta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-accent-yellow">2</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-yellow text-sm">!</span>
              <span className="text-gray-500 text-sm ml-2">para os próximos 7 dias</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Em Andamento</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">2</div>
            <div className="mt-4 flex items-center">
              <span className="text-primary text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">em andamento</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Concluídas</div>
            <div className="text-2xl font-bold text-accent-green">1</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">nesta semana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar atividades..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Todos os Cursos</option>
            <option value="math">Matemática Avançada</option>
            <option value="physics">Física Fundamental</option>
            <option value="chemistry">Química Orgânica</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Todos os Tipos</option>
            <option value="exercise">Exercício</option>
            <option value="report">Relatório</option>
            <option value="quiz">Questionário</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Ordenar por</option>
            <option value="date">Data de entrega</option>
            <option value="priority">Prioridade</option>
            <option value="status">Situação</option>
          </select>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex space-x-2 mb-6">
        <button className="px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary font-medium">
          Todas (5)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-accent-yellow hover:bg-accent-yellow/10 transition-colors duration-200">
          Pendentes (2)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200">
          Em Andamento (2)
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-accent-green hover:bg-accent-green/10 transition-colors duration-200">
          Concluídas (1)
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {MOCK_ASSIGNMENTS.map((assignment) => (
            <div 
              key={assignment.id} 
              className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`material-icons mr-2 ${PRIORITY_ICONS[assignment.priority].color}`}>
                      {PRIORITY_ICONS[assignment.priority].icon}
                    </span>
                    <h3 className="text-lg font-semibold text-primary-dark">{assignment.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{assignment.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="material-icons text-primary/60 text-base mr-2">school</span>
                      <span>{assignment.course}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-primary/60 text-base mr-2">event</span>
                      <span>Data limite: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-primary/60 text-base mr-2">schedule</span>
                      <span>{assignment.timeEstimate}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-primary/60 text-base mr-2">stars</span>
                      <span>{assignment.points} pontos</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-end space-y-4">
                  <span className={`px-3 py-1 ${STATUS_COLORS[assignment.status].bg} ${STATUS_COLORS[assignment.status].text} rounded-full text-sm`}>
                    {STATUS_COLORS[assignment.status].label}
                  </span>
                  <div className="flex items-center space-x-2">
                    {assignment.status === 'completed' ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-green">{assignment.grade}</div>
                        <div className="text-xs text-gray-600">Nota final</div>
                      </div>
                    ) : (
                      <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
                        {assignment.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="material-icons text-primary/60 text-base mr-1">attach_file</span>
                  <span>{assignment.attachments} arquivos anexos</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="material-icons text-primary/60 text-base mr-1">history</span>
                  <span>{assignment.submissions} tentativas</span>
                </div>
                <button className="text-primary hover:text-primary-dark transition-colors duration-200">
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
