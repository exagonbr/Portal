'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRoleManagement } from '@/hooks/useRoleManagement'
import { ExtendedRole, CustomRole, PERMISSION_GROUPS } from '@/types/roleManagement'
import { RolePermissions } from '@/types/roles'
import { ROLE_COLORS } from '@/types/roles'

interface NewRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleData: { name: string; description: string; permissions: RolePermissions }) => void
}

interface EditRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: (ExtendedRole | (CustomRole & { id: string })) | null
  onSave: (updates: Partial<CustomRole>) => void
}

interface PermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  role: (ExtendedRole | (CustomRole & { id: string })) | null
  onSave: (permissions: RolePermissions) => void
}

// Modal Nova Função
function NewRoleModal({ isOpen, onClose, onSave }: NewRoleModalProps) {
  const { createEmptyPermissions } = useRoleManagement()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [selectedPermissions, setSelectedPermissions] = useState<RolePermissions>(createEmptyPermissions())

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      description: formData.description,
      permissions: selectedPermissions
    })
    setFormData({ name: '', description: '' })
    setSelectedPermissions(createEmptyPermissions())
    onClose()
  }

  const handlePermissionToggle = (key: keyof RolePermissions) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Nova Função Personalizada</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Função
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Ex: Coordenador Especial"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Descreva as responsabilidades desta função"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Permissões */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Permissões</h4>
              <div className="max-h-96 overflow-y-auto border rounded-md p-4">
                {PERMISSION_GROUPS.map(group => (
                  <div key={group.id} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-gray-700">{group.name}</h5>
                      <span className="text-xs text-gray-500">{group.description}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                      {group.permissions.map(permission => (
                        <label key={permission.key} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions[permission.key]}
                            onChange={() => handlePermissionToggle(permission.key)}
                            className="mt-1 h-4 w-4 text-primary focus:ring-accent-blue border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue transition-colors duration-200"
              >
                Criar Função
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Modal Editar
function EditRoleModal({ isOpen, onClose, role, onSave }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || ''
  })

  if (!isOpen || !role || !('id' in role)) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      description: formData.description,
      updatedAt: new Date().toISOString()
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Editar Função</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Função
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue transition-colors duration-200"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Modal Permissões
function PermissionsModal({ isOpen, onClose, role, onSave }: PermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<RolePermissions>(
    role?.permissions || {} as RolePermissions
  )

  if (!isOpen || !role) return null

  const handlePermissionToggle = (key: keyof RolePermissions) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSubmit = () => {
    onSave(selectedPermissions)
    onClose()
  }

  const isSystemRole = role.type === 'system'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Gerenciar Permissões - {role.name}
            </h3>
            {isSystemRole && (
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                Função do Sistema (Somente Leitura)
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {PERMISSION_GROUPS.map(group => (
              <div key={group.id} className="mb-6">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h4 className="text-md font-semibold text-gray-800">{group.name}</h4>
                  <span className="text-xs text-gray-500">{group.description}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.permissions.map(permission => (
                    <label key={permission.key} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions[permission.key]}
                        onChange={() => handlePermissionToggle(permission.key)}
                        disabled={isSystemRole}
                        className="mt-1 h-4 w-4 text-primary focus:ring-accent-blue border-gray-300 rounded disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {isSystemRole ? 'Fechar' : 'Cancelar'}
            </button>
            {!isSystemRole && (
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue transition-colors duration-200"
              >
                Salvar Permissões
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminRolesPage() {
  const { user } = useAuth()
  const {
    allRoles,
    statistics,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneRole,
    canEditRole,
    canDeleteRole,
    countActivePermissions
  } = useRoleManagement()

  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false)
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<(ExtendedRole | (CustomRole & { id: string })) | null>(null)

  const handleNewRole = (roleData: { name: string; description: string; permissions: RolePermissions }) => {
    createCustomRole(roleData)
  }

  const handleEditRole = (updates: Partial<CustomRole>) => {
    if (!selectedRole || !('id' in selectedRole)) return
    updateCustomRole(selectedRole.id, updates)
    setSelectedRole(null)
  }

  const handleUpdatePermissions = (permissions: RolePermissions) => {
    if (!selectedRole || !('id' in selectedRole)) return
    updateCustomRole(selectedRole.id, { permissions })
    setSelectedRole(null)
  }

  const handleDeleteRole = (role: ExtendedRole | (CustomRole & { id: string })) => {
    if (!('id' in role)) return
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      deleteCustomRole(role.id)
    }
  }

  const handleCloneRole = (role: ExtendedRole | (CustomRole & { id: string })) => {
    cloneRole(role)
  }

  const openEditModal = (role: ExtendedRole | (CustomRole & { id: string })) => {
    if (!canEditRole(role)) return
    setSelectedRole(role)
    setEditRoleModalOpen(true)
  }

  const openPermissionsModal = (role: ExtendedRole | (CustomRole & { id: string })) => {
    setSelectedRole(role)
    setPermissionsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getRoleColor = (role: ExtendedRole | (CustomRole & { id: string })) => {
    if (role.type === 'system' && 'role' in role && role.role) {
      return ROLE_COLORS[role.role] || '#6B7280'
    }
    return '#8B5CF6' // Cor padrão para roles customizadas
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Gestão de Permissões</h1>
          <p className="text-gray-600">Configure funções e permissões modulares do sistema educacional</p>
        </div>
        <button 
          onClick={() => setNewRoleModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nova Função
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total de Funções</div>
          <div className="text-2xl font-bold text-gray-800">{statistics.totalRoles}</div>
          <div className="mt-4 flex items-center">
            <span className="text-primary text-sm">{statistics.systemRoles} Sistema + {statistics.customRoles} Personalizadas</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Funções Ativas</div>
          <div className="text-2xl font-bold text-gray-800">{statistics.activeRoles}</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-green text-sm">Em uso no sistema</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Usuários Totais</div>
          <div className="text-2xl font-bold text-gray-800">{statistics.totalUsers.toLocaleString()}</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-blue text-sm">Distribuídos nas funções</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Grupos de Permissões</div>
          <div className="text-2xl font-bold text-gray-800">{PERMISSION_GROUPS.length}</div>
          <div className="mt-4 flex items-center">
            <span className="text-accent-purple text-sm">Categorias disponíveis</span>
          </div>
        </div>
      </div>

      {/* Lista de Funções */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissões Ativas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Modificação
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
              {allRoles.map((role, index) => (
                <tr key={`${role.type}-${('id' in role) ? role.id : index}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${getRoleColor(role)}20` }}
                      >
                        <span 
                          className="material-symbols-outlined text-sm"
                          style={{ color: getRoleColor(role) }}
                        >
                          {role.type === 'system' ? 'admin_panel_settings' : 'tune'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{role.description}</div>
                      </div>
                    </div>
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
                    {role.userCount.toLocaleString()} usuários
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {countActivePermissions(role.permissions)} de {Object.keys(role.permissions).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(role.updatedAt)}
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openPermissionsModal(role)}
                        className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200"
                        title="Ver/Editar Permissões"
                      >
                        <span className="material-symbols-outlined text-sm">security</span>
                      </button>
                      
                      <button 
                        onClick={() => handleCloneRole(role)}
                        className="text-accent-green hover:text-accent-green/80 transition-colors duration-200"
                        title="Clonar Função"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>

                      {canEditRole(role) && (
                        <button 
                          onClick={() => openEditModal(role)}
                          className="text-primary hover:text-primary-dark transition-colors duration-200"
                          title="Editar Função"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      )}

                      {canDeleteRole(role) && (
                        <button 
                          onClick={() => handleDeleteRole(role)}
                          className="text-error hover:text-error/80 transition-colors duration-200"
                          title="Excluir Função"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
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

      {/* Matriz de Permissões por Categoria */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Visão Geral das Permissões por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERMISSION_GROUPS.map(group => (
            <div key={group.id} className="border rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">{group.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              <div className="text-sm text-gray-500">
                {group.permissions.length} permissões disponíveis
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {group.permissions.slice(0, 3).map(permission => (
                    <span key={permission.key} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {permission.name}
                    </span>
                  ))}
                  {group.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{group.permissions.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <NewRoleModal
        isOpen={newRoleModalOpen}
        onClose={() => setNewRoleModalOpen(false)}
        onSave={handleNewRole}
      />

      <EditRoleModal
        isOpen={editRoleModalOpen}
        onClose={() => {
          setEditRoleModalOpen(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        onSave={handleEditRole}
      />

      <PermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        onSave={handleUpdatePermissions}
      />
    </div>
  )
}
