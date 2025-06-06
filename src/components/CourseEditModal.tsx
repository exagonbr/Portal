'use client'

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Switch } from './Switch';
import { toast } from 'react-hot-toast';
import { CourseResponseDto, CourseCreateDto, CourseUpdateDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CourseCreateDto | CourseUpdateDto) => Promise<void>;
  course?: CourseResponseDto;
  title: string;
}

export function CourseEditModal({ isOpen, onClose, onSave, course, title }: CourseEditModalProps) {
  const [formData, setFormData] = useState<CourseCreateDto | CourseUpdateDto>({
    name: '',
    description: '',
    level: '',
    type: '',
    institution_id: '',
    active: true
  });
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description,
        level: course.level,
        type: course.type,
        institution_id: course.institution_id,
        active: course.active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        level: '',
        type: '',
        institution_id: '',
        active: true
      });
    }
  }, [course]);

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const response = await institutionService.list();
        setInstitutions(response.data.map(inst => ({
          id: inst.id,
          name: inst.name
        })));
      } catch (error) {
        toast.error('Erro ao carregar instituições');
      }
    };
    loadInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
      toast.success('Curso salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar curso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nível</label>
          <Select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            required
          >
            <option value="">Selecione um nível</option>
            <option value="FUNDAMENTAL">Ensino Fundamental</option>
            <option value="MEDIO">Ensino Médio</option>
            <option value="SUPERIOR">Ensino Superior</option>
            <option value="POS_GRADUACAO">Pós-Graduação</option>
            <option value="MESTRADO">Mestrado</option>
            <option value="DOUTORADO">Doutorado</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="">Selecione um tipo</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="EAD">EAD</option>
            <option value="HIBRIDO">Híbrido</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instituição</label>
          <Select
            value={formData.institution_id}
            onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
            required
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center">
          <Switch
            checked={formData.active}
            onChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <span className="ml-2 text-sm text-gray-700">Ativo</span>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
} 