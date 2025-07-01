'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus, Globe, Building, School, Save, RotateCcw, Search, Filter, ChevronDown } from 'lucide-react';
import { UserGroup, GroupPermission } from '@/types/groups';
import { RolePermissions, PERMISSION_GROUPS } from '@/types/roleManagement';
import { useGroupDetails } from '@/hooks/useGroupManagement';

interface PermissionMatrixModalProps {
  group: UserGroup;
  onClose: () => void;
}

interface PermissionState {
  [key: string]: {
    global: boolean | null;
    institutions: { [id: string]: boolean | null };
    schools: { [id: string]: boolean | null };
  };
}

export const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({
  group,
  onClose
}) => {
  const { permissions, loading, setPermission } = useGroupDetails(group.id);
  const [permissionState, setPermissionState] = useState<PermissionState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contextType, setContextType] = useState<'global' | 'institution' | 'school'>('global');
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(new Set<string>());

  // Mock data - em produção, buscar da API
  const institutions = [
    { id: '1', name: 'Universidade Federal' },
    { id: '2', name: 'Instituto Técnico' }
  ];

  const schools = [
    { id: '1', name: 'Campus Centro', institution_id: '1' },
    { id: '2', name: 'Campus Norte', institution_id: '1' },
    { id: '3', name: 'Unidade Principal', institution_id: '2' }
  ];

  useEffect(() => {
    // Inicializar estado das permissões
    const initialState: PermissionState = {};
    
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(permission => {
        initialState[permission.key] = {
          global: null,
          institutions: {},
          schools: {}
        };
      });
    });

    // Aplicar permissões existentes
    permissions.forEach(permission => {
      if (!initialState[permission.permission_key]) {
        initialState[permission.permission_key] = {
          global: null,
          institutions: {},
          schools: {}
        };
      }

      if (permission.context_type === 'global') {
        initialState[permission.permission_key].global = permission.allowed;
      } else if (permission.context_type === 'institution' && permission.context_id) {
        initialState[permission.permission_key].institutions[permission.context_id] = permission.allowed;
      } else if (permission.context_type === 'school' && permission.context_id) {
        initialState[permission.permission_key].schools[permission.context_id] = permission.allowed;
      }
    });

    setPermissionState(initialState);
  }, [permissions]);

  const handlePermissionChange = async (
    permissionKey: string,
    allowed: boolean | null,
    contextType: 'global' | 'institution' | 'school',
    contextId?: string
  ) => {
    const newState = { ...permissionState };
    
    if (contextType === 'global') {
      newState[permissionKey].global = allowed;
    } else if (contextType === 'institution' && contextId) {
      newState[permissionKey].institutions[contextId] = allowed;
    } else if (contextType === 'school' && contextId) {
      newState[permissionKey].schools[contextId] = allowed;
    }

    setPermissionState(newState);
    
    // Marcar como alteração pendente
    const changeKey = `${permissionKey}-${contextType}-${contextId || 'global'}`;
    setPendingChanges(prev => new Set([...prev, changeKey]));

    // Salvar automaticamente se não for null
    if (allowed !== null) {
      try {
        await setPermission(permissionKey, allowed, contextType, contextId);
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(changeKey);
          return newSet;
        });
      } catch (error) {
        console.log('Erro ao salvar permissão:', error);
      }
    }
  };

  const getPermissionIcon = (value: boolean | null) => {
    if (value === true) return <Check className="w-4 h-4 text-green-600" />;
    if (value === false) return <X className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPermissionColor = (value: boolean | null) => {
    if (value === true) return 'bg-green-100 border-green-300';
    if (value === false) return 'bg-red-100 border-red-300';
    return 'bg-gray-50 border-gray-300';
  };

  const filteredPermissionGroups = PERMISSION_GROUPS.filter(group => {
    if (selectedCategory && group.id !== selectedCategory) return false;
    if (searchTerm) {
      return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             group.permissions.some(p => 
               p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.description.toLowerCase().includes(searchTerm.toLowerCase())
             );
    }
    return true;
  });

  const resetPermissions = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as permissões?')) {
      const resetState: PermissionState = {};
      PERMISSION_GROUPS.forEach(group => {
        group.permissions.forEach(permission => {
          resetState[permission.key] = {
            global: null,
            institutions: {},
            schools: {}
          };
        });
      });
      setPermissionState(resetState);
      setPendingChanges(new Set());
    }
  };

  const renderPermissionCell = (permissionKey: string, contextType: 'global' | 'institution' | 'school', contextId?: string) => {
    const value = contextType === 'global' 
      ? permissionState[permissionKey]?.global
      : contextType === 'institution'
        ? permissionState[permissionKey]?.institutions[contextId!]
        : permissionState[permissionKey]?.schools[contextId!];

    const changeKey = `${permissionKey}-${contextType}-${contextId || 'global'}`;
    const isPending = pendingChanges.has(changeKey);

    return (
      <div className="relative">
        <button
          onClick={() => {
            const nextValue = value === null ? true : value === true ? false : null;
            handlePermissionChange(permissionKey, nextValue, contextType, contextId);
          }}
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            getPermissionColor(value)
          } ${isPending ? 'ring-2 ring-blue-300' : ''}`}
          title={`${value === true ? 'Permitido' : value === false ? 'Negado' : 'Não definido'}`}
        >
          {getPermissionIcon(value)}
        </button>
        {isPending && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  };

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
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Matriz de Permissões
                  </h2>
                  <p className="text-sm text-gray-600">
                    Grupo: {group.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar permissões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Todas as categorias</option>
                  {PERMISSION_GROUPS.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setContextType('global')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      contextType === 'global' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Global
                  </button>
                  <button
                    onClick={() => setContextType('institution')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      contextType === 'institution' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Instituições
                  </button>
                  <button
                    onClick={() => setContextType('school')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      contextType === 'school' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    Escolas
                  </button>
                </div>

                <button
                  onClick={resetPermissions}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando permissões...</p>
              </div>
            ) : (
              <div className="p-6">
                {contextType === 'global' && (
                  <div className="space-y-6">
                    {filteredPermissionGroups.map(group => (
                      <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        </div>
                        <div className="p-4">
                          <div className="grid gap-3">
                            {group.permissions.map(permission => (
                              <div key={permission.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-500 font-medium">GLOBAL</span>
                                  {renderPermissionCell(permission.key, 'global')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contextType === 'institution' && (
                  <div className="space-y-6">
                    {institutions.map(institution => (
                      <div key={institution.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-600" />
                            {institution.name}
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Permissão
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPermissionGroups.flatMap(group => 
                                group.permissions.map(permission => (
                                  <tr key={permission.key}>
                                    <td className="px-4 py-3">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {permission.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {permission.description}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {renderPermissionCell(permission.key, 'institution', institution.id)}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contextType === 'school' && (
                  <div className="space-y-6">
                    {schools.map(school => (
                      <div key={school.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <School className="w-4 h-4 text-green-600" />
                            {school.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {institutions.find(i => i.id === school.institution_id)?.name}
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Permissão
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPermissionGroups.flatMap(group => 
                                group.permissions.map(permission => (
                                  <tr key={permission.key}>
                                    <td className="px-4 py-3">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {permission.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {permission.description}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {renderPermissionCell(permission.key, 'school', school.id)}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span>Permitido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <span>Negado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded flex items-center justify-center">
                  <Minus className="w-3 h-3 text-gray-400" />
                </div>
                <span>Não definido</span>
              </div>
              {pendingChanges.size > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>{pendingChanges.size} alterações pendentes</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Concluído
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
