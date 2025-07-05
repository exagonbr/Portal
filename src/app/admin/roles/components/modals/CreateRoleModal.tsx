'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { PERMISSION_GROUPS } from '@/types/roleManagement'

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleData: any) => void
  loading: boolean
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

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

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const toggleAllGroupPermissions = (groupId: string, permissions: any[]) => {
    const allSelected = permissions.every(p => selectedPermissions[p.key])
    const newPermissions = { ...selectedPermissions }
    
    permissions.forEach(permission => {
      newPermissions[permission.key] = !allSelected
    })
    
    setSelectedPermissions(newPermissions)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setSelectedPermissions({})
    setExpandedGroups({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Criar Nova Função
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Função *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Coordenador Pedagógico"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição opcional da função"
                />
              </div>
            </div>

            {/* Permissões */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Permissões
              </h3>
              <div className="space-y-3">
                {PERMISSION_GROUPS.map(group => {
                  const groupPermissions = group.permissions
                  const selectedCount = groupPermissions.filter(p => selectedPermissions[p.key]).length
                  const isExpanded = expandedGroups[group.id]
                  
                  return (
                    <div key={group.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => toggleGroup(group.id)}
                                className="text-slate-600 hover:text-slate-800"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                              <div>
                                <h4 className="font-semibold text-slate-800">{group.name}</h4>
                                <p className="text-sm text-slate-600">{group.description}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-500">
                              {selectedCount} / {groupPermissions.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAllGroupPermissions(group.id, groupPermissions)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {selectedCount === groupPermissions.length ? 'Desmarcar todas' : 'Marcar todas'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-3">
                            {groupPermissions.map(permission => (
                              <label key={permission.key} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions[permission.key] || false}
                                  onChange={() => togglePermission(permission.key)}
                                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-slate-800">{permission.name}</div>
                                  <div className="text-sm text-slate-500 mt-1">{permission.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="h-4 w-4" />
              <span>Criar Função</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}