'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function InstitutionClassesPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Turmas</h1>
          <p className="text-gray-600">Gerencie as turmas e suas configurações</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Importar Lista
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Nova Turma
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Total de Turmas</div>
          <div className="text-2xl font-bold text-gray-800">24</div>
          <div className="text-xs text-green-600 mt-2">↑ 2 este mês</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Média de Alunos</div>
          <div className="text-2xl font-bold text-gray-800">35</div>
          <div className="text-xs text-blue-600 mt-2">= Estável</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Desempenho Médio</div>
          <div className="text-2xl font-bold text-gray-800">7.9</div>
          <div className="text-xs text-green-600 mt-2">↑ 0.2 este mês</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Aprovação</div>
          <div className="text-2xl font-bold text-gray-800">88%</div>
          <div className="text-xs text-green-600 mt-2">↑ 3% este mês</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Pesquisar turmas..."
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Período</option>
          <option value="morning">Manhã</option>
          <option value="afternoon">Tarde</option>
          <option value="night">Noite</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Ordenar por</option>
          <option value="name">Nome</option>
          <option value="students">Alunos</option>
          <option value="performance">Desempenho</option>
        </select>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Class Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Turma A</h3>
              <p className="text-sm text-gray-600">Período: Manhã</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Ativa
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Professor</span>
              <span className="text-sm font-medium">João Silva</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Alunos</span>
              <span className="text-sm font-medium">32/35</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Média da Turma</span>
              <span className="text-sm font-medium">8.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Frequência</span>
              <span className="text-sm font-medium">94%</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Gerenciar
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                <span className="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Another Class Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Turma B</h3>
              <p className="text-sm text-gray-600">Período: Tarde</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Ativa
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Professor</span>
              <span className="text-sm font-medium">Maria Oliveira</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Alunos</span>
              <span className="text-sm font-medium">28/35</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Média da Turma</span>
              <span className="text-sm font-medium">7.8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Frequência</span>
              <span className="text-sm font-medium">92%</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Gerenciar
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                <span className="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add New Class Card */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer">
          <span className="material-icons text-4xl mb-2">add_circle_outline</span>
          <span className="text-sm font-medium">Adicionar Nova Turma</span>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
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
              <span className="font-medium">9</span> de{' '}
              <span className="font-medium">24</span> turmas
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
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Próximo
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
