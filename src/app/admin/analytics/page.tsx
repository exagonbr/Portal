'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminAnalyticsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics do Sistema</h1>
          <p className="text-gray-600">Monitoramento e estatísticas em tempo real</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Exportar Dados
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
            Atualizar
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
            <option value="realtime">Tempo Real</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <input
              type="date"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <input
              type="date"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
            <option value="all">Todas Instituições</option>
            <option value="inst1">Instituição 1</option>
            <option value="inst2">Instituição 2</option>
          </select>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Usuários Online</div>
          <div className="text-2xl font-bold text-gray-800">1,234</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-green text-sm">↑ 12%</span>
            <span className="text-gray-500 text-sm ml-2">vs. média</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Aulas em Andamento</div>
          <div className="text-2xl font-bold text-gray-800">45</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-blue text-sm">= Estável</span>
            <span className="text-gray-500 text-sm ml-2">vs. média</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Carga do Sistema</div>
          <div className="text-2xl font-bold text-gray-800">68%</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-yellow text-sm">↑ 5%</span>
            <span className="text-gray-500 text-sm ml-2">vs. média</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Tempo de Resposta</div>
          <div className="text-2xl font-bold text-gray-800">245ms</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-green text-sm">↓ 12ms</span>
            <span className="text-gray-500 text-sm ml-2">vs. média</span>
          </div>
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso do Sistema</h3>
          <div className="h-80 bg-gray-50 rounded-lg">
            {/* Placeholder for line chart */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Gráfico de Uso
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Recursos</h3>
          <div className="h-80 bg-gray-50 rounded-lg">
            {/* Placeholder for pie chart */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Gráfico de Distribuição
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU</span>
                <span className="text-gray-800">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent-green h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memória</span>
                <span className="text-gray-800">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent-yellow h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Disco</span>
                <span className="text-gray-800">32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Rede</span>
                <span className="text-gray-800">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-error h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos do Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="h-2 w-2 bg-accent-green rounded-full"></span>
              <span className="text-sm text-gray-600">Sistema iniciado com sucesso</span>
              <span className="text-xs text-gray-500">2min atrás</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="h-2 w-2 bg-accent-yellow rounded-full"></span>
              <span className="text-sm text-gray-600">Alto uso de memória detectado</span>
              <span className="text-xs text-gray-500">5min atrás</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="h-2 w-2 bg-error rounded-full"></span>
              <span className="text-sm text-gray-600">Falha na sincronização de dados</span>
              <span className="text-xs text-gray-500">15min atrás</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="h-2 w-2 bg-primary rounded-full"></span>
              <span className="text-sm text-gray-600">Backup automático concluído</span>
              <span className="text-xs text-gray-500">1h atrás</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sessões Ativas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">João Silva</div>
                      <div className="text-sm text-gray-500">Professor</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  São Paulo, BR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Chrome / Windows
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  45min
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-green/20 text-accent-green">
                    Ativo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
