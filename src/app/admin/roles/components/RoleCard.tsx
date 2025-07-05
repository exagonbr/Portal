'use client'

import React from 'react'
import { 
  Edit, 
  UserCheck, 
  Copy, 
  Check, 
  X, 
  Trash2, 
  Users,
  MoreHorizontal
} from 'lucide-react'
import { RoleResponseDto, UserResponseDto } from '@/types/api'

interface RoleCardProps {
  role: RoleResponseDto & { 
    users?: UserResponseDto[]
    usersLoading?: boolean 
    users_count?: number
  }
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onAssignUsers: () => void
  onDuplicate: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  onEdit,
  onAssignUsers,
  onDuplicate,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 border-blue-200 shadow-md' 
          : 'hover:bg-slate-50 border-slate-200 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
              {role.name}
            </h3>
            <span 
              className={`w-2 h-2 rounded-full ${
                role.active ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={role.active ? 'Ativo' : 'Inativo'}
            />
          </div>
          
          {role.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {role.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {role.usersLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-400" />
              ) : (
                `${role.users_count || 0} usuários`
              )}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              role.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {role.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar função"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAssignUsers()
            }}
            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Gerenciar usuários"
          >
            <UserCheck className="h-4 w-4" />
          </button>

          <div className="relative group">
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
              title="Mais opções"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar função
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                >
                  {role.active ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Desativar função
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Ativar função
                    </>
                  )}
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir função
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}