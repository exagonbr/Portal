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
<div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('compose')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'compose'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Compor Notificação
                </span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  Templates de Email
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'compose' ? (
          <ComposeTab
            form={form}
            setForm={setForm}
            templates={templates}
            onApplyTemplate={handleApplyTemplate}
            availableUsers={availableUsers}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            getAvailableRoles={getAvailableRoles}
            handleRecipientTypeChange={handleRecipientTypeChange}
            handleRoleSelection={handleRoleSelection}
            handleSubmit={handleSubmit}
            handleTestEmail={handleTestEmail}
            handleTestPushNotification={handleTestPushNotification}
            handleEnablePushNotifications={handleEnablePushNotifications}
            loading={loading}
            success={success}
            error={error}
            pushStatus={pushStatus}
            testResults={testResults}
            user={user}
            router={router}
          />
        ) : (
          <TemplatesTab
            templates={templates}
            loading={templatesLoading}
            onApply={handleApplyTemplate}
            onEdit={handleEditTemplate}
            onCreate={handleCreateTemplate}
            onDelete={handleDeleteTemplate}
            onRefresh={() => {
              // Recarregar templates
              const loadTemplates = async () => {
                try {
                  setTemplatesLoading(true)
                  const response = await apiClient.get('/api/notifications/templates')
                  if (response.success && response.data) {
                    const templatesData = Array.isArray(response.data) ? response.data as EmailTemplate[] : []
                    setTemplates(templatesData)
                  }
                } catch (error) {
                  console.error('Erro ao recarregar templates:', error)
                } finally {
                  setTemplatesLoading(false)
                }
              }
              loadTemplates()
            }}
          />
        )}

        {/* Modal de Template */}
        {templateModalOpen && editingTemplate && (
          <TemplateModal
            template={editingTemplate}
            onSave={handleSaveTemplate}
            onClose={() => {
              setTemplateModalOpen(false)
              setEditingTemplate(null)
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

// Componente para a aba de composição
function ComposeTab({
  form,
  setForm,
  templates,
  onApplyTemplate,
  availableUsers,
  selectedUsers,
  toggleUserSelection,
  getAvailableRoles,
  handleRecipientTypeChange,
  handleRoleSelection,
  handleSubmit,
  handleTestEmail,
  handleTestPushNotification,
  handleEnablePushNotifications,
  loading,
  success,
  error,
  pushStatus,
  testResults,
  user,
  router
}: any) {
  return (
    <div className="space-y-6">
      {/* Seletor de Template */}
      {templates.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Carregar Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template: EmailTemplate) => (
                <button
                  key={template.id}
                  onClick={() => onApplyTemplate(template)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-500 truncate">{template.subject}</div>
                  <div className="text-xs text-blue-600 mt-1">{template.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="material-symbols-outlined text-green-600 mr-2">
              check_circle
            </span>
            <p className="text-green-800 font-medium">✅ Notificação enviada com sucesso!</p>
          </div>
          <div className="text-sm text-green-700 ml-6">
            <p>• Título: "{form.title}"</p>
            <p>• Métodos: {
              form.notificationMethod === 'both' ? 'Push + Email' : 
              form.notificationMethod === 'push' ? 'Push Notification' : 'Email'
            }</p>
            <p>• Destinatários: {
              form.recipients.type === 'all' ? 'Todos os usuários permitidos' :
              form.recipients.type === 'role' ? `Funções selecionadas (${form.recipients.roles?.length || 0})` :
              `Usuários específicos (${selectedUsers.length})`
            }</p>
            <p>• Enviado em: {new Date().toLocaleString('pt-BR')}</p>
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
                  
                  if (response.success === true) {
                    const data = response.data as any
                    const statusMessage = `✅ Configuração de Email Verificada
                    
📧 Status: ${data?.message || 'Configuração OK'}
🔗 Conectado: ${data?.connected ? 'Sim' : 'Não'}
⚡ Habilitado: ${data?.enabled ? 'Sim' : 'Não'}
📨 Provedor: ${data?.provider || 'Gmail SMTP'}
📍 Servidor: ${data?.host || 'smtp.gmail.com'}

✅ Sistema pronto para enviar emails!`
                    
                    alert(statusMessage)
                  } else {
                    alert(`❌ Erro na verificação: ${response.message || 'Falha na verificação'}`)
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
                  <p className="text-xs text-gray-600 mb-2">
                    O email de teste será enviado para: <strong>{user?.email || 'seu email'}</strong>
                  </p>
                </div>
                <button
                  onClick={handleTestEmail}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {loading && testResults.email === undefined ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span className="material-symbols-outlined text-sm">email</span>
                  )}
                  <span>Verificar Email</span>
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
              onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o título da notificação"
            />
          </div>

          {/* Mensagem com Editor HTML */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem * (Suporte HTML)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center space-x-2 text-sm">
                <span className="material-symbols-outlined text-sm text-gray-600">code</span>
                <span className="text-gray-600">Editor HTML</span>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    const preview = window.open('', '_blank', 'width=600,height=400')
                    if (preview) {
                      preview.document.write(`
                        <html>
                          <head><title>Preview</title></head>
                          <body style="font-family: Arial, sans-serif; padding: 20px;">
                            <h3>Preview da Mensagem:</h3>
                            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
                              ${form.message}
                            </div>
                          </body>
                        </html>
                      `)
                      preview.document.close()
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Preview
                </button>
              </div>
              <textarea
                required
                rows={8}
                value={form.message}
                onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, message: e.target.value }))}
                className="w-full p-3 border-0 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Digite a mensagem da notificação (HTML permitido)&#10;&#10;Exemplo:&#10;<h2>Título</h2>&#10;<p>Sua mensagem aqui com <strong>formatação</strong></p>&#10;<ul>&#10;  <li>Item 1</li>&#10;  <li>Item 2</li>&#10;</ul>"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>💡 Você pode usar HTML para formatar sua mensagem:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><code>&lt;h1&gt;Título&lt;/h1&gt;</code> - Título grande</div>
                <div><code>&lt;strong&gt;Negrito&lt;/strong&gt;</code> - Texto em negrito</div>
                <div><code>&lt;em&gt;Itálico&lt;/em&gt;</code> - Texto em itálico</div>
                <div><code>&lt;br&gt;</code> - Quebra de linha</div>
                <div><code>&lt;ul&gt;&lt;li&gt;Item&lt;/li&gt;&lt;/ul&gt;</code> - Lista</div>
                <div><code>&lt;a href="url"&gt;Link&lt;/a&gt;</code> - Link</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, type: e.target.value as NotificationForm['type'] }))}
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
                onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, category: e.target.value as NotificationForm['category'] }))}
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
                onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, priority: e.target.value as NotificationForm['priority'] }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Método de Notificação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Método de Envio
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="notificationMethod"
                  value="push"
                  checked={form.notificationMethod === 'push'}
                  onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, notificationMethod: e.target.value as NotificationForm['notificationMethod'], emailTemplate: null }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                  type="radio"
                  name="notificationMethod"
                  value="email"
                  checked={form.notificationMethod === 'email'}
                  onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, notificationMethod: e.target.value as NotificationForm['notificationMethod'] }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="notificationMethod"
                  value="both"
                  checked={form.notificationMethod === 'both'}
                  onChange={(e) => setForm((prev: NotificationForm) => ({ ...prev, notificationMethod: e.target.value as NotificationForm['notificationMethod'] }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">Ambos (Push + Email)</span>
              </label>
            </div>
          </div>

          {/* Seleção de Template de Email */}
          {(form.notificationMethod === 'email' || form.notificationMethod === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de Email
              </label>
              <select
                value={form.emailTemplate || ''}
                onChange={(e) => {
                  const templateId = e.target.value ? parseInt(e.target.value) : null
                  setForm((prev: NotificationForm) => ({ ...prev, emailTemplate: templateId }))
                  
                  // Aplicar template automaticamente se selecionado
                  if (templateId) {
                    const selectedTemplate = templates.find((t: EmailTemplate) => t.id === templateId)
                    if (selectedTemplate) {
                      setForm((prev: NotificationForm) => ({
                        ...prev,
                        title: selectedTemplate.subject,
                        message: selectedTemplate.html
                      }))
                    }
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um template (opcional)</option>
                {templates.filter((t: EmailTemplate) => t.is_active).map((template: EmailTemplate) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Ao selecionar um template, o título e mensagem serão preenchidos automaticamente
              </p>
            </div>
          )}

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
                  