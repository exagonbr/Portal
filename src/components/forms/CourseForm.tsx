'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button, ButtonGroup } from '@/components/ui/Button';

interface Course {
  id: string
  name: string
  code: string
  description: string
  institution_id: string
  institution_name?: string
  duration_hours: number
  level: 'basic' | 'intermediate' | 'advanced'
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

interface CourseFormProps {
  course?: Course | null
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: Partial<Course>) => void
  onCancel: () => void
}

export default function CourseForm({ course, mode, onSubmit, onCancel }: CourseFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '',
    code: '',
    description: '',
    institution_id: '',
    duration_hours: 40,
    level: 'basic',
    category: '',
    active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (course) {
      setFormData(course)
    }
  }, [course])

  const levelOptions = [
    { value: 'basic', label: 'Básico' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ]

  const categoryOptions = [
    { value: 'technology', label: 'Tecnologia' },
    { value: 'business', label: 'Negócios' },
    { value: 'health', label: 'Saúde' },
    { value: 'education', label: 'Educação' },
    { value: 'arts', label: 'Artes' },
    { value: 'languages', label: 'Idiomas' },
    { value: 'other', label: 'Outros' }
  ]

  const statusOptions = [
    { value: 'true', label: 'Ativo' },
    { value: 'false', label: 'Inativo' }
  ]

  const handleChange = (field: keyof Course, value: any) => {
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

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.duration_hours || formData.duration_hours <= 0) {
      newErrors.duration_hours = 'Duração deve ser maior que zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
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
          label="Nome do Curso"
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
          helperText="Código único do curso"
        />

        <Select
          label="Nível"
          value={formData.level || ''}
          onChange={(value) => handleChange('level', value)}
          options={levelOptions}
          disabled={isReadOnly}
        />

        <Select
          label="Categoria"
          value={formData.category || ''}
          onChange={(value) => handleChange('category', value)}
          options={categoryOptions}
          error={errors.category}
          disabled={isReadOnly}
        />

        <Input
          label="Duração (horas)"
          type="number"
          value={formData.duration_hours || ''}
          onChange={(e) => handleChange('duration_hours', parseInt(e.target.value))}
          error={errors.duration_hours}
          disabled={isReadOnly}
          min="1"
        />

        <Select
          label="Status"
          value={String(formData.active)}
          onChange={(value) => handleChange('active', value === 'true')}
          options={statusOptions}
          disabled={isReadOnly}
        />
      </div>

      <Textarea
        label="Descrição"
        value={formData.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        disabled={isReadOnly}
        rows={4}
        maxLength={500}
        showCharCount
      />

      {mode === 'create' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.background.tertiary }}>
          <p style={{ color: theme.colors.text.secondary }} className="text-sm">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            Após criar o curso, você poderá adicionar módulos e conteúdos.
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
            variant="primary"
            icon={mode === 'create' ? 'add' : 'save'}
          >
            {mode === 'create' ? 'Criar Curso' : 'Salvar Alterações'}
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