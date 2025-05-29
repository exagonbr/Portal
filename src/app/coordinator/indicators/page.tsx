'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_INDICATORS = {
  academic: [
    {
      id: 1,
      name: 'Taxa de Aprovação',
      value: 94.2,
      target: 95,
      unit: '%',
      trend: 'up',
      change: '+2.1',
      period: 'Anual',
      status: 'good',
      description: 'Percentual de alunos aprovados no ano letivo'
    },
    {
      id: 2,
      name: 'Média Geral',
      value: 7.8,
      target: 8.0,
      unit: '',
      trend: 'up',
      change: '+0.3',
      period: 'Bimestral',
      status: 'warning',
      description: 'Média das notas de todos os alunos'
    },
    {
      id: 3,
      name: 'Taxa de Frequência',
      value: 96.5,
      target: 95,
      unit: '%',
      trend: 'up',
      change: '+1.2',
      period: 'Mensal',
      status: 'good',
      description: 'Percentual de presença dos alunos'
    },
    {
      id: 4,
      name: 'Taxa de Evasão',
      value: 2.1,
      target: 3.0,
      unit: '%',
      trend: 'down',
      change: '-0.8',
      period: 'Anual',
      status: 'good',
      description: 'Percentual de alunos que abandonaram os estudos'
    }
  ],
  teaching: [
    {
      id: 5,
      name: 'Satisfação dos Professores',
      value: 8.3,
      target: 8.5,
      unit: '/10',
      trend: 'up',
      change: '+0.2',
      period: 'Semestral',
      status: 'warning',
      description: 'Avaliação da satisfação do corpo docente'
    },
    {
      id: 6,
      name: 'Horas de Capacitação',
      value: 45,
      target: 40,
      unit: 'h',
      trend: 'up',
      change: '+8',
      period: 'Semestral',
      status: 'good',
      description: 'Horas de formação continuada por professor'
    },
    {
      id: 7,
      name: 'Avaliação Docente',
      value: 8.7,
      target: 8.0,
      unit: '/10',
      trend: 'stable',
      change: '0.0',
      period: 'Bimestral',
      status: 'good',
      description: 'Avaliação dos professores pelos alunos'
    }
  ],
  infrastructure: [
    {
      id: 8,
      name: 'Utilização de Laboratórios',
      value: 78,
      target: 80,
      unit: '%',
      trend: 'up',
      change: '+5',
      period: 'Mensal',
      status: 'warning',
      description: 'Percentual de uso dos laboratórios'
    },
    {
      id: 9,
      name: 'Recursos Digitais',
      value: 92,
      target: 90,
      unit: '%',
      trend: 'up',
      change: '+7',
      period: 'Mensal',
      status: 'good',
      description: 'Disponibilidade de recursos tecnológicos'
    },
    {
      id: 10,
      name: 'Manutenção Preventiva',
      value: 88,
      target: 85,
      unit: '%',
      trend: 'stable',
      change: '0.0',
      period: 'Mensal',
      status: 'good',
      description: 'Percentual de manutenções realizadas no prazo'
    }
  ]
}

const PERFORMANCE_TRENDS = [
  { month: 'Jan', academic: 92, teaching: 85, infrastructure: 88 },
  { month: 'Fev', academic: 93, teaching: 86, infrastructure: 89 },
  { month: 'Mar', academic: 94, teaching: 87, infrastructure: 90 },
  { month: 'Abr', academic: 94, teaching: 88, infrastructure: 91 },
  { month: 'Mai', academic: 95, teaching: 89, infrastructure: 92 }
]

