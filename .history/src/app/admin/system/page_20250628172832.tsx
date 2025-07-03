'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

// Tipagem para as informações do sistema
interface SystemInfo {
  version: string;
  buildDate: string;
  environment: string;
  uptime: string;
  lastRestart: string;
  database: {
    type: string;
    version: string;
    size: string;
    connections: number;
    maxConnections: number;
  };
  server: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  services: {
    name: string;
    status: 'online' | 'warning' | 'offline';
    uptime: string;
    lastCheck: string;
  }[];
}

// Tipagem para as atividades recentes
interface Activity {
  id: number;
  type: 'system' | 'security' | 'backup' | 'update' | 'error';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}


export default function AdminSystemPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('services')
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [infoRes, activitiesRes] = await Promise.all([
          fetch('/api/admin/system/info'),
          fetch('/api/admin/system/activities')
        ])
        const infoData = await infoRes.json()
        const activitiesData = await activitiesRes.json()
        setSystemInfo(infoData)
        setActivities(activitiesData)
      } catch (error) {
        console.error("Failed to fetch system data:", error)
        // Adicionar tratamento de erro para o usuário, se necessário
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Carregando informações do sistema...</div>
      </div>
    )
  }

  if (!systemInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-red-500">Falha ao carregar as informações do sistema.</div>
      </div>
    )
  }

    return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema</h1>
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
            <div className="text-sm text-gray-600 mt-1">Uptime: {systemInfo.uptime}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">CPU</div>
            <div className="text-2xl font-bold text-gray-600">{systemInfo.server.cpu}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${systemInfo.server.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Memória</div>
            <div className="text-2xl font-bold text-gray-600">{systemInfo.server.memory}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${systemInfo.server.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Disco</div>
            <div className="text-2xl font-bold text-gray-600">{systemInfo.server.disk}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${systemInfo.server.disk}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
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

      {/* General System Summary - Always Visible */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Informações do Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Versão:</span>
                <span className="font-medium">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build:</span>
                <span className="font-medium">{systemInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ambiente:</span>
                <span className="font-medium">{systemInfo.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último Restart:</span>
                <span className="font-medium">{systemInfo.lastRestart}</span>
              </div>
            </div>
          </div>

          {/* Database Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Base de Dados</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{systemInfo.database.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Versão:</span>
                <span className="font-medium">{systemInfo.database.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamanho:</span>
                <span className="font-medium">{systemInfo.database.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conexões:</span>
                <span className="font-medium">{systemInfo.database.connections}/{systemInfo.database.maxConnections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                {systemInfo.services.map((service, index) => (
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
            {activities.map((activity) => (
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