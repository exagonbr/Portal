'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { pushNotificationService } from '@/services/pushNotificationService'
import { isAuthenticated, getCurrentToken, validateToken, syncTokenWithApiClient, clearAllTokens } from '@/utils/token-validator'
import '@/styles/cards-standard.css'

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
  priority: 'low' | 'medium' | 'high'
  notificationMethod: 'push' | 'email' | 'both'
  emailTemplate?: number | null
  scheduledFor?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface EmailTemplate {
  id?: number
  name: string
  subject: string
  html: string
  text?: string
  category?: string
  is_active?: boolean
  created_at?: Date
  updated_at?: Date
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
    notificationMethod: 'push',
    emailTemplate: null
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
  
  // Estados para tabs e templates
  const [activeTab, setActiveTab] = useState<'compose' | 'templates'>('compose')
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

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

  // Carregar templates de email
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true)
        console.log('🔍 [TEMPLATES] Carregando templates de email...')

        // Verificar autenticação
        const authStatus = isAuthenticated()
        if (!authStatus.authenticated) {
          console.warn('⚠️ [TEMPLATES] Usuário não autenticado')
          return
        }

        // Sincronizar token
        const token = getCurrentToken()
        if (token) {
          await syncTokenWithApiClient(token)
        }

        const response = await apiClient.get('/api/notifications/templates')
        
        if (response.success && response.data) {
          // Verificar se response.data é um array válido
          const templatesData = Array.isArray(response.data) ? response.data : []
          setTemplates(templatesData)
          console.log(`✅ [TEMPLATES] ${templatesData.length} templates carregados`)
        } else {
          console.error('❌ [TEMPLATES] Erro na resposta:', response)
          setTemplates([]) // Garantir que sempre seja um array
        }
      } catch (error: any) {
        console.error('❌ [TEMPLATES] Erro ao carregar templates:', error)
        
        // Fallback para templates mock em caso de erro
        const mockTemplates: EmailTemplate[] = [
          {
            id: 1,
            name: 'welcome',
            subject: 'Bem-vindo ao Portal Sabercon!',
            category: 'system',
            is_active: true,
            html: '<div>Template de boas-vindas</div>',
            text: 'Bem-vindo!'
          },
          {
            id: 2,
            name: 'notification',
            subject: '{{subject}}',
            category: 'notification',
            is_active: true,
            html: '<div>{{message}}</div>',
            text: '{{message}}'
          }
        ]
        setTemplates(mockTemplates)
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (user && activeTab === 'templates') {
      loadTemplates()
    }
  }, [user, activeTab])

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
          roles = 'INSTITUTION_MANAGER,COORDINATOR,TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'INSTITUTION_MANAGER') {
          roles = 'COORDINATOR,TEACHER,STUDENT,GUARDIAN'
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
          { id: '1', name: 'João Silva', email: 'joao@escola.com', role: 'INSTITUTION_MANAGER' },
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
          filteredUsers = mockUsers.filter(u => ['COORDINATOR', 'TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role))
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
        { value: 'INSTITUTION_MANAGER', label: 'Administradores Institucionais' },
        { value: 'COORDINATOR', label: 'Gestores Escolares' },
        { value: 'TEACHER', label: 'Professores' },
        { value: 'STUDENT', label: 'Estudantes' },
        { value: 'GUARDIAN', label: 'Responsáveis' }
      ]
    } else if (userRole === 'INSTITUTION_MANAGER') {
      return [
        { value: 'COORDINATOR', label: 'Gestores Escolares' },
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
        sendPush: form.notificationMethod === 'push' || form.notificationMethod === 'both',
        sendEmail: form.notificationMethod === 'email' || form.notificationMethod === 'both',
        emailTemplate: form.emailTemplate,
        recipients: {
          userIds: form.recipients.type === 'specific' ? selectedUsers : undefined,
          emails: form.recipients.type === 'specific' ? 
            selectedUsers.map(id => availableUsers.find(u => u.id === id)?.email).filter(Boolean) : 
            undefined,
          roles: form.recipients.type === 'role' ? form.recipients.roles : undefined
        }
      }

      // Enviar notificação via API
      console.log('🔍 [NOTIFICATIONS] Dados sendo enviados:', notificationData)
      const response = await apiClient.post('/api/notifications/send', notificationData)
      console.log('🔍 [NOTIFICATIONS] Resposta recebida:', response)

      if (response.success === true) {
        const data = response.data as any;
        setSuccess(true)
        
        // Mostrar detalhes do sucesso
        console.log('✅ [NOTIFICATIONS] Notificação enviada com sucesso:', {
          notificationId: data?.notificationId,
          recipientCount: data?.recipientCount,
          methods: data?.methods
        })
        
        // Resetar formulário após sucesso
        setTimeout(() => {
          setForm({
            title: '',
            message: '',
            type: 'info',
            category: 'academic',
            recipients: { type: 'all' },
            priority: 'medium',
            notificationMethod: 'push',
            emailTemplate: null
          })
          setSelectedUsers([])
          setSuccess(false)
        }, 5000) // Aumentado para 5 segundos para dar tempo de ver a mensagem
      } else {
        const errorMessage = response.message || 'Erro ao enviar notificação'
        console.error('❌ [NOTIFICATIONS] Erro na resposta da API:', response)
        throw new Error(errorMessage)
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
    try {
      setLoading(true)
      setTestResults(prev => ({ ...prev, email: undefined }))

      console.log('🔍 [NOTIFICATIONS] Testando email...')

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

      // Usar nossa API de verificação de email
      console.log('🔍 [NOTIFICATIONS] Enviando email de verificação...')
      const response = await apiClient.post('/api/notifications/email/verify')

      console.log('🔍 [NOTIFICATIONS] Resposta recebida:', response)
      
      if (response.success === true) {
        const data = response.data as any;
        setTestResults(prev => ({
          ...prev,
          email: {
            success: true,
            message: `Email de verificação enviado com sucesso para ${data?.recipient || user?.email || 'seu email'}! Verifique a caixa de entrada.`,
            timestamp: new Date().toLocaleString('pt-BR')
          }
        }))
      } else {
        const errorMessage = response.message || 'Erro ao enviar email de verificação'
        
        // Se é erro de autenticação
        if (response.message?.includes('401') ||
            response.message?.includes('Unauthorized') ||
            response.message?.includes('not authenticated')) {
          console.error('🔐 [NOTIFICATIONS] Erro de autenticação detectado na resposta')
          clearAllTokens()
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('❌ [NOTIFICATIONS] Error sending test email:', error)
      
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
        
        // Verificar tipos específicos de erro
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.'
        }
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

  // Funções para gerenciar templates
  const handleApplyTemplate = (template: EmailTemplate) => {
    setForm(prev => ({
      ...prev,
      title: template.subject,
      message: template.html
    }))
    setActiveTab('compose')
    console.log(`✅ [TEMPLATES] Template aplicado: ${template.name}`)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setTemplateModalOpen(true)
  }

  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: '',
      subject: '',
      html: '',
      text: '',
      category: 'general',
      is_active: true
    })
    setTemplateModalOpen(true)
  }

  const handleSaveTemplate = async (templateData: EmailTemplate) => {
    try {
      setLoading(true)
      
      const isEditing = templateData.id !== undefined
      const url = isEditing 
        ? `/api/notifications/templates/${templateData.id}`
        : '/api/notifications/templates'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = method === 'PUT'
        ? await apiClient.put(url, templateData)
        : await apiClient.post(url, templateData)

      if (response.success) {
        // Recarregar templates
        const templatesResponse = await apiClient.get('/api/notifications/templates')
        if (templatesResponse.success && templatesResponse.data) {
          const templatesData = Array.isArray(templatesResponse.data) ? templatesResponse.data as EmailTemplate[] : []
          setTemplates(templatesData)
        }
        
        setTemplateModalOpen(false)
        setEditingTemplate(null)
        console.log(`✅ [TEMPLATES] Template ${isEditing ? 'atualizado' : 'criado'}: ${templateData.name}`)
      } else {
        throw new Error(response.message || 'Erro ao salvar template')
      }
    } catch (error: any) {
      console.error('❌ [TEMPLATES] Erro ao salvar template:', error)
      setError(error.message || 'Erro ao salvar template')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
      return
    }

    try {
      setLoading(true)
      
      const response = await apiClient.delete(`/api/notifications/templates/${templateId}`)
      
      if (response.success) {
        // Recarregar templates
        const templatesResponse = await apiClient.get('/api/notifications/templates')
        if (templatesResponse.success && templatesResponse.data) {
          const templatesData = Array.isArray(templatesResponse.data) ? templatesResponse.data as EmailTemplate[] : []
          setTemplates(templatesData)
        }
        console.log('✅ [TEMPLATES] Template excluído com sucesso')
      } else {
        throw new Error(response.message || 'Erro ao excluir template')
      }
    } catch (error: any) {
      console.error('❌ [TEMPLATES] Erro ao excluir template:', error)
      setError(error.message || 'Erro ao excluir template')
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header da Página */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Central de Notificações</h1>
              <p className="text-sm text-gray-500">
                Criar e gerenciar notificações e templates de email
              </p>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}