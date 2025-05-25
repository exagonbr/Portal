'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AttendanceReportsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatório de Frequência</h1>
          <p className="text-gray-600">Acompanhamento detalhado da frequência dos alunos</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Exportar Relatório
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Registrar Frequência
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecionar Curso</option>
            <option value="math">Matemática</option>
            <option value="physics">Física</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecionar Turma</option>
            <option value="a">Turma A</option>
            <option value="b">Turma B</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Status</option>
            <option value="present">Presente</option>
            <option value="absent">Ausente</option>
            <option value="late">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Presença</div>
          <div className="text-2xl font-bold text-gray-800">92%</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 2%</span>
            <span className="text-gray-500 text-sm ml-2">vs. mês anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Faltas</div>
          <div className="text-2xl font-bold text-gray-800">8%</div>
          <div className="mt-4 flex items-center">
            <span className="text-red-500 text-sm">↓ 2%</span>
            <span className="text-gray-500 text-sm ml-2">vs. mês anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Atrasos</div>
          <div className="text-2xl font-bold text-gray-800">5%</div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-500 text-sm">=</span>
            <span className="text-gray-500 text-sm ml-2">vs. mês anterior</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Alunos em Risco</div>
          <div className="text-2xl font-bold text-red-600">12</div>
          <div className="mt-4 flex items-center">
            <span className="text-red-500 text-sm">↑ 2</span>
            <span className="text-gray-500 text-sm ml-2">vs. mês anterior</span>
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendário de Frequência</h3>
        <div className="grid grid-cols-7 gap-4">
          {/* Calendar Header */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
          {/* Calendar Days */}
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm
                ${i % 3 === 0 ? 'bg-green-100 text-green-800' : 
                  i % 7 === 0 ? 'bg-red-100 text-red-800' : 
                  'bg-gray-50 text-gray-600'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presença
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faltas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atrasos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">João Silva</div>
                      <div className="text-sm text-gray-500">Turma A</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024001
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-600">95%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-red-600">3</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-yellow-600">2</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Regular
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Detalhes</button>
                  <button className="text-purple-600 hover:text-purple-900">Justificar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Anterior
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a{' '}
                  <span className="font-medium">10</span> de{' '}
                  <span className="font-medium">50</span> alunos
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
