'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/apiClient'
import { pushNotificationService } from '@/services/pushNotificationService'

interface NotificationForm {
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'academic' | 'system' | 'social' | 'administrative'
  recipients: {
    type: 'all' | 'role' | 'specific'
    roles?: string[]
    userIds?: string[]
    emails?: string[]
  }
  scheduledFor?: string
  priority: 'low' | 'medium' | 'high'
  sendPush: boolean
  sendEmail: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'teacher' | 'student'
}

export default function SendNotificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    category: 'academic',
    recipients: {
      type: 'all'
    },
    priority: 'medium',
    sendPush: true,
    sendEmail: false
  })
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pushStatus, setPushStatus] = useState<{
    supported: boolean
    permission: NotificationPermission
    subscribed: boolean
  } | null>(null)

  // Verificar permissões
  useEffect(() => {
    if (!user || user.role === 'student') {
      router.push('/notifications')
      return
    }

    // Verificar se o usuário tem permissão para enviar notificações
    const allowedRoles = ['admin',
        'system_admin',
        'institution_manager',
        'academic_coordinator',
        'manager',
        'teacher']
    if (!allowedRoles.includes(user.role)) {
      router.push('/notifications')
      return
    }
  }, [user, router])

  // Verificar status das push notifications
  useEffect(() => {
    const checkPushStatus = async () => {
      try {
        const status = await pushNotificationService.getSubscriptionStatus()
        setPushStatus(status)
      } catch (error) {
        console.error('Error checking push status:', error)
      }
    }

    checkPushStatus()
  }, [])

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadAvailableUsers = async () => {
      try {
        // Buscar usuários do backend baseado na role do usuário atual
        let roles = ''
        if (user?.role === 'admin') {
          roles = 'manager,teacher'
        } else if (user?.role === 'manager') {
          roles = 'teacher'
        } else if (user?.role === 'teacher') {
          roles = 'student'
        }

        const response = await apiClient.get(`/api/users?limit=100${roles ? `&roles=${roles}` : ''}`)

        if (response.success && response.data && Array.isArray(response.data)) {
          setAvailableUsers(response.data)
        } else if (response.success && response.data && typeof response.data === 'object' && 'users' in response.data) {
          setAvailableUsers((response.data as any).users || [])
        }
      } catch (error) {
        console.error('Error loading users:', error)
        // Fallback para dados mock em caso de erro
        const mockUsers: User[] = [
          { id: '1', name: 'João Silva', email: 'joao@escola.com', role: 'manager' },
          { id: '2', name: 'Maria Santos', email: 'maria@escola.com', role: 'teacher' },
          { id: '3', name: 'Pedro Costa', email: 'pedro@escola.com', role: 'teacher' },
          { id: '4', name: 'Ana Oliveira', email: 'ana@escola.com', role: 'student' },
          { id: '5', name: 'Carlos Lima', email: 'carlos@escola.com', role: 'student' },
          { id: '6', name: 'Lucia Ferreira', email: 'lucia@escola.com', role: 'student' }
        ]

        let filteredUsers: User[] = []
        if (user?.role === 'admin') {
          filteredUsers = mockUsers.filter(u => u.role === 'manager' || u.role === 'teacher')
        } else if (user?.role === 'manager') {
          filteredUsers = mockUsers.filter(u => u.role === 'teacher')
        } else if (user?.role === 'teacher') {
          filteredUsers = mockUsers.filter(u => u.role === 'student')
        }

        setAvailableUsers(filteredUsers)
      }
    }

    if (user) {
      loadAvailableUsers()
    }
  }, [user])

  const getAvailableRoles = () => {
    if (user?.role === 'admin') {
      return [
        { value: 'manager', label: 'Gestores' },
        { value: 'teacher', label: 'Professores' }
      ]
    } else if (user?.role === 'manager') {
      return [
        { value: 'teacher', label: 'Professores' }
      ]
    } else if (user?.role === 'teacher') {
      return [
        { value: 'student', label: 'Estudantes' }
      ]
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Preparar dados para envio
      const notificationData = {
        title: form.title,
        message: form.message,
        type: form.type,
        category: form.category,
        priority: form.priority,
        sendPush: form.sendPush,
        sendEmail: form.sendEmail,
        recipients: {
          userIds: form.recipients.type === 'specific' ? selectedUsers : undefined,
          emails: form.recipients.type === 'specific' ? 
            selectedUsers.map(id => availableUsers.find(u => u.id === id)?.email).filter(Boolean) : 
            undefined,
          roles: form.recipients.type === 'role' ? form.recipients.roles : undefined
        }
      }

      // Enviar notificação via API
      const response = await apiClient.post('/api/notifications/send', notificationData)

      if (response.success) {
        setSuccess(true)
        
        // Resetar formulário após sucesso
        setTimeout(() => {
          setForm({
            title: '',
            message: '',
            type: 'info',
            category: 'academic',
            recipients: { type: 'all' },
            priority: 'medium',
            sendPush: true,
            sendEmail: false
          })
          setSelectedUsers([])
          setSuccess(false)
        }, 3000)
      } else {
        throw new Error(response.message || 'Erro ao enviar notificação')
      }

    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const response = await apiClient.post('/api/notifications/email/test', {
        to: user.email
      })

      if (response.success) {
        alert('Email de teste enviado com sucesso! Verifique sua caixa de entrada.')
      } else {
        throw new Error(response.message || 'Erro ao enviar email de teste')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Erro ao enviar email de teste: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const handleTestPushNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification()
      alert('Notificação push de teste enviada!')
    } catch (error) {
      console.error('Error sending test push notification:', error)
      alert('Erro ao enviar notificação push de teste')
    }
  }

  const handleEnablePushNotifications = async () => {
    try {
      const success = await pushNotificationService.requestPermissionAndSubscribe()
      if (success) {
        const status = await pushNotificationService.getSubscriptionStatus()
        setPushStatus(status)
        alert('Push notifications habilitadas com sucesso!')
      } else {
        alert('Não foi possível habilitar as push notifications')
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      alert('Erro ao habilitar push notifications')
    }
  }

  const handleRecipientTypeChange = (type: 'all' | 'role' | 'specific') => {
    setForm(prev => ({
      ...prev,
      recipients: { type }
    }))
    setSelectedUsers([])
  }

  const handleRoleSelection = (roles: string[]) => {
    setForm(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        roles
      }
    }))
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (!user || user.role === 'student') {
    return null
  }

  return (
    <div className="p-6">
      {/* Header da Página */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">
              arrow_back
            </span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Enviar Notificação</h1>
            <p className="text-sm text-gray-500">
              Criar e enviar notificações para usuários
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-green-600 mr-2">
                check_circle
              </span>
              <p className="text-green-800">Notificação enviada com sucesso!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-red-600 mr-2">
                error
              </span>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Status das Notificações Push */}
        {pushStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Status das Push Notifications</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Suporte do navegador:</span>
                <span className={pushStatus.supported ? 'text-green-600' : 'text-red-600'}>
                  {pushStatus.supported ? 'Suportado' : 'Não suportado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Permissão:</span>
                <span className={pushStatus.permission === 'granted' ? 'text-green-600' : 'text-yellow-600'}>
                  {pushStatus.permission === 'granted' ? 'Concedida' : 
                   pushStatus.permission === 'denied' ? 'Negada' : 'Não solicitada'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Inscrito:</span>
                <span className={pushStatus.subscribed ? 'text-green-600' : 'text-red-600'}>
                  {pushStatus.subscribed ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
            {pushStatus.supported && pushStatus.permission !== 'granted' && (
              <button
                onClick={handleEnablePushNotifications}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Habilitar Push Notifications
              </button>
            )}
          </div>
        )}

        {/* Botões de Teste */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Testes de Configuração</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleTestEmail}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Testar Email
            </button>
            {pushStatus?.supported && pushStatus?.subscribed && (
              <button
                onClick={handleTestPushNotification}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                Testar Push Notification
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Notificação *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o título da notificação"
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a mensagem da notificação"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Informação</option>
                  <option value="warning">Aviso</option>
                  <option value="success">Sucesso</option>
                  <option value="error">Erro</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="academic">Acadêmico</option>
                  <option value="system">Sistema</option>
                  <option value="social">Social</option>
                  <option value="administrative">Administrativo</option>
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {/* Tipo de Notificação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Métodos de Envio
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.sendPush}
                    onChange={(e) => setForm(prev => ({ ...prev, sendPush: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Push Notification
                    {pushStatus && !pushStatus.subscribed && (
                      <span className="text-yellow-600 ml-1">(não configurado)</span>
                    )}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.sendEmail}
                    onChange={(e) => setForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Email</span>
                </label>
              </div>
              {!form.sendPush && !form.sendEmail && (
                <p className="text-sm text-red-600 mt-2">
                  Selecione pelo menos um método de envio
                </p>
              )}
            </div>

            {/* Destinatários */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Destinatários
              </label>
              
              <div className="space-y-4">
                {/* Tipo de destinatário */}
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={form.recipients.type === 'all'}
                      onChange={() => handleRecipientTypeChange('all')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos os usuários permitidos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={form.recipients.type === 'role'}
                      onChange={() => handleRecipientTypeChange('role')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Por função</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipientType"
                      checked={form.recipients.type === 'specific'}
                      onChange={() => handleRecipientTypeChange('specific')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Usuários específicos</span>
                  </label>
                </div>

                {/* Seleção por função */}
                {form.recipients.type === 'role' && (
                  <div className="pl-6">
                    <div className="space-y-2">
                      {getAvailableRoles().map(role => (
                        <label key={role.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.recipients.roles?.includes(role.value) || false}
                            onChange={(e) => {
                              const currentRoles = form.recipients.roles || []
                              const newRoles = e.target.checked
                                ? [...currentRoles, role.value]
                                : currentRoles.filter(r => r !== role.value)
                              handleRoleSelection(newRoles)
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seleção específica */}
                {form.recipients.type === 'specific' && (
                  <div className="pl-6">
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      <div className="space-y-2">
                        {availableUsers.map(user => (
                          <label key={user.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-2 flex-1">
                              <span className="text-sm text-gray-700">{user.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({user.email})</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    {selectedUsers.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedUsers.length} usuário(s) selecionado(s)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Agendamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agendar para (opcional)
              </label>
              <input
                type="datetime-local"
                value={form.scheduledFor || ''}
                onChange={(e) => setForm(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para enviar imediatamente
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !form.title || !form.message || (!form.sendPush && !form.sendEmail)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}