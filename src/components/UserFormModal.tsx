'use client';

import { useState, useEffect } from 'react';
import { User, UserRole, UserInstitution } from '../types/auth';
// Assuming authService might be used for a real API call in the future
// import * as authService from '../services/auth';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: User) => void;
  existingUser?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onUserAdded, existingUser }) => {
  const initialFormData: Partial<User> & { repitaSenha?: string } = {
    name: '',
    endereco: '',
    telefone: '',
    email: '',
    senha: '',
    repitaSenha: '',
    institution_id: undefined,
    school_id: '',
    role: 'student',
    is_active: true,
  };

  const [formData, setFormData] = useState<Partial<User> & { repitaSenha?: string }>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for dropdowns - in a real app, fetch this or pass as props
  const mockInstitutions: UserInstitution[] = [
    { id: 'inst1', name: 'Portal Corp' },
    { id: 'inst2', name: 'Escola Municipal São José' },
    { id: 'inst3', name: 'Colégio Estadual Dom Pedro II' },
    { id: 'inst4', name: 'Universidade Federal XYZ' },
    { id: 'inst5', name: 'Centro de Treinamento TechDev' },
    { id: 'inst6', name: 'Escola de Negócios Inova' },
  ];

  const mockUnidadesEnsino = [
    { id: 'ue1', name: 'Sede Administrativa' },
    { id: 'ue2', name: 'Unidade Centro' },
    { id: 'ue3', name: 'Sede Operacional' },
    { id: 'ue4', name: 'Unidade Norte' },
    { id: 'ue5', name: 'Campus Principal' },
    { id: 'ue6', name: 'Polo EAD' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (existingUser) {
        setFormData({
          ...existingUser,
          senha: '',
          repitaSenha: '',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [existingUser, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "institution") {
      setFormData(prev => ({ ...prev, institution_id: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.senha !== formData.repitaSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!formData.name || !formData.email || !formData.senha || !formData.role) {
        setError("Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Senha, Role).");
        return;
    }

    setLoading(true);
    try {
      const newUser: User = {
        id: existingUser?.id || Date.now().toString(), // Use existing ID if editing
        name: formData.name!,
        email: formData.email!,
        role: formData.role as UserRole,
        endereco: formData.endereco,
        telefone: formData.telefone,
        institution_id: formData.institution_id,
        school_id: formData.school_id,
        is_active: formData.is_active || true,
        created_at: existingUser?.created_at || new Date(),
        updated_at: new Date(),
      };
      
      console.log("User data to be submitted:", newUser, "Password (not sent):", formData.senha ? "****" : "N/A");
      // Simulate API call:
      // if (existingUser) {
      //   await authService.updateUser(newUser, formData.senha); // Pass password if it's being changed
      // } else {
      //   await authService.createUser(newUser, formData.senha!);
      // }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUserAdded(newUser); // In a real app, this would be the user returned from the API
      onClose();
    } catch (err) {
      setError('Falha ao salvar usuário. Tente novamente.');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const userRoles: UserRole[] = ['admin', 'teacher', 'student', 'manager', 'system_admin', 'institution_manager', 'academic_coordinator', 'guardian'];


  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{existingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
              <p className="text-primary-light/80 text-sm mt-1">Preencha os dados do usuário abaixo</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-6 p-4 bg-error-light/20 border border-error-DEFAULT/30 text-error-dark rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-error-DEFAULT" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-light">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                    Nome Completo <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    placeholder="Digite o nome completo"
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                    E-mail <span className="text-error-DEFAULT">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                    placeholder="exemplo@email.com"
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    id="telefone"
                    value={formData.telefone || ''}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>

                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-text-secondary mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    id="endereco"
                    value={formData.endereco || ''}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro"
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-light">
                Informações de Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                    Tipo de Usuário <span className="text-error-DEFAULT">*</span>
                  </label>
                  <select
                    name="role"
                    id="role"
                    value={formData.role || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  >
                    {userRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-text-secondary mb-1">
                    Senha {existingUser ? '(Deixe em branco para não alterar)' : <span className="text-error-DEFAULT">*</span>}
                  </label>
                  <input
                    type="password"
                    name="senha"
                    id="senha"
                    value={formData.senha || ''}
                    onChange={handleChange}
                    required={!existingUser} // Senha é obrigatória apenas para novos usuários
                    placeholder={existingUser ? "Nova senha (opcional)" : "Mínimo 8 caracteres"}
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>

                <div>
                  <label htmlFor="repitaSenha" className="block text-sm font-medium text-text-secondary mb-1">
                    Confirmar Senha {existingUser && !formData.senha ? '' : <span className="text-error-DEFAULT">*</span>}
                  </label>
                  <input
                    type="password"
                    name="repitaSenha"
                    id="repitaSenha"
                    value={formData.repitaSenha || ''}
                    onChange={handleChange}
                    required={!!formData.senha} // Obrigatório apenas se a nova senha for preenchida
                    placeholder="Digite a senha novamente"
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Institution Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-light">
                Informações Institucionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-text-secondary mb-1">
                    Instituição
                  </label>
                  <select
                    name="institution"
                    id="institution"
                    value={formData.institution_id || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  >
                    <option value="">Selecione uma instituição</option>
                    {mockInstitutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="school_id" className="block text-sm font-medium text-text-secondary mb-1">
                    Unidade de Ensino
                  </label>
                  <select
                    name="school_id"
                    id="school_id"
                    value={formData.school_id || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-colors duration-200 bg-background-primary text-text-primary"
                  >
                    <option value="">Selecione uma unidade</option>
                    {mockUnidadesEnsino.map(unidade => (
                      <option key={unidade.id} value={unidade.name}>{unidade.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-background-secondary px-8 py-4 border-t border-border-light">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-text-secondary bg-background-primary border border-border-DEFAULT rounded-lg hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-DEFAULT disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button" // Changed from submit to prevent double form submission if form tag had onSubmit
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary-DEFAULT rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                existingUser ? 'Salvar Alterações' : 'Adicionar Usuário'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;