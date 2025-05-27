'use client'

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';

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
    // TODO: Implement save logic
    console.log('Salvando dados do usuário:', formData);
    setEditMode(false);
    if (onUserUpdated && formData as User) {
      onUserUpdated(formData as User);
    }
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(user);
    setEditMode(false);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
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
    // TODO: Implement password change logic
    console.log('Alterando senha do usuário');
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Senha alterada com sucesso!');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-blue-100">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor('active')}`}>
                      Ativo
                    </span>
                    {editMode && (
                      <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                        Modo Edição
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
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
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.telefone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.telefone || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                    {editMode ? (
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="admin">Administrador</option>
                        <option value="manager">Gerente</option>
                        <option value="teacher">Professor</option>
                        <option value="student">Aluno</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.endereco || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.endereco || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Acesso e Segurança</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Informações de Acesso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Último acesso</p>
                      <p className="font-medium">Hoje, 14:32</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IP do último acesso</p>
                      <p className="font-medium">192.168.1.100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dispositivo</p>
                      <p className="font-medium">Chrome no Windows</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Localização</p>
                      <p className="font-medium">São Paulo, Brasil</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Segurança da Conta</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Autenticação de dois fatores</p>
                        <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Ativar
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-medium">Alterar senha</p>
                        <p className="text-sm text-gray-600">Última alteração há 3 meses</p>
                      </div>
                      <button 
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                </div>

                {showPasswordChange && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Alterar Senha</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowPasswordChange(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handlePasswordSubmit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Salvar Nova Senha
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Sessões Ativas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium">Windows - Chrome</p>
                          <p className="text-sm text-gray-600">São Paulo, Brasil • Agora</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Atual</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium">iPhone - Safari</p>
                          <p className="text-sm text-gray-600">Rio de Janeiro, Brasil • 2 horas atrás</p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm">Encerrar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Dados Acadêmicos</h3>
                
                {user.role === 'student' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">8.5</div>
                        <div className="text-sm text-gray-600">Média Geral</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                        <div className="text-sm text-gray-600">Frequência</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                        <div className="text-sm text-gray-600">Cursos Ativos</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-700 mb-4">Cursos Matriculados</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">Matemática Avançada</p>
                            <p className="text-sm text-gray-600">Prof. João Silva</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">8.7</p>
                            <p className="text-sm text-gray-600">Média</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">Física Quântica</p>
                            <p className="text-sm text-gray-600">Prof. Maria Santos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">9.2</p>
                            <p className="text-sm text-gray-600">Média</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : user.role === 'teacher' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                        <div className="text-sm text-gray-600">Turmas Ativas</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">287</div>
                        <div className="text-sm text-gray-600">Alunos Total</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                        <div className="text-sm text-gray-600">Avaliação Média</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-700 mb-4">Disciplinas Lecionadas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">Algoritmos e Estruturas de Dados</p>
                            <p className="text-sm text-gray-600">3º Período • 45 alunos</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Em andamento</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">Programação Web</p>
                            <p className="text-sm text-gray-600">5º Período • 38 alunos</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Em andamento</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Dados acadêmicos não aplicáveis para este tipo de usuário.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Histórico de Atividades</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Atividades Recentes</h4>
                  <div className="space-y-4">
                    {[
                      { action: 'Login realizado', time: 'Há 2 horas', icon: '🔑', color: 'blue' },
                      { action: 'Perfil atualizado', time: 'Ontem, 15:30', icon: '✏️', color: 'green' },
                      { action: 'Senha alterada', time: '3 dias atrás', icon: '🔐', color: 'yellow' },
                      { action: 'Documento enviado', time: '1 semana atrás', icon: '📄', color: 'purple' },
                      { action: 'Curso concluído', time: '2 semanas atrás', icon: '🎓', color: 'green' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                        <div className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center text-xl`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Estatísticas de Uso</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tempo médio de sessão</span>
                        <span className="font-medium">45 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Páginas visitadas/dia</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dispositivo mais usado</span>
                        <span className="font-medium">Desktop</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Engajamento</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mensagens enviadas</span>
                        <span className="font-medium">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Arquivos compartilhados</span>
                        <span className="font-medium">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Comentários</span>
                        <span className="font-medium">67</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Permissões e Acessos</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      Alterações nas permissões podem afetar o acesso do usuário ao sistema.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Módulos do Sistema</h4>
                    <div className="space-y-3">
                      {[
                        { module: 'Dashboard', access: true },
                        { module: 'Cursos', access: true },
                        { module: 'Usuários', access: user.role === 'admin' },
                        { module: 'Relatórios', access: ['admin', 'manager'].includes(user.role) },
                        { module: 'Configurações', access: user.role === 'admin' },
                        { module: 'Financeiro', access: ['admin', 'manager'].includes(user.role) }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="font-medium">{item.module}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={item.access}
                              disabled={!editMode}
                              onChange={() => {}}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-700 mb-4">Permissões Especiais</h4>
                    <div className="space-y-3">
                      {[
                        { permission: 'Criar novos usuários', allowed: user.role === 'admin' },
                        { permission: 'Editar configurações globais', allowed: user.role === 'admin' },
                        { permission: 'Acessar relatórios financeiros', allowed: ['admin', 'manager'].includes(user.role) },
                        { permission: 'Gerenciar cursos', allowed: ['admin', 'manager', 'teacher'].includes(user.role) },
                        { permission: 'Exportar dados', allowed: ['admin', 'manager'].includes(user.role) }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-sm">{item.permission}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.allowed ? 'Permitido' : 'Negado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  Cadastrado em: {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric'
                  })}
                </p>
                {!editMode && activeTab === 'info' && user.role !== 'admin' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Excluir Usuário
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
                {activeTab === 'info' && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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