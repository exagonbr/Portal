'use client'

import { useState, useEffect } from 'react'
import { ThemeDto, CreateThemeDto, UpdateThemeDto } from '@/types/theme'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'

interface ThemeFormProps {
  theme: ThemeDto | null
  isOpen: boolean
  onSubmit: (data: CreateThemeDto | UpdateThemeDto) => void
  onCancel: () => void
}

export default function ThemeForm({ theme, isOpen, onSubmit, onCancel }: ThemeFormProps) {
  const [formData, setFormData] = useState<CreateThemeDto | UpdateThemeDto>({
    name: '',
    description: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (theme) {
      setFormData({
        name: theme.name,
        description: theme.description,
        is_active: theme.is_active
      })
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true
      })
    }
  }, [theme])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'O nome é obrigatório'
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'A descrição é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={theme ? `Editar Tema: ${theme.name}` : 'Novo Tema'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
        </div>
        
        <div>
          <Textarea
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
            required
          />
        </div>
        
        <div>
          <Switch
            label="Ativo"
            checked={formData.is_active}
            onChange={handleSwitchChange}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
          >
            {theme ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
