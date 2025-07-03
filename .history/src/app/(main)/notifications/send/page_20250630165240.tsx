'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { pushNotificationService } from '@/services/pushNotificationService'
import { isAuthenticated, getCurrentToken, validateToken, syncTokenWithApiClient, clearAllTokens } from '@/utils/token-validator'

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
  role: string
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
  const [testResults, setTestResults] = useState<{
    email?: { success: boolean; message: string; timestamp?: string }
    push?: { success: boolean; message: string; timestamp?: string }
  }>({})
  const [testEmail, setTestEmail] = useState('')

  // Verificar permissões - apenas GUARDIAN e STUDENT não podem acessar
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Verificar se o usuário tem permissão para enviar notificações
    const restrictedRoles: string[] = ['GUARDIAN', 'STUDENT']
    if (restrictedRoles.includes(user.role)) {
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

  // Inicializar testEmail com o email do usuário quando disponível
  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email)
    }
  }, [user?.email, testEmail])

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadAvailableUsers = async () => {
      try {
        console.log('🔍 [NOTIFICATIONS] Carregando usuários disponíveis...')

        // Verificar autenticação antes de carregar usuários
        const authStatus = isAuthenticated()
        if (!authStatus.authenticated) {
          console.warn('⚠️ [NOTIFICATIONS] Usuário não autenticado, usando dados mock')
          // Usar dados mock se não autenticado
          throw new Error('Não autenticado')
        }

        // Sincronizar token se necessário
        const token = getCurrentToken()
        if (token) {
          await syncTokenWithApiClient(token)
        }
        // Buscar usuários do backend baseado na role do usuário atual
        let roles = ''
        const userRole = user?.role
        
        if (userRole === 'SYSTEM_ADMIN') {
          roles = 'INSTITUTION_ADMIN,SCHOOL_MANAGER,TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'INSTITUTION_MANAGER') {
          roles = 'SCHOOL_MANAGER,TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'COORDINATOR') {
          roles = 'TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'TEACHER') {
          roles = 'STUDENT,GUARDIAN'
        }

        const response = await apiClient.get(`/api/users?limit=100${roles ? `&roles=${roles}` : ''}`)

        if (response.success && response.data && Array.isArray(response.data)) {
          setAvailableUsers(response.data)
        } else if (response.success && response.data && typeof response.data === 'object' && 'users' in response.data) {
          setAvailableUsers((response.data as any).users || [])
        }
      } catch (error: any) {
        console.error('❌ [NOTIFICATIONS] Error loading users:', error)
        
        // Verificar se é erro de autenticação
        if (error?.message?.includes('Token') || 
            error?.message?.includes('autenticação') || 
            error?.message?.includes('autorização') ||
            error?.message?.includes('401') ||
            error?.status === 401) {
          
          console.error('🔐 [NOTIFICATIONS] Erro de autenticação ao carregar usuários, limpando sessão...')
          clearAllTokens()
        }
        
        // Fallback para dados mock em caso de erro
        const mockUsers: User[] = [
          { id: '1', name: 'João Silva', email: 'joao@escola.com', role: 'INSTITUTION_ADMIN' },
          { id: '2', name: 'Maria Santos', email: 'maria@escola.com', role: 'TEACHER' },
          { id: '3', name: 'Pedro Costa', email: 'pedro@escola.com', role: 'TEACHER' },
          { id: '4', name: 'Ana Oliveira', email: 'ana@escola.com', role: 'STUDENT' },
          { id: '5', name: 'Carlos Lima', email: 'carlos@escola.com', role: 'STUDENT' },
          { id: '6', name: 'Lucia Ferreira', email: 'lucia@escola.com', role: 'GUARDIAN' }
        ]

        let filteredUsers: User[] = []
        const userRole = user?.role
        
        if (userRole === 'SYSTEM_ADMIN') {
          filteredUsers = mockUsers
        } else if (userRole === 'INSTITUTION_MANAGER') {
          filteredUsers = mockUsers.filter(u => ['SCHOOL_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role))
        } else if (userRole === 'COORDINATOR') {
          filteredUsers = mockUsers.filter(u => ['TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role))
        } else if (userRole === 'TEACHER') {
          filteredUsers = mockUsers.filter(u => ['STUDENT', 'GUARDIAN'].includes(u.role))
        }

        setAvailableUsers(filteredUsers)
      }
    }

    if (user) {
      loadAvailableUsers()
    }
  }, [user])

  const getAvailableRoles = () => {
    const userRole = user?.role
    
    if (userRole === 'SYSTEM_ADMIN') {
      return [
        { value: 'INSTITUTION_ADMIN', label: 'Administradores Institucionais' },
        { value: 'SCHOOL_MANAGER', label: 'Gestores Escolares' },
        { value: 'TEACHER', label: 'Professores' },
        { value: 'STUDENT', label: 'Estudantes' },
        { value: 'GUARDIAN', label: 'Responsáveis' }
      ]
    } else if (userRole === 'INSTITUTION_MANAGER') {
      return [
        { value: 'SCHOOL_MANAGER', label: 'Gestores Escolares' },
        { value: 'TEACHER', label: 'Professores' },
        { value: 'STUDENT', label: 'Estudantes' },
        { value: 'GUARDIAN', label: 'Responsáveis' }
      ]
    } else if (userRole === 'COORDINATOR') {
      return [
        { value: 'TEACHER', label: 'Professores' },
        { value: 'STUDENT', label: 'Estudantes' },
        { value: 'GUARDIAN', label: 'Responsáveis' }
      ]
    } else if (userRole === 'TEACHER') {
      return [
        { value: 'STUDENT', label: 'Estudantes' },
        { value: 'GUARDIAN', label: 'Responsáveis' }
      ]
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [NOTIFICATIONS] Enviando notificação...')

      // Verificar autenticação antes de enviar
      const authStatus = isAuthenticated()
      if (!authStatus.authenticated) {
        console.warn('⚠️ [NOTIFICATIONS] Usuário não autenticado:', authStatus.error)
        clearAllTokens()
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Sincronizar token com apiClient
      const token = getCurrentToken()
      if (token) {
        const syncSuccess = await syncTokenWithApiClient(token)
        if (!syncSuccess) {
          console.warn('⚠️ [NOTIFICATIONS] Falha ao sincronizar token')
        }
      }
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

    } catch (error: any) {
      console.error('❌ [NOTIFICATIONS] Erro ao enviar notificação:', error)
      
      let errorMessage = 'Erro desconhecido'
      
      // Verificar se é erro de autenticação específico
      if (error?.message?.includes('Token') || 
          error?.message?.includes('autenticação') || 
          error?.message?.includes('autorização') ||
          error?.message?.includes('401') ||
          error?.status === 401) {
        
        console.error('🔐 [NOTIFICATIONS] Erro de autenticação detectado, limpando sessão...')
        clearAllTokens()
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    const emailToTest = testEmail.trim()
    
    if (!emailToTest) {
      setTestResults(prev => ({
        ...prev,
        email: { success: false, message: 'Digite um email válido para teste' }
      }))
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToTest)) {
      setTestResults(prev => ({
        ...prev,
        email: { success: false, message: 'Formato de email inválido' }
      }))
      return
    }

    try {
      setLoading(true)
      setTestResults(prev => ({ ...prev, email: undefined }))

      console.log('🔍 [NOTIFICATIONS] Testando email para:', emailToTest)

      // Verificar autenticação antes de fazer requisições
      const authStatus = isAuthenticated()
      console.log('🔍 [NOTIFICATIONS] Status de autenticação:', authStatus)
      
      if (!authStatus.authenticated) {
        console.warn('⚠️ [NOTIFICATIONS] Usuário não autenticado:', authStatus.error)
        clearAllTokens()
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Sincronizar token com apiClient
      const token = getCurrentToken()
      console.log('🔍 [NOTIFICATIONS] Token atual:', token ? token.substring(0, 20) + '...' : 'nenhum')
      
      if (token) {
        const syncSuccess = await syncTokenWithApiClient(token)
        console.log('🔍 [NOTIFICATIONS] Sincronização do token:', syncSuccess ? 'sucesso' : 'falha')
        if (!syncSuccess) {
          console.warn('⚠️ [NOTIFICATIONS] Falha ao sincronizar token')
        }
      } else {
        console.error('❌ [NOTIFICATIONS] Nenhum token disponível para sincronização')
      }

      // Usar nossa nova API de verificação de email
      console.log('🔍 [NOTIFICATIONS] Enviando email de verificação...')
      const response = await apiClient.post('/api/notifications/email/verify')

      console.log('🔍 [NOTIFICATIONS] Resposta recebida:', response)
      
      // Verificar se a resposta é válida
      if (!response || typeof response !== 'object') {
        console.error('❌ [NOTIFICATIONS] Resposta inválida ou vazia:', response)
        throw new Error('Erro de comunicação com o servidor - resposta inválida')
      }

      if (response.success === true) {
        setTestResults(prev => ({
          ...prev,
          email: {
            success: true,
            message: `Email de verificação enviado com sucesso para ${response.recipient || user?.email || 'seu email'}! Verifique a caixa de entrada.`,
            timestamp: new Date().toLocaleString('pt-BR')
          }
        }))
      } else {
        // Verificar se há informações de erro específicas na resposta
        console.error('❌ [NOTIFICATIONS] Erro na resposta da API:', response)
        
        const errorMessage = response.message || 'Erro ao enviar email de verificação'
        
        // Se é erro de autenticação, verificar diferentes formas
        if (response.message?.includes('401') ||
            response.message?.includes('Unauthorized') ||
            response.message?.includes('not authenticated') ||
            response.message?.includes('Token de autenticação') ||
            response.message?.includes('autenticação inválido') ||
            response.message?.includes('autenticação não encontrado')) {
          console.error('🔐 [NOTIFICATIONS] Erro de autenticação detectado na resposta')
          clearAllTokens()
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('❌ [NOTIFICATIONS] Error sending test email:', error)
      console.log('🔍 [NOTIFICATIONS] Tipo do erro:', typeof error)
      console.log('🔍 [NOTIFICATIONS] Propriedades do erro:', Object.keys(error || {}))
      
      let errorMessage = 'Erro desconhecido ao enviar email de teste'
      
      // Verificar se é erro de autenticação específico
      if (error?.message?.includes('Token') || 
          error?.message?.includes('autenticação') || 
          error?.message?.includes('autorização') ||
          error?.message?.includes('401') ||
          error?.status === 401) {
        
        console.error('🔐 [NOTIFICATIONS] Erro de autenticação detectado, limpando sessão...')
        clearAllTokens()
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error instanceof Error) {
        errorMessage = error.message
        console.log('🔍 [NOTIFICATIONS] Erro capturado (Error):', error.message)
        
        // Verificar tipos específicos de erro
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.'
        } else if (error.message.includes('resposta inválida') || error.message.includes('resposta malformada')) {
          errorMessage = error.message // Usar a mensagem específica que criamos
        }
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any
        console.log('🔍 [NOTIFICATIONS] Erro capturado (Object):', errorObj)
        
        // Verificar se é erro de rede
        if (errorObj.name === 'TypeError' && errorObj.message?.includes('fetch')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.'
        } else if (errorObj.name === 'AbortError' || errorObj.message?.includes('aborted')) {
          errorMessage = 'Requisição cancelada. Tente novamente.'
        } else if (errorObj.message) {
          errorMessage = errorObj.message
        } else if (errorObj.error) {
          errorMessage = errorObj.error
        } else {
          errorMessage = 'Erro de comunicação com o servidor'
        }
      } else {
        console.log('🔍 [NOTIFICATIONS] Erro capturado (Outro tipo):', typeof error, error)
        errorMessage = 'Erro inesperado ao enviar email de teste'
      }
      
      setTestResults(prev => ({
        ...prev,
        email: { 
          success: false, 
          message: errorMessage
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleTestPushNotification = async () => {
    try {
      setLoading(true)
      setTestResults(prev => ({ ...prev, push: undefined }))

      console.log('🔍 [NOTIFICATIONS] Testando push notification...')

      // Verificar autenticação antes de fazer requisições
      const authStatus = isAuthenticated()
      if (!authStatus.authenticated) {
        console.warn('⚠️ [NOTIFICATIONS] Usuário não autenticado:', authStatus.error)
        clearAllTokens()
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Sincronizar token com apiClient
      const token = getCurrentToken()
      if (token) {
        const syncSuccess = await syncTokenWithApiClient(token)
        if (!syncSuccess) {
          console.warn('⚠️ [NOTIFICATIONS] Falha ao sincronizar token')
        }
      }

      // Primeiro verificar se as push notifications estão configuradas
      try {
        const verifyResponse = await apiClient.get('/api/notifications/push/verify')
        
        if (!verifyResponse.success) {
          if ((verifyResponse as any).status === 401) {
            throw new Error('Sessão expirada. Faça login novamente.')
          }
          throw new Error(verifyResponse.message || 'Falha ao verificar configuração de push notifications')
        }
        
        if (!(verifyResponse.data as any)?.hasActiveSubscriptions) {
          throw new Error((verifyResponse.data as any)?.message || 'Push notifications não estão configuradas para este usuário')
        }
      } catch (verifyError) {
        // Se a verificação falhou, tenta enviar o teste mesmo assim
        console.warn('Verificação de push notifications falhou, tentando enviar teste:', verifyError)
      }

      // Enviar push notification de teste via API
      const response = await apiClient.post('/api/notifications/push/test', {
        userId: user?.id
      })

      if (response.success) {
        setTestResults(prev => ({
          ...prev,
          push: { 
            success: true, 
            message: 'Push notification de teste enviada com sucesso!',
            timestamp: new Date().toLocaleString('pt-BR')
          }
        }))
              } else {
        // Verificar se é erro de autenticação baseado na mensagem
        const errorMsg = response.message || 'Erro ao enviar push notification de teste'
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('not authenticated')) {
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        throw new Error(errorMsg)
      }
    } catch (error: any) {
      console.error('❌ [NOTIFICATIONS] Error sending test push notification:', error)
      let errorMessage = 'Erro desconhecido ao enviar push notification de teste'
      
      // Verificar se é erro de autenticação específico
      if (error?.message?.includes('Token') || 
          error?.message?.includes('autenticação') || 
          error?.message?.includes('autorização') ||
          error?.message?.includes('401') ||
          error?.status === 401) {
        
        console.error('🔐 [NOTIFICATIONS] Erro de autenticação detectado, limpando sessão...')
        clearAllTokens()
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any
        if (errorObj.message) {
          errorMessage = errorObj.message
        }
      }
      
      setTestResults(prev => ({
        ...prev,
        push: { 
          success: false, 
          message: errorMessage
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleEnablePushNotifications = async () => {
    try {
      setLoading(true)
      const success = await pushNotificationService.requestPermissionAndSubscribe()
      if (success) {
        const status = await pushNotificationService.getSubscriptionStatus()
        setPushStatus(status)
        setTestResults(prev => ({
          ...prev,
          push: { 
            success: true, 
            message: 'Push notifications habilitadas com sucesso!',
            timestamp: new Date().toLocaleString('pt-BR')
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          push: { 
            success: false, 
            message: 'Não foi possível habilitar as push notifications. Verifique as permissões do navegador.'
          }
        }))
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      setTestResults(prev => ({
        ...prev,
        push: { 
          success: false, 
          message: 'Erro ao habilitar push notifications: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        }
      }))
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

  // Verificar se o usuário pode acessar esta página
  const restrictedRoles: string[] = ['GUARDIAN', 'STUDENT']
  if (!user || restrictedRoles.includes(user.role)) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">block</span>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Acesso Negado</h3>
          <p className="text-gray-500 mb-4">Você não tem permissão para enviar notificações.</p>
          <button
            onClick={() => router.push('/notifications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Notificações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive spacing-y-responsive">
      <div className="max-w-4xl mx-auto">
        {/* Header da Página */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Enviar Notificação</h1>
              <p className="text-sm text-gray-500">
                Criar e enviar notificações para usuários
              </p>
            </div>
          </div>
        </div>
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
          
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informações de Debug</h4>
            <div className="space-y-1 text-blue-800">
              <div>API Base URL: {process.env.NEXT_PUBLIC_API_URL || '/api'}</div>
              <div>Usuário logado: {user?.email || 'Não identificado'}</div>
              <div>Papel do usuário: {user?.role || 'Não identificado'}</div>
              <div>Timestamp: {new Date().toLocaleString('pt-BR')}</div>
            </div>
          </div>
          
                      <div className="space-y-4">
            {/* Verificação de Configuração de Email */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">1. Verificação de Configuração</h4>
              <button
                onClick={async () => {
                  try {
                    setLoading(true)
                    
                    console.log('🔍 [NOTIFICATIONS] Verificando configuração de email...')

                    // Verificar autenticação antes da requisição
                    const authStatus = isAuthenticated()
                    if (!authStatus.authenticated) {
                      console.warn('⚠️ [NOTIFICATIONS] Usuário não autenticado')
                      clearAllTokens()
                      alert('❌ Sessão expirada. Faça login novamente.')
                      return
                    }

                    // Sincronizar token
                    const token = getCurrentToken()
                    if (token) {
                      await syncTokenWithApiClient(token)
                    }
                    
                    const response = await apiClient.get('/api/notifications/email/verify')
                    console.log('✅ [NOTIFICATIONS] Verificação de email:', response)
                    
                    if (response.success) {
                      const data = response.data as any
                      alert(`✅ Configuração: ${data?.message || 'OK'}\nConectado: ${data?.connected ? 'Sim' : 'Não'}\nHabilitado: ${data?.enabled ? 'Sim' : 'Não'}`)
                    } else {
                      alert(`❌ Erro na verificação: ${response.message}`)
                    }
                  } catch (error: any) {
                    console.error('❌ [NOTIFICATIONS] Erro na verificação:', error)
                    
                    let errorMessage = 'Erro desconhecido'
                    
                    // Verificar se é erro de autenticação
                    if (error?.message?.includes('Token') || 
                        error?.message?.includes('autenticação') || 
                        error?.message?.includes('autorização') ||
                        error?.message?.includes('401') ||
                        error?.status === 401) {
                      
                      console.error('🔐 [NOTIFICATIONS] Erro de autenticação na verificação')
                      clearAllTokens()
                      errorMessage = 'Sessão expirada. Faça login novamente.'
                    } else if (error instanceof Error) {
                      errorMessage = error.message
                    }
                    
                    alert(`❌ Erro: ${errorMessage}`)
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                <span>Verificar Configuração</span>
              </button>
            </div>

            {/* Teste de Email */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">2. Teste de Envio de Email</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email para teste
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Digite o email para receber o teste"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleTestEmail}
                    disabled={loading || !testEmail.trim()}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2 mt-5"
                  >
                    {loading && testResults.email === undefined ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span className="material-symbols-outlined text-sm">email</span>
                    )}
                    <span>Testar Email</span>
                  </button>
                </div>
                
                {testResults.email && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    testResults.email.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {testResults.email.success ? 'check_circle' : 'error'}
                    </span>
                    <span>{testResults.email.success ? 'Sucesso' : 'Erro'}</span>
                    {testResults.email.timestamp && (
                      <span className="text-gray-500">({testResults.email.timestamp})</span>
                    )}
                  </div>
                )}
              </div>
              
              {testResults.email && (
                <div className={`p-3 rounded-lg text-sm mt-2 ${
                  testResults.email.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {testResults.email.message}
                </div>
              )}
            </div>

            {/* Teste de Push Notification */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">3. Teste de Push Notification</h4>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={handleTestPushNotification}
                  disabled={loading || !pushStatus?.supported}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {loading && testResults.push === undefined ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span className="material-symbols-outlined text-sm">notifications</span>
                  )}
                  <span>Testar Push Notification</span>
                </button>
                
                {!pushStatus?.supported && (
                  <span className="text-sm text-gray-500">
                    (Não suportado neste navegador)
                  </span>
                )}
                
                {testResults.push && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    testResults.push.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {testResults.push.success ? 'check_circle' : 'error'}
                    </span>
                    <span>{testResults.push.success ? 'Sucesso' : 'Erro'}</span>
                    {testResults.push.timestamp && (
                      <span className="text-gray-500">({testResults.push.timestamp})</span>
                    )}
                  </div>
                )}
              </div>
              
              {testResults.push && (
                <div className={`p-3 rounded-lg text-sm ${
                  testResults.push.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {testResults.push.message}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>💡 Use os testes para verificar se as configurações de email e push notifications estão funcionando corretamente antes de enviar notificações para todos os usuários.</p>
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