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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Atividades Escolares</h1>
            <p className="text-gray-600">Acompanhe as atividades e tarefas dos seus filhos</p>
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors">
            <span className="material-symbols-outlined">download</span>
            <span>Relatório</span>
          </button>
        </div>

        {/* Children Selector */}
        <div className="flex space-x-4 mb-6">
          {MOCK_ACTIVITIES_DATA.map((child) => (
            <button
              key={child.childId}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                selectedChild.childId === child.childId
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-primary-dark">{child.childName}</div>
                <div className="text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Activity Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Atividades</div>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Este período</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Concluídas</div>
            <div className="text-2xl font-bold text-accent-green">{stats.completed}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% do total
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 mt-1">Sendo desenvolvidas</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-accent-yellow">{stats.pending}</div>
            <div className="text-sm text-gray-600 mt-1">Aguardando início</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">{activity.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{activity.subject}</span>
                  <span>•</span>
                  <span>{activity.teacher}</span>
                  <span>•</span>
                  <span>Entrega: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-gray-600 mt-2">{activity.description}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                  {getPriorityText(activity.priority)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusText(activity.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'Trabalho' ? 'bg-primary/20 text-primary' :
                  activity.type === 'Projeto' ? 'bg-accent-purple/20 text-accent-purple' :
                  activity.type === 'Exercícios' ? 'bg-accent-green/20 text-accent-green' :
                  'bg-accent-orange/20 text-accent-orange'
                }`}>
                  {activity.type}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>
                    {Math.ceil((new Date(activity.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias restantes
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  <span>{activity.submissionType}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedActivity(activity)}
                className="text-primary hover:text-primary-dark flex items-center space-x-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Ver Detalhes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-primary">Detalhes da Atividade</h3>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-primary">{selectedActivity.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{selectedActivity.subject}</span>
                  <span>•</span>
                  <span>{selectedActivity.teacher}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-primary-dark mb-2">Informações Gerais</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tipo:</span> {selectedActivity.type}</div>
                    <div><span className="font-medium">Data de Entrega:</span> {new Date(selectedActivity.dueDate).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Prioridade:</span> {getPriorityText(selectedActivity.priority)}</div>
                    <div><span className="font-medium">Status:</span> {getStatusText(selectedActivity.status)}</div>
                    <div><span className="font-medium">Forma de Entrega:</span> {selectedActivity.submissionType}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-primary-dark mb-2">Materiais Necessários</h5>
                  <div className="space-y-1">
                    {selectedActivity.materials.map((material: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="material-symbols-outlined text-xs text-primary">check</span>
                        <span>{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-primary-dark mb-2">Descrição</h5>
                <p className="text-gray-600">{selectedActivity.description}</p>
              </div>

              <div>
                <h5 className="font-medium text-primary-dark mb-2">Instruções Detalhadas</h5>
                <p className="text-gray-600">{selectedActivity.instructions}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors">
                  Contatar Professor
                </button>
                <button className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/80 transition-colors">
                  Marcar como Concluída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}