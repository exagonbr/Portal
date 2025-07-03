'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserResponseDto, RoleResponseDto, InstitutionResponseDto, CreateUserDto, UpdateUserDto } from '@/types/api'
import { userService } from '@/services/userService'
import { useToast } from '@/components/ToastManager'
import { 
  Users, 
  Mail, 
  Building2, 
  Shield, 
  Activity, 
  Key,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react'
import { formatDate } from '@/utils/date'

interface UserFormModalProps {
  isOpen: boolean
  user?: UserResponseDto | null
  roles: RoleResponseDto[]
  institutions: InstitutionResponseDto[]
  onClose: () => void
  onSuccess?: () => void
  viewOnly?: boolean
}

export default function UserFormModal({
  isOpen,
  user,
  roles,
  institutions,
  onClose,
  onSuccess,
  viewOnly = false
}: UserFormModalProps) {
  const { showSuccess, showError } = useToast()
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    institution_id: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || user.full_name,
        email: user.email,
        role_id: user.role_id,
        institution_id: user.institution_id || '',
        is_active: user.is_active
      })
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role_id: '',
        institution_id: '',
        is_active: true
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (viewOnly) return

    setLoading(true)
    try {
      if (user) {
        await userService.updateUser(user.id, formData as UpdateUserDto)
        showSuccess('Usuário atualizado com sucesso!')
      } else {
        await userService.createUser(formData as CreateUserDto)
        showSuccess('Usuário criado com sucesso!')
      }
      onSuccess?.()
    } catch (error: any) {
      showError(error.message || 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // View-only mode
  if (viewOnly && user) {
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
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-600">{user.email}</p>
            </div>
            <div className="ml-auto">
              {user.is_active ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="warning">Inativo</Badge>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Informações Pessoais
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Cadastrado em: {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Informações do Sistema
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4" />
                  <span>Função: {userRole?.name || 'Não definida'}</span>
                </div>
                {userInstitution && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span>Instituição: {userInstitution.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Usuário Ativo</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Usuário Inativo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  // Form mode (create/edit)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuário' : 'Novo Usuário'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="usuario@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Password (only for new users) */}
        {!user && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Key className="h-5 w-5 text-green-500" />
              Senha
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite a senha"
              />
            </div>
          </div>
        )}

        {/* Role and Institution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Função e Instituição
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Função *
              </label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => handleInputChange('role_id', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma função</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instituição
              </label>
              <select
                value={formData.institution_id}
                onChange={(e) => handleInputChange('institution_id', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma instituição (opcional)</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Status do Usuário
          </h3>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Usuário ativo no sistema
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {user ? 'Atualizar Usuário' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
