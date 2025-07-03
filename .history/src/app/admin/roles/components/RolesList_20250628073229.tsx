'use client'

import React from 'react'
import { Shield, RefreshCw } from 'lucide-react'
import { RoleCard } from './RoleCard'
import { RoleResponseDto, UserResponseDto } from '@/types/api'

interface RoleWithUsers extends RoleResponseDto {
  users?: UserResponseDto[]
  usersLoading?: boolean
  users_count?: number
}

interface RolesListProps {
  roles: RoleWithUsers[]
  selectedRoleId: string | null
  loading: boolean
  onSelectRole: (roleId: string) => void
  onEditRole: (role: RoleWithUsers) => void
  onAssignUsers: (role: RoleWithUsers) => void
  onDuplicateRole: (roleId: string) => void
  onToggleRoleStatus: (roleId: string, active: boolean) => void
  onDeleteRole: (roleId: string) => void
  onRefresh: () => void
}

export const RolesList: React.FC<RolesListProps> = ({
  roles,
  selectedRoleId,
  loading,
  onSelectRole,
  onEditRole,
  onAssignUsers,
  onDuplicateRole,
  onToggleRoleStatus,
  onDeleteRole,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Funções do Sistema
              </h2>
              <p className="text-sm text-slate-600">
                {roles.length} função(ões) encontrada(s)
              </p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Carregando funções...</p>
            </div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Nenhuma função encontrada
            </h3>
            <p className="text-sm text-slate-500">
              Crie uma nova função para começar a gerenciar permissões.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map(role => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={selectedRoleId === role.id}
                onSelect={() => onSelectRole(role.id)}
                onEdit={() => onEditRole(role)}
                onAssignUsers={() => onAssignUsers(role)}
                onDuplicate={() => onDuplicateRole(role.id)}
                onToggleStatus={() => onToggleRoleStatus(role.id, !role.active)}
                onDelete={() => onDeleteRole(role.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}