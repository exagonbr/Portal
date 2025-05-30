'use client'

import React, { useState } from 'react';

interface InstitutionFormData {
  name: string;
  type: 'Universidade' | 'Escola' | 'Centro de Treinamento' | 'Instituto';
  status: 'Ativa' | 'Inativa' | 'Pendente';
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  director: string;
  cnpj: string;
  foundationDate: string;
  description: string;
}

interface InstitutionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstitutionAddModal({ isOpen, onClose }: InstitutionAddModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    type: 'Escola',
    status: 'Ativa',
    location: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    director: '',
    cnpj: '',
    foundationDate: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InstitutionFormData, string>>>({});

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof InstitutionFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof InstitutionFormData, string>> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nome da instituição é obrigatório';
      if (!formData.type) newErrors.type = 'Tipo é obrigatório';
      if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';
      if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    } else if (step === 2) {
      if (!formData.director.trim()) newErrors.director = 'Diretor/Reitor é obrigatório';
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
      console.log('Criando nova instituição:', formData);
      alert('Instituição criada com sucesso!');
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      type: 'Escola',
      status: 'Ativa',
      location: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      director: '',
      cnpj: '',
      foundationDate: '',
      description: ''
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
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Nova Instituição de Ensino</h2>
              <p className="text-primary-light/80 mt-1">Adicione uma nova instituição à plataforma</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-primary-light/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: `calc(90vh - 120px - 68px)` }}> {/* Adjusted maxHeight */}
          {renderStepIndicator()}

          <form className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">Informações Básicas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Nome da Instituição <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.name ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: Universidade Federal de São Paulo"
                    />
                    {errors.name && <p className="text-error-text text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Tipo de Instituição <span className="text-error-DEFAULT">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                    >
                      <option value="Universidade">Universidade</option>
                      <option value="Escola">Escola</option>
                      <option value="Centro de Treinamento">Centro de Treinamento</option>
                      <option value="Instituto">Instituto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Localização <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.location ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: São Paulo, SP"
                    />
                    {errors.location && <p className="text-error-text text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Endereço Completo <span className="text-error-DEFAULT">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.address ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567"
                    />
                    {errors.address && <p className="text-error-text text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                      placeholder="Breve descrição sobre a instituição..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">Informações de Contato</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Diretor/Reitor <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.director ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: Prof. Dr. João Silva"
                    />
                    {errors.director && <p className="text-error-text text-sm mt-1">{errors.director}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Telefone <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.phone ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: (11) 1234-5678"
                    />
                    {errors.phone && <p className="text-error-text text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      E-mail <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.email ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: contato@instituicao.edu.br"
                    />
                    {errors.email && <p className="text-error-text text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                      placeholder="Ex: www.instituicao.edu.br"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-info-light/20 rounded-lg">
                  <h4 className="font-medium text-info-dark mb-3">Dica</h4>
                  <p className="text-sm text-info-text">
                    Certifique-se de que as informações de contato estejam atualizadas, pois serão utilizadas
                    para comunicação oficial com a instituição.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Documentation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">Documentação</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      CNPJ <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.cnpj ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                      placeholder="Ex: 12.345.678/0001-90"
                    />
                    {errors.cnpj && <p className="text-error-text text-sm mt-1">{errors.cnpj}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Data de Fundação <span className="text-error-DEFAULT">*</span>
                    </label>
                    <input
                      type="date"
                      name="foundationDate"
                      value={formData.foundationDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT ${
                        errors.foundationDate ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                      }`}
                    />
                    {errors.foundationDate && <p className="text-error-text text-sm mt-1">{errors.foundationDate}</p>}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-6 bg-background-secondary rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-4">Resumo da Nova Instituição</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Nome:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.name}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Tipo:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.type}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Status:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.status}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Localização:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.location}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Diretor/Reitor:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.director}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">E-mail:</span>
                      <span className="ml-2 font-medium text-text-primary">{formData.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                >
                  Anterior
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark"
                >
                  Criar Instituição
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}