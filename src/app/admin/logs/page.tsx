'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function AdminLogsPage() {
  const { user } = useAuth()

  const headerActions = (
    <div className="flex space-x-4">
      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
        Exportar Logs
      </button>
      <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200">
        Limpar Logs
      </button>
    </div>
  )

  return (
    <DashboardPageLayout
      title="Logs do Sistema"
      subtitle="Visualize e analise os logs do sistema"
      actions={headerActions}
    >
          <div className="space-y-6">

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">Todos os Níveis</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">Todas as Categorias</option>
                  <option value="auth">Autenticação</option>
                  <option value="system">Sistema</option>
                  <option value="user">Usuário</option>
                  <option value="api">API</option>
                </select>
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Pesquisar logs..."
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                </select>
              </div>
            </div>

            {/* Resumo dos logs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total de Logs</div>
                <div className="text-2xl font-bold text-gray-600">12,458</div>
                <div className="mt-4 flex items-center">
                  <span className="text-accent-green text-sm">↑ 234</span>
                  <span className="text-gray-500 text-sm ml-2">hoje</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Erros</div>
                <div className="text-2xl font-bold text-error">23</div>
                <div className="mt-4 flex items-center">
                  <span className="text-error text-sm">↑ 5</span>
                  <span className="text-gray-500 text-sm ml-2">hoje</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Warnings</div>
                <div className="text-2xl font-bold text-accent-yellow">45</div>
                <div className="mt-4 flex items-center">
                  <span className="text-accent-yellow text-sm">↑ 12</span>
                  <span className="text-gray-500 text-sm ml-2">hoje</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Tamanho dos Logs</div>
                <div className="text-2xl font-bold text-gray-600">2.4GB</div>
                <div className="mt-4 flex items-center">
                  <span className="text-primary text-sm">+156MB</span>
                  <span className="text-gray-500 text-sm ml-2">hoje</span>
                </div>
              </div>
            </div>

            {/* Tabela de logs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Mensagem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2024-01-15 14:23:45
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-error/20 text-error">
                          Error
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Authentication
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Failed login attempt: Invalid credentials
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        192.168.1.1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        anonymous
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary hover:text-primary/80 mr-3 transition-colors duration-200">Detalhes</button>
                        <button className="text-error hover:text-error/80 transition-colors duration-200">Excluir</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2024-01-15 14:22:30
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-green/20 text-accent-green">
                          Info
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        System
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        System backup completed successfully
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        127.0.0.1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        system
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary hover:text-primary/80 mr-3 transition-colors duration-200">Detalhes</button>
                        <button className="text-error hover:text-error/80 transition-colors duration-200">Excluir</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
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
                        <span className="font-medium">12,458</span> resultados
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

            {/* Modal de detalhes do log (oculto por padrão) */}
            <div className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-700 mb-4">Detalhes do Log</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify({
                        timestamp: '2024-01-15 14:23:45',
                        level: 'ERROR',
                        category: 'Authentication',
                        message: 'Failed login attempt: Invalid credentials',
                        ip: '192.168.1.1',
                        user: 'anonymous',
                        userAgent: 'Mozilla/5.0...',
                        stackTrace: '...',
                        context: {
                          requestId: '123456',
                          sessionId: 'abcdef'
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </DashboardPageLayout>
  )
}
