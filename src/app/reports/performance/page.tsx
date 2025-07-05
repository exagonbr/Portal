'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function PerformanceReportsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">Relatório de Desempenho</h1>
          <p className="text-gray-600">Análise detalhada do desempenho institucional</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Exportar Dados
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Atualizar
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="last30">Últimos 30 dias</option>
            <option value="last90">Últimos 90 dias</option>
            <option value="last180">Últimos 180 dias</option>
            <option value="year">Este ano</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Conclusão</div>
          <div className="text-2xl font-bold text-gray-600">85%</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 5%</span>
            <span className="text-gray-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Engajamento</div>
          <div className="text-2xl font-bold text-gray-600">78%</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 3%</span>
            <span className="text-gray-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Satisfação</div>
          <div className="text-2xl font-bold text-gray-600">4.5/5.0</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 0.2</span>
            <span className="text-gray-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Retenção</div>
          <div className="text-2xl font-bold text-gray-600">92%</div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-500 text-sm">=</span>
            <span className="text-gray-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Tendência de Desempenho</h3>
          <div className="h-64 bg-gray-50 rounded-lg">
            {/* Placeholder for line chart */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Gráfico de Tendência
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Distribuição por Área</h3>
          <div className="h-64 bg-gray-50 rounded-lg">
            {/* Placeholder for pie chart */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Gráfico de Distribuição
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">Taxa de Aprovação</div>
                  <div className="text-sm text-gray-500">Geral</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">85%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">80%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +5%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  85%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Atingida
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Recomendações</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span className="text-sm text-blue-800">
              Aumentar o foco em atividades práticas para melhorar o engajamento dos alunos
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span className="text-sm text-blue-800">
              Implementar programa de mentoria para alunos com baixo desempenho
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span className="text-sm text-blue-800">
              Revisar material didático das disciplinas com menor taxa de aprovação
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
