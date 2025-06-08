'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button, ButtonGroup } from '@/components/ui/Button';

interface Institution {
  id: string
  name: string
  code: string
  type: 'university' | 'school' | 'training_center'
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  active: boolean
  created_at: string
  updated_at: string
}

interface InstitutionFormProps {
  institution?: Institution | null
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: Partial<Institution>) => void
  onCancel: () => void
}

export default function InstitutionForm({ institution, mode, onSubmit, onCancel }: InstitutionFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: '',
    code: '',
    type: 'school',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (institution) {
      setFormData(institution)
    }
  }, [institution])

  const typeOptions = [
    { value: 'university', label: 'Universidade' },
    { value: 'school', label: 'Escola' },
    { value: 'training_center', label: 'Centro de Treinamento' }
  ]

  const statusOptions = [
    { value: 'true', label: 'Ativa' },
    { value: 'false', label: 'Inativa' }
  ]

  const handleChange = (field: keyof Institution, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'Código é obrigatório'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'Estado é obrigatório'
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
          label="Nome da Instituição"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={isReadOnly}
        />

        <Input
          label="Código"
          value={formData.code || ''}
          onChange={(e) => handleChange('code', e.target.value)}
          error={errors.code}
          disabled={isReadOnly}
          helperText="Código único da instituição"
        />

        <Select
          label="Tipo"
          value={formData.type || ''}
          onChange={(value) => handleChange('type', value)}
          options={typeOptions}
          disabled={isReadOnly}
        />

        <Select
          label="Status"
          value={String(formData.active)}
          onChange={(value) => handleChange('active', value === 'true')}
          options={statusOptions}
          disabled={isReadOnly}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          disabled={isReadOnly}
        />

        <Input
          label="Telefone"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          disabled={isReadOnly}
          placeholder="(00) 00000-0000"
        />
      </div>

      <Textarea
        label="Endereço"
        value={formData.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        disabled={isReadOnly}
        rows={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Cidade"
          value={formData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          error={errors.city}
          disabled={isReadOnly}
        />

        <Input
          label="Estado"
          value={formData.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          error={errors.state}
          disabled={isReadOnly}
        />

        <Input
          label="País"
          value={formData.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          disabled={isReadOnly}
        />
      </div>

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
            variant="primary"
          >
            {mode === 'create' ? 'Criar Instituição' : 'Salvar Alterações'}
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