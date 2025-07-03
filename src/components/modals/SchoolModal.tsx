'use client';

import React, { useState, useEffect } from 'react';
import { School, CreateSchoolData, UpdateSchoolData } from '@/types/school';
import { schoolService } from '@/services/schoolService';
import { institutionService } from '@/services/institutionService';
import { InstitutionDto } from '@/types/api';

interface SchoolModalProps {
  school?: School | null;
  onClose: () => void;
}

export default function SchoolModal({ school, onClose }: SchoolModalProps) {
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: '',
    code: '',
    institution_id: '',
    type: undefined,
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadInstitutions();
    if (school) {
      setFormData({
        name: school.name,
        code: school.code,
        institution_id: school.institution_id,
        type: school.type,
        description: school.description || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        zip_code: school.zip_code || '',
        phone: school.phone || '',
        email: school.email || ''
      });
    }
  }, [school]);

  const loadInstitutions = async () => {
    try {
      const response = await institutionService.getAll();
      setInstitutions(response);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (school) {
        await schoolService.update(school.id, formData as UpdateSchoolData);
      } else {
        await schoolService.create(formData);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar escola');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏛️</span>
                <h2 className="text-2xl font-bold">
                  {school ? 'Editar Escola' : 'Nova Escola'}
                </h2>
              </div>
              <p className="text-primary-light/80">
                {school ? `Código: ${school.code}` : 'Criar nova escola no sistema'}
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
                  Nome da Escola *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  placeholder="Ex: Escola Municipal João Silva"
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
                  placeholder="Ex: ESC-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Instituição *
                </label>
                <select
                  value={formData.institution_id}
                  onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                >
                  <option value="">Selecione uma instituição</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Tipo de Escola
                </label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'elementary' | 'middle' | 'high' | 'technical' || undefined })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="elementary">Fundamental I</option>
                  <option value="middle">Fundamental II</option>
                  <option value="high">Ensino Médio</option>
                  <option value="technical">Técnico</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  rows={3}
                  placeholder="Descrição da escola (opcional)"
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
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Estado
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="00000-000"
                />
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

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="contato@escola.edu.br"
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
                {school ? 'Editando escola existente' : 'Criando nova escola'}
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
                {loading ? 'Salvando...' : school ? 'Salvar Alterações' : 'Criar Escola'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}