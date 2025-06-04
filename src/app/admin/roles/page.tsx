'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Interface Role local com todos os campos necessários
interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  scope: 'system' | 'institution' | 'school'
  contextId: string | null
  type: 'system' | 'custom'
  status: 'active' | 'inactive'
  userCount: number
  is_system_role: boolean
  created_at: string
  updated_at: string
}

// Tipos para a hierarquia
interface Institution {
  id: string
  name: string
  code: string
  type: 'university' | 'school_group' | 'educational_system'
  status: 'active' | 'inactive'
  createdAt: string
  schoolsCount: number
  usersCount: number
}

interface School {
  id: string
  name: string
  code: string
  institutionId: string
  type: 'elementary' | 'middle' | 'high' | 'university' | 'technical'
  status: 'active' | 'inactive'
  createdAt: string
  usersCount: number
}

interface User {
  id: string
  name: string
  email: string
  institutionId: string
  schoolId?: string
  roles: string[]
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  scope: 'system' | 'institution' | 'school'
}

interface Resource {
  id: string
  name: string
  description: string
}

interface HierarchyLevel {
  type: 'system' | 'institution' | 'school' | 'user'
  id?: string
  name: string
}

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Hooks customizados para APIs
function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitutions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/institutions')
      if (!response.ok) throw new Error('Erro ao carregar instituições')
      const data: ApiResponse<Institution[]> = await response.json()
      setInstitutions(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [])

  return { institutions, loading, error, refetch: fetchInstitutions }
}

function useSchools(institutionId?: string) {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchools = async () => {
    if (!institutionId) {
      setSchools([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/institutions/${institutionId}/schools`)
      if (!response.ok) throw new Error('Erro ao carregar escolas')
      const data: ApiResponse<School[]> = await response.json()
      setSchools(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [institutionId])

  return { schools, loading, error, refetch: fetchSchools }
}

function useRoles(currentLevel: HierarchyLevel) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/admin/roles'
      if (currentLevel.type === 'institution' && currentLevel.id) {
        url += `?institutionId=${currentLevel.id}`
      } else if (currentLevel.type === 'school' && currentLevel.id) {
        url += `?schoolId=${currentLevel.id}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Erro ao carregar funções')
      const data: ApiResponse<Role[]> = await response.json()
      setRoles(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const createRole = async (roleData: Partial<Role>) => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roleData,
          scope: currentLevel.type === 'system' ? 'system' : 
                 currentLevel.type === 'institution' ? 'institution' : 'school',
          contextId: currentLevel.id
        })
      })
      if (!response.ok) throw new Error('Erro ao criar função')
      await fetchRoles()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const updateRole = async (roleId: string, roleData: Partial<Role>) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      })
      if (!response.ok) throw new Error('Erro ao atualizar função')
      await fetchRoles()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const deleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro ao excluir função')
      await fetchRoles()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const updateRolePermissions = async (roleId: string, permissions: string[]) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      })
      if (!response.ok) throw new Error('Erro ao atualizar permissões')
      await fetchRoles()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [currentLevel])

  return { 
    roles, 
    loading, 
    error, 
    createRole, 
    updateRole, 
    deleteRole, 
    updateRolePermissions,
    refetch: fetchRoles 
  }
}

function useUsers(currentLevel: HierarchyLevel) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/admin/users'
      if (currentLevel.type === 'institution' && currentLevel.id) {
        url += `?institutionId=${currentLevel.id}`
      } else if (currentLevel.type === 'school' && currentLevel.id) {
        url += `?schoolId=${currentLevel.id}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      const data: ApiResponse<User[]> = await response.json()
      setUsers(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRoles = async (userId: string, roles: string[]) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles })
      })
      if (!response.ok) throw new Error('Erro ao atualizar funções do usuário')
      await fetchUsers()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentLevel])

  return { users, loading, error, updateUserRoles, refetch: fetchUsers }
}

function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [permissionsRes, resourcesRes] = await Promise.all([
        fetch('/api/admin/permissions'),
        fetch('/api/admin/resources')
      ])

      if (!permissionsRes.ok || !resourcesRes.ok) {
        throw new Error('Erro ao carregar permissões ou recursos')
      }

      const [permissionsData, resourcesData] = await Promise.all([
        permissionsRes.json() as Promise<ApiResponse<Permission[]>>,
        resourcesRes.json() as Promise<ApiResponse<Resource[]>>
      ])

      setPermissions(permissionsData.data)
      setResources(resourcesData.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { permissions, resources, loading, error, refetch: fetchData }
}

function useStats(currentLevel: HierarchyLevel) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/admin/stats'
      if (currentLevel.type === 'institution' && currentLevel.id) {
        url += `?institutionId=${currentLevel.id}`
      } else if (currentLevel.type === 'school' && currentLevel.id) {
        url += `?schoolId=${currentLevel.id}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Erro ao carregar estatísticas')
      const data: ApiResponse<Record<string, number>> = await response.json()
      setStats(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [currentLevel])

  return { stats, loading, error, refetch: fetchStats }
}

