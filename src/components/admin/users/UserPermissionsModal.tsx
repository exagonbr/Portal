'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { UserResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'
import { Shield, Lock, Unlock, Check, X } from 'lucide-react'

interface Permission {
  id: string
  name: string
  module: string
  action: string
  description?: string
  enabled: boolean
}

interface PermissionModule {
  name: string
  permissions: Permission[]
}

interface UserPermissionsModalProps {
  isOpen: boolean
  user: UserResponseDto | null
  onClose: () => void
  onSave: () => void
}

export default function UserPermissionsModal({
  isOpen,
  user,
  onClose,
  onSave
}: UserPermissionsModalProps) {
  const { showSuccess, showError } = useToast()
  const [permissions, setPermissions] = useState<PermissionModule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Mock permissions data - replace with real API call
  useEffect(() => {
    if (user && isOpen) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockPermissions: PermissionModule[] = [
          {
            name: 'Usuários',
            permissions: [
              { id: '1', name: 'Visualizar Usuários', module: 'users', action: 'read', enabled: true, description: 'Visualizar lista de usuários' },
              { id: '2', name: 'Criar Usuários', module: 'users', action: 'create', enabled: false, description: 'Criar novos usuários' },
              { id: '3', name: 'Editar Usuários', module: 'users', action: 'update', enabled: true, description: 'Editar informações de usuários' },
              { id: '4', name: 'Excluir Usuários', module: 'users', action: 'delete', enabled: false, description: 'Excluir usuários do sistema' }
            ]
          },
          {
            name: 'Cursos',
            permissions: [
              { id: '5', name: 'Visualizar Cursos', module: 'courses', action: 'read', enabled: true, description: 'Visualizar lista de cursos' },
              { id: '6', name: 'Criar Cursos', module: 'courses', action: 'create', enabled: false, description: 'Criar novos cursos' },
              { id: '7', name: 'Editar Cursos', module: 'courses', action: 'update', enabled: false, description: 'Editar informações de cursos' },
              { id: '8', name: 'Excluir Cursos', module: 'courses', action: 'delete', enabled: false, description: 'Excluir cursos do sistema' }
            ]
          },
          {
            name: 'Relatórios',
            permissions: [
              { id: '9', name: 'Visualizar Relatórios', module: 'reports', action: 'read', enabled: true, description: 'Visualizar relatórios do sistema' },
              { id: '10', name: 'Exportar Relatórios', module: 'reports', action: 'export', enabled: false, description: 'Exportar relatórios em diferentes formatos' }
            ]
          },
          {
            name: 'Configurações',
            permissions: [
              { id: '11', name: 'Visualizar Configurações', module: 'settings', action: 'read', enabled: false, description: 'Visualizar configurações do sistema' },
              { id: '12', name: 'Editar Configurações', module: 'settings', action: 'update', enabled: false, description: 'Modificar configurações do sistema' }
            ]
          }
        ]
        setPermissions(mockPermissions)
        setLoading(false)
      }, 1000)
    }
  }, [user, isOpen])

  const handlePermissionToggle = (moduleIndex: number, permissionIndex: number) => {
    setPermissions(prev => {
      const newPermissions = [...prev]
      newPermissions[moduleIndex].permissions[permissionIndex].enabled = 
        !newPermissions[moduleIndex].permissions[permissionIndex].enabled
      return newPermissions
    })
  }

  const handleSelectAll = (moduleIndex: number, enabled: boolean) => {
    setPermissions(prev => {
      const newPermissions = [...prev]
      newPermissions[moduleIndex].permissions.forEach(permission => {
        permission.enabled = enabled
      })
      return newPermissions
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call to save permissions
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      showSuccess('Permissões atualizadas com sucesso!')
      onSave()
    } catch (error) {
      showError('Erro ao salvar permissões')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const totalPermissions = permissions.reduce((acc, module) => acc + module.permissions.length, 0)
  const enabledPermissions = permissions.reduce((acc, module) => 
    acc + module.permissions.filter(p => p.enabled).length, 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Permissões"
      size="xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-600">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-slate-600">Permissões Ativas</div>
            <div className="text-xl font-bold text-purple-600">
              {enabledPermissions}/{totalPermissions}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando permissões...</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {permissions.map((module, moduleIndex) => {
              const moduleEnabled = module.permissions.filter(p => p.enabled).length
              const moduleTotal = module.permissions.length
              const allEnabled = moduleEnabled === moduleTotal
              const someEnabled = moduleEnabled > 0 && moduleEnabled < moduleTotal

              return (
                <div key={module.name} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800">{module.name}</h3>
                        <span className="text-sm text-slate-500">
                          {moduleEnabled}/{moduleTotal} ativas
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelectAll(moduleIndex, false)}
                          disabled={moduleEnabled === 0}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Nenhuma
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelectAll(moduleIndex, true)}
                          disabled={allEnabled}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Todas
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            allEnabled ? 'bg-green-500' : 
                            someEnabled ? 'bg-yellow-500' : 'bg-slate-300'
                          }`}
                          style={{ width: `${(moduleEnabled / moduleTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Module Permissions */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.permissions.map((permission, permissionIndex) => (
                        <div 
                          key={permission.id}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            permission.enabled 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          onClick={() => handlePermissionToggle(moduleIndex, permissionIndex)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1 rounded ${
                              permission.enabled ? 'bg-green-500' : 'bg-slate-300'
                            }`}>
                              {permission.enabled ? (
                                <Unlock className="h-3 w-3 text-white" />
                              ) : (
                                <Lock className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${
                                permission.enabled ? 'text-green-800' : 'text-slate-700'
                              }`}>
                                {permission.name}
                              </div>
                              {permission.description && (
                                <div className={`text-xs mt-1 ${
                                  permission.enabled ? 'text-green-600' : 'text-slate-500'
                                }`}>
                                  {permission.description}
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  {permission.action}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {enabledPermissions > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ {enabledPermissions} permissões ativas de {totalPermissions}
              </span>
            ) : (
              <span className="text-red-600">
                ⚠ Nenhuma permissão ativa
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={saving || loading}
            >
              Salvar Permissões
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
