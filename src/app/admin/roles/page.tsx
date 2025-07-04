'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Key,
  Settings,
  Group
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ToastManager';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { mockRoleService as roleService } from '@/mocks/api';
import { RoleResponseDto, RoleCreateDto, RoleUpdateDto } from '@/types/api';

// Importar componentes do sistema de grupos
import { GroupManagementDashboard } from '@/components/groups/GroupManagementDashboard';
import { GroupCreateModal } from '@/components/groups/GroupCreateModal';
import { GroupEditModal } from '@/components/groups/GroupEditModal';
import { GroupDetailsModal } from '@/components/groups/GroupDetailsModal';
import { PermissionMatrixModal } from '@/components/groups/PermissionMatrixModal';
import { PermissionsQuickActions } from '@/components/admin/PermissionsQuickActions';
import { useGroupManagement, useGroupStats } from '@/hooks/useGroupManagement';
import { UserGroup, GroupFilter } from '@/types/groups';

// Interface para permissões
interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

export default function RolesPermissionsPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'roles' | 'groups' | 'permissions'>('roles');
  
  // Estados para Roles (aba existente)
  const [roles, setRoles] = useState<RoleResponseDto[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<RoleCreateDto>({
    name: '',
    description: '',
    active: true
  });

  // Estados para Grupos (nova aba)
  const [groupFilters, setGroupFilters] = useState<GroupFilter>({});
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [groupModalType, setGroupModalType] = useState<'edit' | 'details' | 'permissions' | null>(null);
  
  // Hooks para grupos
  const { groups, loading: groupsLoading, error: groupsError, fetchGroups, createGroup, updateGroup, deleteGroup } = useGroupManagement(groupFilters);
  const { stats: groupStats, loading: statsLoading } = useGroupStats();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando roles e permissões...');

      // Carregar roles usando o serviço real
      const rolesResponse = await roleService.getRoles({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      setRoles(rolesResponse.items);
      console.log(`✅ ${rolesResponse.items.length} roles carregadas`);

      // Para permissões, usar dados simulados até a API estar pronta
      const mockPermissions: Permission[] = [
        { id: '1', name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create' },
        { id: '2', name: 'users.read', description: 'Visualizar usuários', module: 'users', action: 'read' },
        { id: '3', name: 'users.update', description: 'Editar usuários', module: 'users', action: 'update' },
        { id: '4', name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete' },
        { id: '5', name: 'courses.create', description: 'Criar cursos', module: 'courses', action: 'create' },
        { id: '6', name: 'courses.read', description: 'Visualizar cursos', module: 'courses', action: 'read' },
        { id: '7', name: 'courses.update', description: 'Editar cursos', module: 'courses', action: 'update' },
        { id: '8', name: 'courses.delete', description: 'Excluir cursos', module: 'courses', action: 'delete' },
        { id: '9', name: 'institutions.create', description: 'Criar instituições', module: 'institutions', action: 'create' },
        { id: '10', name: 'institutions.read', description: 'Visualizar instituições', module: 'institutions', action: 'read' },
        { id: '11', name: 'institutions.update', description: 'Editar instituições', module: 'institutions', action: 'update' },
        { id: '12', name: 'institutions.delete', description: 'Excluir instituições', module: 'institutions', action: 'delete' }
      ];
      
      setPermissions(mockPermissions);
      console.log(`✅ ${mockPermissions.length} permissões carregadas`);
      
    } catch (error) {
      console.log('❌ Erro ao carregar dados:', error);
      showError('Erro ao carregar roles e permissões');
      
      setRoles([]); // Limpa as roles em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Nome da função é obrigatório');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingRole) {
        const updateData: RoleUpdateDto = {
          name: formData.name,
          description: formData.description,
          active: formData.active
        };
        await roleService.updateRole(editingRole.id.toString(), updateData);
        showSuccess('Função atualizada com sucesso!');
      } else {
        await roleService.createRole(formData);
        showSuccess('Função criada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      console.log('Erro ao salvar função:', error);
      showError(error.message || 'Erro ao salvar função. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role: RoleResponseDto) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      active: role.active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (role: RoleResponseDto) => {
    try {
      await roleService.toggleRoleStatus(role.id.toString(), !role.active);
      showSuccess(role.active ? 'Função desativada' : 'Função ativada');
      await loadData();
    } catch (error: any) {
      console.log('Erro ao alterar status:', error);
      showError(error.message || 'Erro ao alterar status da função');
    }
  };

  const handleDelete = async (role: RoleResponseDto) => {
    if (!confirm('Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await roleService.deleteRole(role.id.toString());
      showSuccess('Função excluída com sucesso!');
      await loadData();
    } catch (error: any) {
      console.log('Erro ao excluir função:', error);
      showError(error.message || 'Erro ao excluir função');
    }
  };

  const resetForm = () => {
    setEditingRole(null);
    setSubmitting(false);
    setFormData({
      name: '',
      description: '',
      active: true
    });
  };

  // Handlers para Grupos
  const handleCreateGroup = async (groupData: any) => {
    const result = await createGroup(groupData);
    if (result) {
      setShowCreateGroupModal(false);
      showSuccess('Grupo criado com sucesso!');
    }
  };

  const handleEditGroup = async (groupData: any) => {
    if (!selectedGroup) return;
    
    const result = await updateGroup(selectedGroup.id, groupData);
    if (result) {
      setGroupModalType(null);
      setSelectedGroup(null);
      showSuccess('Grupo atualizado com sucesso!');
    }
  };

  const handleDeleteGroup = async (group: UserGroup) => {
    if (window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) {
      const success = await deleteGroup(group.id);
      if (success) {
        showSuccess('Grupo excluído com sucesso!');
      }
    }
  };

  const handleCloneGroup = async (group: UserGroup) => {
    const newName = prompt(`Nome para o novo grupo (cópia de "${group.name}")`);
    if (newName) {
      await createGroup({
        name: newName,
        description: `Cópia de: ${group.description || group.name}`,
        color: group.color,
        institution_id: group.institution_id,
        school_id: group.school_id
      });
    }
  };

  const openGroupModal = (type: 'edit' | 'details' | 'permissions', group: UserGroup) => {
    setSelectedGroup(group);
    setGroupModalType(type);
  };

  const closeGroupModal = () => {
    setGroupModalType(null);
    setSelectedGroup(null);
  };

  // Filtrar roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? role.active : !role.active);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AuthenticatedLayout>
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Gerenciar Permissões
                </h1>
                <p className="text-slate-600 mt-1">
                  Sistema completo de gerenciamento de permissões
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Funções & Roles
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Grupos
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="w-4 h-4" />
                Permissões Contextuais
              </button>
            </div>
          </div>

          {/* Ações Rápidas */}
          <PermissionsQuickActions
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCreateRole={() => setShowModal(true)}
            onCreateGroup={() => setShowCreateGroupModal(true)}
            stats={{
              totalRoles: roles.length,
              totalGroups: groups.length,
              totalUsers: roles.reduce((acc, r) => acc + (r.users_count || 0), 0),
              totalPermissions: permissions.length
            }}
          />

          {/* Conteúdo das Abas */}
          {activeTab === 'roles' && (
            <>
              {/* Header da Aba Roles */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Funções</h2>
                  <p className="text-gray-600">Total: {roles.length} funções</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Função
                </button>
              </div>

              {/* Filtros */}
              <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-800">Filtros de Funções</h2>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Busca */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <Search className="h-4 w-4 text-purple-500" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome da função..."
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
              </div>

              {/* Filtro por Módulo */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <Settings className="h-4 w-4 text-purple-500" />
                  Módulo
                </label>
                <select className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all">
                  <option value="all">Todos os módulos</option>
                  <option value="users">Usuários</option>
                  <option value="courses">Cursos</option>
                  <option value="institutions">Instituições</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card Total de Funções */}
            <div className="stat-card stat-card-purple">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <Shield className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{roles.length}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">FUNÇÕES</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Funções</h3>
                  <p className="stat-card-subtitle">Registradas no sistema</p>
                </div>
              </div>
            </div>

            {/* Card Funções Ativas */}
            <div className="stat-card stat-card-green">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <CheckCircle className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{roles.filter(r => r.active).length}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">ATIVAS</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Funções Ativas</h3>
                  <p className="stat-card-subtitle">Em uso no sistema</p>
                </div>
              </div>
            </div>

            {/* Card Total de Usuários */}
            <div className="stat-card stat-card-blue">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <Users className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{roles.reduce((acc, r) => acc + (r.users_count || 0), 0)}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">USUÁRIOS</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Usuários</h3>
                  <p className="stat-card-subtitle">Com funções atribuídas</p>
                </div>
              </div>
            </div>

            {/* Card Total de Permissões */}
            <div className="stat-card stat-card-amber">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <Key className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{permissions.length}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">PERMISSÕES</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Permissões</h3>
                  <p className="stat-card-subtitle">Disponíveis no sistema</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Funções */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="text-lg text-slate-600">Carregando funções...</span>
                </div>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Shield className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-xl font-bold text-slate-800">Nenhuma função encontrada</h3>
                <p className="mt-2 text-base text-slate-600 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all'
                    ? "Tente ajustar seus filtros de busca para ver mais resultados."
                    : "Não há funções cadastradas ainda."}
                </p>
              </div>
            ) : (
              <>
                {/* Tabela de funções */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Usuários
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Permissões
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredRoles.map((role) => (
                        <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex-shrink-0">
                                <Shield className="h-8 w-8 text-purple-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 truncate">{role.name}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {role.description || 'Sem descrição'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-slate-700">{role.users_count || 0} usuários</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <Key className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-slate-700">
                                  {Math.floor(Math.random() * 10) + 1} permissões
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(role)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                                role.active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={`Clique para ${role.active ? 'desativar' : 'ativar'}`}
                            >
                              <div className={`h-2 w-2 rounded-full ${role.active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                              {role.active ? "Ativa" : "Inativa"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(role)}
                                className="p-1 rounded hover:bg-slate-100 transition-colors text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                title="Editar função"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(role)}
                                className="p-1 rounded hover:bg-slate-100 transition-colors text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Excluir função"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
            </>
          )}

          {/* Aba de Grupos */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              {/* Header da Aba Grupos */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Grupos</h2>
                  <p className="text-gray-600">Organize usuários e configure permissões granulares</p>
                </div>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Grupo
                </button>
              </div>

              {/* Dashboard de Grupos */}
              <GroupManagementDashboard
                stats={groupStats}
                groups={groups}
                loading={groupsLoading}
                onCreateGroup={() => setShowCreateGroupModal(true)}
                onViewGroup={(group) => openGroupModal('details', group)}
              />

              {/* Lista de Grupos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar grupos..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Todos os status</option>
                        <option value="true">Apenas ativos</option>
                        <option value="false">Apenas inativos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {groupsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando grupos...</p>
                  </div>
                ) : groupsError ? (
                  <div className="p-8 text-center">
                    <p className="text-red-600 mb-4">{groupsError}</p>
                    <button
                      onClick={fetchGroups}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhum grupo encontrado</p>
                    <button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Criar primeiro grupo
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grupo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Membros
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Criado em
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groups.map((group) => (
                          <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {group.color && (
                                  <div
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: group.color }}
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {group.name}
                                  </div>
                                  {group.description && (
                                    <div className="text-sm text-gray-500">
                                      {group.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{group.member_count}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                group.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {group.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(group.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openGroupModal('details', group)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Ver detalhes"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openGroupModal('edit', group)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openGroupModal('permissions', group)}
                                  className="text-purple-600 hover:text-purple-900 p-1"
                                  title="Gerenciar permissões"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba de Permissões Contextuais */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Permissões Contextuais
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Configure permissões específicas por usuário, instituição ou escola. 
                  Esta funcionalidade permite ajustes granulares além das permissões de grupo.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Como usar:</h4>
                  </div>
                  <ul className="text-left text-blue-800 space-y-2">
                    <li>• Vá para "Grupos" para configurar permissões de grupo</li>
                    <li>• Use a "Matriz de Permissões" para ajustes granulares</li>
                    <li>• Configure contextos específicos por instituição/escola</li>
                    <li>• Gerencie membros dos grupos através dos detalhes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Criação/Edição de Roles */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingRole ? 'Editar Função' : 'Nova Função'}
                        </h3>
                        <p className="text-purple-100 text-sm">
                          {editingRole ? 'Atualize as informações da função' : 'Cadastre uma nova função no sistema'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Informações da Função
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome da Função *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-colors"
                            placeholder="Ex: Administrador do Sistema"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Descrição
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-colors resize-none"
                            placeholder="Descrição opcional da função..."
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="active" className="text-sm font-medium text-slate-700">
                            Função ativa
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editingRole ? 'Atualizando...' : 'Criando...'}
                          </>
                        ) : (
                          <>
                            {editingRole ? 'Atualizar Função' : 'Criar Função'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {/* Modals de Grupos */}
          {showCreateGroupModal && (
            <GroupCreateModal
              onClose={() => setShowCreateGroupModal(false)}
              onSubmit={handleCreateGroup}
            />
          )}

          {groupModalType === 'edit' && selectedGroup && (
            <GroupEditModal
              group={selectedGroup}
              onClose={closeGroupModal}
              onSubmit={handleEditGroup}
            />
          )}

          {groupModalType === 'details' && selectedGroup && (
            <GroupDetailsModal
              group={selectedGroup}
              onClose={closeGroupModal}
              onEdit={() => setGroupModalType('edit')}
              onManagePermissions={() => setGroupModalType('permissions')}
            />
          )}

          {groupModalType === 'permissions' && selectedGroup && (
            <PermissionMatrixModal
              group={selectedGroup}
              onClose={closeGroupModal}
            />
          )}
        </div>
      </ProtectedRoute>
    </AuthenticatedLayout>
  );
}
