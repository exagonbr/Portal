'use client'

import React from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserResponseDto, RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { 
  Users, 
  Mail, 
  Building2, 
  Shield, 
  Calendar,
  UserCheck,
  UserX,
  Activity,
  Clock
} from 'lucide-react'
import { formatDate } from '@/utils/date'

interface UserViewModalProps {
  isOpen: boolean
  user: UserResponseDto | null
  roles: RoleResponseDto[]
  institutions: InstitutionResponseDto[]
  onClose: () => void
  onEdit?: (user: UserResponseDto) => void
  onManagePermissions?: (user: UserResponseDto) => void
}

export default function UserViewModal({
  isOpen,
  user,
  roles,
  institutions,
  onClose,
  onEdit,
  onManagePermissions
}: UserViewModalProps) {
  if (!user) return null

  const userRole = roles.find(r => r.id === user.role_id)
  const userInstitution = institutions.find(i => i.id === user.institution_id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Usuário"
      size="lg"
    >
      <div className="p-6">
        {/* User Header */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-600 flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>
          <div className="text-right">
            {user.is_active ? (
              <Badge variant="success" className="mb-2">Ativo</Badge>
            ) : (
              <Badge variant="destructive" className="mb-2">Inativo</Badge>
            )}
            <div className="text-xs text-slate-500">
              ID: {user.id.substring(0, 8)}...
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Informações Pessoais
            </h3>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Cadastrado:</span>
                <span>{formatDate(user.created_at)}</span>
              </div>

              {user.updated_at && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Última atualização:</span>
                  <span>{formatDate(user.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Informações do Sistema
            </h3>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Função:</span>
                <Badge variant="info">{userRole?.name || 'Não definida'}</Badge>
              </div>
              
              {userInstitution && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Instituição:</span>
                  <span>{userInstitution.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {user.is_active ? (
                  <>
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Status: Ativo</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-600">Status: Inativo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-green-500" />
            Estatísticas de Uso
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Cursos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">Atividades</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-600">Certificados</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">0h</div>
              <div className="text-sm text-orange-600">Tempo Total</div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-slate-800 mb-2">Informações Rápidas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Último login:</span>
              <span className="ml-2 text-slate-800">Nunca</span>
            </div>
            <div>
              <span className="text-slate-600">Tentativas de login:</span>
              <span className="ml-2 text-slate-800">0</span>
            </div>
            <div>
              <span className="text-slate-600">Senha alterada:</span>
              <span className="ml-2 text-slate-800">Nunca</span>
            </div>
            <div>
              <span className="text-slate-600">Bloqueado:</span>
              <span className="ml-2 text-green-600">Não</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                onClick={() => onEdit(user)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Editar Usuário
              </Button>
            )}
            
            {onManagePermissions && (
              <Button
                variant="outline"
                onClick={() => onManagePermissions(user)}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Gerenciar Permissões
              </Button>
            )}
          </div>
          
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
