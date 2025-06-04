'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Relatório de Desempenho Acadêmico',
    type: 'Acadêmico',
    period: 'Bimestral',
    createdAt: '2024-03-15',
    status: 'Concluído',
    author: 'Coord. Maria Silva',
    description: 'Análise completa do desempenho dos alunos no 1º bimestre',
    size: '2.3 MB',
    downloads: 15,
    categories: ['Notas', 'Frequência', 'Aprovação']
  },
  {
    id: 2,
    title: 'Avaliação do Corpo Docente',
    type: 'Pedagógico',
    period: 'Semestral',
    createdAt: '2024-03-10',
    status: 'Concluído',
    author: 'Coord. João Santos',
    description: 'Relatório sobre desempenho e satisfação dos professores',
    size: '1.8 MB',
    downloads: 8,
    categories: ['Avaliação', 'Capacitação', 'Satisfação']
  },
  {
    id: 3,
    title: 'Análise de Frequência por Turma',
    type: 'Frequência',
    period: 'Mensal',
    createdAt: '2024-03-20',
    status: 'Em andamento',
    author: 'Coord. Ana Costa',
    description: 'Monitoramento da frequência dos alunos por turma',
    size: '1.2 MB',
    downloads: 3,
    categories: ['Presença', 'Faltas', 'Justificativas']
  },
  {
    id: 4,
    title: 'Relatório de Projetos Interdisciplinares',
    type: 'Projetos',
    period: 'Trimestral',
    createdAt: '2024-03-18',
    status: 'Rascunho',
    author: 'Coord. Pedro Lima',
    description: 'Avaliação dos projetos interdisciplinares desenvolvidos',
    size: '0.9 MB',
    downloads: 0,
    categories: ['Projetos', 'Interdisciplinar', 'Resultados']
  }
]

const REPORT_TEMPLATES = [
  {
    id: 1,
    name: 'Desempenho Acadêmico',
    description: 'Relatório completo de notas e aprovação',
    icon: 'assessment',
    color: 'blue',
    fields: ['Notas por disciplina', 'Taxa de aprovação', 'Comparativo histórico']
  },
  {
    id: 2,
    name: 'Frequência Escolar',
    description: 'Análise de presença e faltas dos alunos',
    icon: 'fact_check',
    color: 'green',
    fields: ['Presença por turma', 'Faltas justificadas', 'Alertas de evasão']
  },
  {
    id: 3,
    name: 'Avaliação Docente',
    description: 'Relatório sobre o corpo docente',
    icon: 'groups',
    color: 'purple',
    fields: ['Avaliação por alunos', 'Capacitações realizadas', 'Satisfação']
  },
  {
    id: 4,
    name: 'Infraestrutura',
    description: 'Relatório sobre recursos e instalações',
    icon: 'business',
    color: 'orange',
    fields: ['Uso de laboratórios', 'Recursos digitais', 'Manutenções']
  }
]

export default function CoordinatorReportsPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('reports')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const filteredReports = MOCK_REPORTS.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    return matchesStatus && matchesType
  })

  const reportTypes = Array.from(new Set(MOCK_REPORTS.map(report => report.type)))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Relatórios Acadêmicos</h1>
            <p className="text-text-secondary">Gere e gerencie relatórios da coordenação</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Novo Relatório</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Total de Relatórios</div>
            <div className="text-2xl font-bold text-text-primary">{MOCK_REPORTS.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2</span>
              <span className="text-text-tertiary text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Concluídos</div>
            <div className="text-2xl font-bold text-text-primary">
              {MOCK_REPORTS.filter(r => r.status === 'Concluído').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-text-tertiary text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Downloads</div>
            <div className="text-2xl font-bold text-text-primary">
              {MOCK_REPORTS.reduce((acc, r) => acc + r.downloads, 0)}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 8</span>
              <span className="text-text-tertiary text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-text-tertiary mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-text-primary">
              {MOCK_REPORTS.filter(r => r.status === 'Em andamento').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">→ 0</span>
              <span className="text-text-tertiary text-sm ml-2">esta semana</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border'
              }`}
            >
              Meus Relatórios
            </button>
            <button
              onClick={() => setSelectedTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border'
              }`}
            >
              Modelos de Relatório
            </button>
          </nav>
        </div>
      </div>

      {selectedTab === 'reports' && (
        <>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
            
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Reports List */}
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-background-primary rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{report.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <span>{report.period}</span>
                      <span>•</span>
                      <span>Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>Por: {report.author}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                    <p className="text-text-secondary mt-2">{report.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'Concluído' 
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'Em andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.type === 'Acadêmico' 
                        ? 'bg-blue-100 text-blue-800'
                        : report.type === 'Pedagógico'
                        ? 'bg-purple-100 text-purple-800'
                        : report.type === 'Frequência'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {report.type}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categorias:</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.categories.map((category, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {report.status === 'Concluído' && (
                      <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Download</span>
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>Visualizar</span>
                    </button>
                    {report.status !== 'Concluído' && (
                      <button className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Editar</span>
                      </button>
                    )}
                    <button className="text-orange-600 hover:text-orange-800 flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">share</span>
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORT_TEMPLATES.map((template) => (
            <div key={template.id} className="bg-background-primary rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-${template.color}-600`}>
                    {template.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">{template.name}</h3>
                  <p className="text-text-secondary text-sm">{template.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Campos inclusos:</h4>
                <div className="space-y-1">
                  {template.fields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-xs text-green-600">check</span>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedTemplate(template)}
                className={`w-full py-2 px-4 bg-${template.color}-600 text-white rounded-lg hover:bg-${template.color}-700 transition-colors`}
              >
                Usar este Modelo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Template Selection Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Criar Relatório: {selectedTemplate.name}</h3>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Relatório</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Ex: ${selectedTemplate.name} - Março 2024`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Mensal</option>
                    <option>Bimestral</option>
                    <option>Trimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Referência</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciclos/Turmas</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Ensino Fundamental I</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Ensino Fundamental II</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Ensino Médio</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campos do Relatório</label>
                <div className="space-y-2">
                  {selectedTemplate.fields.map((field: string, index: number) => (
                    <label key={index} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações adicionais para o relatório"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gerar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Relatório</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Escolha como deseja criar seu relatório:
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setSelectedTab('templates')
                  }}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-blue-600">description</span>
                    <div>
                      <div className="font-medium text-gray-600">Usar Modelo</div>
                      <div className="text-sm text-gray-600">Criar relatório baseado em um modelo</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-green-600">edit</span>
                    <div>
                      <div className="font-medium text-gray-600">Criar do Zero</div>
                      <div className="text-sm text-gray-600">Criar relatório personalizado</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}