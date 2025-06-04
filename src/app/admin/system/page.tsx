'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const SYSTEM_INFO = {
  version: '2.1.4',
  buildDate: '2024-03-20',
  environment: 'Production',
  uptime: '15 dias, 8 horas',
  lastRestart: '2024-03-05 14:30:00',
  database: {
    type: 'PostgreSQL',
    version: '15.2',
    size: '2.8 GB',
    connections: 45,
    maxConnections: 100
  },
  server: {
    cpu: 35,
    memory: 68,
    disk: 42,
    network: 15
  },
  services: [
    { name: 'API Gateway', status: 'online', uptime: '99.9%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Database', status: 'online', uptime: '99.8%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'File Storage', status: 'online', uptime: '99.7%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Email Service', status: 'warning', uptime: '98.5%', lastCheck: '2024-03-20 11:44:00' },
    { name: 'Backup Service', status: 'online', uptime: '99.9%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Cache Redis', status: 'online', uptime: '99.6%', lastCheck: '2024-03-20 11:45:00' }
  ]
}

const RECENT_ACTIVITIES = [
  { id: 1, type: 'system', message: 'Sistema reiniciado para manutenção', timestamp: '2024-03-20 10:30:00', severity: 'info' },
  { id: 2, type: 'security', message: 'Tentativa de acesso não autorizado bloqueada', timestamp: '2024-03-20 09:15:00', severity: 'warning' },
  { id: 3, type: 'backup', message: 'Backup automático concluído com sucesso', timestamp: '2024-03-20 02:00:00', severity: 'success' },
  { id: 4, type: 'update', message: 'Atualização de segurança aplicada', timestamp: '2024-03-19 18:45:00', severity: 'info' },
  { id: 5, type: 'error', message: 'Erro temporário no serviço de email', timestamp: '2024-03-19 14:20:00', severity: 'error' }
]

export default function AdminSystemPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Sistema</h1>
            <p className="text-gray-600">Monitoramento e configuração do sistema</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowMaintenanceModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              <span className="material-symbols-outlined">build</span>
              <span>Manutenção</span>
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <span className="material-symbols-outlined">refresh</span>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Status do Sistema</div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-gray-600">Online</div>
            <div className="text-sm text-gray-600 mt-1">Uptime: {SYSTEM_INFO.uptime}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">CPU</div>
            <div className="text-2xl font-bold text-gray-600">{SYSTEM_INFO.server.cpu}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${SYSTEM_INFO.server.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Memória</div>
            <div className="text-2xl font-bold text-gray-600">{SYSTEM_INFO.server.memory}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${SYSTEM_INFO.server.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Disco</div>
            <div className="text-2xl font-bold text-gray-600">{SYSTEM_INFO.server.disk}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${SYSTEM_INFO.server.disk}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedTab('services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Serviços
            </button>
            <button
              onClick={() => setSelectedTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Atividades Recentes
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Informações do Sistema</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versão:</span>
                  <span className="font-medium">{SYSTEM_INFO.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build:</span>
                  <span className="font-medium">{SYSTEM_INFO.buildDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ambiente:</span>
                  <span className="font-medium">{SYSTEM_INFO.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Último Restart:</span>
                  <span className="font-medium">{SYSTEM_INFO.lastRestart}</span>
                </div>
              </div>
            </div>

            {/* Database Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Base de Dados</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{SYSTEM_INFO.database.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versão:</span>
                  <span className="font-medium">{SYSTEM_INFO.database.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamanho:</span>
                  <span className="font-medium">{SYSTEM_INFO.database.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conexões:</span>
                  <span className="font-medium">{SYSTEM_INFO.database.connections}/{SYSTEM_INFO.database.maxConnections}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {selectedTab === 'services' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Serviço</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Uptime</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Última Verificação</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEM_INFO.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-600">{service.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.status === 'online' 
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status === 'online' ? 'Online' : 
                         service.status === 'warning' ? 'Atenção' : 'Offline'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{service.uptime}</td>
                    <td className="py-4 px-6 text-gray-600">{service.lastCheck}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <span className="material-symbols-outlined text-sm">refresh</span>
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <span className="material-symbols-outlined text-sm">stop</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {selectedTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.severity === 'success' ? 'bg-green-100' :
                  activity.severity === 'warning' ? 'bg-yellow-100' :
                  activity.severity === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <span className={`material-symbols-outlined text-sm ${
                    activity.severity === 'success' ? 'text-green-600' :
                    activity.severity === 'warning' ? 'text-yellow-600' :
                    activity.severity === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {activity.type === 'system' ? 'computer' :
                     activity.type === 'security' ? 'security' :
                     activity.type === 'backup' ? 'backup' :
                     activity.type === 'update' ? 'update' : 'error'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">{activity.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.severity === 'success' ? 'bg-green-100 text-green-800' :
                  activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  activity.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modo de Manutenção</h3>
              <button 
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Ativar o modo de manutenção impedirá que usuários acessem o sistema.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem para usuários</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Sistema em manutenção. Voltaremos em breve."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração estimada</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>30 minutos</option>
                  <option>1 hora</option>
                  <option>2 horas</option>
                  <option>4 horas</option>
                  <option>Indefinido</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  Ativar Manutenção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}