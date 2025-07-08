'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { UnitDto, CreateUnitDto, UpdateUnitDto } from '@/types/unit'
import { InstitutionDto } from '@/types/institution'
import { useToast } from '@/components/ToastManager'
import { unitService } from '@/services/unitService'
import { Building2, School } from 'lucide-react'

interface UnitFormModalProps {
  isOpen: boolean
  unit?: UnitDto | null
  institutions: InstitutionDto[]
  onClose: () => void
  onSuccess?: () => void
  viewOnly?: boolean
}

export default function UnitFormModal({
  isOpen,
  unit,
  institutions,
  onClose,
  onSuccess,
  viewOnly = false
}: UnitFormModalProps) {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Formulário inicial
  const initialFormState: CreateUnitDto = {
    name: '',
    institution_id: '',
    deleted: false
  }
  
  const [formData, setFormData] = useState<CreateUnitDto>(initialFormState)

  // Carregar dados da unidade quando disponível
  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        institution_id: unit.institution_id,
        deleted: unit.deleted || false
      })
    } else {
      setFormData(initialFormState)
    }
  }, [unit])

  // Manipular mudanças no formulário
  const handleInputChange = (field: keyof CreateUnitDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (viewOnly) return
    
    setLoading(true)
    
    try {
      if (unit) {
        // Atualizar unidade existente
        const updateData: UpdateUnitDto = {
          name: formData.name,
          institution_id: formData.institution_id,
          deleted: formData.deleted
        }
        
        await unitService.updateUnit(Number(unit.id), updateData)
        showSuccess('Unidade atualizada com sucesso!')
      } else {
        // Criar nova unidade
        await unitService.createUnit(formData)
        showSuccess('Unidade criada com sucesso!')
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao salvar unidade:', error)
      showError(unit ? 'Erro ao atualizar unidade' : 'Erro ao criar unidade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? 'Editar Unidade' : 'Nova Unidade'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <School className="h-5 w-5 text-blue-500" />
            Informações da Unidade
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome da Unidade *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o nome da unidade"
                disabled={viewOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instituição *
              </label>
              <select
                required
                value={formData.institution_id}
                onChange={(e) => handleInputChange('institution_id', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={viewOnly}
              >
                <option value="">Selecione uma instituição</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>{institution.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!formData.deleted}
                onChange={(e) => handleInputChange('deleted', !e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                disabled={viewOnly}
              />
              <span className="text-sm text-gray-700">Unidade ativa</span>
            </label>
          </div>
        </div>

        {/* Ações */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            {!viewOnly && (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">&#8635;</span>
                    Salvando...
                  </>
                ) : unit ? 'Atualizar' : 'Criar'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
} 