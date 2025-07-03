import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { isAuthenticated, getCurrentToken, syncTokenWithApiClient, clearAllTokens } from '@/utils/token-validator'

interface User {
  id: string
  name: string
  email: string
  role: string
  type?: 'user' | 'group' | 'role'
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@escola.com', type: 'user', role: 'TEACHER' },
  { id: '2', name: 'Maria Santos', email: 'maria@escola.com', type: 'user', role: 'TEACHER' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@escola.com', type: 'user', role: 'STUDENT' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@escola.com', type: 'user', role: 'STUDENT' },
  { id: '5', name: 'Carlos Lima', email: 'carlos@escola.com', type: 'user', role: 'GUARDIAN' },
  { id: '6', name: 'Turma 9º Ano A', email: 'turma9a@escola.com', type: 'group', role: 'GROUP' },
  { id: '7', name: 'Professores', email: 'professores@escola.com', type: 'group', role: 'GROUP' },
  { id: '8', name: 'Coordenação', email: 'coordenacao@escola.com', type: 'role', role: 'COORDINATOR' }
]

export function useAvailableUsers(userRole?: string) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userRole) {
      setLoading(false)
      return
    }

    const loadAvailableUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔍 [useAvailableUsers] Carregando usuários disponíveis para role:', userRole)

        // Verificar autenticação
        const authStatus = isAuthenticated()
        if (!authStatus.authenticated) {
          console.warn('⚠️ [useAvailableUsers] Usuário não autenticado, usando dados mock')
          throw new Error('Não autenticado')
        }

        // Sincronizar token
        const token = getCurrentToken()
        if (token) {
          await syncTokenWithApiClient(token)
        }

        // Determinar roles permitidas baseado na role do usuário
        let roles = ''
        if (userRole === 'SYSTEM_ADMIN') {
          roles = 'INSTITUTION_MANAGER,COORDINATOR,TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'INSTITUTION_MANAGER') {
          roles = 'COORDINATOR,TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'COORDINATOR') {
          roles = 'TEACHER,STUDENT,GUARDIAN'
        } else if (userRole === 'TEACHER') {
          roles = 'STUDENT,GUARDIAN'
        }

        // Buscar usuários do backend
        const response = await apiClient.get(`/api/users?limit=100${roles ? `&roles=${roles}` : ''}`)

        if (response.success && response.data) {
          const users = Array.isArray(response.data) ? response.data : 
                        (response.data as any).users || []
          
          // Transformar para o formato esperado
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
        console.log('❌ [useAvailableUsers] Erro ao carregar usuários:', error)
        
        // Verificar se é erro de autenticação
        if (error?.status === 401 || error?.message?.includes('401')) {
          console.log('🔐 [useAvailableUsers] Erro de autenticação detectado')
          // Não chamar clearAllTokens aqui para evitar loops
          setError('Sessão expirada. Faça login novamente.')
        }
        
        // Usar dados mock como fallback
        let filteredUsers = MOCK_USERS
        
        if (userRole === 'TEACHER') {
          filteredUsers = MOCK_USERS.filter(u =>
            ['STUDENT', 'GUARDIAN'].includes(u.role) || u.type === 'group'
          )
        } else if (userRole === 'COORDINATOR') {
          filteredUsers = MOCK_USERS.filter(u =>
            ['TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role) || u.type === 'group'
          )
        } else if (userRole === 'INSTITUTION_MANAGER') {
          filteredUsers = MOCK_USERS.filter(u =>
            ['COORDINATOR', 'TEACHER', 'STUDENT', 'GUARDIAN'].includes(u.role) || u.type === 'group' || u.type === 'role'
          )
        }

        setAvailableUsers(filteredUsers)
      } finally {
        setLoading(false)
      }
    }

    loadAvailableUsers()
  }, [userRole])

  return { availableUsers, loading, error }
}