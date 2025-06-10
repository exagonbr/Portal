'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  RefreshCw
} from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import { roleService, RoleFilters } from '@/services/roleService'
import { userService } from '@/services/userService'
import { PERMISSION_GROUPS } from '@/types/roleManagement'
import { RoleResponseDto } from '@/types/api'
import { UserRole, ROLE_LABELS } from '@/types/roles'

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [saved, setSaved] = useState(false)
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [permissionFilter, setPermissionFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados para controlar quais grupos estão expandidos
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    PERMISSION_GROUPS.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  )

  // Estado para armazenar as permissões selecionadas para o papel atual
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})
  
  // Carregar roles do banco de dados
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true)
      try {
        const filters: RoleFilters = {}
        if (roleFilter) {
          filters.search = roleFilter
        }
        
        const response = await roleService.getRoles({
          filters,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        
        // Filtrar roles por usuário se houver um filtro de usuário
        let filteredRoles = response.items
        
        if (userFilter && userFilter.trim() !== '') {
          // Buscar usuários que correspondem ao filtro
          try {
            const usersResponse = await userService.searchUsers(userFilter)
            
            if (usersResponse.items.length > 0) {
              // Obter os IDs de roles dos usuários encontrados
              const roleIds = usersResponse.items.map(user => user.role_id)
              
              // Filtrar as roles para incluir apenas aquelas que têm usuários correspondentes
              filteredRoles = filteredRoles.filter(role => roleIds.includes(role.id))
            } else {
              // Se nenhum usuário for encontrado, não mostrar nenhuma role
              filteredRoles = []
            }
          } catch (error) {
            console.error('Erro ao buscar usuários:', error)
            // Em caso de erro, continuar com as roles não filtradas
          }
        }
        
        setRoles(filteredRoles)
        
        // Se não houver role selecionada e temos roles, seleciona a primeira
        if (!selectedRole && filteredRoles.length > 0) {
          setSelectedRole(filteredRoles[0].id)
        }
      } catch (err) {
        console.error('Erro ao carregar roles:', err)
        setError('Não foi possível carregar as funções. Tente novamente mais tarde.')
      } finally {
        setLoadingRoles(false)
      }
    }
    
    fetchRoles()
  }, [roleFilter, userFilter, selectedRole])
  
  // Carregar permissões da role selecionada
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedRole) return
      
      setLoadingPermissions(true)
      try {
        const roleData = await roleService.getRoleById(selectedRole)
        
        // Inicializar todas as permissões como false
        const permissionsMap: Record<string, boolean> = {}
        
        // Inicializar todas as permissões possíveis como false
        PERMISSION_GROUPS.forEach(group => {
          group.permissions.forEach(permission => {
            permissionsMap[permission.key] = false
          })
        })
        
        // Marcar como true as permissões que o papel possui
        if (roleData.permissions && Array.isArray(roleData.permissions)) {
          roleData.permissions.forEach(permissionKey => {
            permissionsMap[permissionKey] = true
          })
        }
        
        setSelectedPermissions(permissionsMap)
      } catch (err) {
        console.error('Erro ao carregar permissões:', err)
        setError('Não foi possível carregar as permissões. Tente novamente mais tarde.')
      } finally {
        setLoadingPermissions(false)
      }
    }
    
    fetchRolePermissions()
  }, [selectedRole])
  
  // Filtrar permissões com base no filtro de permissão
  const filteredPermissionGroups = useMemo(() => {
    if (!permissionFilter) return PERMISSION_GROUPS
    
    return PERMISSION_GROUPS.map(group => {
      const filteredPermissions = group.permissions.filter(permission => 
        permission.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
        permission.description.toLowerCase().includes(permissionFilter.toLowerCase())
      )
      
      return {
        ...group,
        permissions: filteredPermissions
      }
    }).filter(group => group.permissions.length > 0)
  }, [permissionFilter])
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }
  
  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }))
  }
  
  const toggleAllInGroup = (groupId: string, value: boolean) => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId)
    if (!group) return
    
    const newPermissions = { ...selectedPermissions }
    group.permissions.forEach(permission => {
      newPermissions[permission.key] = value
    })
    
    setSelectedPermissions(newPermissions)
  }
  
  const handleSavePermissions = async () => {
    if (!selectedRole) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Converter o objeto de permissões para um array de strings
      // Incluir apenas as permissões que estão habilitadas (true)
      const permissionsArray = Object.entries(selectedPermissions)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key)
      
      // Preparar dados para enviar à API
      await roleService.updateRole(selectedRole, {
        permissions: permissionsArray
      })
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Erro ao salvar permissões:', err)
      setError('Não foi possível salvar as permissões. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }
  
  const isAllGroupSelected = (groupId: string) => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.every(permission => selectedPermissions[permission.key])
  }
  
  const isAnyGroupSelected = (groupId: string) => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.some(permission => selectedPermissions[permission.key])
  }
  
  const handleCreateRole = () => {
    // Implementar lógica para criar nova role
    console.log('Criar nova role')
  }
  
  const refreshRoles = async () => {
    setLoadingRoles(true)
    try {
      const response = await roleService.getRoles()
      setRoles(response.items)
    } catch (err) {
      console.error('Erro ao atualizar roles:', err)
      setError('Não foi possível atualizar as funções. Tente novamente mais tarde.')
    } finally {
      setLoadingRoles(false)
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
        onClick={refreshRoles}
        disabled={loadingRoles}
        className="px-3 py-2 rounded-lg flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
      >
        <RefreshCw className={`h-4 w-4 ${loadingRoles ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
      
      <button
        onClick={handleSavePermissions}
        disabled={loading || !selectedRole}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          loading || !selectedRole
            ? 'bg-gray-400 cursor-not-allowed' 
            : saved 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {loading ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
      </button>
    </div>
  )
  
  return (
    <DashboardPageLayout
      title="Gerenciar Permissões"
      subtitle="Configure os papéis e permissões de acesso ao sistema"
      actions={headerActions}
    >
      {/* Área de filtros */}
      {showFilters && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="roleFilter" className="block text-xs text-slate-500 mb-1">
                Filtrar por função
              </label>
              <div className="relative">
                <input
                  id="roleFilter"
                  type="text"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  placeholder="Nome da função..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="userFilter" className="block text-xs text-slate-500 mb-1">
                Filtrar por usuário
              </label>
              <div className="relative">
                <input
                  id="userFilter"
                  type="text"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="Nome do usuário..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Users className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="permissionFilter" className="block text-xs text-slate-500 mb-1">
                Filtrar por permissão
              </label>
              <div className="relative">
                <input
                  id="permissionFilter"
                  type="text"
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value)}
                  placeholder="Nome da permissão..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagens de erro */}
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback de salvamento */}
      {saved && (
        <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Permissões atualizadas com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Papéis */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-indigo-600" />
                Papéis de Acesso
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Selecione um papel para configurar suas permissões
              </p>
            </div>
            
            <div className="p-2">
              <button 
                onClick={handleCreateRole}
                className="w-full flex justify-between items-center p-3 text-left rounded-md hover:bg-indigo-50 transition-colors"
              >
                <span className="font-medium text-indigo-600">+ Novo Papel</span>
              </button>
              
              {loadingRoles ? (
                <div className="flex justify-center items-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : roles.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Nenhum papel encontrado
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full flex justify-between items-center p-3 text-left rounded-md ${
                        selectedRole === role.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-slate-500">{role.description}</div>
                      </div>
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        {role.users_count || 0} usuários
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Configuração de Permissões */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800">
                Permissões: {roles.find(r => r.id === selectedRole)?.name || 'Selecione um papel'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure quais ações esse papel pode realizar no sistema
              </p>
            </div>
            
            {loadingPermissions ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : !selectedRole ? (
              <div className="p-8 text-center text-slate-500">
                Selecione um papel para configurar suas permissões
              </div>
            ) : (
              <div className="p-4">
                {filteredPermissionGroups.map(group => (
                  <div key={group.id} className="mb-4 border border-slate-200 rounded-md overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAllInGroup(group.id, !isAllGroupSelected(group.id))
                          }}
                          className={`w-5 h-5 rounded border ${
                            isAllGroupSelected(group.id) 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : isAnyGroupSelected(group.id)
                                ? 'bg-indigo-200 border-indigo-400'
                                : 'border-slate-300'
                          } flex items-center justify-center mr-3`}
                        >
                          {isAllGroupSelected(group.id) && <Check className="h-3 w-3" />}
                        </button>
                        <span className="font-medium">{group.name}</span>
                      </div>
                      {expandedGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    
                    {expandedGroups[group.id] && (
                      <div className="p-3 border-t border-slate-200">
                        {group.permissions.map(permission => (
                          <div key={permission.key} className="flex items-center py-2">
                            <button 
                              onClick={() => togglePermission(permission.key)}
                              className={`w-5 h-5 rounded border ${
                                selectedPermissions[permission.key] 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'border-slate-300'
                              } flex items-center justify-center mr-3`}
                            >
                              {selectedPermissions[permission.key] && <Check className="h-3 w-3" />}
                            </button>
                            <div>
                              <div className="text-sm font-medium">{permission.name}</div>
                              <div className="text-xs text-slate-500">{permission.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
