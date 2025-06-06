'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

export default function AdminMonitoringPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  })

  // Simular métricas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-error'
    if (value > 60) return 'text-accent-yellow'
    return 'text-accent-green'
  }

  const getStatusBg = (value: number) => {
    if (value > 80) return 'bg-error/20'
    if (value > 60) return 'bg-accent-yellow/20'
    return 'bg-accent-green/20'
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardPageLayout
          title="Monitoramento do Sistema"
          subtitle="Monitore a performance e status em tempo real"
        >
          <div className="space-y-6">
            {/* Status Geral */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">CPU</div>
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.cpu)}`}>
                      {metrics.cpu}%
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${getStatusBg(metrics.cpu)}`}>
                    <span className="material-symbols-outlined text-lg">memory</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metrics.cpu > 80 ? 'bg-error' : 
                        metrics.cpu > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                      }`}
                      style={{ width: `${metrics.cpu}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Memória</div>
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.memory)}`}>
                      {metrics.memory}%
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${getStatusBg(metrics.memory)}`}>
                    <span className="material-symbols-outlined text-lg">storage</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metrics.memory > 80 ? 'bg-error' : 
                        metrics.memory > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                      }`}
                      style={{ width: `${metrics.memory}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Disco</div>
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.disk)}`}>
                      {metrics.disk}%
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${getStatusBg(metrics.disk)}`}>
                    <span className="material-symbols-outlined text-lg">hard_drive_2</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metrics.disk > 80 ? 'bg-error' : 
                        metrics.disk > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                      }`}
                      style={{ width: `${metrics.disk}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Rede</div>
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.network)}`}>
                      {metrics.network}%
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${getStatusBg(metrics.network)}`}>
                    <span className="material-symbols-outlined text-lg">network_check</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metrics.network > 80 ? 'bg-error' : 
                        metrics.network > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                      }`}
                      style={{ width: `${metrics.network}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Status dos Serviços</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Servidor Web', status: 'online', uptime: '15 dias' },
                    { name: 'Banco de Dados', status: 'online', uptime: '22 dias' },
                    { name: 'Redis Cache', status: 'online', uptime: '8 dias' },
                    { name: 'Email Service', status: 'warning', uptime: '2 horas' },
                    { name: 'Storage S3', status: 'online', uptime: '45 dias' },
                    { name: 'CDN', status: 'offline', uptime: '0 min' }
                  ].map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-700">{service.name}</h4>
                        <span className={`
                          px-2 py-1 text-xs font-semibold rounded-full
                          ${service.status === 'online' ? 'bg-accent-green/20 text-accent-green' :
                            service.status === 'warning' ? 'bg-accent-yellow/20 text-accent-yellow' :
                            'bg-error/20 text-error'}
                        `}>
                          {service.status === 'online' ? 'Online' :
                           service.status === 'warning' ? 'Aviso' : 'Offline'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Uptime: {service.uptime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logs Recentes */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-600">Logs Recentes</h3>
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  Ver todos
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { time: '14:35', type: 'info', message: 'Sistema iniciado com sucesso' },
                    { time: '14:32', type: 'warning', message: 'Uso de memória alto detectado' },
                    { time: '14:28', type: 'error', message: 'Falha na conexão com serviço externo' },
                    { time: '14:25', type: 'info', message: 'Backup automático realizado' },
                    { time: '14:20', type: 'info', message: 'Usuário admin logou no sistema' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center space-x-3 py-2">
                      <div className="text-xs text-gray-500 w-12">{log.time}</div>
                      <div className={`
                        w-2 h-2 rounded-full
                        ${log.type === 'info' ? 'bg-accent-blue' :
                          log.type === 'warning' ? 'bg-accent-yellow' :
                          'bg-error'}
                      `} />
                      <div className="text-sm text-gray-700 flex-1">{log.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alertas Ativos */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Alertas Ativos</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="border-l-4 border-error bg-error/10 p-4 rounded">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-error mr-2">error</span>
                      <div>
                        <div className="font-medium text-error">Disco quase cheio</div>
                        <div className="text-sm text-gray-600">Partição /var está com 89% de uso</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-accent-yellow bg-accent-yellow/10 p-4 rounded">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-accent-yellow mr-2">warning</span>
                      <div>
                        <div className="font-medium text-accent-yellow">Alto uso de CPU</div>
                        <div className="text-sm text-gray-600">CPU está acima de 80% por mais de 5 minutos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardPageLayout>
    </ProtectedRoute>
  )
}