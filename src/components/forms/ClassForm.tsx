'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

interface Class {
  id: string
  name: string
  code: string
  course_id: string
  course_name?: string
  teacher_id: string
  teacher_name?: string
  start_date: string
  end_date: string
  schedule: string
  max_students: number
  enrolled_students?: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

interface ClassFormProps {
  classItem?: Class | null
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: Partial<Class>) => void
  onCancel: () => void
}

export default function ClassForm({ classItem, mode, onSubmit, onCancel }: ClassFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    code: '',
    course_id: '',
    teacher_id: '',
    start_date: '',
    end_date: '',
    schedule: '',
    max_students: 30,
    status: 'planned'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (classItem) {
      setFormData(classItem)
    }
  }, [classItem])

  const statusOptions = [
    { value: 'planned', label: 'Planejada' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluída' },
    { value: 'cancelled', label: 'Cancelada' }
  ]

  const handleChange = (field: keyof Class, value: any) => {
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

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Data de término é obrigatória'
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'Data de término deve ser posterior à data de início'
    }

    if (!formData.schedule?.trim()) {
      newErrors.schedule = 'Horário é obrigatório'
    }

    if (!formData.max_students || formData.max_students <= 0) {
      newErrors.max_students = 'Número máximo de alunos deve ser maior que zero'
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
          label="Nome da Turma"
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
          helperText="Código único da turma"
        />

        <Input
          label="Data de Início"
          type="date"
          value={formData.start_date || ''}
          onChange={(e) => handleChange('start_date', e.target.value)}
          error={errors.start_date}
          disabled={isReadOnly}
        />

        <Input
          label="Data de Término"
          type="date"
          value={formData.end_date || ''}
          onChange={(e) => handleChange('end_date', e.target.value)}
          error={errors.end_date}
          disabled={isReadOnly}
        />

        <Input
          label="Horário"
          value={formData.schedule || ''}
          onChange={(e) => handleChange('schedule', e.target.value)}
          error={errors.schedule}
          disabled={isReadOnly}
          placeholder="Ex: Segunda e Quarta, 19h-22h"
        />

        <Input
          label="Máximo de Alunos"
          type="number"
          value={formData.max_students || ''}
          onChange={(e) => handleChange('max_students', parseInt(e.target.value))}
          error={errors.max_students}
          disabled={isReadOnly}
          min="1"
        />

        <Select
          label="Status"
          value={formData.status || ''}
          onChange={(value) => handleChange('status', value)}
          options={statusOptions}
          disabled={isReadOnly}
        />

        {mode === 'view' && formData.enrolled_students !== undefined && (
          <Input
            label="Alunos Matriculados"
            value={formData.enrolled_students}
            disabled
          />
        )}
      </div>

      {mode === 'create' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.background.tertiary }}>
          <p style={{ color: theme.colors.text.secondary }} className="text-sm">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            Após criar a turma, você poderá adicionar alunos e gerenciar as aulas.
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
            {mode === 'create' ? 'Criar Turma' : 'Salvar Alterações'}
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