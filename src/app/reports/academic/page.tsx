'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AcademicReportsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">Relatórios Acadêmicos</h1>
          <p className="text-gray-600">Análise detalhada do desempenho acadêmico</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Exportar PDF
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Período Letivo</option>
            <option value="2024-1">2024.1</option>
            <option value="2023-2">2023.2</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Departamento</option>
            <option value="math">Matemática</option>
            <option value="science">Ciências</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Curso</option>
            <option value="calc">Cálculo I</option>
            <option value="physics">Física I</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Turma</option>
            <option value="a">Turma A</option>
            <option value="b">Turma B</option>
          </select>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Média Geral</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Placeholder for circular progress chart */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">7.8</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Aumento de 0.3 pontos em relação ao período anterior
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Distribuição de Notas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>9-10</span>
                <span>15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>7-8.9</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>5-6.9</span>
                <span>30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>0-4.9</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Indicadores Chave</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Aprovação</span>
              <span className="text-sm font-medium text-green-600">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Frequência</span>
              <span className="text-sm font-medium text-blue-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Atividades Entregues</span>
              <span className="text-sm font-medium text-purple-600">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Participação em Aula</span>
              <span className="text-sm font-medium text-orange-600">65%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aprovação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">Cálculo I</div>
                  <div className="text-sm text-gray-500">MAT101</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">João Silva</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">8.2</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">88%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">94%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary hover:text-primary/80 px-3 py-1 rounded transition-colors">Detalhes</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