export default function CoordinatorIndicatorsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('academic')
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [showModal, setShowModal] = useState(false)

  const getCurrentIndicators = () => {
    switch (selectedCategory) {
      case 'academic':
        return MOCK_INDICATORS.academic
      case 'teaching':
        return MOCK_INDICATORS.teaching
      case 'infrastructure':
        return MOCK_INDICATORS.infrastructure
      default:
        return MOCK_INDICATORS.academic
    }
  }

  const getOverallScore = () => {
    const allIndicators = [
      ...MOCK_INDICATORS.academic,
      ...MOCK_INDICATORS.teaching,
      ...MOCK_INDICATORS.infrastructure
    ]
    
    const totalScore = allIndicators.reduce((acc, indicator) => {
      const score = indicator.unit === '%' ? indicator.value : indicator.value * 10
      return acc + score
    }, 0)
    
    return Math.round(totalScore / allIndicators.length)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Indicadores de Qualidade</h1>
            <p className="text-gray-600">Monitore os principais indicadores da instituição</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current">Período Atual</option>
              <option value="semester">Semestre</option>
              <option value="year">Ano Letivo</option>
            </select>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span className="material-symbols-outlined">download</span>
              <span>Exportar Relatório</span>
            </button>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Índice Geral de Qualidade</h3>
              <div className="text-4xl font-bold">{getOverallScore()}%</div>
              <p className="text-blue-100 mt-2">Baseado em todos os indicadores</p>
            </div>
            <div className="text-right">
              <div className="text-green-300 flex items-center space-x-1">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="font-medium">+3.2%</span>
              </div>
              <p className="text-blue-100 text-sm">vs. período anterior</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedCategory('academic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'academic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Indicadores Acadêmicos
            </button>
            <button
              onClick={() => setSelectedCategory('teaching')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'teaching'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Corpo Docente
            </button>
            <button
              onClick={() => setSelectedCategory('infrastructure')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'infrastructure'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Infraestrutura
            </button>
          </nav>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getCurrentIndicators().map((indicator) => (
          <div key={indicator.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{indicator.name}</h3>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                indicator.status === 'good' 
                  ? 'bg-green-100 text-green-800'
                  : indicator.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {indicator.status === 'good' ? 'Bom' : 
                 indicator.status === 'warning' ? 'Atenção' : 'Crítico'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-800">
                  {indicator.value}
                </span>
                <span className="text-lg text-gray-600">{indicator.unit}</span>
                <div className={`flex items-center space-x-1 text-sm ${
                  indicator.trend === 'up' ? 'text-green-600' :
                  indicator.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {indicator.trend === 'up' ? 'trending_up' :
                     indicator.trend === 'down' ? 'trending_down' : 'trending_flat'}
                  </span>
                  <span className="font-medium">{indicator.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Meta: {indicator.target}{indicator.unit} • {indicator.period}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso da Meta</span>
                <span className="text-gray-800">
                  {Math.round((indicator.value / indicator.target) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    indicator.status === 'good' ? 'bg-green-500' :
                    indicator.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min((indicator.value / indicator.target) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Performance</h3>
        <div className="space-y-4">
          {PERFORMANCE_TRENDS.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-700 w-16">{trend.month}</div>
              
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Acadêmico</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${trend.academic}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{trend.academic}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Docente</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${trend.teaching}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{trend.teaching}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Infraestrutura</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${trend.infrastructure}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{trend.infrastructure}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Recomendadas</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
            <span className="material-symbols-outlined text-yellow-600 mt-1">warning</span>
            <div>
              <h4 className="font-medium text-gray-800">Média Geral Abaixo da Meta</h4>
              <p className="text-sm text-gray-600 mt-1">
                A média geral está em 7.8, abaixo da meta de 8.0. Considere implementar programas de reforço.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                Ver Plano de Ação →
              </button>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
            <span className="material-symbols-outlined text-blue-600 mt-1">info</span>
            <div>
              <h4 className="font-medium text-gray-800">Satisfação dos Professores</h4>
              <p className="text-sm text-gray-600 mt-1">
                Implementar mais programas de capacitação pode melhorar a satisfação docente.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                Ver Sugestões →
              </button>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
            <span className="material-symbols-outlined text-green-600 mt-1">check_circle</span>
            <div>
              <h4 className="font-medium text-gray-800">Excelente Taxa de Frequência</h4>
              <p className="text-sm text-gray-600 mt-1">
                A taxa de frequência está acima da meta. Continue com as estratégias atuais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Exportar Relatório</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Mês Atual</option>
                  <option>Bimestre Atual</option>
                  <option>Semestre Atual</option>
                  <option>Ano Letivo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorias</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Indicadores Acadêmicos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Corpo Docente</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Infraestrutura</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}