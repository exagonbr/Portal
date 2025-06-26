'use client'

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { CourseCreateDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';
import { useToast } from '@/components/ToastManager';

interface Institution {
  id: string;
  name: string;
}

interface CourseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CourseCreateDto) => Promise<void>;
  title: string;
}

export function CourseAddModal({ isOpen, onClose, onSave, title }: CourseAddModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<CourseCreateDto>({
    name: '',
    description: '',
    level: '',
    type: '',
    institution_id: '',
    active: true
  });
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await institutionService.getInstitutions();
        if (response.items) {
          setInstitutions(response.items.map((inst: any) => ({
            id: inst.id,
            name: inst.name
          })));
        }
      } catch (error) {
        showError('Erro ao carregar instituições');
      }
    };

    if (isOpen) {
      fetchInstitutions();
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome do curso é obrigatório";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }
    
    if (!formData.level) {
      newErrors.level = "Nível é obrigatório";
    }
    
    if (!formData.type) {
      newErrors.type = "Tipo é obrigatório";
    }
    
    if (!formData.institution_id) {
      newErrors.institution_id = "Instituição é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CourseCreateDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
      showSuccess("Sucesso", "Curso criado com sucesso");
      onClose();
    } catch (error) {
      showError("Erro", "Não foi possível criar o curso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Nome do curso"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            placeholder="Descrição do curso"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.level}
              onChange={(value) => handleInputChange('level', Array.isArray(value) ? value[0] : value)}
              options={[
                { value: '', label: 'Selecione um nível' },
                { value: 'FUNDAMENTAL', label: 'Ensino Fundamental' },
                { value: 'MEDIO', label: 'Ensino Médio' },
                { value: 'SUPERIOR', label: 'Ensino Superior' },
                { value: 'TECNICO', label: 'Ensino Técnico' },
                { value: 'POS_GRADUACAO', label: 'Pós-graduação' }
              ]}
              error={errors.level}
            />
            {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(value) => handleInputChange('type', Array.isArray(value) ? value[0] : value)}
              options={[
                { value: '', label: 'Selecione um tipo' },
                { value: 'PRESENCIAL', label: 'Presencial' },
                { value: 'EAD', label: 'Ensino a Distância' },
                { value: 'HIBRIDO', label: 'Híbrido' },
                { value: 'LIVRE', label: 'Curso Livre' }
              ]}
              error={errors.type}
            />
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instituição <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.institution_id}
            onChange={(value) => handleInputChange('institution_id', Array.isArray(value) ? value[0] : value)}
            options={[
              { value: '', label: 'Selecione uma instituição' },
              ...institutions.map(inst => ({
                value: inst.id,
                label: inst.name
              }))
            ]}
            error={errors.institution_id}
          />
          {errors.institution_id && <p className="text-red-500 text-sm mt-1">{errors.institution_id}</p>}
        </div>

        <div className="flex items-center">
          <Switch
            checked={formData.active}
            onChange={handleSwitchChange}
            id="active-status"
          />
          <label htmlFor="active-status" className="ml-2 text-sm text-gray-700">
            Ativo
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            Criar Curso
          </Button>
        </div>
      </form>
    </Modal>
  );
} 