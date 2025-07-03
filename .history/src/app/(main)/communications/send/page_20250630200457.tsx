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
      console.log('🔍 [COMMUNICATIONS] Enviando comunicação...')

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
      const communicationData = {
        title: emailData.subject,
        message: emailData.message,
        type: 'communication',
        category: 'general',
        priority: 'medium',
        sendEmail: true,
        sendPush: false,
        iconType: emailData.iconType,
        recipients: {
          emails: emailData.recipients
        }
      }

      // Enviar via API
      console.log('🔍 [COMMUNICATIONS] Dados sendo enviados:', communicationData)
      const response = await apiClient.post('/api/communications/send', communicationData)
      
      if (response.success) {
        setSuccess(true)
        setSuccessMessage(`Comunicação enviada com sucesso para ${emailData.recipients.length} destinatário(s)!`)
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccess(false)
          setSuccessMessage('')
        }, 5000)
      } else {
        throw new Error(response.message || 'Erro ao enviar comunicação')
      }
    } catch (error: any) {
      console.error('❌ [COMMUNICATIONS] Erro ao enviar comunicação:', error)
      
      let errorMessage = 'Erro ao enviar comunicação'
      
      if (error?.message?.includes('401') || error?.status === 401) {
        console.error('🔐 [COMMUNICATIONS] Erro de autenticação detectado')
        clearAllTokens()
