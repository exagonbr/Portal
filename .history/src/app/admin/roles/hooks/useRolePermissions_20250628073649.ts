'use client'

import { useState, useCallback } from 'react'
import { roleService } from '@/services/roleService'

interface UseRolePermissionsReturn {
  permissions: Record<string, any>
  loadingPermissions: Record<string, boolean>
  loadPermissionsForRole: (roleId: string) => Promise<void>
  clearPermissionsCache: (roleId?: string) => void
}

export const useRolePermissions = (): UseRolePermissionsReturn => {
  const [permissions, setPermissions] = useState<Record<string, any>>({})
  const [loadingPermissions, setLoadingPermissions] = useState<Record<string, boolean>>({})

  const loadPermissionsForRole = useCallback(async (roleId: string) => {
    // Evitar carregamento duplicado
    if (loadingPermissions[roleId] || permissions[roleId]) {
      return
    }

    setLoadingPermissions(prev => ({ ...prev, [roleId]: true }))
    
    try {
      const permissionsData = await roleService.getPermissionsForRole(roleId)
      setPermissions(prev => ({ ...prev, [roleId]: permissionsData }))
    } catch (error) {
      console.error(`Erro ao carregar permissões da role ${roleId}:`, error)
      setPermissions(prev => ({ ...prev, [roleId]: null }))
    } finally {
      setLoadingPermissions(prev => ({ ...prev, [roleId]: false }))
    }
  }, [loadingPermissions, permissions])

  const clearPermissionsCache = useCallback((roleId?: string) => {
    if (roleId) {
      setPermissions(prev => {
        const newPermissions = { ...prev }
        delete newPermissions[roleId]
        return newPermissions
      })
      setLoadingPermissions(prev => {
        const newLoading = { ...prev }
        delete newLoading[roleId]
        return newLoading
      })
    } else {
      setPermissions({})
      setLoadingPermissions({})
    }
  }, [])

  return {
    permissions,
    loadingPermissions,
    loadPermissionsForRole,
    clearPermissionsCache
  }
}