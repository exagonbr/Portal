'use client'

import React, { useState } from 'react';

interface StudentFormData {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
  institutionId: string;
  courseId: string;
  classGroup: string;
  status: 'Ativo' | 'Inativo' | 'Trancado';
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  observations: string;
}

interface StudentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentAddModal({ isOpen, onClose }: StudentAddModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: '',
    institutionId: '',
    courseId: '',
    classGroup: '',
    status: 'Ativo',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelationship: '',
    observations: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof StudentFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Nome é obrigatório';
      if (!formData.email) newErrors.email = 'Email é obrigatório';
      if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
      if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (step === 2) {
      if (!formData.institutionId) newErrors.institutionId = 'Instituição é obrigatória';
      if (!formData.courseId) newErrors.courseId = 'Curso é obrigatório';
      if (!formData.classGroup) newErrors.classGroup = 'Turma é obrigatória';
    } else if (step === 3) {
      // Guardian info is optional for adult students
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 18) {
        if (!formData.guardianName) newErrors.guardianName = 'Nome do responsável é obrigatório para menores de 18 anos';
        if (!formData.guardianPhone) newErrors.guardianPhone = 'Telefone do responsável é obrigatório';
      }
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
      console.log('Criando novo aluno:', formData);
      alert('Aluno cadastrado com sucesso!');
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        cpf: '',
        birthDate: '',
        phone: '',
        address: '',
        institutionId: '',
        courseId: '',
        classGroup: '',
        status: 'Ativo',
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianRelationship: '',
        observations: ''
      });
      setCurrentStep(1);
    }
  };

  const calculateAge = () => {
    if (!formData.birthDate) return null;
    const birthYear = new Date(formData.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Dados Pessoais' },
      { number: 2, title: 'Dados Acadêmicos' },
      { number: 3, title: 'Responsável' },
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
            <h2 className="text-2xl font-bold">Novo Aluno</h2>
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

          {/* Step 1: Dados Pessoais */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dados Pessoais</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nome Completo <span className="text-error-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  placeholder="Digite o nome completo do aluno"
                />
                {errors.name && <p className="text-error-DEFAULT text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    CPF <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.cpf ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-error-DEFAULT text-sm mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Data de Nascimento <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.birthDate ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  />
                  {errors.birthDate && <p className="text-error-DEFAULT text-sm mt-1">{errors.birthDate}</p>}
                  {formData.birthDate && (
                    <p className="text-sm text-text-secondary mt-1">Idade: {calculateAge()} anos</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="aluno@email.com"
                  />
                  {errors.email && <p className="text-error-DEFAULT text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Endereço
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Endereço completo do aluno"
                />
              </div>
            </div>
          )}

          {/* Step 2: Dados Acadêmicos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dados Acadêmicos</h3>
              
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
                    Curso <span className="text-error-DEFAULT">*</span>
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.courseId ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                  >
                    <option value="">Selecione um curso</option>
                    <option value="1">Matemática Avançada</option>
                    <option value="2">Física Fundamental</option>
                    <option value="3">Química Orgânica</option>
                  </select>
                  {errors.courseId && <p className="text-error-DEFAULT text-sm mt-1">{errors.courseId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Turma <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    name="classGroup"
                    value={formData.classGroup}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.classGroup ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="Ex: Turma A"
                  />
                  {errors.classGroup && <p className="text-error-DEFAULT text-sm mt-1">{errors.classGroup}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Status Inicial
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Trancado">Trancado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Observações
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  placeholder="Observações sobre o aluno (opcional)"
                />
              </div>
            </div>
          )}

          {/* Step 3: Responsável */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dados do Responsável</h3>
              
              {calculateAge() && calculateAge()! < 18 ? (
                <div className="bg-warning-light/20 rounded-lg p-4 mb-6">
                  <p className="text-warning-dark text-sm">
                    <strong>Atenção:</strong> O aluno é menor de idade. Os dados do responsável são obrigatórios.
                  </p>
                </div>
              ) : (
                <div className="bg-info-light/20 rounded-lg p-4 mb-6">
                  <p className="text-info-dark text-sm">
                    <strong>Informação:</strong> Os dados do responsável são opcionais para alunos maiores de idade.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nome do Responsável {calculateAge() && calculateAge()! < 18 && <span className="text-error-DEFAULT">*</span>}
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.guardianName ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="Nome completo do responsável"
                  />
                  {errors.guardianName && <p className="text-error-DEFAULT text-sm mt-1">{errors.guardianName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Grau de Parentesco
                  </label>
                  <input
                    type="text"
                    name="guardianRelationship"
                    value={formData.guardianRelationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    placeholder="Ex: Pai, Mãe, Avô, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Telefone do Responsável {calculateAge() && calculateAge()! < 18 && <span className="text-error-DEFAULT">*</span>}
                  </label>
                  <input
                    type="text"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.guardianPhone ? 'border-error-DEFAULT' : 'border-border-DEFAULT'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary`}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.guardianPhone && <p className="text-error-DEFAULT text-sm mt-1">{errors.guardianPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email do Responsável
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    placeholder="responsavel@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Revisão */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Revisão Final</h3>
              
              <div className="bg-background-secondary rounded-lg p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Nome:</p>
                      <p className="font-medium text-text-primary">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">CPF:</p>
                      <p className="font-medium text-text-primary">{formData.cpf}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Email:</p>
                      <p className="font-medium text-text-primary">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Data de Nascimento:</p>
                      <p className="font-medium text-text-primary">
                        {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR') : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-text-primary mb-3">Dados Acadêmicos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Instituição:</p>
                      <p className="font-medium text-text-primary">
                        {formData.institutionId === '1' ? 'Universidade Federal' : 
                         formData.institutionId === '2' ? 'Instituto Tecnológico' : 
                         formData.institutionId === '3' ? 'Centro de Ensino' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Curso:</p>
                      <p className="font-medium text-text-primary">
                        {formData.courseId === '1' ? 'Matemática Avançada' : 
                         formData.courseId === '2' ? 'Física Fundamental' : 
                         formData.courseId === '3' ? 'Química Orgânica' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Turma:</p>
                      <p className="font-medium text-text-primary">{formData.classGroup}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Status:</p>
                      <p className="font-medium text-text-primary">{formData.status}</p>
                    </div>
                  </div>
                </div>

                {(formData.guardianName || formData.guardianPhone) && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-text-primary mb-3">Dados do Responsável</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary">Nome:</p>
                        <p className="font-medium text-text-primary">{formData.guardianName}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Telefone:</p>
                        <p className="font-medium text-text-primary">{formData.guardianPhone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-success-light/20 rounded-lg p-4">
                <p className="text-success-dark text-sm">
                  <strong>Pronto!</strong> Revise as informações acima. Após confirmar, 
                  o aluno será cadastrado e receberá um email com as instruções de acesso.
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
                  Cadastrar Aluno
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 