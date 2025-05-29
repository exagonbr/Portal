'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_IMPROVEMENTS = [
  {
    id: 1,
    title: 'Implementação de Laboratório de Robótica',
    category: 'Infraestrutura',
    priority: 'Alta',
    status: 'Em andamento',
    description: 'Criação de laboratório para ensino de robótica e programação',
    proposedBy: 'Coord. Maria Silva',
    dateProposed: '2024-02-15',
    expectedCompletion: '2024-06-30',
    budget: 50000,
    progress: 65,
    benefits: [
      'Melhoria no ensino de tecnologia',
      'Aumento do interesse dos alunos',
      'Preparação para o futuro digital'
    ],
    stakeholders: ['Direção', 'Professores de Tecnologia', 'Alunos'],
    tasks: [
      { id: 1, name: 'Aprovação do orçamento', completed: true },
      { id: 2, name: 'Compra de equipamentos', completed: true },
      { id: 3, name: 'Preparação do espaço', completed: false },
      { id: 4, name: 'Treinamento de professores', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Programa de Mentoria Acadêmica',
    category: 'Pedagógico',
    priority: 'Média',
    status: 'Planejamento',
    description: 'Sistema de mentoria entre alunos veteranos e novatos',
    proposedBy: 'Coord. João Santos',
    dateProposed: '2024-03-01',
    expectedCompletion: '2024-08-15',
    budget: 5000,
    progress: 25,
    benefits: [
      'Melhoria na adaptação de novos alunos',
      'Desenvolvimento de liderança',
      'Redução da evasão escolar'
    ],
    stakeholders: ['Alunos', 'Professores', 'Orientação Educacional'],
    tasks: [
      { id: 1, name: 'Definição de critérios', completed: true },
      { id: 2, name: 'Seleção de mentores', completed: false },
      { id: 3, name: 'Treinamento de mentores', completed: false },
      { id: 4, name: 'Lançamento do programa', completed: false }
    ]
  },
  {
    id: 3,
    title: 'Sistema de Avaliação Contínua',
    category: 'Avaliação',
    priority: 'Alta',
    status: 'Aprovado',
    description: 'Implementação de sistema de avaliação formativa contínua',
    proposedBy: 'Coord. Ana Costa',
    dateProposed: '2024-01-20',
    expectedCompletion: '2024-05-30',
    budget: 15000,
    progress: 80,
    benefits: [
      'Avaliação mais justa e precisa',
      'Feedback contínuo para alunos',
      'Identificação precoce de dificuldades'
    ],
    stakeholders: ['Professores', 'Alunos', 'Coordenação'],
    tasks: [
      { id: 1, name: 'Desenvolvimento do sistema', completed: true },
      { id: 2, name: 'Treinamento de professores', completed: true },
      { id: 3, name: 'Teste piloto', completed: true },
      { id: 4, name: 'Implementação completa', completed: false }
    ]
  },
  {
    id: 4,
    title: 'Programa de Sustentabilidade',
    category: 'Ambiental',
    priority: 'Baixa',
    status: 'Proposto',
    description: 'Iniciativas para tornar a escola mais sustentável',
    proposedBy: 'Coord. Pedro Lima',
    dateProposed: '2024-03-10',
    expectedCompletion: '2024-12-15',
    budget: 25000,
    progress: 10,
    benefits: [
      'Redução de custos operacionais',
      'Educação ambiental',
      'Responsabilidade social'
    ],
    stakeholders: ['Toda a comunidade escolar'],
    tasks: [
      { id: 1, name: 'Auditoria ambiental', completed: false },
      { id: 2, name: 'Plano de ação', completed: false },
      { id: 3, name: 'Implementação de medidas', completed: false },
      { id: 4, name: 'Monitoramento', completed: false }
    ]
  }
]

const IMPROVEMENT_CATEGORIES = ['Pedagógico', 'Infraestrutura', 'Tecnologia', 'Avaliação', 'Ambiental', 'Gestão']
const PRIORITY_LEVELS = ['Baixa', 'Média', 'Alta', 'Crítica']
const STATUS_OPTIONS = ['Proposto', 'Planejamento', 'Aprovado', 'Em andamento', 'Concluído', 'Cancelado']

export default function CoordinatorImprovementsPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('improvements')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedImprovement, setSelectedImprovement] = useState<any>(null)

  const filteredImprovements = MOCK_IMPROVEMENTS.filter(improvement => {
    const matchesStatus = statusFilter === 'all' || improvement.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || improvement.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || improvement.priority === priorityFilter
    return matchesStatus && matchesCategory && matchesPriority
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Gestão de Melhorias</h1>
            <p className="text-text-secondary">Gerencie propostas e projetos de melhoria da instituição</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Proposta</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Total de Propostas</div>
            <div className="text-2xl font-bold text-text-primary">{MOCK_IMPROVEMENTS.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-text-tertiary text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-text-primary">
              {MOCK_IMPROVEMENTS.filter(i => i.status === 'Em andamento').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">→ 0</span>
              <span className="text-text-tertiary text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Orçamento Total</div>
            <div className="text-2xl font-bold text-text-primary">
              R$ {(MOCK_IMPROVEMENTS.reduce((acc, i) => acc + i.budget, 0) / 1000).toFixed(0)}k
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ R$ 15k</span>
              <span className="text-text-tertiary text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Taxa de Conclusão</div>
            <div className="text-2xl font-bold text-text-primary">
              {Math.round(MOCK_IMPROVEMENTS.reduce((acc, i) => acc + i.progress, 0) / MOCK_IMPROVEMENTS.length)}%
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 15%</span>
              <span className="text-text-tertiary text-sm ml-2">este trimestre</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Categorias</option>
            {IMPROVEMENT_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Prioridades</option>
            {PRIORITY_LEVELS.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Improvements List */}
      <div className="space-y-6">
        {filteredImprovements.map((improvement) => (
          <div key={improvement.id} className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{improvement.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                  <span>Proposto por: {improvement.proposedBy}</span>
                  <span>•</span>
                  <span>Em {new Date(improvement.dateProposed).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>Orçamento: R$ {improvement.budget.toLocaleString()}</span>
                </div>
                <p className="text-text-secondary mt-2">{improvement.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  improvement.priority === 'Crítica' 
                    ? 'bg-red-100 text-red-800'
                    : improvement.priority === 'Alta'
                    ? 'bg-orange-100 text-orange-800'
                    : improvement.priority === 'Média'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {improvement.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  improvement.status === 'Concluído' 
                    ? 'bg-green-100 text-green-800'
                    : improvement.status === 'Em andamento'
                    ? 'bg-blue-100 text-blue-800'
                    : improvement.status === 'Aprovado'
                    ? 'bg-purple-100 text-purple-800'
                    : improvement.status === 'Planejamento'
                    ? 'bg-yellow-100 text-yellow-800'
                    : improvement.status === 'Cancelado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {improvement.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  improvement.category === 'Pedagógico' 
                    ? 'bg-blue-100 text-blue-800'
                    : improvement.category === 'Infraestrutura'
                    ? 'bg-purple-100 text-purple-800'
                    : improvement.category === 'Tecnologia'
                    ? 'bg-indigo-100 text-indigo-800'
                    : improvement.category === 'Avaliação'
                    ? 'bg-green-100 text-green-800'
                    : improvement.category === 'Ambiental'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {improvement.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Benefícios Esperados:</h4>
                <div className="space-y-1">
                  {improvement.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                      <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">check</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Progresso das Tarefas:</h4>
                <div className="space-y-2">
                  {improvement.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-sm">
                      <span className={`material-symbols-outlined text-xs ${
                        task.completed ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={task.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                  {improvement.tasks.length > 3 && (
                    <div className="text-xs text-text-tertiary">
                      +{improvement.tasks.length - 3} outras tarefas
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Progresso Geral</span>
                <span className="text-text-primary">{improvement.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    improvement.progress >= 80 ? 'bg-green-500' :
                    improvement.progress >= 50 ? 'bg-blue-500' :
                    improvement.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${improvement.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>Início: {new Date(improvement.dateProposed).toLocaleDateString('pt-BR')}</span>
                <span>Previsão: {new Date(improvement.expectedCompletion).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedImprovement(improvement)}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Ver Detalhes</span>
              </button>
              {improvement.status !== 'Concluído' && improvement.status !== 'Cancelado' && (
                <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Editar</span>
                </button>
              )}
              <button className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Relatório</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Improvement Details Modal */}
      {selectedImprovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-primary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Detalhes da Melhoria</h3>
              <button 
                onClick={() => setSelectedImprovement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-text-primary">{selectedImprovement.title}</h4>
                <p className="text-text-secondary">{selectedImprovement.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-text-primary mb-2">Informações Gerais</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Categoria:</span> {selectedImprovement.category}</div>
                    <div><span className="font-medium">Prioridade:</span> {selectedImprovement.priority}</div>
                    <div><span className="font-medium">Status:</span> {selectedImprovement.status}</div>
                    <div><span className="font-medium">Proposto por:</span> {selectedImprovement.proposedBy}</div>
                    <div><span className="font-medium">Orçamento:</span> R$ {selectedImprovement.budget.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-text-primary mb-2">Cronograma</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Data da Proposta:</span> {new Date(selectedImprovement.dateProposed).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Conclusão Prevista:</span> {new Date(selectedImprovement.expectedCompletion).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Progresso:</span> {selectedImprovement.progress}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-text-primary mb-2">Benefícios Esperados</h5>
                <div className="space-y-1">
                  {selectedImprovement.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <span className="material-symbols-outlined text-xs text-green-600 mt-0.5">check</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Partes Interessadas</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedImprovement.stakeholders.map((stakeholder: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {stakeholder}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Tarefas do Projeto</h5>
                <div className="space-y-2">
                  {selectedImprovement.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <span className={`material-symbols-outlined ${
                        task.completed ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`flex-1 ${task.completed ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                        {task.name}
                      </span>
                      {!task.completed && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Marcar como Concluída
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedImprovement.status !== 'Concluído' && selectedImprovement.status !== 'Cancelado' && (
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Editar Projeto
                  </button>
                )}
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Gerar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Improvement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Proposta de Melhoria</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Proposta</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Implementação de Laboratório de Robótica"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {IMPROVEMENT_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {PRIORITY_LEVELS.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva detalhadamente a proposta de melhoria"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefícios Esperados</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Liste os benefícios esperados, um por linha"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partes Interessadas</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Direção, Professores, Alunos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Conclusão Prevista</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Criar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}