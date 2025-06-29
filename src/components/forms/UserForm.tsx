'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button, ButtonGroup } from '@/components/ui/Button';
import { UserRole } from '@/types/roles'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  institution_id?: string
  school_id?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface UserFormProps {
  user?: User | null
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: Partial<User>) => void
  onCancel: () => void
}

export default function UserForm({ user, mode, onSubmit, onCancel }: UserFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.STUDENT,
    active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id,
        school_id: user.school_id,
        active: user.active
      })
    }
  }, [user])

  const roleOptions = [
    { value: UserRole.SYSTEM_ADMIN, label: 'Administrador do Sistema' },
    { value: UserRole.INSTITUTION_MANAGER, label: 'Gestor de Instituição' },
    { value: UserRole.COORDINATOR, label: 'Coordenador Acadêmico' },
    { value: UserRole.TEACHER, label: 'Professor' },
    { value: UserRole.STUDENT, label: 'Aluno' },
    { value: UserRole.GUARDIAN, label: 'Responsável' }
  ]

  const statusOptions = [
    { value: 'true', label: 'Ativo' },
    { value: 'false', label: 'Inativo' }
  ]

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.role) {
      newErrors.role = 'Perfil é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={isReadOnly}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          disabled={isReadOnly}
          required
        />

        <Select
          label="Perfil"
          value={formData.role || ''}
          onChange={(value) => handleChange('role', value)}
          options={roleOptions}
          error={errors.role}
          disabled={isReadOnly}
        />

        <Select
          label="Status"
          value={String(formData.active)}
          onChange={(value) => handleChange('active', value === 'true')}
          options={statusOptions}
          disabled={isReadOnly}
        />
      </div>

      {mode === 'create' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.background.tertiary }}>
          <p style={{ color: theme.colors.text.secondary }} className="text-sm">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            Uma senha temporária será enviada para o email do usuário após o cadastro.
          </p>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: theme.colors.border.light }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
          >
            {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
          </Button>
        </div>
      )}

      {isReadOnly && (
        <div className="flex justify-end pt-4 border-t" style={{ borderColor: theme.colors.border.light }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Fechar
          </Button>
        </div>
      )}
    </form>
  )
} 