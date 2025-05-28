'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mockRoles, mockPermissions, mockResources, Role, Permission } from '@/constants/mockData'

interface NewRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleData: Partial<Role>) => void
}

interface EditRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  onSave: (roleData: Partial<Role>) => void
}

interface PermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  onSave: (permissions: string[]) => void
}

// Modal Nova Função
function NewRoleModal({ isOpen, onClose, onSave }: NewRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as 'system' | 'custom'
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      permissions: [],
      userCount: 0,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setFormData({ name: '', description: '', type: 'custom' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Nova Função</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Função
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Coordenador Pedagógico"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva as responsabilidades desta função"
                rows={3}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'system' | 'custom' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="custom">Personalizada</option>
                <option value="system">Sistema</option>
              </select>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    description: role?.description || '',
    type: role?.type || 'custom' as 'system' | 'custom'
  })

  if (!isOpen || !role) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'system' | 'custom' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={role.type === 'system'}
              >
                <option value="custom">Personalizada</option>
                <option value="system">Sistema</option>
              </select>
              {role.type === 'system' && (
                <p className="text-xs text-gray-500 mt-1">Funções do sistema não podem ter o tipo alterado</p>
              )}
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || [])

  if (!isOpen || !role) return null

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmit = () => {
    onSave(selectedPermissions)
    onClose()
  }

  const groupedPermissions = mockResources.map(resource => ({
    resource,
    permissions: mockPermissions.filter(p => p.resource === resource.id)
  }))

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Gerenciar Permissões - {role.name}
          </h3>
          <div className="max-h-96 overflow-y-auto">
            {groupedPermissions.map(({ resource, permissions }) => (
              <div key={resource.id} className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                  {resource.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map(permission => (
                    <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Salvar Permissões
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminRolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false)
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Calcular estatísticas
  const totalRoles = roles.length
  const customRoles = roles.filter(role => role.type === 'custom').length
  const totalPermissions = mockPermissions.length
  const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0)

  const handleNewRole = (roleData: Partial<Role>) => {
    const newRole: Role = {
      ...roleData as Role,
      id: `role_${Date.now()}`
    }
    setRoles([...roles, newRole])
  }

  const handleEditRole = (roleData: Partial<Role>) => {
    if (!selectedRole) return
    setRoles(roles.map(role => 
      role.id === selectedRole.id 
        ? { ...role, ...roleData }
        : role
    ))
    setSelectedRole(null)
  }

  const handleUpdatePermissions = (permissions: string[]) => {
    if (!selectedRole) return
    setRoles(roles.map(role => 
      role.id === selectedRole.id 
        ? { ...role, permissions, updatedAt: new Date().toISOString() }
        : role
    ))
    setSelectedRole(null)
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      setRoles(roles.filter(role => role.id !== roleId))
    }
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setEditRoleModalOpen(true)
  }

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role)
    setPermissionsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Permissões</h1>
          <p className="text-gray-600">Configure as funções e permissões do sistema</p>
        </div>
        <button 
          onClick={() => setNewRoleModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nova Função
        </button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total de Funções</div>
          <div className="text-2xl font-bold text-gray-800">{totalRoles}</div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-500 text-sm">Sistema</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Funções Personalizadas</div>
          <div className="text-2xl font-bold text-gray-800">{customRoles}</div>
          <div className="mt-4 flex items-center">
            <span className="text-purple-500 text-sm">Customizadas</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Permissões</div>
          <div className="text-2xl font-bold text-gray-800">{totalPermissions}</div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm">Ativas</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Usuários Afetados</div>
          <div className="text-2xl font-bold text-gray-800">{totalUsers.toLocaleString()}</div>
          <div className="mt-4 flex items-center">
            <span className="text-gray-500 text-sm">Total</span>
          </div>
        </div>
      </div>

      {/* Roles List */}
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
                  Permissões
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
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-sm">
                          {role.type === 'system' ? 'admin_panel_settings' : 'person'}
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
                      role.type === 'system' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(role.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {role.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => openPermissionsModal(role)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Permissões
                    </button>
                    {role.type === 'custom' && (
                      <button 
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Matriz de Permissões</h3>
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
              {mockResources.slice(0, 5).map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                  </td>
                  {['read', 'create', 'update', 'delete'].map((action) => {
                    const permission = mockPermissions.find(p => 
                      p.resource === resource.id && p.action === action
                    )
                    const hasPermission = permission && roles.some(role => 
                      role.permissions.includes(permission.id) && role.status === 'active'
                    )
                    return (
                      <td key={action} className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600" 
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