// Componente de navegação hierárquica
interface HierarchyNavigationProps {
  currentLevel: HierarchyLevel
  onLevelChange: (level: HierarchyLevel) => void
}

function HierarchyNavigation({ currentLevel, onLevelChange }: HierarchyNavigationProps) {
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { schools, loading: schoolsLoading } = useSchools(
    currentLevel.type === 'institution' ? currentLevel.id : undefined
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Navegação Hierárquica</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onLevelChange({ type: 'system', name: 'Sistema' })}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            currentLevel.type === 'system'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏢 Sistema
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">→</span>
          <select
            value={currentLevel.type === 'institution' ? currentLevel.id : ''}
            onChange={(e) => {
              const inst = institutions.find(i => i.id === e.target.value)
              if (inst) {
                onLevelChange({ type: 'institution', id: inst.id, name: inst.name })
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
            disabled={institutionsLoading}
          >
            <option value="">
              {institutionsLoading ? 'Carregando...' : 'Selecionar Instituição'}
            </option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>

        {currentLevel.type === 'institution' && currentLevel.id && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">→</span>
            <select
              value=""
              onChange={(e) => {
                const school = schools.find(s => s.id === e.target.value)
                if (school) {
                  onLevelChange({ type: 'school', id: school.id, name: school.name })
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              disabled={schoolsLoading}
            >
              <option value="">
                {schoolsLoading ? 'Carregando...' : 'Selecionar Escola'}
              </option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
        )}

        {currentLevel.type === 'school' && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">→</span>
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
              {currentLevel.name}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <strong>Nível Atual:</strong> {currentLevel.name}
        {currentLevel.type !== 'system' && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {currentLevel.type === 'institution' ? 'Instituição' : 
             currentLevel.type === 'school' ? 'Escola' : 'Usuário'}
          </span>
        )}
      </div>
    </div>
  )
}

// Componente de estatísticas por nível
interface LevelStatsProps {
  currentLevel: HierarchyLevel
}

function LevelStats({ currentLevel }: LevelStatsProps) {
  const { stats, loading, error } = useStats(currentLevel)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700">Erro ao carregar estatísticas: {error}</p>
      </div>
    )
  }

  const getStatsLabels = () => {
    switch (currentLevel.type) {
      case 'system':
        return {
          institutions: 'Instituições',
          schools: 'Escolas', 
          users: 'Usuários',
          roles: 'Funções'
        }
      case 'institution':
        return {
          schools: 'Escolas',
          users: 'Usuários',
          roles: 'Funções',
          activeUsers: 'Usuários Ativos'
        }
      case 'school':
        return {
          users: 'Usuários',
          roles: 'Funções',
          activeUsers: 'Usuários Ativos',
          teachers: 'Professores'
        }
      default:
        return {}
    }
  }

  const labels = getStatsLabels()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {Object.entries(labels).map(([key, label]) => (
        <div key={key} className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-800">{stats[key] || 0}</div>
          <div className="mt-4 flex items-center">
            <span className="text-primary text-sm">
              {currentLevel.type === 'system' ? 'Global' :
               currentLevel.type === 'institution' ? 'Instituição' : 'Escola'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente de gestão de roles
interface RoleManagementProps {
  currentLevel: HierarchyLevel
}

function RoleManagement({ currentLevel }: RoleManagementProps) {
  const { 
    roles, 
    loading, 
    error, 
    createRole, 
    updateRole, 
    deleteRole, 
    updateRolePermissions 
  } = useRoles(currentLevel)

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showNewRoleModal, setShowNewRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  const handleNewRole = async (roleData: Partial<Role>) => {
    try {
      await createRole(roleData)
      setShowNewRoleModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar função')
    }
  }

  const handleEditRole = async (roleData: Partial<Role>) => {
    if (!selectedRole) return
    try {
      await updateRole(selectedRole.id, roleData)
      setSelectedRole(null)
      setShowEditRoleModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar função')
    }
  }

  const handleUpdatePermissions = async (permissions: string[]) => {
    if (!selectedRole) return
    try {
      await updateRolePermissions(selectedRole.id, permissions)
      setSelectedRole(null)
      setShowPermissionsModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar permissões')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta função?')) return
    try {
      await deleteRole(roleId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir função')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erro ao carregar funções: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Gestão de Funções - {currentLevel.name}
          </h2>
          <p className="text-gray-600">
            {roles.length} função(ões) disponível(eis) neste nível
          </p>
        </div>
        <button 
          onClick={() => setShowNewRoleModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center space-x-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Nova Função</span>
        </button>
      </div>

      {/* Lista de roles */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escopo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">
                          {role.scope === 'system' ? 'admin_panel_settings' : 
                           role.scope === 'institution' ? 'business' : 
                           role.scope === 'school' ? 'school' : 'person'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.scope === 'system' ? 'bg-purple-100 text-purple-800' :
                      role.scope === 'institution' ? 'bg-blue-100 text-blue-800' :
                      role.scope === 'school' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {role.scope === 'system' ? 'Sistema' :
                       role.scope === 'institution' ? 'Instituição' :
                       role.scope === 'school' ? 'Escola' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.type === 'system'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent-purple/20 text-accent-purple'
                    }`}>
                      {role.type === 'system' ? 'Sistema' : 'Personalizada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.userCount} usuários
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.permissions.length} permissões
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.status === 'active'
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-error/20 text-error'
                    }`}>
                      {role.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedRole(role)
                          setShowEditRoleModal(true)
                        }}
                        className="text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRole(role)
                          setShowPermissionsModal(true)
                        }}
                        className="text-accent-purple hover:text-accent-purple/80 transition-colors duration-200"
                      >
                        Permissões
                      </button>
                      {role.type === 'custom' && (
                        <button 
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-error hover:text-error/80 transition-colors duration-200"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Nenhuma função encontrada neste nível</p>
          <button
            onClick={() => setShowNewRoleModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Criar primeira função
          </button>
        </div>
      )}

      {/* Modals seriam implementados aqui */}
    </div>
  )
}

// Componente de gestão de usuários
interface UserManagementProps {
  currentLevel: HierarchyLevel
}

function UserManagement({ currentLevel }: UserManagementProps) {
  const { users, loading, error, updateUserRoles } = useUsers(currentLevel)
  const { roles } = useRoles(currentLevel)

  const handleRoleAssignment = async (userId: string, roleIds: string[]) => {
    try {
      await updateUserRoles(userId, roleIds)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar funções do usuário')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erro ao carregar usuários: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Gestão de Usuários - {currentLevel.name}
          </h2>
          <p className="text-gray-600">
            {users.length} usuário(s) neste nível
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funções
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(roleId => {
                        const role = roles.find(r => r.id === roleId)
                        return role ? (
                          <span key={roleId} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            {role.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-accent-green/20 text-accent-green' :
                      user.status === 'inactive' ? 'bg-error/20 text-error' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? 'Ativo' :
                       user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark transition-colors duration-200 mr-3">
                      Editar Funções
                    </button>
                    <button className="text-accent-purple hover:text-accent-purple/80 transition-colors duration-200">
                      Ver Perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhum usuário encontrado neste nível</p>
        </div>
      )}
    </div>
  )
}

// Componente de matriz de permissões
interface PermissionsMatrixProps {
  currentLevel: HierarchyLevel
}

function PermissionsMatrix({ currentLevel }: PermissionsMatrixProps) {
  const { permissions, resources, loading, error } = usePermissions()
  const { roles } = useRoles(currentLevel)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erro ao carregar permissões: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Matriz de Permissões - {currentLevel.name}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurso
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visualizar
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criar
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Editar
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Excluir
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.description}</div>
                </td>
                {['read', 'create', 'update', 'delete'].map((action) => {
                  const permission = permissions.find(p => 
                    p.resource === resource.id && p.action === action
                  )
                  const hasPermission = permission && roles.some(role => 
                    role.permissions.includes(permission.id) && role.status === 'active'
                  )
                  return (
                    <td key={action} className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-primary rounded focus:ring-accent-blue"
                        checked={!!hasPermission} 
                        readOnly 
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente principal
export default function AdminRolesPage() {
  const { user } = useAuth()
  const [currentLevel, setCurrentLevel] = useState<HierarchyLevel>({ type: 'system', name: 'Sistema' })
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Permissões</h1>
        <p className="text-gray-600">Configure funções, permissões e usuários em todos os níveis hierárquicos</p>
      </div>

      {/* Navegação hierárquica */}
      <HierarchyNavigation 
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
      />

      {/* Estatísticas do nível atual */}
      <LevelStats currentLevel={currentLevel} />

      {/* Tabs de navegação */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'roles'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Funções
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'users'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'permissions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Matriz de Permissões
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="space-y-6">
        {activeTab === 'roles' && <RoleManagement currentLevel={currentLevel} />}
        {activeTab === 'users' && <UserManagement currentLevel={currentLevel} />}
        {activeTab === 'permissions' && <PermissionsMatrix currentLevel={currentLevel} />}
      </div>
    </div>
  )
}
