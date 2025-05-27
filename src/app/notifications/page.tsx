'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import { useNotifications, type NotificationFilters, type Notification } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const {
    notifications,
    loading,
    error,
    unreadCount,
    totalCount,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotifications,
    getFilteredNotifications
  } = useNotifications()

  const [filteredNotifications, setFilteredNotifications] = useState(notifications)
  const [filters, setFilters] = useState<NotificationFilters>({
    category: 'all',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const itemsPerPage = 10

  // Aplicar filtros
  useEffect(() => {
    const filtered = getFilteredNotifications(filters, searchTerm)
    setFilteredNotifications(filtered)
    setCurrentPage(1)
  }, [filters, searchTerm, notifications, getFilteredNotifications])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'info'
      case 'warning':
        return 'warning'
      case 'success':
        return 'check_circle'
      case 'error':
        return 'error'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-600 bg-blue-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic':
        return 'Acadêmico'
      case 'system':
        return 'Sistema'
      case 'social':
        return 'Social'
      case 'administrative':
        return 'Administrativo'
      default:
        return 'Geral'
    }
  }

  const markSelectedAsRead = () => {
    markMultipleAsRead(selectedNotifications)
    setSelectedNotifications([])
  }

  const deleteSelected = () => {
    deleteNotifications(selectedNotifications)
    setSelectedNotifications([])
  }

  const toggleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAllVisible = () => {
    const visibleIds = paginatedNotifications.map(n => n.id)
    setSelectedNotifications(prev =>
      visibleIds.every(id => prev.includes(id))
        ? prev.filter(id => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    )
  }

  // Paginação
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage)


  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">
            error
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar notificações</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header da Página */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Central de Notificações</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} não lidas de {totalCount} total
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={markSelectedAsRead}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Marcar como Lidas ({selectedNotifications.length})
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir ({selectedNotifications.length})
                </button>
              </>
            )}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Marcar Todas como Lidas
            </button>
            {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'teacher') && (
              <>
                <button
                  onClick={() => router.push('/notifications/sent')}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    history
                  </span>
                  <span>Enviadas</span>
                </button>
                <button
                  onClick={() => router.push('/notifications/send')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    send
                  </span>
                  <span>Enviar Notificação</span>
                </button>
              </>
            )}
            <NotificationSettings />
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com Filtros */}
          <div className="lg:w-80 space-y-6">
            {/* Busca */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              <div className="space-y-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas as categorias</option>
                    <option value="academic">Acadêmico</option>
                    <option value="system">Sistema</option>
                    <option value="social">Social</option>
                    <option value="administrative">Administrativo</option>
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="info">Informação</option>
                    <option value="warning">Aviso</option>
                    <option value="success">Sucesso</option>
                    <option value="error">Erro</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    <option value="unread">Não lidas</option>
                    <option value="read">Lidas</option>
                  </select>
                </div>
              </div>

              {/* Limpar Filtros */}
              <button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    type: 'all',
                    status: 'all',
                    dateRange: 'all'
                  })
                  setSearchTerm('')
                }}
                className="w-full mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header da Lista */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={paginatedNotifications.length > 0 && paginatedNotifications.every(n => selectedNotifications.includes(n.id))}
                      onChange={selectAllVisible}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {filteredNotifications.length} notificações encontradas
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>
              </div>

              {/* Lista */}
              <div className="divide-y divide-gray-200">
                {paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelectNotification(notification.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          <span className="material-symbols-outlined text-sm">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  {getCategoryLabel(notification.category)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Marcar como lida"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    mark_email_read
                                  </span>
                                </button>
                              )}
                              <button
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                title="Mais opções"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  more_vert
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">
                      notifications_off
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma notificação encontrada
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou termos de busca.
                    </p>
                  </div>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} de {filteredNotifications.length} resultados
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}