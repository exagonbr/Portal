'use client'

import React, { useState } from 'react';
import { mockCourses } from '@/constants/mockData'; // Assuming mockInstitutions might come from here or similar
import { useTheme } from '@/contexts/ThemeContext';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';

interface UnitFormData {
  name: string;
  institutionId: string;
  type: 'Campus Principal' | 'Unidade' | 'Polo' | 'Extensão';
  status: 'Ativa' | 'Inativa' | 'Em Manutenção';
  location: string;
  address: string;
  phone: string;
  email: string;
  coordinator: string;
  cnpj: string;
  stateRegistration: string;
  foundationDate: string;
  operatingLicense: string;
}

interface UnitAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A simple mock for institutions if not available from mockCourses or if structure differs
const mockInstitutionsList = mockCourses.length > 0 
  ? Array.from(new Set(mockCourses.map(course => course.institution))).map(inst => ({id: inst.id || inst.name, name: inst.name})) // Ensure id is present
  : [{id: 'defaultInst', name: 'Instituição Padrão'}];

export default function UnitAddModal({ isOpen, onClose }: UnitAddModalProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    institutionId: '',
    type: 'Unidade',
    status: 'Ativa',
    location: '',
    address: '',
    phone: '',
    email: '',
    coordinator: '',
    cnpj: '',
    stateRegistration: '',
    foundationDate: '',
    operatingLicense: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormData, string>>>({});

  const institutions = mockInstitutionsList;

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof UnitFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof UnitFormData, string>> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nome da unidade é obrigatório';
      if (!formData.institutionId) newErrors.institutionId = 'Instituição é obrigatória';
      if (!formData.type) newErrors.type = 'Tipo de unidade é obrigatório';
      if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';
      if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    } else if (step === 2) {
      if (!formData.coordinator.trim()) newErrors.coordinator = 'Coordenador é obrigatório';
      if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
      if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
      }
    } else if (step === 3) {
      if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
      if (!formData.foundationDate) newErrors.foundationDate = 'Data de fundação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      console.log('Criando nova unidade:', formData);
      alert('Unidade criada com sucesso!');
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      institutionId: '',
      type: 'Unidade',
      status: 'Ativa',
      location: '',
      address: '',
      phone: '',
      email: '',
      coordinator: '',
      cnpj: '',
      stateRegistration: '',
      foundationDate: '',
      operatingLicense: ''
    });
    setErrors({});
    onClose();
  };

  const renderStepIndicator = () => {
    const steps = ['Informações Básicas', 'Contatos', 'Documentação'];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                currentStep > index + 1 ? 'bg-success-DEFAULT text-white' :
                currentStep === index + 1 ? 'bg-primary-DEFAULT text-white' :
                'bg-secondary-light text-text-secondary'
              }`}>
                {currentStep > index + 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-3 text-sm font-medium ${
                currentStep >= index + 1 ? 'text-text-primary' : 'text-text-tertiary'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-24 h-0.5 mx-4 ${
                currentStep > index + 1 ? 'bg-success-DEFAULT' : 'bg-border-DEFAULT'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Unidade de Ensino"
      size="xl"
    >
      <div className="p-6 overflow-y-auto" style={{ maxHeight: `calc(90vh - 120px - 68px)` }}>
        {renderStepIndicator()}

        <form className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Nome da Unidade <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.name ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: Campus São Paulo"
                  />
                  {errors.name && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Instituição <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <select
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.institutionId ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.institutionId ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                  >
                    <option value="">Selecione uma instituição</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                  {errors.institutionId && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.institutionId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Tipo de Unidade <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                  >
                    <option value="Campus Principal">Campus Principal</option>
                    <option value="Unidade">Unidade</option>
                    <option value="Polo">Polo</option>
                    <option value="Extensão">Extensão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Inativa">Inativa</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Localização <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.location ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.location ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: São Paulo, SP"
                  />
                  {errors.location && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.location}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Endereço Completo <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.address ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.address ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567"
                  />
                  {errors.address && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.address}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
                Informações de Contato
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Coordenador <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="coordinator"
                    value={formData.coordinator}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.coordinator ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.coordinator ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: Prof. Dr. João Silva"
                  />
                  {errors.coordinator && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.coordinator}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Telefone <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phone ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.phone ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: (11) 1234-5678"
                  />
                  {errors.phone && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    E-mail <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.email ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: contato@unidade.edu.br"
                  />
                  {errors.email && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.email}</p>}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ 
                backgroundColor: theme.colors.status.info + '20',
                borderColor: theme.colors.status.info,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}>
                <h4 className="font-medium mb-3" style={{ color: theme.colors.status.info }}>Dica</h4>
                <p className="text-sm" style={{ color: theme.colors.text.primary }}>
                  Certifique-se de que as informações de contato estejam atualizadas, pois serão utilizadas
                  para comunicação oficial com a unidade.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Documentation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
                Documentação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    CNPJ <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.cnpj ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.cnpj ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: 12.345.678/0001-90"
                  />
                  {errors.cnpj && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.cnpj}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    name="stateRegistration"
                    value={formData.stateRegistration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: 123.456.789.012"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Data de Fundação <span style={{ color: theme.colors.status.error }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="foundationDate"
                    value={formData.foundationDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.foundationDate ? 'border-error-DEFAULT' : ''
                    }`}
                    style={{
                      borderColor: errors.foundationDate ? theme.colors.status.error : theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                  />
                  {errors.foundationDate && <p className="text-sm mt-1" style={{ color: theme.colors.status.error }}>{errors.foundationDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                    Alvará de Funcionamento
                  </label>
                  <input
                    type="text"
                    name="operatingLicense"
                    value={formData.operatingLicense}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.primary
                    }}
                    placeholder="Ex: ALV-2024-0123"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: theme.colors.background.secondary }}>
                <h4 className="font-semibold mb-4" style={{ color: theme.colors.text.primary }}>
                  Resumo da Nova Unidade
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>Nome:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {formData.name}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>Instituição:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {institutions.find(i => i.id === formData.institutionId)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>Tipo:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {formData.type}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>Status:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {formData.status}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>Coordenador:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {formData.coordinator}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>E-mail:</span>
                    <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                      {formData.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4" style={{ 
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary 
      }}>
        <div className="flex justify-between items-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 hover:opacity-80 transition-opacity"
            style={{ color: theme.colors.text.secondary }}
          >
            Cancelar
          </button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  borderColor: theme.colors.border.DEFAULT,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.primary
                }}
              >
                Anterior
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: theme.colors.primary.DEFAULT,
                  color: theme.colors.primary.contrast
                }}
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: theme.colors.status.success,
                  color: '#ffffff'
                }}
              >
                Criar Unidade
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}