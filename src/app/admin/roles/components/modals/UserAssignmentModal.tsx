'use client'

import React, { useState, useMemo } from 'react'
import { X, Search, Users, UserCheck } from 'lucide-react'
import { RoleResponseDto, UserResponseDto } from '@/types/api'

interface UserAssignmentModalProps {
  isOpen: boolean
  role: RoleResponseDto | null
  users: UserResponseDto[]
  onClose: () => void
  onAssignUsers: (roleId: string, userIds: string[]) => void
  loading: boolean
}

export const UserAssignmentModal: React.FC<UserAssignmentModalProps> = ({ 
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

  const availableUsers = useMemo(() => {
    return filteredUsers.filter(user => !user.role_id || user.role_id !== role?.id)
  }, [filteredUsers, role])

  const currentRoleUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role_id === role?.id)
  }, [filteredUsers, role])

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

  const selectAllAvailable = () => {
    const allAvailableIds = availableUsers.map(user => user.id)
    setSelectedUsers(allAvailableIds)
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  const resetForm = () => {
    setSelectedUsers([])
    setSearchTerm('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen || !role) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Gerenciar Usuários: {role.name}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Atribua ou remova usuários desta função
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            {/* Busca */}
            <div className="p-6 border-b border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar usuários por nome ou email..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Usuários Disponíveis */}
                <div className="p-6 border-r border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Usuários Disponíveis
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        ({availableUsers.length})
                      </span>
                    </h3>
                    
                    {availableUsers.length > 0 && (
                      <div className="flex space-x-2">
                        <button
                          onClick={selectAllAvailable}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Selecionar todos
                        </button>
                        {selectedUsers.length > 0 && (
                          <button
                            onClick={clearSelection}
                            className="text-sm text-slate-500 hover:text-slate-700"
                          >
                            Limpar seleção
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p>Nenhum usuário disponível</p>
                        <p className="text-sm mt-1">
                          {searchTerm ? 'Tente ajustar sua busca' : 'Todos os usuários já possuem funções'}
                        </p>
                      </div>
                    ) : (
                      availableUsers.map(user => (
                        <label 
                          key={user.id} 
                          className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUser(user.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 truncate">{user.name}</div>
                            <div className="text-sm text-slate-500 truncate">{user.email}</div>
                            {user.role_id && (
                              <div className="text-xs text-orange-600 mt-1">
                                Possui outra função
                              </div>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Usuários Atuais */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                    Usuários Atuais
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({currentRoleUsers.length})
                    </span>
                  </h3>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentRoleUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p>Nenhum usuário atribuído</p>
                        <p className="text-sm mt-1">
                          Selecione usuários à esquerda para atribuir
                        </p>
                      </div>
                    ) : (
                      currentRoleUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-green-900 truncate">{user.name}</div>
                            <div className="text-sm text-green-700 truncate">{user.email}</div>
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Atribuído
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              {selectedUsers.length > 0 && (
                <span className="font-medium">
                  {selectedUsers.length} usuário(s) selecionado(s) para atribuição
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <UserCheck className="h-4 w-4" />
                <span>Atribuir Usuários</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}