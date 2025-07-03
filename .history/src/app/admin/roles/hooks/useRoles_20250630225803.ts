'use client'

import { useState, useEffect, useCallback } from 'react'
import { roleService, RoleFilters } from '@/services/roleService'
import { userService } from '@/services/userService'
import { RoleResponseDto, UserResponseDto } from '@/types/api'
import { getLoopPrevention } from '@/utils/loop-prevention'

interface RoleWithUsers extends RoleResponseDto {
  users?: UserResponseDto[]
  usersLoading?: boolean
  users_count?: number
}

interface UseRolesReturn {
  // Estado
  roles: RoleWithUsers[]
  allUsers: UserResponseDto[]
  loading: boolean
  error: string | null
  success: string | null
  rateLimitWarning: boolean
  
  // Ações
  loadRoles: () => Promise<void>
  loadUsers: () => Promise<void>
  createRole: (roleData: any) => Promise<void>
  updateRole: (id: string, roleData: any) => Promise<void>
  deleteRole: (roleId: string) => Promise<void>
  toggleRoleStatus: (roleId: string, active: boolean) => Promise<void>
  duplicateRole: (roleId: string, newName: string) => Promise<void>
  assignUsers: (roleId: string, userIds: string[]) => Promise<void>
  
  // Utilitários
  clearMessages: () => void
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<RoleWithUsers[]>([])
  const [allUsers, setAllUsers] = useState<UserResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)

  // Limpar mensagens automaticamente após 3 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Reset do sistema de prevenção de loops
      const loopPrevention = getLoopPrevention()
      if (loopPrevention) {
        const stats = loopPrevention.getStats()
        if (stats.blockedUrls > 0) {
          console.log(`🔄 Limpando ${stats.blockedUrls} URLs bloqueadas`)
          loopPrevention.clearBlocks()
        }
      }

      const response = await roleService.getRoles({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      })
      
      const rolesWithUsers = response.items.map(role => ({
        ...role,
        users: [],
        usersLoading: false
      }))
      
      setRoles(rolesWithUsers)
      
      // Carregar usuários para cada role sequencialmente
      if (rolesWithUsers.length > 0) {
        setRateLimitWarning(true)
        
        for (let i = 0; i < rolesWithUsers.length; i++) {
          const role = rolesWithUsers[i]
          await loadUsersForRole(role.id)
          
          // Delay entre requisições
          if (i < rolesWithUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        setRateLimitWarning(false)
      }
      
    } catch (err) {
      console.error('Erro ao carregar roles:', err)
      setError('Não foi possível carregar as funções. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsersForRole = useCallback(async (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, usersLoading: true } : role
    ))

    try {
      const response = await userService.getUsersByRole(roleId)
      setRoles(prev => prev.map(role =>
        role.id === roleId ? {
          ...role,
          users: Array.isArray(response) ? response as unknown as UserResponseDto[] : [],
          users_count: Array.isArray(response) ? response.length : 0,
          usersLoading: false
        } : role
      ))
    } catch (err) {
      console.error(`Erro ao carregar usuários da role ${roleId}:`, err)
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { 
          ...role, 
          users: [],
          users_count: 0,
          usersLoading: false 
        } : role
      ))
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const response = await userService.getUsers({
        page: 1,
        limit: 1000,
        sortBy: 'fullName',
        sortOrder: 'asc'
      })
      setAllUsers(response.items as unknown as UserResponseDto[])
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }, [])

  const createRole = useCallback(async (roleData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await roleService.createRole(roleData)
      setSuccess('Função criada com sucesso!')
      await loadRoles()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar função')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles])

  const updateRole = useCallback(async (id: string, roleData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await roleService.updateRole(id, roleData)
      setSuccess('Função atualizada com sucesso!')
      await loadRoles()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar função')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles])

  const deleteRole = useCallback(async (roleId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await roleService.deleteRole(roleId)
      setSuccess('Função excluída com sucesso!')
      await loadRoles()
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir função')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles])

  const toggleRoleStatus = useCallback(async (roleId: string, active: boolean) => {
    setLoading(true)
    setError(null)
    
    try {
      await roleService.toggleRoleStatus(roleId, active)
      setSuccess(`Função ${active ? 'ativada' : 'desativada'} com sucesso!`)
      await loadRoles()
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status da função')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles])

  const duplicateRole = useCallback(async (roleId: string, newName: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await roleService.duplicateRole(roleId, newName)
      setSuccess('Função duplicada com sucesso!')
      await loadRoles()
    } catch (err: any) {
      setError(err.message || 'Erro ao duplicar função')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles])

  const assignUsers = useCallback(async (roleId: string, userIds: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      // Atribuir usuários sequencialmente para evitar rate limiting
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i]
        await userService.updateUser(userId, { roleId: roleId })
        
        if (i < userIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      setSuccess('Usuários atribuídos com sucesso!')
      await Promise.all([loadRoles(), loadUsers()])
    } catch (err: any) {
      setError(err.message || 'Erro ao atribuir usuários')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadRoles, loadUsers])

  return {
    // Estado
    roles,
    allUsers,
    loading,
    error,
    success,
    rateLimitWarning,
    
    // Ações
    loadRoles,
    loadUsers,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    duplicateRole,
    assignUsers,
    
    // Utilitários
    clearMessages,
    setError,
    setSuccess
  }
}