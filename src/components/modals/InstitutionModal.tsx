'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  InstitutionDto,
  CreateInstitutionDto as CreateInstitutionDtoFromInstitution,
  UpdateInstitutionDto as UpdateInstitutionDtoFromInstitution,
  InstitutionType,
  INSTITUTION_TYPE_LABELS
} from '@/types/institution';
import { institutionService } from '@/services/institutionService';

interface InstitutionModalProps {
  institution?: InstitutionDto | null;
  onClose: () => void;
}

export default function InstitutionModal({ institution, onClose }: InstitutionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInstitutionDtoFromInstitution>({
    name: '',
    code: '',
    type: 'PUBLIC',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name,
        code: institution.code,
        type: institution.type,
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || ''
      });
    }
  }, [institution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (institution) {
        await institutionService.update(institution.id, formData as UpdateInstitutionDtoFromInstitution);
      } else {
        await institutionService.create(formData);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar instituição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {institution ? 'Editar Instituição' : 'Nova Instituição'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome da Instituição *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Código *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
                required
                placeholder="Ex: INST001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InstitutionType })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
                required
              >
                {Object.entries(INSTITUTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-background-primary"
                placeholder="contato@instituicao.com"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-text-secondary hover:bg-background-secondary rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : institution ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}