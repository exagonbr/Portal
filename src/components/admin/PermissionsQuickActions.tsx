'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Key, Plus, Settings, Group, ChevronRight } from 'lucide-react';

interface PermissionsQuickActionsProps {
  activeTab: 'roles' | 'groups' | 'permissions';
  onTabChange: (tab: 'roles' | 'groups' | 'permissions') => void;
  onCreateRole: () => void;
  onCreateGroup: () => void;
  stats: {
    totalRoles: number;
    totalGroups: number;
    totalUsers: number;
    totalPermissions: number;
  };
}

export const PermissionsQuickActions: React.FC<PermissionsQuickActionsProps> = ({
  activeTab,
  onTabChange,
  onCreateRole,
  onCreateGroup,
  stats
}) => {
  const quickActions = [
    {
      id: 'create-role',
      title: 'Nova Função',
      description: 'Criar um novo papel no sistema',
      icon: Shield,
      color: 'purple',
      action: onCreateRole,
      available: activeTab === 'roles'
    },
    {
      id: 'create-group',
      title: 'Novo Grupo',
      description: 'Organizar usuários em grupos',
      icon: Users,
      color: 'green',
      action: onCreateGroup,
      available: activeTab === 'groups'
    },
    {
      id: 'manage-permissions',
      title: 'Configurar Permissões',
      description: 'Ajustar permissões contextuais',
      icon: Key,
      color: 'blue',
      action: () => onTabChange('permissions'),
      available: true
    },
    {
      id: 'view-matrix',
      title: 'Matriz de Permissões',
      description: 'Visualizar permissões granulares',
      icon: Settings,
      color: 'orange',
      action: () => {},
      available: activeTab === 'groups'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Group className="w-5 h-5 text-blue-600" />
            Ações Rápidas
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Acesso rápido às principais funcionalidades de permissões
          </p>
        </div>
        
        {/* Indicadores de estatísticas */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-purple-600">{stats.totalRoles}</div>
            <div className="text-gray-500">Funções</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{stats.totalGroups}</div>
            <div className="text-gray-500">Grupos</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-gray-500">Usuários</div>
          </div>
        </div>
      </div>

      {/* Grid de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions
          .filter(action => action.available)
          .map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.action}
              className={`p-4 border rounded-lg transition-all group ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${getIconColorClasses(action.color)}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-80 mt-1">{action.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
      </div>

      {/* Navegação entre abas */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Navegar para:</span>
          <div className="flex gap-2">
            {[
              { id: 'roles', label: 'Funções', icon: Shield },
              { id: 'groups', label: 'Grupos', icon: Users },
              { id: 'permissions', label: 'Permissões', icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
