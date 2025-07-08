'use client'

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ToastManager';
import { UnitDto, UnitCreateDto, UnitUpdateDto } from '@/services/unitService';
import { institutionService } from '@/services/institutionService';

interface UnitEditModalProps {
  unit?: UnitDto;
  onSave: (data: UnitCreateDto | UnitUpdateDto) => Promise<void>;
  onClose: () => void;
}

export function UnitEditModal({ unit, onSave, onClose }: UnitEditModalProps) {
  const { showSuccess, showError } = useToast();
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
        description: unit.description || '',
        type: unit.type || '',
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
        const response = await institutionService.getAll();
        setInstitutions(response.map((inst: any) => ({
          id: inst.id,
          name: inst.name
        })));
      } catch (error) {
        showError('Erro ao carregar instituições');
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
      showSuccess('Unidade salva com sucesso!');
    } catch (error) {
      showError('Erro ao salvar unidade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={unit ? 'Editar Unidade' : 'Nova Unidade'}>
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
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição opcional da unidade..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={formData.type || ''}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um tipo</option>
            <option value="ESCOLA">Escola</option>
            <option value="FACULDADE">Faculdade</option>
            <option value="UNIVERSIDADE">Universidade</option>
            <option value="CENTRO_EDUCACIONAL">Centro Educacional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instituição</label>
          <select
            value={formData.institution_id}
            onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <Switch
            checked={formData.active || false}
            onChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <span className="ml-2 text-sm text-gray-700">Ativo</span>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}