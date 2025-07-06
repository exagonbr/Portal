'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { SubjectDto } from '@/types/subject'

interface SubjectFormProps {
  subject: SubjectDto | null
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function SubjectForm({ subject, mode, onSubmit, onCancel }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        description: subject.description,
        is_active: subject.is_active
      })
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true
      })
    }
  }, [subject])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpa o erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'view') {
      onCancel()
      return
    }
    
    if (validate()) {
      onSubmit(formData)
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isReadOnly}
            required
          />
        </div>
        
        <div>
          <Input
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            disabled={isReadOnly}
            required
            multiline
            rows={3}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Status</label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={handleSwitchChange}
            disabled={isReadOnly}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          {isReadOnly ? 'Fechar' : 'Cancelar'}
        </Button>
        
        {!isReadOnly && (
          <Button
            type="submit"
            variant="default"
          >
            {mode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        )}
      </div>
    </form>
  )
} 