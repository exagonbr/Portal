'use client'

import React from 'react'
import { Shield, Users, Key, User } from 'lucide-react'
import { RoleResponseDto, UserResponseDto } from '@/types/api'

interface RoleWithUsers extends RoleResponseDto {
  users?: UserResponseDto[]
  usersLoading?: boolean
  users_count?: number
}

interface RoleDetailsProps {
  role: RoleWithUsers | null
  permissions: any
  loadingPermissions: boolean
}

export const RoleDetails: React.FC<RoleDetailsProps> = ({
  role,
  permissions,
  loadingPermissions
}) => {
  if (!role) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-12 text-center">
          <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            Selecione uma função
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Escolha uma função na lista ao lado para visualizar seus detalhes, 
            permissões e usuários atribuídos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header da função */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-800">
                {role.name}
              </h2>
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  role.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {role.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            {role.description && (
              <p className="text-slate-600 mb-3">{role.description}</p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {role.users_count || 0} usuários atribuídos
              </span>
              <span className="flex items-center">
                <Key className="h-4 w-4 mr-1" />
                {permissions?.enabledPermissions || 0} permissões ativas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usuários atribuídos */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Usuários Atribuídos
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({role.users?.length || 0})
          </span>
        </h3>
        
        {role.usersLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-500">Carregando usuários...</p>
            </div>
          </div>
        ) : role.users && role.users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {role.users.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum usuário atribuído a esta função</p>
            <p className="text-sm text-slate-400 mt-1">
              Use o botão "Gerenciar usuários" para atribuir usuários
            </p>
          </div>
        )}
      </div>

      {/* Permissões */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-green-600" />
          Permissões
          {permissions && (
            <span className="ml-2 text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded">
              {permissions.enabledPermissions || 0} de {permissions.totalPermissions || 0}
            </span>
          )}
        </h3>
        
        {loadingPermissions ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-500">Carregando permissões...</p>
            </div>
          </div>
        ) : permissions?.permissionGroups ? (
          <div className="space-y-4">
            {permissions.permissionGroups.map((group: any) => (
              <div key={group.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">{group.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{group.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">
                        {group.permissions.filter((p: any) => p.enabled).length} / {group.permissions.length}
                      </div>
                      <div className="text-xs text-slate-500">permissões ativas</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {group.permissions.map((permission: any) => (
                      <div 
                        key={permission.key} 
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                          permission.enabled 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          permission.enabled ? 'bg-green-500' : 'bg-slate-300'
                        }`} />
                        
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            permission.enabled ? 'text-green-900' : 'text-slate-700'
                          }`}>
                            {permission.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {permission.description}
                          </div>
                        </div>
                        
                        <div className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                          {permission.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma permissão encontrada</p>
            <p className="text-sm text-slate-400 mt-1">
              As permissões serão carregadas automaticamente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}