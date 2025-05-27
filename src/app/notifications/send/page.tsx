'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { type Notification } from '@/hooks/useNotifications'

interface NotificationForm {
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'academic' | 'system' | 'social' | 'administrative'
  recipients: {
    type: 'all' | 'role' | 'specific'
    roles?: string[]
    userIds?: string[]
  }
  scheduledFor?: string
  priority: 'low' | 'medium' | 'high'
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
    priority: 'medium'
  })
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Verificar permissões
  useEffect(() => {
    if (!user || user.role === 'student') {
      router.push('/notifications')
      return
    }
  }, [user, router])

  // Carregar usuários disponíveis baseado na role
  useEffect(() => {
    const loadAvailableUsers = () => {
      // Mock data - em produção viria do backend
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
        // Admin pode enviar para managers e teachers
        filteredUsers = mockUsers.filter(u => u.role === 'manager' || u.role === 'teacher')
      } else if (user?.role === 'manager') {
        // Manager pode enviar para teachers
        filteredUsers = mockUsers.filter(u => u.role === 'teacher')
      } else if (user?.role === 'teacher') {
        // Teacher pode enviar para students
        filteredUsers = mockUsers.filter(u => u.role === 'student')
      }

      setAvailableUsers(filteredUsers)
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

    try {
      // Simular envio para o backend
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Aqui seria feita a chamada real para a API
      console.log('Enviando notificação:', {
        ...form,
        sender: user?.id,
        selectedUsers: form.recipients.type === 'specific' ? selectedUsers : undefined
      })

      setSuccess(true)
      
      // Resetar formulário após sucesso
      setTimeout(() => {
        setForm({
          title: '',
          message: '',
          type: 'info',
          category: 'academic',
          recipients: { type: 'all' },
          priority: 'medium'
        })
        setSelectedUsers([])
        setSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl font-bold text-gray-900">Enviar Notificação</h1>
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
                              <span className="text-sm text-gray-900">{user.name}</span>
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
                disabled={loading || !form.title || !form.message}
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