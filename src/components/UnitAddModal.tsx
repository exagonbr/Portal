'use client'

import React, { useState } from 'react';
import { mockCourses } from '@/constants/mockData';

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

export default function UnitAddModal({ isOpen, onClose }: UnitAddModalProps) {
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

  // Get unique institutions for dropdown
  const institutions = Array.from(new Set(mockCourses.map(course => course.institution)));

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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
      // TODO: Implement save logic
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
                currentStep > index + 1 ? 'bg-green-600 text-white' :
                currentStep === index + 1 ? 'bg-blue-600 text-white' :
                'bg-gray-300 text-gray-600'
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
                currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-24 h-0.5 mx-4 ${
                currentStep > index + 1 ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Nova Unidade de Ensino</h2>
              <p className="text-blue-100 mt-1">Adicione uma nova unidade à plataforma</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}

          <form className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Unidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Campus São Paulo"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instituição <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="institutionId"
                      value={formData.institutionId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.institutionId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma instituição</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                    {errors.institutionId && <p className="text-red-500 text-sm mt-1">{errors.institutionId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Unidade <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Campus Principal">Campus Principal</option>
                      <option value="Unidade">Unidade</option>
                      <option value="Polo">Polo</option>
                      <option value="Extensão">Extensão</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: São Paulo, SP"
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço Completo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Informações de Contato</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coordenador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="coordinator"
                      value={formData.coordinator}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.coordinator ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Prof. Dr. João Silva"
                    />
                    {errors.coordinator && <p className="text-red-500 text-sm mt-1">{errors.coordinator}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: (11) 1234-5678"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: contato@unidade.edu.br"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Dica</h4>
                  <p className="text-sm text-gray-600">
                    Certifique-se de que as informações de contato estejam atualizadas, pois serão utilizadas
                    para comunicação oficial com a unidade.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Documentation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Documentação</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cnpj ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: 12.345.678/0001-90"
                    />
                    {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      name="stateRegistration"
                      value={formData.stateRegistration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 123.456.789.012"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fundação <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="foundationDate"
                      value={formData.foundationDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.foundationDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.foundationDate && <p className="text-red-500 text-sm mt-1">{errors.foundationDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alvará de Funcionamento
                    </label>
                    <input
                      type="text"
                      name="operatingLicense"
                      value={formData.operatingLicense}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: ALV-2024-0123"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Resumo da Nova Unidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <span className="ml-2 font-medium">{formData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Instituição:</span>
                      <span className="ml-2 font-medium">
                        {institutions.find(i => i.id === formData.institutionId)?.name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">{formData.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium">{formData.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coordenador:</span>
                      <span className="ml-2 font-medium">{formData.coordinator}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">E-mail:</span>
                      <span className="ml-2 font-medium">{formData.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Anterior
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Criar Unidade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}