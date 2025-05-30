'use client'

import React, { useState } from 'react';

interface CourseFormData {
  name: string;
  description: string;
  institutionId: string;
  category: 'Exatas' | 'Humanas' | 'Ciências' | 'Linguagens' | 'Técnico';
  status: 'Ativo' | 'Inativo' | 'Em Desenvolvimento';
  duration: string;
  level: 'Básico' | 'Intermediário' | 'Avançado';
  startDate: string;
  endDate: string;
  coordinator: string;
  price: string;
  certificateAvailable: boolean;
  maxStudents: string;
  minStudents: string;
  prerequisites: string;
  objectives: string;
  methodology: string;
}

interface CourseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseAddModal({ isOpen, onClose }: CourseAddModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    institutionId: '',
    category: 'Exatas',
    status: 'Em Desenvolvimento',
    duration: '',
    level: 'Básico',
    startDate: '',
    endDate: '',
    coordinator: '',
    price: '',
    certificateAvailable: false,
    maxStudents: '',
    minStudents: '',
    prerequisites: '',
    objectives: '',
    methodology: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CourseFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Nome é obrigatório';
      if (!formData.description) newErrors.description = 'Descrição é obrigatória';
      if (!formData.institutionId) newErrors.institutionId = 'Instituição é obrigatória';
      if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    } else if (step === 2) {
      if (!formData.duration) newErrors.duration = 'Duração é obrigatória';
      if (!formData.level) newErrors.level = 'Nível é obrigatório';
      if (!formData.coordinator) newErrors.coordinator = 'Coordenador é obrigatório';
      if (!formData.maxStudents) newErrors.maxStudents = 'Número máximo de alunos é obrigatório';
      if (!formData.minStudents) newErrors.minStudents = 'Número mínimo de alunos é obrigatório';
    } else if (step === 3) {
      if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';
      if (!formData.price) newErrors.price = 'Valor é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      console.log('Criando novo curso:', formData);
      alert('Curso criado com sucesso!');
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        institutionId: '',
        category: 'Exatas',
        status: 'Em Desenvolvimento',
        duration: '',
        level: 'Básico',
        startDate: '',
        endDate: '',
        coordinator: '',
        price: '',
        certificateAvailable: false,
        maxStudents: '',
        minStudents: '',
        prerequisites: '',
        objectives: '',
        methodology: ''
      });
      setCurrentStep(1);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Informações Básicas' },
      { number: 2, title: 'Configuração' },
      { number: 3, title: 'Detalhes' },
      { number: 4, title: 'Revisão' }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`flex items-center ${currentStep >= step.number ? 'text-primary-DEFAULT' : 'text-text-tertiary'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number 
                  ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT' 
                  : 'bg-background-secondary border-border-DEFAULT'
              }`}>
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-primary-DEFAULT' : 'bg-border-DEFAULT'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Novo Curso</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-light/70 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {renderStepIndicator()}

          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nome do Curso <span className="text-error-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  placeholder="Digite o nome do curso"
                />
                {errors.name && <p className="text-error-DEFAULT text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Descrição <span className="text-error-DEFAULT">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  placeholder="Descreva o curso em detalhes"
                />
                {errors.description && <p className="text-error-DEFAULT text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Instituição <span className="text-error-DEFAULT">*</span>
                  </label>
                  <select
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.institutionId ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  >
                    <option value="">Selecione uma instituição</option>
                    <option value="1">Universidade Federal</option>
                    <option value="2">Instituto Tecnológico</option>
                    <option value="3">Centro de Ensino</option>
                  </select>
                  {errors.institutionId && <p className="text-error-DEFAULT text-sm mt-1">{errors.institutionId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Categoria <span className="text-error-DEFAULT">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  >
                    <option value="Exatas">Exatas</option>
                    <option value="Humanas">Humanas</option>
                    <option value="Ciências">Ciências</option>
                    <option value="Linguagens">Linguagens</option>
                    <option value="Técnico">Técnico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status Inicial</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  >
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nível</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuração */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Configuração do Curso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Duração <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.duration ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="Ex: 60 horas"
                  />
                  {errors.duration && <p className="text-error-DEFAULT text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Coordenador <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    name="coordinator"
                    value={formData.coordinator}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.coordinator ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="Nome do coordenador"
                  />
                  {errors.coordinator && <p className="text-error-DEFAULT text-sm mt-1">{errors.coordinator}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Mínimo de Alunos <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="number"
                    name="minStudents"
                    value={formData.minStudents}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.minStudents ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="10"
                  />
                  {errors.minStudents && <p className="text-error-DEFAULT text-sm mt-1">{errors.minStudents}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Máximo de Alunos <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.maxStudents ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="50"
                  />
                  {errors.maxStudents && <p className="text-error-DEFAULT text-sm mt-1">{errors.maxStudents}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Pré-requisitos</label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Liste os pré-requisitos necessários para o curso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Objetivos do Curso</label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Descreva os objetivos do curso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Metodologia</label>
                <textarea
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Descreva a metodologia de ensino"
                />
              </div>
            </div>
          )}

          {/* Step 3: Detalhes */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Detalhes e Valores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Data de Início <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.startDate ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  />
                  {errors.startDate && <p className="text-error-DEFAULT text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Data de Término</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Valor do Curso (R$) <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    className={`w-full px-3 py-2 border ${errors.price ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-error-DEFAULT text-sm mt-1">{errors.price}</p>}
                </div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="certificateAvailable"
                    checked={formData.certificateAvailable}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-text-primary">Certificado Disponível</label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-info-light/20 rounded-lg">
                <h4 className="font-medium text-info-dark mb-2">Dica:</h4>
                <p className="text-sm text-info-dark">
                  Certifique-se de que todas as informações estão corretas antes de prosseguir. 
                  Você poderá editar essas informações posteriormente se necessário.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Revisão */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Revisão Final</h3>
              
              <div className="bg-background-secondary rounded-lg p-6 space-y-4">
                <h4 className="font-medium text-text-primary mb-3">Informações do Curso</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Nome:</p>
                    <p className="font-medium text-text-primary">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Categoria:</p>
                    <p className="font-medium text-text-primary">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Nível:</p>
                    <p className="font-medium text-text-primary">{formData.level}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Duração:</p>
                    <p className="font-medium text-text-primary">{formData.duration}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Coordenador:</p>
                    <p className="font-medium text-text-primary">{formData.coordinator}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Valor:</p>
                    <p className="font-medium text-text-primary">R$ {formData.price}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Capacidade:</p>
                    <p className="font-medium text-text-primary">{formData.minStudents} - {formData.maxStudents} alunos</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Certificado:</p>
                    <p className="font-medium text-text-primary">{formData.certificateAvailable ? 'Sim' : 'Não'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-text-secondary text-sm">Descrição:</p>
                  <p className="text-text-primary text-sm mt-1">{formData.description}</p>
                </div>
              </div>

              <div className="bg-warning-light/20 rounded-lg p-4">
                <p className="text-warning-dark text-sm">
                  <strong>Atenção:</strong> Após criar o curso, você poderá adicionar o conteúdo programático, 
                  materiais didáticos e configurar as avaliações.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                >
                  Voltar
                </button>
              )}
              {currentStep < 4 ? (
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
                  Criar Curso
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 