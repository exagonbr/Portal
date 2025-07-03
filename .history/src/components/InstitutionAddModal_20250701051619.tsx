'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { InstitutionCreateDto } from '@/types/api'

interface InstitutionAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: InstitutionCreateDto) => Promise<void>
  title: string
}

export function InstitutionAddModal({ isOpen, onClose, onSave, title }: InstitutionAddModalProps) {
  const [formData, setFormData] = useState<InstitutionCreateDto>({
    name: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
      setFormData({
        name: '',
        code: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        active: true
      })
      setErrors({})
    } catch (error) {
      console.log('Erro ao salvar instituição:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InstitutionCreateDto, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nome *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Nome da instituição"
            />
          </div>
          
          <div>
            <Input
              label="Código *"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={errors.code}
              placeholder="Código único da instituição"
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Descrição"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descrição da instituição"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="email@instituicao.com"
            />
          </div>
          
          <div>
            <Input
              label="Telefone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Endereço"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Endereço completo da instituição"
            rows={2}
          />
        </div>

        <div>
          <Switch
            label="Instituição ativa"
            checked={formData.active}
            onChange={(checked) => handleInputChange('active', checked)}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar Instituição
          </Button>
        </div>
      </form>
    </Modal>
  )
}