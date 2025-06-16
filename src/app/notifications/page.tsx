'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/roles'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import { useNotifications, type NotificationFilters, type Notification } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const { user, loading: authLoading, error: authError } = useAuth()
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
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const [authRetryCount, setAuthRetryCount] = useState(0)
  const itemsPerPage = 15

  // Verificar permissões - apenas GUARDIAN e STUDENT não podem acessar funcionalidades de envio
  useEffect(() => {
    if (!authLoading && !user) {
      // Se não há usuário após o carregamento, mas não houve muitas tentativas, tentar recarregar
      if (authRetryCount < 2) {
        console.log('🔄 Notificações: Tentando recarregar dados de autenticação...');
        setAuthRetryCount(prev => prev + 1);
        
        // Tentar recarregar a página após um pequeno delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
      
      // Após várias tentativas, redirecionar para login
      router.push('/login');
      return;
    }
  }, [user, authLoading, router, authRetryCount])

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
        return 'bg-blue-100 text-blue-600'
      case 'warning':
        return 'bg-yellow-100 text-yellow-600'
      case 'success':
        return 'bg-green-100 text-green-600'
      case 'error':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getCategoryLabel = (category: Notification['category']) => {
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

  const toggleSelectNotification = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    )
  }

  const selectAllVisible = () => {
    const allSelected = paginatedNotifications.every(n => selectedNotifications.includes(n.id))
    if (allSelected) {
      setSelectedNotifications(prev => prev.filter(id => !paginatedNotifications.some(n => n.id === id)))
    } else {
      const newSelections = paginatedNotifications.map(n => n.id).filter(id => !selectedNotifications.includes(id))
      setSelectedNotifications(prev => [...prev, ...newSelections])
    }
  }

  const markSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markMultipleAsRead(selectedNotifications)
      setSelectedNotifications([])
    }
  }

  const deleteSelected = async () => {
    if (selectedNotifications.length > 0 && confirm('Tem certeza que deseja excluir as notificações selecionadas?')) {
      await deleteNotifications(selectedNotifications)
      setSelectedNotifications([])
    }
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      status: 'all',
      dateRange: 'all'
    })
    setSearchTerm('')
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all') || searchTerm !== ''

  // Paginação
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

  // Verificar se o usuário pode enviar notificações (todos exceto GUARDIAN e STUDENT)
  const canSendNotifications = user?.role && ![UserRole.GUARDIAN, UserRole.STUDENT].includes(user.role as UserRole)

  // Componente para erro de autenticação específico
  const AuthErrorComponent = () => (
    <div className="container-responsive spacing-y-responsive">
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-orange-500 mb-4">warning</span>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Problema de Autenticação</h3>
        <p className="text-gray-500 mb-6">
          Houve um problema ao verificar sua sessão. Isso pode acontecer quando sua sessão expira.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Recarregar Página
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Fazer Login
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )

  // Se está carregando autenticação, mostrar loading
  if (authLoading) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    )
  }

  // Se não há usuário após tentativas, mostrar erro de autenticação
  if (!user && authRetryCount >= 2) {
    return <AuthErrorComponent />
  }

  if (loading) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando notificações...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Erro ao carregar notificações</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive spacing-y-responsive">
      {/* Header da Página */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="page-title">Central de Notificações</h1>
            <p className="text-xs-responsive text-gray-500 mt-1">
              {unreadCount} não lidas de {totalCount} total
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Botões de ação rápida */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <span className="text-xs-responsive text-blue-700 font-medium">
                  {selectedNotifications.length} selecionadas
                </span>
                <button
                  onClick={markSelectedAsRead}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Marcar como lidas"
                >
                  <span className="material-symbols-outlined text-sm">mark_email_read</span>
                </button>
                <button
                  onClick={deleteSelected}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Excluir selecionadas"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            )}

            {/* Botões principais */}
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 text-xs-responsive bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span className="hide-mobile">Marcar todas</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-xs-responsive rounded-lg transition-colors flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">material-symbols-outlined</span>
              <span className="hide-mobile">Filtros</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full"></span>}
            </button>

            {canSendNotifications && (
              <>
                <button
                  onClick={() => router.push('/notifications/sent')}
                  className="px-3 py-2 text-xs-responsive bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  <span className="hide-mobile">Enviadas</span>
                </button>
                <button
                  onClick={() => router.push('/notifications/send')}
                  className="px-3 py-2 text-xs-responsive bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span className="hide-mobile">Enviar</span>
                </button>
              </>
            )}

            <NotificationSettings />
          </div>
        </div>
      </div>

      <div>
        {/* Barra de busca e filtros */}
        <div className="mb-4 sm:mb-6">
          {/* Busca sempre visível */}
          <div className="relative mb-3 sm:mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtros expansíveis */}
          {showFilters && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs-responsive font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="all">Todas</option>
                      <option value="unread">Não lidas</option>
                      <option value="read">Lidas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs-responsive font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="all">Todas as categorias</option>
                      <option value="academic">Acadêmico</option>
                      <option value="system">Sistema</option>
                      <option value="social">Social</option>
                      <option value="administrative">Administrativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs-responsive font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="info">Informação</option>
                      <option value="warning">Aviso</option>
                      <option value="success">Sucesso</option>
                      <option value="error">Erro</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs-responsive text-gray-600">
                      {filteredNotifications.length} de {totalCount} notificações
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-xs-responsive text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filtros ativos (chips) */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.status !== 'all' && (
                <span className="badge bg-blue-100 text-blue-800">
                  Status: {filters.status === 'unread' ? 'Não lidas' : 'Lidas'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="badge bg-green-100 text-green-800">
                  {getCategoryLabel(filters.category as 'system' | 'academic' | 'administrative' | 'social')}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="badge bg-purple-100 text-purple-800">
                  Busca: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Lista de notificações */}
        <div className="card overflow-hidden">
          {/* Header da lista com seleção */}
          {paginatedNotifications.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <input
                    type="checkbox"
                    checked={paginatedNotifications.length > 0 && paginatedNotifications.every(n => selectedNotifications.includes(n.id))}
                    onChange={selectAllVisible}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs-responsive text-gray-600">
                    {filteredNotifications.length} notificações
                  </span>
                </div>
                
                {totalPages > 1 && (
                  <div className="text-xs-responsive text-gray-500">
                    Página {currentPage} de {totalPages}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo da lista */}
          <div className={viewMode === 'compact' ? 'divide-y divide-gray-100' : 'divide-y divide-gray-200'}>
            {paginatedNotifications.length > 0 ? (
              paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${
                    viewMode === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
                  } hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    <div className={`${viewMode === 'compact' ? 'p-1.5' : 'p-2'} rounded-full ${getNotificationColor(notification.type)}`}>
                      <span className={`material-symbols-outlined ${viewMode === 'compact' ? 'text-xs' : 'text-sm'}`}>
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm-responsive font-medium ${
                              !notification.read ? 'text-gray-700' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className={`badge bg-gray-100 text-gray-600`}>
                              {getCategoryLabel(notification.category)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          {viewMode === 'list' && (
                            <p className="text-xs-responsive text-gray-600 mb-2">
                              {notification.message}
                            </p>
                          )}
                          <p className={`text-xs text-gray-500`}>
                            {notification.time}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2 sm:ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="button-icon p-1.5"
                              title="Marcar como lida"
                            >
                              <span className="material-symbols-outlined text-sm">
                                mark_email_read
                              </span>
                            </button>
                          )}
                          <button
                            className="button-icon p-1.5"
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-gray-400">
                    {hasActiveFilters ? 'search_off' : 'notifications_off'}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {hasActiveFilters ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros ou termos de busca.' 
                    : 'Você não possui notificações no momento.'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Paginação melhorada */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} de {filteredNotifications.length} resultados
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              : 'border border-gray-300 hover:bg-white'
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
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  )
}