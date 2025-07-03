'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Settings, Edit, Plus, Trash2, Search, 
  UserCheck, Calendar, Shield, Building, School, Clock,
  Crown, User, Mail, Phone, MapPin
} from 'lucide-react';
import { UserGroup } from '@/types/groups';
import { useGroupDetails } from '@/hooks/useGroupManagement';

interface GroupDetailsModalProps {
  group: UserGroup;
  onClose: () => void;
  onEdit: () => void;
  onManagePermissions: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  onClose,
  onEdit,
  onManagePermissions
}) => {
  const { members, permissions, loading, addMember, removeMember } = useGroupDetails(group.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'permissions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  // Mock data - em produção, buscar da API
  const institutions = [
    { id: '1', name: 'Universidade Federal' },
    { id: '2', name: 'Instituto Técnico' },
    { id: '3', name: 'Colégio Municipal' }
  ];

  const schools = [
    { id: '1', name: 'Campus Centro', institution_id: '1' },
    { id: '2', name: 'Campus Norte', institution_id: '1' },
    { id: '3', name: 'Unidade Principal', institution_id: '2' },
    { id: '4', name: 'Anexo Sul', institution_id: '2' },
    { id: '5', name: 'Sede Central', institution_id: '3' }
  ];

  const filteredMembers = members.filter(member =>
    member.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveMember = async (memberId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${userName}" do grupo?`)) {
      await removeMember(memberId);
    }
  };

  const getInstitutionName = (id?: string) => {
    return institutions.find(i => i.id === id)?.name || 'Não especificada';
  };

  const getSchoolName = (id?: string) => {
    return schools.find(s => s.id === id)?.name || 'Não especificada';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-amber-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const contextKey = permission.context_type === 'global' 
      ? 'Global' 
      : permission.context_type === 'institution' 
        ? `Instituição: ${getInstitutionName(permission.context_id)}`
        : `Escola: ${getSchoolName(permission.context_id)}`;
    
    if (!acc[contextKey]) {
      acc[contextKey] = [];
    }
    acc[contextKey].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div 
            className="px-6 py-4 text-white relative"
            style={{ backgroundColor: group.color || '#3B82F6' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{group.name}</h2>
                  <p className="text-white text-opacity-90 mt-1">
                    {group.description || 'Nenhuma descrição fornecida'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-white text-opacity-80">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      <span>{group.member_count} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      group.is_active 
                        ? 'bg-green-500 bg-opacity-20 text-green-100' 
                        : 'bg-red-500 bg-opacity-20 text-red-100'
                    }`}>
                      {group.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  title="Editar grupo"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={onManagePermissions}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  title="Gerenciar permissões"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: Users },
                { id: 'members', label: 'Membros', icon: UserCheck },
                { id: 'permissions', label: 'Permissões', icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      Contexto
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Instituição:</span>
                        <p className="font-medium text-gray-900">
                          {group.institution_id ? getInstitutionName(group.institution_id) : 'Todas as instituições'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Escola:</span>
                        <p className="font-medium text-gray-900">
                          {group.school_id ? getSchoolName(group.school_id) : 'Todas as escolas'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Informações
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Criado em:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(group.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Última atualização:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(group.updated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total de Membros</p>
                        <p className="text-3xl font-bold text-blue-900">{members.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Permissões Configuradas</p>
                        <p className="text-3xl font-bold text-purple-900">{permissions.length}</p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Administradores</p>
                        <p className="text-3xl font-bold text-green-900">
                          {members.filter(m => m.role === 'admin').length}
                        </p>
                      </div>
                      <Crown className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar membros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Membro
                  </button>
                </div>

                {/* Members List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando membros...</p>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhum membro encontrado' : 'Este grupo ainda não tem membros'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{member.user?.name}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(member.role)}`}>
                                  {member.role === 'admin' ? 'Administrador' : 'Membro'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{member.user?.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Entrou em {new Date(member.joined_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <button
                              onClick={() => handleRemoveMember(member.user_id, member.user?.name || '')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover membro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Permissões Configuradas
                  </h3>
                  <button
                    onClick={onManagePermissions}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Gerenciar Permissões
                  </button>
                </div>

                {permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhuma permissão específica configurada</p>
                    <p className="text-sm text-gray-500">
                      Este grupo herda as permissões padrão do sistema
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([context, contextPermissions]) => (
                      <div key={context} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">{context}</h4>
                        </div>
                        <div className="p-4">
                          <div className="grid gap-3">
                            {contextPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {permission.permission_key}
                                  </span>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  permission.allowed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {permission.allowed ? 'Permitido' : 'Negado'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
