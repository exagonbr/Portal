'use client'

import { useState, useMemo } from 'react'
import { RoleResponseDto, UserResponseDto } from '@/types/api'

interface RoleWithUsers extends RoleResponseDto {
  users?: UserResponseDto[]
  usersLoading?: boolean
  users_count?: number
}

interface RoleFilters {
  search: string
  status: string
  hasUsers: string
  permissionType: string
}

interface UseRoleFiltersReturn {
  filters: RoleFilters
  filteredRoles: RoleWithUsers[]
  showFilters: boolean
  setFilters: (filters: RoleFilters) => void
  setShowFilters: (show: boolean) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

const initialFilters: RoleFilters = {
  search: '',
  status: '',
  hasUsers: '',
  permissionType: ''
}

export const useRoleFilters = (roles: RoleWithUsers[]): UseRoleFiltersReturn => {
  const [filters, setFilters] = useState<RoleFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '')
  }, [filters])

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      // Filtro de busca
      const matchesSearch = !filters.search || 
        role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(filters.search.toLowerCase()))
      
      // Filtro de status
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && role.active) ||
        (filters.status === 'inactive' && !role.active)
      
      // Filtro de usuários
      const matchesHasUsers = !filters.hasUsers ||
        (filters.hasUsers === 'with_users' && (role.users_count || 0) > 0) ||
        (filters.hasUsers === 'without_users' && (role.users_count || 0) === 0)

      // Filtro de tipo de permissão (implementação futura se necessário)
      const matchesPermissionType = !filters.permissionType
      // TODO: Implementar filtro por tipo de permissão quando necessário

      return matchesSearch && matchesStatus && matchesHasUsers && matchesPermissionType
    })
  }, [roles, filters])

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  return {
    filters,
    filteredRoles,
    showFilters,
    setFilters,
    setShowFilters,
    clearFilters,
    hasActiveFilters
  }
}