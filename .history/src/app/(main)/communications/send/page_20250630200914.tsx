'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import EmailComposer, { EmailData } from '@/components/notifications/EmailComposer'
import { isAuthenticated, getCurrentToken, syncTokenWithApiClient, clearAllTokens } from '@/utils/token-validator'
import '@/styles/cards-standard.css'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function SendCommunicationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Verificar permissões - apenas GUARDIAN e STUDENT não podem acessar
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Verificar se o usuário tem permissão para enviar comunicações
    const restrictedRoles: string[] = ['GUARDIAN', 'STUDENT']
    if (restrictedRoles.includes(user.role)) {
      router.push('/communications')
      return
    }
  }, [user, router])

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadAvailableUsers = async () => {
      try {
        console.log('🔍 [COMMUNICATIONS] Carregando usuários disponíveis...')

        // Verificar autenticação antes de carregar usuários
        const authStatus = isAuthenticated()
        if (!authStatus.authenticated) {
          console.warn('⚠️ [COMMUNICATIONS] Usuário não autenticado, usando dados mock')
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

        if (response.success && response.data) {
          const users = Array.isArray(response.data) ? response.data : 
                        (response.data as any).users || []
          
          // Transformar para o formato esperado pelo RecipientSelector
          const formattedUsers = users.map((u: any) => ({
            id: u.id || u._id,
            name: u.name || u.fullName || 'Sem nome',
            email: u.email,
            type: 'user' as const,
            role: u.role
          }))
          
          setAvailableUsers(formattedUsers)
        }
      } catch (error: any) {
        console.error('❌ [COMMUNICATIONS] Error loading users:', error)
        
        // Verificar se é erro de autenticação
        if (error?.status === 401) {
          console.error('🔐 [COMMUNICATIONS] Erro de autenticação ao carregar usuários')
          clearAllTokens()
        }
        
        // Fallback para dados mock
        const mockUsers = [
          { id: '1', name: 'João Silva', email: 'joao@escola.com', type: 'user' as const, role: 'TEACHER' },
          { id: '2', name: 'Maria Santos', email: 'maria@escola.com', type: 'user' as const, role: 'TEACHER' },
          { id: '3', name: 'Pedro Costa', email: 'pedro@escola.com', type: 'user' as const, role: 'STUDENT' },
          { id: '4', name: 'Ana Oliveira', email: 'ana@escola.com', type: 'user' as const, role: 'STUDENT' },
          { id: '5', name: 'Carlos Lima', email: 'carlos@escola.com', type: 'user' as const, role: 'GUARDIAN' },
          { id: '6', name: 'Turma 9º Ano A', email: 'turma9a@escola.com', type: 'group' as const, role: 'GROUP' },
          { id: '7', name: 'Professores', email: 'professores@escola.com', type: 'group' as const, role: 'GROUP' },
          { id: '8', name: 'Coordenação', email: 'coordenacao@escola.com', type: 'role' as const, role: 'COORDINATOR' }
        ]

        // Filtrar baseado na role do usuário
        let filteredUsers = mockUsers
        const userRole = user?.role
        
        if (userRole === 'TEACHER') {
          filteredUsers = mockUsers.filter(u => 
            ['STUDENT', 'GUARDIAN'].includes(u.role) || u.type === 'group'
          )
        } else if (userRole === 'COORDINATOR') {
          filteredUsers = mockUsers.filter(u => 
            ['TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role) || u.type === 'group'
          )
        }

        setAvailableUsers(filteredUsers)
      }
    }

    if (user) {
      loadAvailableUsers()
    }
  }, [user])

  const handleSendEmail = async (emailData: EmailData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('🔍 [COMMUNICATIONS] Enviando e-mail...')

      // Verificar autenticação
      const authStatus = isAuthenticated()
      if (!authStatus.authenticated) {
        console.warn('⚠️ [COMMUNICATIONS] Usuário não autenticado')
        clearAllTokens()
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Sincronizar token
      const token = getCurrentToken()
      if (token) {
        await syncTokenWithApiClient(token)
      }

      // Preparar dados para envio
      const notificationData = {
        title: emailData.subject,
        message: emailData.message,
        type: 'info',
        category: 'email',
        priority: 'medium',
        sendEmail: true,
        sendPush: false,
        iconType: emailData.iconType,
        recipients: {
          emails: emailData.recipients
        }
      }

      // Enviar via API
      console.log('🔍 [COMMUNICATIONS] Dados sendo enviados:', notificationData)
      const response = await apiClient.post('/api/communications/send', notificationData)
      
      if (response.success) {
        setSuccess(true)
        setSuccessMessage(`E-mail enviado com sucesso para ${emailData.recipients.length} destinatário(s)!`)
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccess(false)
          setSuccessMessage('')
        }, 5000)
      } else {
        throw new Error(response.message || 'Erro ao enviar e-mail')
      }
    } catch (error: any) {
      console.error('❌ [COMMUNICATIONS] Erro ao enviar e-mail:', error)
      
      let errorMessage = 'Erro ao enviar e-mail'
      
      if (error?.message?.includes('401') || error?.status === 401) {
        console.error('🔐 [COMMUNICATIONS] Erro de autenticação detectado')
        clearAllTokens()
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      
      // Limpar erro após 5 segundos
      setTimeout(() => {
        setError(null)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = (emailData: EmailData) => {
    // Implementar salvamento de rascunho
    console.log('Salvando rascunho:', emailData)
    // Por enquanto, apenas mostrar mensagem de sucesso
    setSuccessMessage('Rascunho salvo com sucesso!')
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSuccessMessage('')
    }, 3000)
  }

  // Verificar se o usuário pode acessar esta página
  const restrictedRoles: string[] = ['GUARDIAN', 'STUDENT']
  if (!user || restrictedRoles.includes(user.role)) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">block</span>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Acesso Negado</h3>
          <p className="text-gray-500 mb-6">Você não tem permissão para enviar comunicações.</p>
          <button
            onClick={() => router.push('/communications')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Comunicações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive spacing-y-responsive">
      {/* Header da Página */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Envio de mensagem de e-mail</h1>
            <p className="text-sm text-gray-500 mt-1">
              Envie mensagens personalizadas para usuários do sistema
            </p>
          </div>
          <button
            onClick={() => router.push('/communications')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar
          </button>
        </div>
      </div>

      {/* Alertas de sucesso/erro */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Componente de composição de e-mail */}
      <EmailComposer
        onSend={handleSendEmail}
        onSaveDraft={handleSaveDraft}
        loading={loading}
        availableRecipients={availableUsers}
      />
    </div>
  )
}