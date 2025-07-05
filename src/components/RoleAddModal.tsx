'use client'

import React, { useState } from 'react';

interface RoleFormData {
  name: string;
  description: string;
  type: 'Customizado';
  status: 'Ativo' | 'Inativo';
  permissions: string[];
  color: string;
  icon: string;
}

interface RoleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleAddModal({ isOpen, onClose }: RoleAddModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    type: 'Customizado',
    status: 'Ativo',
    permissions: [],
    color: '#3B82F6',
    icon: '👤'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  // Categorias de permissões
  const permissionCategories = [
    {
      name: 'Usuários',
      permissions: [
        { id: 'user.view', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários' },
        { id: 'user.create', name: 'Criar Usuários', description: 'Permite criar novos usuários' },
        { id: 'user.edit', name: 'Editar Usuários', description: 'Permite editar dados de usuários' },
        { id: 'user.delete', name: 'Excluir Usuários', description: 'Permite excluir usuários' }
      ]
    },
    {
      name: 'Cursos',
      permissions: [
        { id: 'courses.view', name: 'Visualizar Cursos', description: 'Permite visualizar lista de cursos' },
        { id: 'courses.create', name: 'Criar Cursos', description: 'Permite criar novos cursos' },
        { id: 'courses.edit', name: 'Editar Cursos', description: 'Permite editar dados de cursos' },
        { id: 'courses.delete', name: 'Excluir Cursos', description: 'Permite excluir cursos' }
      ]
    },
    {
      name: 'Instituições',
      permissions: [
        { id: 'institutions.view', name: 'Visualizar Instituições', description: 'Permite visualizar lista de instituições' },
        { id: 'institutions.create', name: 'Criar Instituições', description: 'Permite criar novas instituições' },
        { id: 'institutions.edit', name: 'Editar Instituições', description: 'Permite editar dados de instituições' },
        { id: 'institutions.delete', name: 'Excluir Instituições', description: 'Permite excluir instituições' }
      ]
    },
    {
      name: 'Relatórios',
      permissions: [
        { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios' },
        { id: 'reports.export', name: 'Exportar Relatórios', description: 'Permite exportar relatórios' },
        { id: 'reports.create', name: 'Criar Relatórios', description: 'Permite criar novos relatórios' }
      ]
    },
    {
      name: 'Sistema',
      permissions: [
        { id: 'system.settings', name: 'Configurações do Sistema', description: 'Permite acessar configurações' },
        { id: 'system.backup', name: 'Backup do Sistema', description: 'Permite realizar backups' },
        { id: 'system.logs', name: 'Logs do Sistema', description: 'Permite visualizar logs' },
        { id: 'system.audit', name: 'Auditoria do Sistema', description: 'Permite acessar auditoria' }
      ]
    }
  ];

  const iconOptions = [
    { value: '👤', label: 'Usuário' },
    { value: '👨‍🏫', label: 'Professor' },
    { value: '👨‍🎓', label: 'Aluno' },
    { value: '👔', label: 'Coordenador' },
    { value: '🏛️', label: 'Diretor' },
    { value: '📋', label: 'Secretário' },
    { value: '👨‍👩‍👧', label: 'Responsável' },
    { value: '👑', label: 'Administrador' },
    { value: '🔧', label: 'Técnico' },
    { value: '📊', label: 'Analista' }
  ];

  const colorOptions = [
    { value: '#3B82F6', label: 'Azul', className: 'bg-blue-500' },
    { value: '#10B981', label: 'Verde', className: 'bg-green-500' },
    { value: '#8B5CF6', label: 'Roxo', className: 'bg-purple-500' },
    { value: '#F59E0B', label: 'Amarelo', className: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Vermelho', className: 'bg-red-500' },
    { value: '#6366F1', label: 'Índigo', className: 'bg-indigo-500' },
    { value: '#EC4899', label: 'Rosa', className: 'bg-pink-500' },
    { value: '#64748B', label: 'Cinza', className: 'bg-gray-500' }
  ];

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RoleFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAllCategory = (categoryPermissions: { id: string }[]) => {
    const categoryIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryIds.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Remove all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !categoryIds.includes(id))
      }));
    } else {
      // Add all permissions from this category
      setFormData(prev => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...categoryIds]))
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof RoleFormData, string>> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Nome é obrigatório';
      if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    } else if (step === 2) {
      if (formData.permissions.length === 0) {
        alert('Selecione pelo menos uma permissão para a função');
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
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
      console.log('Criando nova função:', formData);
      alert('Função criada com sucesso!');
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'Customizado',
        status: 'Ativo',
        permissions: [],
        color: '#3B82F6',
        icon: '👤'
      });
      setCurrentStep(1);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Informações Básicas' },
      { number: 2, title: 'Permissões' },
      { number: 3, title: 'Revisão' }
    ];

    return (
      <div className="flex items-center justify-center space-x-8 mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-primary-DEFAULT border-primary-DEFAULT text-white'
                : 'border-border-DEFAULT text-text-secondary bg-background-secondary'
            }`}>
              {currentStep > step.number ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>
            <span className={`ml-3 text-sm font-medium ${
              currentStep >= step.number ? 'text-primary-DEFAULT' : 'text-text-secondary'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 ml-8 ${
                currentStep > step.number ? 'bg-primary-DEFAULT' : 'bg-border-DEFAULT'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{formData.icon}</span>
                <h2 className="text-2xl font-bold">Nova Função</h2>
              </div>
              <p className="text-primary-light/80">Criar nova função personalizada no sistema</p>
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
          {renderStepIndicator()}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Função *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary ${
                      errors.name ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                    }`}
                    placeholder="Ex: Professor Coordenador"
                  />
                  {errors.name && <p className="text-error-DEFAULT text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Descrição *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary ${
                      errors.description ? 'border-error-DEFAULT' : 'border-border-DEFAULT'
                    }`}
                    placeholder="Descreva as responsabilidades desta função..."
                  />
                  {errors.description && <p className="text-error-DEFAULT text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Ícone</label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                        className={`p-3 text-2xl border-2 rounded-lg transition-colors ${
                          formData.icon === icon.value
                            ? 'border-primary-DEFAULT bg-primary-light/20'
                            : 'border-border-DEFAULT hover:border-primary-DEFAULT/50'
                        }`}
                        title={icon.label}
                      >
                        {icon.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Cor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.color === color.value
                            ? 'border-text-primary'
                            : 'border-border-DEFAULT hover:border-text-secondary'
                        }`}
                        title={color.label}
                      >
                        <div className={`w-full h-6 rounded ${color.className}`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Permissões da Função</h3>
              
              <div className="space-y-6">
                {permissionCategories.map((category) => (
                  <div key={category.name} className="bg-background-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-text-primary">{category.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAllCategory(category.permissions)}
                        className="text-sm text-primary-DEFAULT hover:text-primary-dark"
                      >
                        {category.permissions.every(p => formData.permissions.includes(p.id)) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 bg-background-primary rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-text-primary">{permission.name}</p>
                            <p className="text-sm text-text-secondary">{permission.description}</p>
                          </div>
                          <label className="flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="sr-only"
                            />
                            <div className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                              formData.permissions.includes(permission.id) ? 'bg-primary-DEFAULT' : 'bg-secondary-light'
                            }`}>
                              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                                formData.permissions.includes(permission.id) ? 'translate-x-4' : 'translate-x-0'
                              }`}></div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Revisão da Função</h3>
              
              <div className="bg-background-secondary rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: formData.color + '20', color: formData.color }}>
                    <span className="text-3xl">{formData.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-text-primary">{formData.name}</h4>
                    <p className="text-text-secondary mt-1">{formData.description}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      formData.status === 'Ativo' ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border-DEFAULT pt-4">
                  <h5 className="font-medium text-text-primary mb-3">Permissões Selecionadas ({formData.permissions.length})</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissionCategories.map((category) => {
                      const categoryPermissions = category.permissions.filter(p => formData.permissions.includes(p.id));
                      if (categoryPermissions.length === 0) return null;
                      
                      return (
                        <div key={category.name} className="bg-background-primary rounded p-3">
                          <p className="font-medium text-text-primary text-sm mb-1">{category.name}</p>
                          <ul className="text-xs text-text-secondary space-y-1">
                            {categoryPermissions.map((permission) => (
                              <li key={permission.id}>• {permission.name}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm text-text-tertiary">
                Passo {currentStep} de 3
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-secondary-light text-text-primary rounded-lg hover:bg-secondary-DEFAULT/80 transition-colors"
              >
                Cancelar
              </button>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary transition-colors"
                >
                  Voltar
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark transition-colors"
                >
                  Criar Função
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 