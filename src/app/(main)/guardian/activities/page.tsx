'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_ACTIVITIES_DATA = [
  {
    childId: 1,
    childName: 'Ana Silva Santos',
    grade: '8º Ano B',
    activities: [
      {
        id: 1,
        title: 'Trabalho de História - Brasil Colonial',
        subject: 'História',
        type: 'Trabalho',
        description: 'Pesquisa sobre o período colonial brasileiro com apresentação',
        dueDate: '2024-03-28',
        status: 'pending',
        priority: 'high',
        teacher: 'Prof. Carlos Lima',
        instructions: 'Fazer uma pesquisa de 3 páginas sobre o período colonial brasileiro, incluindo aspectos econômicos, sociais e políticos.',
        materials: ['Livro didático', 'Fontes online confiáveis', 'Imagens históricas'],
        submissionType: 'Apresentação + Relatório escrito'
      },
      {
        id: 2,
        title: 'Lista de Exercícios - Equações do 2º Grau',
        subject: 'Matemática',
        type: 'Exercícios',
        description: 'Resolver lista com 20 exercícios sobre equações quadráticas',
        dueDate: '2024-03-25',
        status: 'completed',
        priority: 'medium',
        teacher: 'Prof. João Silva',
        instructions: 'Resolver todos os exercícios da página 45 a 47 do livro didático.',
        materials: ['Livro didático', 'Calculadora'],
        submissionType: 'Entrega física'
      },
      {
        id: 3,
        title: 'Redação - Meio Ambiente',
        subject: 'Português',
        type: 'Redação',
        description: 'Redação dissertativa sobre preservação ambiental',
        dueDate: '2024-04-02',
        status: 'in_progress',
        priority: 'medium',
        teacher: 'Profa. Maria Santos',
        instructions: 'Escrever uma redação dissertativa de 25 a 30 linhas sobre a importância da preservação ambiental.',
        materials: ['Folha de redação', 'Caneta azul ou preta'],
        submissionType: 'Entrega física'
      }
    ]
  },
  {
    childId: 2,
    childName: 'Pedro Silva Santos',
    grade: '5º Ano A',
    activities: [
      {
        id: 4,
        title: 'Projeto Sistema Solar',
        subject: 'Ciências',
        type: 'Projeto',
        description: 'Criar maquete do sistema solar com informações dos planetas',
        dueDate: '2024-03-29',
        status: 'pending',
        priority: 'high',
        teacher: 'Profa. Ana Costa',
        instructions: 'Construir uma maquete do sistema solar usando materiais recicláveis e incluir informações sobre cada planeta.',
        materials: ['Isopor', 'Tintas', 'Palitos', 'Cartolina'],
        submissionType: 'Apresentação + Maquete'
      },
      {
        id: 5,
        title: 'Tabuada do 7 e 8',
        subject: 'Matemática',
        type: 'Exercícios',
        description: 'Memorizar e praticar tabuada do 7 e 8',
        dueDate: '2024-03-26',
        status: 'completed',
        priority: 'low',
        teacher: 'Profa. Ana Costa',
        instructions: 'Estudar e decorar a tabuada do 7 e 8. Haverá teste oral na próxima aula.',
        materials: ['Caderno', 'Lápis'],
        submissionType: 'Teste oral'
      }
    ]
  }
]

export default function GuardianActivitiesPage() {
  const { user } = useAuth()
  const [selectedChild, setSelectedChild] = useState(MOCK_ACTIVITIES_DATA[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-green/20 text-accent-green'
      case 'in_progress':
        return 'bg-primary/20 text-primary'
      case 'pending':
        return 'bg-accent-yellow/20 text-accent-yellow'
      case 'overdue':
        return 'bg-error/20 text-error'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'in_progress':
        return 'Em Andamento'
      case 'pending':
        return 'Pendente'
      case 'overdue':
        return 'Atrasada'
      default:
        return 'N/A'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error'
      case 'medium':
        return 'bg-accent-yellow/20 text-accent-yellow'
      case 'low':
        return 'bg-accent-green/20 text-accent-green'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return 'N/A'
    }
  }

  const filteredActivities = selectedChild.activities.filter(activity => {
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter
    return matchesStatus && matchesPriority
  })

  const getActivityStats = () => {
    const total = selectedChild.activities.length
    const completed = selectedChild.activities.filter(a => a.status === 'completed').length
    const pending = selectedChild.activities.filter(a => a.status === 'pending').length
    const inProgress = selectedChild.activities.filter(a => a.status === 'in_progress').length
    
    return { total, completed, pending, inProgress }
  }

  const stats = getActivityStats()

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-800 truncate">Atividades Escolares</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Acompanhe as atividades e tarefas dos seus filhos</p>
          </div>
          <button className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base w-full sm:w-auto">
            <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
            <span>Relatório</span>
          </button>
        </div>

        {/* Children Selector - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          {MOCK_ACTIVITIES_DATA.map((child) => (
            <button
              key={child.childId}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all w-full sm:w-auto ${
                selectedChild.childId === child.childId
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-600 text-lg sm:text-xl">person</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-blue-600 text-sm sm:text-base truncate">{child.childName}</div>
                <div className="text-xs sm:text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats Cards - Grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">atividades</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Concluídas</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-green">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">finalizadas</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Pendentes</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-yellow">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">aguardando</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Em Andamento</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">em progresso</div>
          </div>
        </div>

        {/* Filters - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluídas</option>
            <option value="overdue">Atrasadas</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta Prioridade</option>
            <option value="medium">Prioridade Média</option>
            <option value="low">Baixa Prioridade</option>
          </select>
        </div>
      </div>

      {/* Activities List - Responsivo */}
      <div className="space-y-3 sm:space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Activity Icon */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'Trabalho' ? 'bg-primary/20' :
                activity.type === 'Projeto' ? 'bg-accent-purple/20' :
                activity.type === 'Exercícios' ? 'bg-accent-green/20' :
                'bg-accent-blue/20'
              }`}>
                <span className={`material-symbols-outlined text-lg sm:text-xl ${
                  activity.type === 'Trabalho' ? 'text-primary' :
                  activity.type === 'Projeto' ? 'text-accent-purple' :
                  activity.type === 'Exercícios' ? 'text-accent-green' :
                  'text-accent-blue'
                }`}>
                  {activity.type === 'Trabalho' ? 'assignment' :
                   activity.type === 'Projeto' ? 'science' :
                   activity.type === 'Exercícios' ? 'quiz' :
                   'school'}
                </span>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 truncate">{activity.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{activity.subject} • {activity.teacher}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                      {getPriorityText(activity.priority)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="font-medium">Entrega:</span> {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Details Modal - Responsivo */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary truncate pr-4">{selectedActivity.title}</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Disciplina:</span> {selectedActivity.subject}</div>
                      <div><span className="font-medium">Professor:</span> {selectedActivity.teacher}</div>
                      <div><span className="font-medium">Tipo:</span> {selectedActivity.type}</div>
                      <div><span className="font-medium">Entrega:</span> {new Date(selectedActivity.dueDate).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                    <div className="space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedActivity.status)}`}>
                        {getStatusText(selectedActivity.status)}
                      </span>
                      <br />
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedActivity.priority)}`}>
                        Prioridade {getPriorityText(selectedActivity.priority)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Instruções</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.instructions}</p>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Materiais Necessários</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedActivity.materials.map((material: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600">{material}</li>
                    ))}
                  </ul>
                </div>

                {/* Submission Type */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Forma de Entrega</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.submissionType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}