'use client'

import React, { useState } from 'react'
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Server,
  Database,
  HardDrive,
  Cpu,
  RefreshCw,
  Play,
  Pause,
  Square,
  Settings,
  Calendar,
  Bell
} from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

interface MaintenanceTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: string
  lastRun?: string
  nextScheduled?: string
}

export default function MaintenancePage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      title: 'Limpeza de Cache',
      description: 'Limpar cache do sistema e arquivos temporários',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '5 min',
      lastRun: '2024-01-14 02:00',
      nextScheduled: '2024-01-16 02:00'
    },
    {
      id: '2',
      title: 'Backup do Banco de Dados',
      description: 'Realizar backup completo do banco de dados',
      status: 'completed',
      priority: 'high',
      estimatedTime: '30 min',
      lastRun: '2024-01-15 01:00',
      nextScheduled: '2024-01-16 01:00'
    },
    {
      id: '3',
      title: 'Otimização de Índices',
      description: 'Otimizar índices do banco de dados para melhor performance',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '15 min',
      lastRun: '2024-01-13 03:00',
      nextScheduled: '2024-01-17 03:00'
    },
    {
      id: '4',
      title: 'Verificação de Segurança',
      description: 'Executar verificação de vulnerabilidades e atualizações de segurança',
      status: 'running',
      priority: 'critical',
      estimatedTime: '45 min',
      lastRun: '2024-01-15 14:30'
    },
    {
      id: '5',
      title: 'Limpeza de Logs Antigos',
      description: 'Remover logs antigos para liberar espaço em disco',
      status: 'pending',
      priority: 'low',
      estimatedTime: '10 min',
      lastRun: '2024-01-10 04:00',
      nextScheduled: '2024-01-20 04:00'
    }
  ])

  const runTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'running' as const }
        : task
    ))
    
    // Simular execução da tarefa
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, lastRun: new Date().toLocaleString('pt-BR') }
          : task
      ))
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <DashboardPageLayout
      title="Manutenção do Sistema"
      description="Gerenciar tarefas de manutenção e monitoramento do sistema"
    >
      <div className="space-y-6">
        {/* Status do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Sistema
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Funcionando normalmente
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Ativo</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Banco de Dados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Conectado e responsivo
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <HardDrive className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600">78%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Armazenamento
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              234 GB disponíveis
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Cpu className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">45%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              CPU
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uso normal
            </p>
          </div>
        </div>

        {/* Modo de Manutenção */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Modo de Manutenção
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isMaintenanceMode 
                    ? 'Sistema em modo de manutenção - usuários não podem acessar'
                    : 'Sistema disponível para todos os usuários'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isMaintenanceMode 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {isMaintenanceMode ? 'Ativo' : 'Inativo'}
              </span>
              <button
                onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMaintenanceMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isMaintenanceMode ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>

        {/* Tarefas de Manutenção */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tarefas de Manutenção
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurar Agendamento
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'critical' ? 'Crítica' :
                       task.priority === 'high' ? 'Alta' :
                       task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => runTask(task.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Executar
                      </button>
                    )}
                    {task.status === 'running' && (
                      <button
                        disabled
                        className="px-3 py-1 bg-gray-400 text-white rounded text-sm cursor-not-allowed flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Executando
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Duração estimada: {task.estimatedTime}</span>
                  </div>
                  {task.lastRun && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Última execução: {task.lastRun}</span>
                    </div>
                  )}
                  {task.nextScheduled && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Próxima execução: {task.nextScheduled}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Ações Rápidas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">Reiniciar Serviços</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reiniciar todos os serviços do sistema
              </p>
            </button>

            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">Backup Manual</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Executar backup imediato
              </p>
            </button>

            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Limpar Cache</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Limpar cache e arquivos temporários
              </p>
            </button>

            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900 dark:text-white">Notificar Usuários</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enviar notificação de manutenção
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
} 