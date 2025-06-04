'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MONITORING_DATA = {
  realTime: {
    activeUsers: 1247,
    activeTeachers: 89,
    activeStudents: 1158,
    systemLoad: 68,
    responseTime: 245,
    errorRate: 0.02
  },
  alerts: [
    {
      id: 1,
      type: 'warning',
      title: 'Alto uso de CPU',
      message: 'CPU acima de 80% nos últimos 10 minutos',
      timestamp: '2024-03-20 11:45:00',
      severity: 'medium',
      status: 'active'
    },
    {
      id: 2,
      type: 'error',
      title: 'Falha no serviço de email',
      message: 'Serviço de email indisponível há 5 minutos',
      timestamp: '2024-03-20 11:40:00',
      severity: 'high',
      status: 'active'
    },
    {
      id: 3,
      type: 'info',
      title: 'Backup concluído',
      message: 'Backup automático realizado com sucesso',
      timestamp: '2024-03-20 02:00:00',
      severity: 'low',
      status: 'resolved'
    }
  ],
  performance: [
    { time: '11:00', cpu: 45, memory: 62, disk: 38, network: 12 },
    { time: '11:15', cpu: 52, memory: 65, disk: 40, network: 18 },
    { time: '11:30', cpu: 68, memory: 70, disk: 42, network: 25 },
    { time: '11:45', cpu: 82, memory: 75, disk: 45, network: 32 }
  ],
  services: [
    { name: 'Web Server', status: 'healthy', responseTime: 120, uptime: 99.9 },
    { name: 'Database', status: 'healthy', responseTime: 45, uptime: 99.8 },
    { name: 'API Gateway', status: 'healthy', responseTime: 89, uptime: 99.7 },
    { name: 'File Storage', status: 'warning', responseTime: 340, uptime: 98.5 },
    { name: 'Email Service', status: 'critical', responseTime: 0, uptime: 95.2 },
    { name: 'Cache Redis', status: 'healthy', responseTime: 15, uptime: 99.9 }
  ]
}

export default function AdminMonitoringPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState('1h')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Monitoramento</h1>
            <p className="text-gray-600">Monitoramento em tempo real do sistema</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15m">Últimos 15 min</option>
              <option value="1h">Última hora</option>
              <option value="6h">Últimas 6 horas</option>
              <option value="24h">Últimas 24 horas</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <span className="material-symbols-outlined">refresh</span>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Usuários Ativos</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.activeUsers.toLocaleString()}</div>
            <div className="mt-2 flex items-center">
              <span className="text-green-500 text-sm">↑ 12%</span>
              <span className="text-gray-500 text-sm ml-2">vs. ontem</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Professores</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.activeTeachers}</div>
            <div className="mt-2 flex items-center">
              <span className="text-green-500 text-sm">↑ 5%</span>
              <span className="text-gray-500 text-sm ml-2">vs. ontem</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Estudantes</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.activeStudents.toLocaleString()}</div>
            <div className="mt-2 flex items-center">
              <span className="text-green-500 text-sm">↑ 8%</span>
              <span className="text-gray-500 text-sm ml-2">vs. ontem</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Carga do Sistema</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.systemLoad}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${MONITORING_DATA.realTime.systemLoad}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Tempo de Resposta</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.responseTime}ms</div>
            <div className="mt-2 flex items-center">
              <span className="text-red-500 text-sm">↑ 15ms</span>
              <span className="text-gray-500 text-sm ml-2">vs. média</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Erro</div>
            <div className="text-2xl font-bold text-gray-600">{MONITORING_DATA.realTime.errorRate}%</div>
            <div className="mt-2 flex items-center">
              <span className="text-green-500 text-sm">↓ 0.01%</span>
              <span className="text-gray-500 text-sm ml-2">vs. ontem</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alertas
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
          </nav>
        </div>
      </div>

      {/* Dashboard Tab */}
      {selectedTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Performance do Sistema</h3>
            <div className="space-y-4">
              {MONITORING_DATA.performance.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-700 w-16">{data.time}</div>
                  
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">CPU</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.cpu > 80 ? 'bg-red-500' : 
                              data.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${data.cpu}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{data.cpu}%</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Memória</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.memory > 80 ? 'bg-red-500' : 
                              data.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${data.memory}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{data.memory}%</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Disco</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${data.disk}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{data.disk}%</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Rede</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${data.network}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{data.network}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          {MONITORING_DATA.alerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              alert.severity === 'high' ? 'border-red-500' :
              alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {alert.type === 'error' ? 'error' :
                       alert.type === 'warning' ? 'warning' : 'info'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-600">{alert.title}</h4>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-2">{alert.timestamp}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity === 'high' ? 'Alta' :
                     alert.severity === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.status === 'active' ? 'Ativo' : 'Resolvido'}
                  </span>
                  
                  {alert.status === 'active' && (
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Tempo de Resposta</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Uptime</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {MONITORING_DATA.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-600">{service.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.status === 'healthy' 
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status === 'healthy' ? 'Saudável' : 
                         service.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${
                        service.responseTime > 300 ? 'text-red-600' :
                        service.responseTime > 200 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${
                        service.uptime < 98 ? 'text-red-600' :
                        service.uptime < 99 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {service.uptime}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <span className="material-symbols-outlined text-sm">refresh</span>
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
    </div>
  )
}