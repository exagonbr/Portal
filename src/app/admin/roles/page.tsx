'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminRolesPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Permissões</h1>
          <p className="text-gray-600">Configure as funções e permissões do sistema</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Nova Função
        </button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total de Funções</div>
          <div className="text-2xl font-bold text-gray-800">8</div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-500 text-sm">Sistema</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Funções Personalizadas</div>
          <div className="text-2xl font-bold text-gray-800">3</div>
          <div className="mt-4 flex items-center">
            <span className="text-purple-500 text-sm">Customizadas</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Permissões</div>
          <div className="text-2xl font-bold text-gray-800">42</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">Ativas</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Usuários Afetados</div>
          <div className="text-2xl font-bold text-gray-800">1,543</div>
          <div className="mt-4 flex items-center">
            <span className="text-gray-500 text-sm">Total</span>
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Modificação
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
                    <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                      <span className="material-icons text-blue-600 text-sm">admin_panel_settings</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Administrador</div>
                      <div className="text-sm text-gray-500">Acesso total ao sistema</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Sistema
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  12 usuários
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  01/01/2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Ativo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button className="text-purple-600 hover:text-purple-900">Permissões</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Matriz de Permissões</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visualizar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Editar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Excluir
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">Usuários</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">Cursos</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" checked readOnly />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Details Modal (Hidden by default) */}
      <div className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Função</h3>
            <div className="mt-2 px-7 py-3">
              <input
                type="text"
                className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da Função"
              />
            </div>
            <div className="items-center px-4 py-3">
              <button className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
