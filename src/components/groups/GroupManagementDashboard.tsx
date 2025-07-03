'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Shield, Activity, ChevronRight, Plus } from 'lucide-react';
import { UserGroup, GroupStats } from '@/types/groups';

interface GroupManagementDashboardProps {
  stats: GroupStats | null;
  groups: UserGroup[];
  loading: boolean;
  onCreateGroup: () => void;
  onViewGroup: (group: UserGroup) => void;
}

export const GroupManagementDashboard: React.FC<GroupManagementDashboardProps> = ({
  stats,
  groups,
  loading,
  onCreateGroup,
  onViewGroup
}) => {
  const recentGroups = groups.slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Grupos</p>
              <p className="text-3xl font-bold">{stats?.total_groups || 0}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{stats?.active_groups || 0} ativos</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total de Membros</p>
              <p className="text-3xl font-bold">{stats?.total_members || 0}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-green-100 text-sm">
              <Activity className="w-4 h-4 mr-1" />
              <span>Distribuídos em grupos</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Permissões Configuradas</p>
              <p className="text-3xl font-bold">{stats?.permissions_count || 0}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-purple-100 text-sm">
              <Shield className="w-4 h-4 mr-1" />
              <span>Personalizações ativas</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Taxa de Adoção</p>
              <p className="text-3xl font-bold">
                {stats?.total_groups ? Math.round((stats.active_groups / stats.total_groups) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-orange-100 text-sm">
              <Activity className="w-4 h-4 mr-1" />
              <span>Grupos ativos</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateGroup}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Criar Novo Grupo</p>
                <p className="text-sm text-gray-600">Organize usuários em grupos</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Gerenciar Membros</p>
                <p className="text-sm text-gray-600">Adicionar/remover usuários</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Configurar Permissões</p>
                <p className="text-sm text-gray-600">Definir acessos granulares</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Recent Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Grupos Recentes</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentGroups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Nenhum grupo criado ainda</p>
            <button
              onClick={onCreateGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Criar primeiro grupo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => onViewGroup(group)}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color || '#3B82F6' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {group.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {group.member_count} membros • Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Distribution by Institution */}
      {stats && Object.keys(stats.by_institution).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Instituição</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_institution).map(([institutionId, count], index) => (
              <div key={institutionId} className="flex items-center justify-between">
                <span className="text-gray-700">Instituição {institutionId}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.total_groups) * 100}%` }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
