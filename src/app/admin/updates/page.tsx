'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { useState } from 'react'

export default function AdminUpdatesPage() {
  const { user } = useAuth()
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const updates = [
    {
      id: 1,
      version: '2.1.0',
      title: 'Atualização de Segurança',
      description: 'Correções de segurança importantes e melhorias de performance',
      status: 'available',
      releaseDate: '2024-01-20',
      size: '45.2 MB',
      priority: 'high',
      changelog: [
        'Correção de vulnerabilidade de autenticação',
        'Melhoria na performance do dashboard',
        'Atualização de dependências críticas'
      ]
    },
    {
      id: 2,
      version: '2.0.5',
      title: 'Correções de Bugs',
      description: 'Correções menores e melhorias de usabilidade',
      status: 'installed',
      releaseDate: '2024-01-15',
      size: '12.8 MB',
      priority: 'medium',
      changelog: [
        'Correção no sistema de notificações',
        'Melhoria na interface de usuário',
        'Otimização de consultas ao banco de dados'
      ]
    },
    {
      id: 3,
      version: '2.0.4',
      title: 'Atualização de Recursos',
      description: 'Novos recursos e funcionalidades',
      status: 'installing',
      releaseDate: '2024-01-10',
      size: '78.5 MB',
      priority: 'low',
      changelog: [
        'Novo sistema de relatórios',
        'Integração com APIs externas',
        'Melhorias no sistema de backup'
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-green/20 text-accent-green">Disponível</span>
      case 'installed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/20 text-primary">Instalado</span>
      case 'installing':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-yellow/20 text-accent-yellow">Instalando</span>
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-600">Desconhecido</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-error/20 text-error">Alta</span>
      case 'medium':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-yellow/20 text-accent-yellow">Média</span>
      case 'low':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-600">Baixa</span>
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-600">Normal</span>
    }
  }

  const handleViewDetails = (update: any) => {
    setSelectedUpdate(update)
    setShowModal(true)
  }

  const handleInstallUpdate = (updateId: number) => {
    // Lógica para instalar atualização
    console.log('Instalando atualização:', updateId)
  }

  const handleCheckUpdates = () => {
    // Lógica para verificar novas atualizações
    console.log('Verificando atualizações...')
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Atualizações do Sistema"
        subtitle="Gerencie e instale atualizações do sistema"
      >
        <div className="space-y-6">
          {/* Header com ações */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button 
                onClick={handleCheckUpdates}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200"
              >
                Verificar Atualizações
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Configurações de Atualização
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Última verificação: 15/01/2024 às 14:30
            </div>
          </div>

          {/* Resumo das atualizações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Versão Atual</div>
              <div className="text-2xl font-bold text-primary">2.0.5</div>
              <div className="mt-4 flex items-center">
                <span className="text-accent-green text-sm">✓ Atualizado</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Atualizações Disponíveis</div>
              <div className="text-2xl font-bold text-accent-green">1</div>
              <div className="mt-4 flex items-center">
                <span className="text-error text-sm">Alta prioridade</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Em Instalação</div>
              <div className="text-2xl font-bold text-accent-yellow">1</div>
              <div className="mt-4 flex items-center">
                <span className="text-accent-yellow text-sm">Em progresso</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Última Atualização</div>
              <div className="text-2xl font-bold text-gray-600">15/01</div>
              <div className="mt-4 flex items-center">
                <span className="text-gray-500 text-sm">v2.0.5</span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Todos os Status</option>
                <option value="available">Disponível</option>
                <option value="installed">Instalado</option>
                <option value="installing">Instalando</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Todas as Prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
              <input
                type="text"
                placeholder="Pesquisar atualizações..."
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="newest">Mais Recentes</option>
                <option value="oldest">Mais Antigas</option>
                <option value="priority">Por Prioridade</option>
              </select>
            </div>
          </div>

          {/* Lista de atualizações */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Versão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Data de Lançamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tamanho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {updates.map((update) => (
                    <tr key={update.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {update.version}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <div className="font-medium">{update.title}</div>
                          <div className="text-gray-500 text-xs">{update.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(update.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(update.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(update.releaseDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(update)}
                          className="text-primary hover:text-primary/80 mr-3 transition-colors duration-200"
                        >
                          Detalhes
                        </button>
                        {update.status === 'available' && (
                          <button 
                            onClick={() => handleInstallUpdate(update.id)}
                            className="text-accent-green hover:text-accent-green/80 mr-3 transition-colors duration-200"
                          >
                            Instalar
                          </button>
                        )}
                        {update.status === 'installing' && (
                          <button className="text-accent-yellow hover:text-accent-yellow/80 transition-colors duration-200">
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de detalhes da atualização */}
          {showModal && selectedUpdate && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-700">
                      Detalhes da Atualização - {selectedUpdate.version}
                    </h3>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <p className="text-sm text-gray-900">{selectedUpdate.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Versão</label>
                        <p className="text-sm text-gray-900">{selectedUpdate.version}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedUpdate.status)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                        <div className="mt-1">{getPriorityBadge(selectedUpdate.priority)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Lançamento</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedUpdate.releaseDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                        <p className="text-sm text-gray-900">{selectedUpdate.size}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedUpdate.description}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Changelog</label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <ul className="list-disc list-inside space-y-1">
                          {selectedUpdate.changelog.map((item: string, index: number) => (
                            <li key={index} className="text-sm text-gray-900">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Fechar
                    </button>
                    {selectedUpdate.status === 'available' && (
                      <button 
                        onClick={() => {
                          handleInstallUpdate(selectedUpdate.id)
                          setShowModal(false)
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                      >
                        Instalar Atualização
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}