'use client'

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { CreateCourseDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';
import { useToast } from '@/components/ToastManager';

interface Institution {
  id: string;
  name: string;
}

interface CourseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCourseDto) => Promise<void>;
  title: string;
}

export function CourseAddModal({ isOpen, onClose, onSave, title }: CourseAddModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<CreateCourseDto>({
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
        if (response.success && response.data) {
          setInstitutions(response.data.map(inst => ({
            id: inst.id,
            name: inst.name
          })));
        }
      } catch (error) {
        showError("Erro", "Não foi possível carregar as instituições");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              error={errors.level}
            >
              <option value="">Selecione um nível</option>
              <option value="FUNDAMENTAL">Ensino Fundamental</option>
              <option value="MEDIO">Ensino Médio</option>
              <option value="SUPERIOR">Ensino Superior</option>
              <option value="POS_GRADUACAO">Pós-Graduação</option>
              <option value="MESTRADO">Mestrado</option>
              <option value="DOUTORADO">Doutorado</option>
            </Select>
            {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              error={errors.type}
            >
              <option value="">Selecione um tipo</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="EAD">EAD</option>
              <option value="HIBRIDO">Híbrido</option>
            </Select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instituição <span className="text-red-500">*</span>
          </label>
          <Select
            name="institution_id"
            value={formData.institution_id}
            onChange={handleInputChange}
            error={errors.institution_id}
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </Select>
          {errors.institution_id && <p className="text-red-500 text-sm mt-1">{errors.institution_id}</p>}
        </div>

        <div className="flex items-center">
          <Switch 
            checked={formData.active} 
            onCheckedChange={handleSwitchChange} 
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
            isLoading={isLoading}
          >
            Criar Curso
          </Button>
        </div>
      </form>
    </Modal>
  );
} 