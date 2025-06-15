'use client'

import React, { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

interface RoleDisplayData {
  id: string;
  name: string;
  description: string;
  type: 'Sistema' | 'Customizado';
  status: 'Ativo' | 'Inativo';
  userCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
  color?: string;
  icon?: string;
}

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDisplayData | null;
}

export default function RoleEditModal({ isOpen, onClose, role }: RoleEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<RoleDisplayData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Categorias de permissões
  const permissionCategories = [
    {
      name: 'Usuários',
      permissions: [
        { id: 'users.view', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários' },
        { id: 'users.create', name: 'Criar Usuários', description: 'Permite criar novos usuários' },
        { id: 'users.edit', name: 'Editar Usuários', description: 'Permite editar dados de usuários' },
        { id: 'users.delete', name: 'Excluir Usuários', description: 'Permite excluir usuários' }
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
        { id: 'reports.export', name: 'Exportar Relatórios', description: 'Permite exportar relatórios' }
      ]
    },
    {
      name: 'Sistema',
      permissions: [
        { id: 'system.settings', name: 'Configurações do Sistema', description: 'Permite acessar configurações' },
        { id: 'system.backup', name: 'Backup do Sistema', description: 'Permite realizar backups' },
        { id: 'system.logs', name: 'Logs do Sistema', description: 'Permite visualizar logs' }
      ]
    }
  ];

  useEffect(() => {
    if (role) {
      setFormData(role);
      setActiveTab('info');
      setEditMode(false);
      // Inicializar permissões selecionadas
      const activePermissions = role.permissions.filter(p => p.active).map(p => p.id);
      setSelectedPermissions(activePermissions);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = () => {
    console.log('Salvando dados da função:', formData);
    console.log('Permissões selecionadas:', selectedPermissions);
    setEditMode(false);
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(role);
    setEditMode(false);
    // Resetar permissões
    const activePermissions = role.permissions.filter(p => p.active).map(p => p.id);
    setSelectedPermissions(activePermissions);
  };

  const handleDelete = () => {
    console.log('Deletando função:', role.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Função removida com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-success-DEFAULT text-white';
      case 'Inativo': return 'bg-error-DEFAULT text-white';
      default: return 'bg-secondary-DEFAULT text-white';
    }
  };

  const getRoleIcon = (roleName: string) => {
    const icons: { [key: string]: string } = {
      'Administrador': '👑',
      'Professor': '👨‍🏫',
      'Aluno': '👨‍🎓',
      'Coordenador': '👔',
      'Diretor': '🏛️',
      'Secretário': '📋',
      'Responsável': '👨‍👩‍👧'
    };
    return icons[roleName] || '👤';
  };

  return (
    <>
      <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getRoleIcon(formData.name || role.name)}</span>
                  <h2 className="text-2xl font-bold">{formData.name || role.name}</h2>
                  {editMode && (
                    <span className="px-2 py-1 bg-primary-dark/70 rounded text-xs">
                      Modo Edição
                    </span>
                  )}
                </div>
                <p className="text-primary-light/80 mb-3">{formData.description || role.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || role.status)}`}>
                    {formData.status || role.status}
                  </span>
                  <span className="px-3 py-1 bg-primary-light/30 rounded-full text-sm text-white">
                    {formData.type || role.type}
                  </span>
                  <span className="px-3 py-1 bg-primary-dark/50 rounded-full text-sm text-white">
                    {role.userCount} usuários
                  </span>
                </div>
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

          {/* Tabs */}
          <div className="border-b border-border-DEFAULT bg-background-secondary">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'info', label: 'Informações Gerais', icon: '📋' },
                { id: 'permissions', label: 'Permissões', icon: '🔐' },
                { id: 'users', label: 'Usuários', icon: '👥' },
                { id: 'history', label: 'Histórico', icon: '📊' }
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
                  <h3 className="text-lg font-semibold text-text-primary">Informações da Função</h3>
                  {role.type !== 'Sistema' && (
                    !editMode ? (
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
                    )
                  )}
                </div>

                {role.type === 'Sistema' && (
                  <div className="bg-info-light/20 rounded-lg p-4 mb-6">
                    <p className="text-info-dark text-sm">
                      <strong>Informação:</strong> Esta é uma função do sistema e não pode ser editada.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Função</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.name || role.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    {editMode ? (
                      <select
                        name="status"
                        value={formData.status || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.status || role.status}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                    {editMode ? (
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.description || role.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
                    <p className="text-text-primary py-2">{role.type}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Usuários com esta função</label>
                    <p className="text-text-primary py-2">{role.userCount}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Criado em</label>
                    <p className="text-text-primary py-2">{new Date(role.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Última atualização</label>
                    <p className="text-text-primary py-2">
                      {role.updatedAt ? new Date(role.updatedAt).toLocaleDateString('pt-BR') : 'Nunca atualizado'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Estatísticas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Total de Permissões</p>
                      <p className="font-medium text-text-primary">{role.permissions.length}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Permissões Ativas</p>
                      <p className="font-medium text-text-primary">{role.permissions.filter(p => p.active).length}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Usuários Ativos</p>
                      <p className="font-medium text-text-primary">{Math.round(role.userCount * 0.85)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Último Acesso</p>
                      <p className="font-medium text-text-primary">Há 2 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Permissões da Função</h3>
                  {role.type !== 'Sistema' && (
                    !editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                      >
                        Editar Permissões
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
                          Salvar Permissões
                        </button>
                      </div>
                    )
                  )}
                </div>

                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.name} className="bg-background-secondary rounded-lg p-4">
                      <h4 className="font-medium text-text-primary mb-3">{category.name}</h4>
                      <div className="space-y-2">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-background-primary rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-text-primary">{permission.name}</p>
                              <p className="text-sm text-text-secondary">{permission.description}</p>
                            </div>
                            <div className="ml-4">
                              {editMode ? (
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                    className="sr-only"
                                  />
                                  <div className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                                    selectedPermissions.includes(permission.id) ? 'bg-primary-DEFAULT' : 'bg-secondary-light'
                                  }`}>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                                      selectedPermissions.includes(permission.id) ? 'translate-x-4' : 'translate-x-0'
                                    }`}></div>
                                  </div>
                                </label>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  role.permissions.find(p => p.id === permission.id)?.active
                                    ? 'bg-success-light text-success-dark'
                                    : 'bg-error-light text-error-dark'
                                }`}>
                                  {role.permissions.find(p => p.id === permission.id)?.active ? 'Ativo' : 'Inativo'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Usuários com esta Função</h3>
                <div className="grid grid-cols-1 gap-3">
                  {/* Dados de exemplo */}
                  {[
                    { name: 'João Silva', email: 'joao@example.com', status: 'Ativo', lastLogin: '2 horas atrás' },
                    { name: 'Maria Santos', email: 'maria@example.com', status: 'Ativo', lastLogin: '1 dia atrás' },
                    { name: 'Pedro Costa', email: 'pedro@example.com', status: 'Inativo', lastLogin: '1 semana atrás' }
                  ].map((user, index) => (
                    <div key={index} className="bg-background-secondary rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-text-primary">{user.name}</p>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'Ativo' ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'
                          }`}>
                            {user.status}
                          </span>
                          <p className="text-xs text-text-secondary mt-1">{user.lastLogin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico da Função</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-DEFAULT -ml-px"></div>
                  <div className="space-y-6">
                    {[
                      { date: '2025', event: 'Permissão de relatórios adicionada', type: 'permission' },
                      { date: '2024', event: 'Usuários migrados do sistema antigo', type: 'migration' },
                      { date: '2023', event: 'Função criada no sistema', type: 'creation' },
                    ].map((item, index) => (
                      <div key={index} className="relative flex items-start pl-10">
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-background-primary flex items-center justify-center ${
                          item.type === 'creation' ? 'bg-primary-DEFAULT' :
                          item.type === 'permission' ? 'bg-success-DEFAULT' :
                          item.type === 'migration' ? 'bg-accent-purple-DEFAULT' :
                          'bg-secondary-DEFAULT'
                        } text-white`}>
                          <span className="text-sm">{item.type.substring(0,1).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-text-primary">{item.date}</p>
                          <p className="text-sm text-text-secondary mt-1">{item.event}</p>
                        </div>
                      </div>
                    ))}
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
                  Última atualização: {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {!editMode && activeTab === 'info' && role.type !== 'Sistema' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-error-DEFAULT hover:text-error-dark"
                  >
                    Excluir Função
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
                {activeTab === 'info' && !editMode && role.type !== 'Sistema' && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Editar Informações
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                    >
                      Cancelar Edição
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark"
                    >
                      Salvar Alterações
                    </button>
                  </>
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
              Tem certeza que deseja excluir a função &quot;{role.name}&quot;? Esta ação não pode ser desfeita.
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