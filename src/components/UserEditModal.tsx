'use client'

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth'; // Assuming UserRole is also in auth

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated?: (user: User) => void;
}

export default function UserEditModal({ isOpen, onClose, user, onUserUpdated }: UserEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
      setActiveTab('info');
      setEditMode(false);
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Salvando dados do usuário:', formData);
    setEditMode(false);
    if (onUserUpdated && formData as User) {
      onUserUpdated(formData as User);
    }
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(user); // Reset to original user data
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log('Deletando usuário:', user.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Usuário removido com sucesso!');
  };

  const handlePasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    console.log('Alterando senha do usuário');
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Senha alterada com sucesso!');
  };

  const getRoleBadgeColor = (role: UserRole | string) => {
    switch (role as UserRole) {
      case 'admin': return 'bg-error-light/30 text-error-dark';
      case 'manager': return 'bg-accent-purple-light/30 text-accent-purple-dark';
      case 'teacher': return 'bg-accent-blue-light/30 text-accent-blue-dark';
      case 'student': return 'bg-success-light/30 text-success-dark';
      default: return 'bg-secondary-light text-text-secondary';
    }
  };

  const getStatusBadgeColor = (status: string = 'active') => {
    switch (status.toLowerCase()) { // Normalize status
      case 'active':
      case 'ativa':
        return 'bg-success-light/30 text-success-dark';
      case 'inactive':
      case 'inativa':
        return 'bg-error-light/30 text-error-dark';
      case 'suspended':
      case 'em manutenção': // Assuming 'Em Manutenção' for users might mean suspended
      case 'pendente':
        return 'bg-warning-light/30 text-warning-dark';
      default: return 'bg-secondary-light text-text-secondary';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-background-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-dark ring-2 ring-primary-light">
                  {(formData.name || user.name)?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'N/A'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{formData.name || user.name}</h2>
                  <p className="text-primary-light/80">{formData.email || user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(formData.role || user.role)}`}>
                      {((formData.role || user.role).charAt(0).toUpperCase() + (formData.role || user.role).slice(1))}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor((formData as any).status || (user as any).status || 'active')}`}>
                      {(((formData as any).status || (user as any).status || 'active').charAt(0).toUpperCase() + ((formData as any).status || (user as any).status || 'active').slice(1))}
                    </span>
                    {editMode && (
                      <span className="px-2 py-0.5 bg-primary-dark/70 rounded text-xs">
                        Modo Edição
                      </span>
                    )}
                  </div>
                </div>
              </div>
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

          {/* Tabs */}
          <div className="border-b border-border-DEFAULT bg-background-secondary">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'info', label: 'Informações Pessoais', icon: '👤' },
                { id: 'access', label: 'Acesso e Segurança', icon: '🔐' },
                { id: 'academic', label: 'Dados Acadêmicos', icon: '🎓' },
                { id: 'activity', label: 'Atividades', icon: '📊' },
                { id: 'permissions', label: 'Permissões', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-DEFAULT text-primary-DEFAULT bg-background-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-light'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Informações Pessoais</h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.name || user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.email || user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.telefone || user.telefone || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Função</label>
                    {editMode ? (
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="admin">Administrador</option>
                        <option value="manager">Gerente</option>
                        <option value="teacher">Professor</option>
                        <option value="student">Aluno</option>
                        <option value="system_admin">Admin. Sistema</option>
                        <option value="institution_manager">Gestor Institucional</option>
                        <option value="academic_coordinator">Coord. Acadêmico</option>
                        <option value="guardian">Responsável</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{(formData.role || user.role).charAt(0).toUpperCase() + (formData.role || user.role).slice(1)}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Endereço</label>
                    {editMode ? (
                      <textarea
                        name="endereco"
                        value={formData.endereco || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.endereco || user.endereco || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Acesso e Segurança</h3>
                <div className="bg-background-secondary rounded-lg p-6">
                  <h4 className="font-medium text-text-primary mb-4">Informações de Acesso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Último acesso</p>
                      <p className="font-medium text-text-primary">Hoje, 14:32</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">IP do último acesso</p>
                      <p className="font-medium text-text-primary">192.168.1.100</p>
                    </div>
                  </div>
                </div>

                <div className="bg-info-light/20 rounded-lg p-6">
                  <h4 className="font-medium text-info-dark mb-4">Segurança da Conta</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">Autenticação de dois fatores</p>
                        <p className="text-sm text-text-secondary">Adicione uma camada extra de segurança</p>
                      </div>
                      <button className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark text-sm">
                        Ativar
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border-light">
                      <div>
                        <p className="font-medium text-text-primary">Alterar senha</p>
                        <p className="text-sm text-text-secondary">Última alteração há 3 meses</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="px-4 py-2 bg-secondary-dark text-white rounded-lg hover:bg-secondary-DEFAULT text-sm"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                </div>

                {showPasswordChange && (
                  <div className="bg-background-primary border border-border-DEFAULT rounded-lg p-6">
                    <h4 className="font-medium text-text-primary mb-4">Alterar Senha</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Senha Atual</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Nova Senha</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowPasswordChange(false)}
                          className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handlePasswordSubmit}
                          className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                        >
                          Salvar Nova Senha
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                 <div className="bg-warning-light/20 rounded-lg p-6">
                  <h4 className="font-medium text-warning-dark mb-4">Sessões Ativas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background-primary rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-text-primary">Windows - Chrome</p>
                          <p className="text-sm text-text-secondary">São Paulo, Brasil • Agora</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-success-light/30 text-success-dark rounded text-xs font-medium">Atual</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background-primary rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-text-primary">iPhone - Safari</p>
                          <p className="text-sm text-text-secondary">Rio de Janeiro, Brasil • 2 horas atrás</p>
                        </div>
                      </div>
                      <button className="text-error-DEFAULT hover:text-error-dark text-sm font-medium">Encerrar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Dados Acadêmicos</h3>
                {user.role === 'student' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-primary-DEFAULT mb-2">8.5</div>
                        <div className="text-sm text-text-secondary">Média Geral</div>
                      </div>
                      <div className="bg-success-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-success-DEFAULT mb-2">92%</div>
                        <div className="text-sm text-text-secondary">Frequência</div>
                      </div>
                      <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">5</div>
                        <div className="text-sm text-text-secondary">Cursos Ativos</div>
                      </div>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-6">
                      <h4 className="font-medium text-text-primary mb-4">Cursos Matriculados</h4>
                      {/* Replace with actual data mapping */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background-primary rounded-lg shadow-sm">
                          <div>
                            <p className="font-medium text-text-primary">Matemática Avançada</p>
                            <p className="text-sm text-text-secondary">Prof. João Silva</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-primary-DEFAULT">8.7</p>
                            <p className="text-sm text-text-secondary">Média</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : user.role === 'teacher' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-primary-DEFAULT mb-2">12</div>
                        <div className="text-sm text-text-secondary">Turmas Ativas</div>
                      </div>
                      <div className="bg-success-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-success-DEFAULT mb-2">287</div>
                        <div className="text-sm text-text-secondary">Alunos Total</div>
                      </div>
                      <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">4.8</div>
                        <div className="text-sm text-text-secondary">Avaliação Média</div>
                      </div>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-6">
                      <h4 className="font-medium text-text-primary mb-4">Disciplinas Lecionadas</h4>
                      {/* Replace with actual data mapping */}
                       <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background-primary rounded-lg shadow-sm">
                          <div>
                            <p className="font-medium text-text-primary">Algoritmos e Estruturas de Dados</p>
                            <p className="text-sm text-text-secondary">3º Período • 45 alunos</p>
                          </div>
                          <span className="px-2 py-1 bg-success-light/30 text-success-dark rounded text-xs font-medium">Em andamento</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-text-tertiary">
                    Dados acadêmicos não aplicáveis para este tipo de usuário.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico de Atividades</h3>
                <div className="bg-background-secondary rounded-lg p-6">
                  <h4 className="font-medium text-text-primary mb-4">Atividades Recentes</h4>
                  <div className="space-y-4">
                    {[
                      { action: 'Login realizado', time: 'Há 2 horas', icon: '🔑', color: 'accent-blue' },
                      { action: 'Perfil atualizado', time: 'Ontem, 15:30', icon: '✏️', color: 'success' },
                      { action: 'Senha alterada', time: '3 dias atrás', icon: '🔐', color: 'warning' },
                      { action: 'Documento enviado', time: '1 semana atrás', icon: '📄', color: 'accent-purple' },
                      { action: 'Curso concluído', time: '2 semanas atrás', icon: '🎓', color: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-background-primary rounded-lg shadow-sm">
                        <div className={`w-10 h-10 bg-${activity.color}-light/20 rounded-full flex items-center justify-center text-xl text-${activity.color}-DEFAULT`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{activity.action}</p>
                          <p className="text-sm text-text-secondary">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Permissões e Acessos</h3>
                <div className="bg-warning-light/20 border border-warning-DEFAULT/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-warning-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-warning-text">
                      Alterações nas permissões podem afetar o acesso do usuário ao sistema.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background-secondary rounded-lg p-6">
                    <h4 className="font-medium text-text-primary mb-4">Módulos do Sistema</h4>
                    <div className="space-y-3">
                      {[
                        { module: 'Dashboard', access: true },
                        { module: 'Cursos', access: true },
                        { module: 'Usuários', access: user.role === 'admin' || user.role === 'system_admin' },
                        { module: 'Relatórios', access: ['admin', 'manager', 'system_admin', 'institution_manager'].includes(user.role) },
                        { module: 'Configurações', access: user.role === 'admin' || user.role === 'system_admin' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-primary rounded-lg shadow-sm">
                          <span className="font-medium text-text-primary">{item.module}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.access}
                              disabled={!editMode || !(user.role === 'admin' || user.role === 'system_admin')} // Only admins can change
                              onChange={() => { /* Handle permission change */ }}
                            />
                            <div className="w-11 h-6 bg-secondary-light peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-DEFAULT after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-DEFAULT"></div>
                          </label>
                        </div>
                      ))}
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
                  Cadastrado em: {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
                {!editMode && activeTab === 'info' && user.role !== 'admin' && user.role !== 'system_admin' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-error-DEFAULT hover:text-error-dark"
                  >
                    Excluir Usuário
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-secondary-light text-text-primary rounded-lg hover:bg-secondary-DEFAULT/80 transition-colors"
                >
                  Fechar
                </button>
                {activeTab === 'info' && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Editar Informações
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-background-primary rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Confirmar Exclusão</h3>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-error-DEFAULT text-white rounded-lg hover:bg-error-dark"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}