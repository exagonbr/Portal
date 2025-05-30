'use client';

import React, { useState, useEffect } from 'react';
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

  const getInstitutionIcon = () => {
    return '🏛️';
  };

  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getInstitutionIcon()}</span>
                <h2 className="text-2xl font-bold">
                  {institution ? 'Editar Instituição' : 'Nova Instituição'}
                </h2>
              </div>
              <p className="text-primary-light/80">
                {institution ? `Código: ${institution.code}` : 'Criar nova instituição no sistema'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-light/70 transition-colors ml-4 p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nome da Instituição *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  placeholder="Ex: Universidade Federal de São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  placeholder="Ex: UNIFESP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as InstitutionType })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
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
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Rua, número, bairro, cidade - Estado"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="contato@instituicao.edu.br"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm text-text-tertiary">
                {institution ? 'Editando instituição existente' : 'Criando nova instituição'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary-light text-text-primary rounded-lg hover:bg-secondary-DEFAULT/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : institution ? 'Salvar Alterações' : 'Criar Instituição'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}