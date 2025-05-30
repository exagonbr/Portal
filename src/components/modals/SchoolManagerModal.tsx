'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { SchoolManager, CreateSchoolManagerData, UpdateSchoolManagerData, ManagerPosition, MANAGER_POSITION_LABELS, SchoolManagerWithDetails } from '@/types/schoolManager';
import { schoolManagerService } from '@/services/schoolManagerService';
import { schoolService } from '@/services/schoolService';
import { userService } from '@/services/userService';
import { School } from '@/types/school';
import { UserResponseDto } from '@/types/api';

interface SchoolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId?: string;
  manager?: SchoolManager;
}

export default function SchoolManagerModal({ isOpen, onClose, onSuccess, schoolId, manager }: SchoolManagerModalProps) {
  const [formData, setFormData] = useState<CreateSchoolManagerData>({
    user_id: '',
    school_id: '',
    position: 'COORDINATOR' as ManagerPosition,
    start_date: new Date(),
    is_active: true
  });
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [managers, setManagers] = useState<SchoolManagerWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'assign' | 'manage'>('assign');

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (schoolId) {
        setFormData(prev => ({ ...prev, school_id: schoolId }));
        loadSchoolManagers(schoolId);
      }
      if (manager) {
        setFormData({
          user_id: manager.user_id,
          school_id: manager.school_id,
          position: manager.position,
          start_date: manager.start_date,
          end_date: manager.end_date,
          is_active: manager.is_active
        });
        setStartDateStr(new Date(manager.start_date).toISOString().split('T')[0]);
        setEndDateStr(manager.end_date ? new Date(manager.end_date).toISOString().split('T')[0] : '');
      }
    }
  }, [isOpen, schoolId, manager]);

  const loadData = async () => {
    try {
      const [schoolsResponse, usersResponse] = await Promise.all([
        schoolService.list({ limit: 100 }),
        userService.list({ limit: 100 })
      ]);
      setSchools(schoolsResponse.items || []);
      setUsers(usersResponse.items || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadSchoolManagers = async (schoolId: string) => {
    try {
      const response = await schoolManagerService.getBySchool(schoolId);
      setManagers(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar gestores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        start_date: new Date(startDateStr),
        end_date: endDateStr ? new Date(endDateStr) : undefined
      };

      if (manager) {
        await schoolManagerService.update(manager.id, dataToSubmit as UpdateSchoolManagerData);
      } else {
        await schoolManagerService.create(dataToSubmit);
      }
      
      onSuccess();
      if (formData.school_id) {
        loadSchoolManagers(formData.school_id);
      }
      
      // Limpar formulário
      if (!manager) {
        setFormData({
          user_id: '',
          school_id: schoolId || '',
          position: 'COORDINATOR' as ManagerPosition,
          start_date: new Date(),
          is_active: true
        });
        setStartDateStr(new Date().toISOString().split('T')[0]);
        setEndDateStr('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar gestor');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (managerId: string) => {
    if (!confirm('Tem certeza que deseja remover este gestor?')) {
      return;
    }

    try {
      await schoolManagerService.delete(managerId);
      if (formData.school_id) {
        loadSchoolManagers(formData.school_id);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao remover gestor');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = filteredUsers.filter(user => 
    !managers.some(manager => manager.user_id === user.id && manager.is_active)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {manager ? 'Editar Gestor Escolar' : 'Gerenciar Gestores Escolares'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!manager && (
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'assign'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assign')}
            >
              Atribuir Gestor
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'manage'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('manage')}
            >
              Gestores Ativos ({managers.filter(m => m.is_active).length})
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {(activeTab === 'assign' || manager) ? (
            <form onSubmit={handleSubmit}>
              {!schoolId && !manager && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Escola</label>
                  <select
                    value={formData.school_id}
                    onChange={(e) => {
                      setFormData({ ...formData, school_id: e.target.value });
                      if (e.target.value) {
                        loadSchoolManagers(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                    required
                  >
                    <option value="">Selecione uma escola</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} - {school.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!manager && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Buscar Usuário</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome ou email..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}

              {!manager && searchTerm && (
                <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {availableUsers.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">Nenhum usuário disponível encontrado</p>
                  ) : (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-300 cursor-pointer ${
                          formData.user_id === user.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, user_id: user.id })}
                      >
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Cargo</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as ManagerPosition })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                  required
                >
                  {Object.entries(MANAGER_POSITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Término</label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Ativo</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (!manager && (!formData.user_id || !formData.school_id))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Salvando...' : manager ? 'Atualizar' : 'Atribuir'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {managers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum gestor atribuído a esta escola</p>
              ) : (
                <div className="space-y-2">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        manager.is_active ? 'bg-gray-50 dark:bg-gray-300' : 'bg-gray-100 dark:bg-gray-800 opacity-75'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{manager.user_name}</p>
                        <p className="text-sm text-gray-500">
                          {manager.user_email} • {MANAGER_POSITION_LABELS[manager.position]}
                        </p>
                        <p className="text-xs text-gray-400">
                          Desde: {new Date(manager.start_date).toLocaleDateString('pt-BR')}
                          {manager.end_date && ` até ${new Date(manager.end_date).toLocaleDateString('pt-BR')}`}
                          {!manager.is_active && ' (Inativo)'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('assign');
                            setFormData({
                              user_id: manager.user_id,
                              school_id: manager.school_id,
                              position: manager.position,
                              start_date: manager.start_date,
                              end_date: manager.end_date,
                              is_active: manager.is_active
                            });
                            setStartDateStr(new Date(manager.start_date).toISOString().split('T')[0]);
                            setEndDateStr(manager.end_date ? new Date(manager.end_date).toISOString().split('T')[0] : '');
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemove(manager.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1"
                        >
                          <UserMinus className="w-4 h-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}