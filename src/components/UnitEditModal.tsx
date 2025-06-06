'use client'

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Switch } from './Switch';
import { toast } from 'react-hot-toast';
import { UnitResponseDto, UnitCreateDto, UnitUpdateDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';

interface UnitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UnitCreateDto | UnitUpdateDto) => Promise<void>;
  unit?: UnitResponseDto;
  title: string;
}

export function UnitEditModal({ isOpen, onClose, onSave, unit, title }: UnitEditModalProps) {
  const [formData, setFormData] = useState<UnitCreateDto | UnitUpdateDto>({
    name: '',
    description: '',
    type: '',
    institution_id: '',
    active: true
  });
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        description: unit.description,
        type: unit.type,
        institution_id: unit.institution_id,
        active: unit.active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: '',
        institution_id: '',
        active: true
      });
    }
  }, [unit]);

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
      toast.success('Unidade salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar unidade');
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
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="">Selecione um tipo</option>
            <option value="ESCOLA">Escola</option>
            <option value="FACULDADE">Faculdade</option>
            <option value="UNIVERSIDADE">Universidade</option>
            <option value="CENTRO_EDUCACIONAL">Centro Educacional</option>
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