'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_PLANNING_DATA = [
  {
    id: 1,
    title: 'Planejamento Anual 2024',
    type: 'Anual',
    cycle: 'Ensino Fundamental II',
    startDate: '2024-02-01',
    endDate: '2024-12-15',
    status: 'Em andamento',
    progress: 65,
    subjects: ['Matemática', 'Português', 'História', 'Geografia', 'Ciências'],
    coordinator: 'Coord. Maria Silva',
    lastUpdate: '2024-03-15'
  },
  {
    id: 2,
    title: 'Planejamento Bimestral - 1º Bimestre',
    type: 'Bimestral',
    cycle: 'Ensino Médio',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    status: 'Concluído',
    progress: 100,
    subjects: ['Física', 'Química', 'Biologia', 'Matemática'],
    coordinator: 'Coord. João Santos',
    lastUpdate: '2024-04-15'
  },
  {
    id: 3,
    title: 'Projeto Interdisciplinar - Meio Ambiente',
    type: 'Projeto',
    cycle: 'Ensino Fundamental I',
    startDate: '2024-03-01',
    endDate: '2024-05-30',
    status: 'Planejamento',
    progress: 25,
    subjects: ['Ciências', 'Geografia', 'Português'],
    coordinator: 'Coord. Ana Costa',
    lastUpdate: '2024-03-10'
  },
  {
    id: 4,
    title: 'Preparação ENEM 2024',
    type: 'Especial',
    cycle: 'Ensino Médio',
    startDate: '2024-04-01',
    endDate: '2024-11-30',
    status: 'Aprovado',
    progress: 15,
    subjects: ['Todas as disciplinas'],
    coordinator: 'Coord. Pedro Lima',
    lastUpdate: '2024-03-20'
  }
]

const CALENDAR_EVENTS = [
  {
    id: 1,
    title: 'Reunião de Planejamento - Matemática',
    date: '2024-03-25',
    time: '14:00',
    type: 'Reunião',
    participants: ['Prof. João Silva', 'Coord. Maria Silva'],
    status: 'Agendado'
  },
  {
    id: 2,
    title: 'Avaliação do Projeto Interdisciplinar',
    date: '2024-03-28',
    time: '09:00',
    type: 'Avaliação',
    participants: ['Coord. Ana Costa', 'Direção'],
    status: 'Agendado'
  },
  {
    id: 3,
    title: 'Entrega do Planejamento Bimestral',
    date: '2024-03-30',
    time: '17:00',
    type: 'Entrega',
    participants: ['Todos os coordenadores'],
    status: 'Pendente'
  }
]

export default function CoordinatorPlanningPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('plans')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const filteredPlans = MOCK_PLANNING_DATA.filter(plan => {
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
    const matchesType = typeFilter === 'all' || plan.type === typeFilter
    return matchesStatus && matchesType
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Planejamento Acadêmico</h1>
            <p className="text-gray-600">Gerencie o planejamento pedagógico da instituição</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Novo Planejamento</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Planos</div>
            <div className="text-2xl font-bold text-gray-800">{MOCK_PLANNING_DATA.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_PLANNING_DATA.filter(p => p.status === 'Em andamento').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">→ 0</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Concluídos</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_PLANNING_DATA.filter(p => p.status === 'Concluído').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">este bimestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Progresso Médio</div>
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(MOCK_PLANNING_DATA.reduce((acc, p) => acc + p.progress, 0) / MOCK_PLANNING_DATA.length)}%
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 5%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Planejamentos
            </button>
            <button
              onClick={() => setSelectedTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cronograma
            </button>
          </nav>
        </div>
      </div>

      {selectedTab === 'plans' && (
        <>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Planejamento">Planejamento</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
            
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Anual">Anual</option>
              <option value="Bimestral">Bimestral</option>
              <option value="Projeto">Projeto</option>
              <option value="Especial">Especial</option>
            </select>
          </div>

          {/* Plans List */}
          <div className="space-y-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{plan.cycle}</span>
                      <span>•</span>
                      <span>{plan.coordinator}</span>
                      <span>•</span>
                      <span>Atualizado em {new Date(plan.lastUpdate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'Concluído' 
                        ? 'bg-green-100 text-green-800'
                        : plan.status === 'Em andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : plan.status === 'Aprovado'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.type === 'Anual' 
                        ? 'bg-indigo-100 text-indigo-800'
                        : plan.type === 'Bimestral'
                        ? 'bg-cyan-100 text-cyan-800'
                        : plan.type === 'Projeto'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {plan.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Período</p>
                    <p className="text-sm text-gray-600">
                      {new Date(plan.startDate).toLocaleDateString('pt-BR')} - {new Date(plan.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Disciplinas</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.subjects.slice(0, 3).map((subject, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {subject}
                        </span>
                      ))}
                      {plan.subjects.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{plan.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Progresso</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            plan.progress >= 80 ? 'bg-green-500' :
                            plan.progress >= 50 ? 'bg-blue-500' :
                            plan.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{plan.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedPlan(plan)}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Ver Detalhes</span>
                  </button>
                  <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Editar</span>
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Exportar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos Eventos</h3>
            <div className="space-y-4">
              {CALENDAR_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600">
                        {event.type === 'Reunião' ? 'groups' :
                         event.type === 'Avaliação' ? 'assessment' : 'assignment'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        Participantes: {event.participants.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'Agendado' 
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'Pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'Reunião' 
                        ? 'bg-purple-100 text-purple-800'
                        : event.type === 'Avaliação'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Detalhes do Planejamento</h3>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{selectedPlan.title}</h4>
                <p className="text-gray-600">{selectedPlan.cycle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Informações Gerais</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tipo:</span> {selectedPlan.type}</div>
                    <div><span className="font-medium">Coordenador:</span> {selectedPlan.coordinator}</div>
                    <div><span className="font-medium">Status:</span> {selectedPlan.status}</div>
                    <div><span className="font-medium">Progresso:</span> {selectedPlan.progress}%</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Cronograma</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Início:</span> {new Date(selectedPlan.startDate).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Término:</span> {new Date(selectedPlan.endDate).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Última atualização:</span> {new Date(selectedPlan.lastUpdate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Disciplinas Envolvidas</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.subjects.map((subject: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                  Editar Planejamento
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Planning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Planejamento</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Planejamento</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Planejamento Anual 2024"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Anual</option>
                    <option>Bimestral</option>
                    <option>Projeto</option>
                    <option>Especial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Ensino Fundamental I</option>
                    <option>Ensino Fundamental II</option>
                    <option>Ensino Médio</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplinas</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Digite as disciplinas separadas por vírgula"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Descrição detalhada do planejamento"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar Planejamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}