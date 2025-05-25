'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminInstitutionsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Instituições</h1>
          <p className="text-gray-600">Gerencie as instituições de ensino cadastradas</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Importar Dados
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Nova Instituição
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total de Instituições</div>
          <div className="text-2xl font-bold text-gray-800">24</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 2</span>
            <span className="text-gray-500 text-sm ml-2">este mês</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Alunos Ativos</div>
          <div className="text-2xl font-bold text-gray-800">12,458</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 8%</span>
            <span className="text-gray-500 text-sm ml-2">este mês</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Professores</div>
          <div className="text-2xl font-bold text-gray-800">845</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 12</span>
            <span className="text-gray-500 text-sm ml-2">este mês</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Cursos Ativos</div>
          <div className="text-2xl font-bold text-gray-800">156</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">↑ 5</span>
            <span className="text-gray-500 text-sm ml-2">este mês</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Pesquisar instituições..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tipo</option>
            <option value="university">Universidade</option>
            <option value="school">Escola</option>
            <option value="training">Centro de Treinamento</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Status</option>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
            <option value="pending">Pendente</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Ordenar por</option>
            <option value="name">Nome</option>
            <option value="students">Alunos</option>
            <option value="date">Data de Cadastro</option>
          </select>
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Institution Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-32 bg-gray-200"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Universidade ABC</h3>
                <p className="text-sm text-gray-600">São Paulo, SP</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Ativa
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Alunos</span>
                <span className="font-medium">2,345</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Professores</span>
                <span className="font-medium">145</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cursos</span>
                <span className="font-medium">28</span>
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
        </div>

        {/* Another Institution Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-32 bg-gray-200"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Colégio XYZ</h3>
                <p className="text-sm text-gray-600">Rio de Janeiro, RJ</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Ativa
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Alunos</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Professores</span>
                <span className="font-medium">78</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cursos</span>
                <span className="font-medium">15</span>
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
        </div>

        {/* Add New Institution Card */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer">
          <span className="material-icons text-4xl mb-2">add_business</span>
          <span className="text-sm font-medium">Adicionar Nova Instituição</span>
        </div>
      </div>

      {/* Pagination */}
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
              <span className="font-medium">9</span> de{' '}
              <span className="font-medium">24</span> instituições
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
  )
}
