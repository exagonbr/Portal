'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Key, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Check,
  X,
  Shield,
  Save,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Users,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  MoreHorizontal,
  Settings
} from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import { roleService, RoleFilters } from '@/services/roleService'
import { userService } from '@/services/userService'
import { PERMISSION_GROUPS } from '@/types/roleManagement'
import { RoleResponseDto, UserResponseDto } from '@/types/api'
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/types/roles'
import { getLoopPrevention } from '@/utils/loop-prevention'
import { StatCard, ContentCard, SimpleCard } from '@/components/ui/StandardCard'

interface RoleWithUsers extends RoleResponseDto {
  users?: UserResponseDto[]
  usersLoading?: boolean
}

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleData: any) => void
  loading: boolean
}

interface EditRoleModalProps {
  isOpen: boolean
  role: RoleResponseDto | null
  onClose: () => void
  onSave: (id: string, roleData: any) => void
  loading: boolean
}

interface UserAssignmentModalProps {
  isOpen: boolean
  role: RoleResponseDto | null
  users: UserResponseDto[]
  onClose: () => void
  onAssignUsers: (roleId: string, userIds: string[]) => void
  loading: boolean
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
    
    onSave({
      ...formData,
      permissions
    })
  }

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Criar Nova Função</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Função *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Coordenador Pedagógico"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição opcional da função"
              />
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-4">Permissões</h4>
            <div className="space-y-4">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-md">
                  <div className="p-3 bg-gray-50">
                    <h5 className="font-medium text-gray-800">{group.name}</h5>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {group.permissions.map(permission => (
                      <label key={permission.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions[permission.key] || false}
                          onChange={() => togglePermission(permission.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Criar Função</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, role, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || ''
      })

      // Carregar permissões da role
      const loadPermissions = async () => {
        try {
          const permissionsData = await roleService.getPermissionsForRole(role.id)
          const permissionsMap: Record<string, boolean> = {}
          
          // Se permissionsData tem a estrutura esperada
          if (permissionsData?.permissionGroups) {
            permissionsData.permissionGroups.forEach((group: any) => {
              group.permissions.forEach((permission: any) => {
                permissionsMap[permission.key] = permission.enabled || false
              })
            })
          } else {
            // Fallback para array simples de permissões
            const permissions = Array.isArray(permissionsData) ? permissionsData : (role.permissions || [])
            PERMISSION_GROUPS.forEach(group => {
              group.permissions.forEach(permission => {
                permissionsMap[permission.key] = permissions.includes(permission.key)
              })
            })
          }
          
          setSelectedPermissions(permissionsMap)
        } catch (error) {
          console.error('Erro ao carregar permissões:', error)
          // Fallback para permissões da role se disponível
          if (role.permissions) {
            const permissionsMap: Record<string, boolean> = {}
            PERMISSION_GROUPS.forEach(group => {
              group.permissions.forEach(permission => {
                permissionsMap[permission.key] = role.permissions?.includes(permission.key) || false
              })
            })
            setSelectedPermissions(permissionsMap)
          }
        }
      }

      loadPermissions()
    }
  }, [role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return

    const permissions = Object.entries(selectedPermissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
    
    onSave(role.id, {
      ...formData,
      permissions
    })
  }

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }))
  }

  if (!isOpen || !role) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Editar Função: {role.name}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Função *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-4">Permissões</h4>
            <div className="space-y-4">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-md">
                  <div className="p-3 bg-gray-50">
                    <h5 className="font-medium text-gray-800">{group.name}</h5>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {group.permissions.map(permission => (
                      <label key={permission.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions[permission.key] || false}
                          onChange={() => togglePermission(permission.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const UserAssignmentModal: React.FC<UserAssignmentModalProps> = ({ 
  isOpen, 
  role, 
  users, 
  onClose, 
  onAssignUsers, 
  loading 
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const handleSubmit = () => {
    if (!role) return
    onAssignUsers(role.id, selectedUsers)
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (!isOpen || !role) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Atribuir Usuários: {role.name}</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuários..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map(user => (
              <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                {user.role_id && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    Função atual
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedUsers.length} usuário(s) selecionado(s)
            </span>
            <div className="space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Atribuir Função</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [roles, setRoles] = useState<RoleWithUsers[]>([])
  const [allUsers, setAllUsers] = useState<UserResponseDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  
  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userAssignmentModalOpen, setUserAssignmentModalOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleResponseDto | null>(null)
  const [roleForUserAssignment, setRoleForUserAssignment] = useState<RoleResponseDto | null>(null)
  
  // Permissões
  const [rolePermissions, setRolePermissions] = useState<Record<string, any>>({})
  const [loadingPermissions, setLoadingPermissions] = useState<Record<string, boolean>>({})
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    hasUsers: '',
    permissionType: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    // Reset do sistema de prevenção de loops para garantir que não haja bloqueios residuais
    const loopPrevention = getLoopPrevention();
    if (loopPrevention) {
      console.log('🔄 Verificando sistema de prevenção de loops para página de roles');
      const stats = loopPrevention.getStats();
      if (stats.blockedUrls > 0) {
        console.log(`🔄 Encontrados ${stats.blockedUrls} URLs bloqueadas, limpando bloqueios`);
        loopPrevention.clearBlocks();
      }
    }

    loadRoles()
    loadUsers()
  }, [])

  // Aplicar filtros
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = !filters.search || 
        role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && role.active) ||
        (filters.status === 'inactive' && !role.active)
      
      const matchesHasUsers = !filters.hasUsers ||
        (filters.hasUsers === 'with_users' && (role.users_count || 0) > 0) ||
        (filters.hasUsers === 'without_users' && (role.users_count || 0) === 0)

      return matchesSearch && matchesStatus && matchesHasUsers
    })
  }, [roles, filters])

  const loadRoles = async () => {
    setLoadingRoles(true)
    setError(null)
    try {
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
      
      // Carregar usuários para cada role de forma sequencial com delay
      // para evitar ser detectado como loop de requisições
      const loadUsersSequentially = async () => {
        if (rolesWithUsers.length > 0) {
          setRateLimitWarning(true);
        }
        
        for (let i = 0; i < rolesWithUsers.length; i++) {
          const role = rolesWithUsers[i];
          await loadUsersForRole(role.id);
          
          // Adicionar pequeno delay entre requisições para evitar rate limiting
          if (i < rolesWithUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setRateLimitWarning(false);
      }
      
      // Executar carregamento sequencial
      loadUsersSequentially();
      
    } catch (err) {
      console.error('Erro ao carregar roles:', err)
      setError('Não foi possível carregar as funções. Tente novamente.')
    } finally {
      setLoadingRoles(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({
        page: 1,
        limit: 1000,
        sortBy: 'name',
        sortOrder: 'asc'
      })
      setAllUsers(response.items)
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const loadUsersForRole = async (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, usersLoading: true } : role
    ))

    try {
      const response = await userService.getUsersByRole(roleId)
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { 
          ...role, 
          users: Array.isArray(response) ? response : [],
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
  }

  const handleCreateRole = async (roleData: any) => {
    setLoading(true)
    setError(null)
    try {
      await roleService.createRole(roleData)
      setSuccess('Função criada com sucesso!')
      setCreateModalOpen(false)
      loadRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar função')
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = async (id: string, roleData: any) => {
    setLoading(true)
    setError(null)
    try {
      await roleService.updateRole(id, roleData)
      setSuccess('Função atualizada com sucesso!')
      setEditModalOpen(false)
      setRoleToEdit(null)
      
      // Limpar cache de permissões para a role editada
      setRolePermissions(prev => {
        const newPermissions = { ...prev }
        delete newPermissions[id]
        return newPermissions
      })
      
      loadRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar função')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await roleService.deleteRole(roleId)
      setSuccess('Função excluída com sucesso!')
      
      // Limpar cache de permissões para a role deletada
      setRolePermissions(prev => {
        const newPermissions = { ...prev }
        delete newPermissions[roleId]
        return newPermissions
      })
      
      loadRoles()
      if (selectedRole === roleId) {
        setSelectedRole(null)
      }
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir função')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRoleStatus = async (roleId: string, active: boolean) => {
    setLoading(true)
    setError(null)
    try {
      await roleService.toggleRoleStatus(roleId, active)
      setSuccess(`Função ${active ? 'ativada' : 'desativada'} com sucesso!`)
      loadRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status da função')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignUsers = async (roleId: string, userIds: string[]) => {
    setLoading(true)
    setError(null)
    try {
      // Implementar lógica de atribuição de usuários de forma sequencial
      // para evitar múltiplas requisições simultâneas
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        await userService.updateUser(userId, { role_id: roleId });
        
        // Adicionar pequeno delay entre requisições para evitar rate limiting
        if (i < userIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      setSuccess('Usuários atribuídos com sucesso!')
      setUserAssignmentModalOpen(false)
      setRoleForUserAssignment(null)
      loadRoles()
      loadUsers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atribuir usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return

    const newName = prompt('Nome para a nova função:', `${role.name} (Cópia)`)
    if (!newName) return

    setLoading(true)
    setError(null)
    try {
      await roleService.duplicateRole(roleId, newName)
      setSuccess('Função duplicada com sucesso!')
      loadRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao duplicar função')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      hasUsers: '',
      permissionType: ''
    })
  }

  const selectedRoleData = selectedRole ? roles.find(r => r.id === selectedRole) : null

  // Carregar permissões quando uma role é selecionada
  useEffect(() => {
    if (selectedRole && !rolePermissions[selectedRole] && !loadingPermissions[selectedRole]) {
      loadPermissionsForRole(selectedRole)
    }
  }, [selectedRole])

  const loadPermissionsForRole = async (roleId: string) => {
    setLoadingPermissions(prev => ({ ...prev, [roleId]: true }))
    try {
      const permissions = await roleService.getPermissionsForRole(roleId)
      setRolePermissions(prev => ({ ...prev, [roleId]: permissions }))
    } catch (error) {
      console.error(`Erro ao carregar permissões da role ${roleId}:`, error)
      setRolePermissions(prev => ({ ...prev, [roleId]: null }))
    } finally {
      setLoadingPermissions(prev => ({ ...prev, [roleId]: false }))
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-3 py-2 rounded-lg flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
      >
        <Filter className="h-4 w-4" />
        Filtros
      </button>
      
      <button
        onClick={loadRoles}
        disabled={loadingRoles}
        className="px-3 py-2 rounded-lg flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
      >
        <RefreshCw className={`h-4 w-4 ${loadingRoles ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
      
      <button
        onClick={() => setCreateModalOpen(true)}
        className="px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4" />
        Nova Função
      </button>
    </div>
  )
  
  return (
    <DashboardPageLayout
      title="Gerenciar Funções e Permissões"
      subtitle="Configure papéis, permissões e atribuições de usuários no sistema"
      actions={headerActions}
    >
      {/* Área de filtros */}
      {showFilters && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-slate-700">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Nome ou descrição..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500 mb-1">Usuários</label>
              <select
                value={filters.hasUsers}
                onChange={(e) => setFilters(prev => ({ ...prev, hasUsers: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="with_users">Com usuários</option>
                <option value="without_users">Sem usuários</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tipo de Permissão</label>
              <select
                value={filters.permissionType}
                onChange={(e) => setFilters(prev => ({ ...prev, permissionType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="system">Sistema</option>
                <option value="institution">Instituição</option>
                <option value="academic">Acadêmico</option>
                <option value="teaching">Ensino</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Mensagens */}
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {rateLimitWarning && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Carregamento em andamento
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Os dados estão sendo carregados de forma sequencial para evitar sobrecarga do sistema. 
                Aguarde alguns segundos para ver todas as informações.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Funções */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Funções do Sistema
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {filteredRoles.length} função(ões) encontrada(s)
              </p>
            </div>
            
            <div className="p-2">
              {loadingRoles ? (
                <div className="flex justify-center items-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Nenhuma função encontrada
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRoles.map(role => (
                    <div
                      key={role.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedRole === role.id 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{role.name}</span>
                            <span className={`w-2 h-2 rounded-full ${role.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          </div>
                          {role.description && (
                            <div className="text-xs text-slate-500 mt-1">{role.description}</div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {role.usersLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-400"></div>
                              ) : (
                                `${role.users_count || 0} usuários`
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setRoleToEdit(role)
                              setEditModalOpen(true)
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setRoleForUserAssignment(role)
                              setUserAssignmentModalOpen(true)
                            }}
                            className="p-1 text-slate-400 hover:text-green-600"
                            title="Atribuir usuários"
                          >
                            <UserCheck className="h-3 w-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateRole(role.id)
                            }}
                            className="p-1 text-slate-400 hover:text-purple-600"
                            title="Duplicar"
                          >
                            <Copy className="h-3 w-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleRoleStatus(role.id, !role.active)
                            }}
                            className={`p-1 text-slate-400 hover:${role.active ? 'text-red-600' : 'text-green-600'}`}
                            title={role.active ? 'Desativar' : 'Ativar'}
                          >
                            {role.active ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRole(role.id)
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Detalhes da Função Selecionada */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {!selectedRoleData ? (
              <div className="p-8 text-center text-slate-500">
                <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Selecione uma função
                </h3>
                <p className="text-sm">
                  Escolha uma função na lista ao lado para ver seus detalhes, permissões e usuários atribuídos.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-slate-800 flex items-center">
                        {selectedRoleData.name}
                        <span className={`ml-2 w-2 h-2 rounded-full ${selectedRoleData.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </h2>
                      {selectedRoleData.description && (
                        <p className="mt-1 text-sm text-slate-600">{selectedRoleData.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                        <span>Status: {selectedRoleData.active ? 'Ativo' : 'Inativo'}</span>
                        <span>Usuários: {selectedRoleData.users_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usuários Atribuídos */}
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-md font-medium text-slate-800 mb-3 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Usuários Atribuídos ({selectedRoleData.users?.length || 0})
                  </h3>
                  
                  {selectedRoleData.usersLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : selectedRoleData.users && selectedRoleData.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedRoleData.users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate">{user.name}</div>
                            <div className="text-xs text-slate-500 truncate">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm">Nenhum usuário atribuído a esta função</p>
                    </div>
                  )}
                </div>

                {/* Permissões */}
                <div className="p-4">
                  <h3 className="text-md font-medium text-slate-800 mb-3 flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Permissões
                    {selectedRole && rolePermissions[selectedRole] && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {rolePermissions[selectedRole].enabledPermissions || 0} de {rolePermissions[selectedRole].totalPermissions || 0}
                      </span>
                    )}
                  </h3>
                  
                  {selectedRole && loadingPermissions[selectedRole] ? (
                    <div className="text-center py-4 text-slate-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm">Carregando permissões...</p>
                    </div>
                  ) : selectedRole && rolePermissions[selectedRole] ? (
                    <div className="space-y-4">
                      {rolePermissions[selectedRole].permissionGroups?.map((group: any) => (
                        <div key={group.id} className="border border-slate-200 rounded-md">
                          <div className="p-3 bg-slate-50 border-b border-slate-200">
                            <h4 className="font-medium text-slate-800">{group.name}</h4>
                            <p className="text-sm text-slate-600">{group.description}</p>
                            <div className="mt-1 text-xs text-slate-500">
                              {group.permissions.filter((p: any) => p.enabled).length} de {group.permissions.length} permissões ativas
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="grid grid-cols-1 gap-2">
                              {group.permissions.map((permission: any) => (
                                <div key={permission.key} className={`flex items-center space-x-2 p-2 rounded ${permission.enabled ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                                  <div className={`w-2 h-2 rounded-full ${permission.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                  <div className="flex-1">
                                    <div className={`text-sm font-medium ${permission.enabled ? 'text-green-800' : 'text-slate-600'}`}>
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-slate-500">{permission.description}</div>
                                  </div>
                                  <div className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                                    {permission.category}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-slate-500">
                          <Key className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                          <p className="text-sm">Nenhum grupo de permissões encontrado</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <Key className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm">Selecione uma função para ver suas permissões</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <CreateRoleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateRole}
        loading={loading}
      />

      <EditRoleModal
        isOpen={editModalOpen}
        role={roleToEdit}
        onClose={() => {
          setEditModalOpen(false)
          setRoleToEdit(null)
        }}
        onSave={handleEditRole}
        loading={loading}
      />

      <UserAssignmentModal
        isOpen={userAssignmentModalOpen}
        role={roleForUserAssignment}
        users={allUsers}
        onClose={() => {
          setUserAssignmentModalOpen(false)
          setRoleForUserAssignment(null)
        }}
        onAssignUsers={handleAssignUsers}
        loading={loading}
      />
    </DashboardPageLayout>
  )
}
