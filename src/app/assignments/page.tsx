'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, ApiClientError } from '@/services/apiClient' // Ajuste o caminho se necessário

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'late'
type PriorityLevel = 'high' | 'medium' | 'low'

interface Assignment {
  id: number | string // API pode retornar string ou number
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

// MOCK_ASSIGNMENTS será removido ou usado como fallback/inicialização
// const MOCK_ASSIGNMENTS: Assignment[] = [ ... ]

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
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) {
        // Idealmente, redirecionar para login ou mostrar mensagem
        setLoading(false)
        setError("Usuário não autenticado.")
        return
      }
      try {
        setLoading(true)
        // TODO: Ajustar o endpoint da API conforme necessário
        const response = await apiClient.get<{ assignments: Assignment[] }>(`/api/users/${user.id}/assignments`)
        
        if (response.success && response.data) {
          setAssignments(response.data.assignments || []) // Garante que seja um array
        } else {
          setError(response.message || 'Falha ao buscar atividades.')
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError('Ocorreu um erro desconhecido.')
        }
        console.error("Erro ao buscar atividades:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [user]) // Adiciona user como dependência

  // Calcula estatísticas baseadas nos dados carregados
  const totalAssignments = assignments.length
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length
  const completedAssignments = assignments.filter(a => a.status === 'completed').length


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Carregando atividades...</p>
        {/* Você pode adicionar um spinner aqui */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-500">Erro: {error}</p>
        <button
          onClick={() => window.location.reload()} // Simples reload, idealmente uma função de retry mais robusta
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }
  
  if (!user) {
     return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Por favor, faça login para ver suas atividades.</p>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">Minhas Atividades</h1>
            <p className="text-gray-600">Acompanhe e gerencie suas atividades acadêmicas</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <span className="material-icons text-sm mr-2">filter_list</span>
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
            <div className="text-2xl font-bold text-primary-dark">{totalAssignments}</div>
            {/* Estatísticas dinâmicas podem ser mais complexas, mantendo simples por agora */}
            <div className="mt-4 flex items-center">
              {/* <span className="text-accent-green text-sm">↑ X</span> */}
              {/* <span className="text-gray-500 text-sm ml-2">...</span> */}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-accent-yellow">{pendingAssignments}</div>
            <div className="mt-4 flex items-center">
              {/* <span className="text-accent-yellow text-sm">!</span> */}
              {/* <span className="text-gray-500 text-sm ml-2">...</span> */}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-primary">{inProgressAssignments}</div>
            <div className="mt-4 flex items-center">
              {/* <span className="text-primary text-sm">↑ Y</span> */}
              {/* <span className="text-gray-500 text-sm ml-2">...</span> */}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Concluídas</div>
            <div className="text-2xl font-bold text-accent-green">{completedAssignments}</div>
            <div className="mt-4 flex items-center">
              {/* <span className="text-accent-green text-sm">↑ Z</span> */}
              {/* <span className="text-gray-500 text-sm ml-2">...</span> */}
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
          Todas ({totalAssignments})
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-accent-yellow hover:bg-accent-yellow/10 transition-colors duration-200">
          Pendentes ({pendingAssignments})
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200">
          Em Andamento ({inProgressAssignments})
        </button>
        <button className="px-4 py-2 text-sm rounded-lg text-accent-green hover:bg-accent-green/10 transition-colors duration-200">
          Concluídas ({completedAssignments})
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {assignments.length === 0 && !loading && (
            <p className="text-center text-gray-500">Nenhuma atividade encontrada.</p>
          )}
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {/* Verifica se PRIORITY_ICONS[assignment.priority] existe antes de acessar icon e color */}
                    {PRIORITY_ICONS[assignment.priority] && (
                       <span className={`material-icons mr-2 ${PRIORITY_ICONS[assignment.priority].color}`}>
                         {PRIORITY_ICONS[assignment.priority].icon}
                       </span>
                    )}
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
                  {/* Verifica se STATUS_COLORS[assignment.status] existe */}
                  {STATUS_COLORS[assignment.status] && (
                    <span className={`px-3 py-1 ${STATUS_COLORS[assignment.status].bg} ${STATUS_COLORS[assignment.status].text} rounded-full text-sm`}>
                      {STATUS_COLORS[assignment.status].label}
                    </span>
                  )}
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
