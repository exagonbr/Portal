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
    <div className="fixed inset-0 bg-background-primary bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-primary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">Gestores da Escola</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light border border-error-dark text-error-text rounded">
            {error}
          </div>
        )}

        {!manager && (
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'assign'
                  ? 'text-accent-blue-light border-b-2 border-accent-blue-light'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('assign')}
            >
              Atribuir Gestor
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'manage'
                  ? 'text-accent-blue-light border-b-2 border-accent-blue-light'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('manage')}
            >
              Gestores da Escola ({managers.length})
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
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    required
                  >
                    <option value="">Selecione uma escola</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!manager && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Buscar Usuário</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome ou email..."
                      className="w-full pl-10 pr-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    />
                  </div>
                </div>
              )}

              {!manager && searchTerm && (
                <div className="mb-4 max-h-48 overflow-y-auto border border-border-DEFAULT rounded-lg">
                  {availableUsers.length === 0 ? (
                    <p className="p-4 text-center text-text-secondary">Nenhum usuário disponível encontrado</p>
                  ) : (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 hover:bg-background-tertiary cursor-pointer ${
                          formData.user_id === user.id ? 'bg-accent-blue-light' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, user_id: user.id })}
                      >
                        <p className="font-medium text-text-primary">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
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
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
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
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Término</label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
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
                  <span className="text-sm font-medium text-text-primary">Ativo</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-text-secondary bg-background-tertiary rounded-lg hover:bg-secondary-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (!manager && (!formData.user_id || !formData.school_id))}
                  className="px-4 py-2 bg-accent-blue-light text-text-primary rounded-lg hover:bg-accent-blue-dark disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Salvando...' : manager ? 'Atualizar' : 'Atribuir'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {managers.length === 0 ? (
                <p className="text-center text-text-secondary py-8">Nenhum gestor vinculado a esta escola</p>
              ) : (
                <div className="space-y-2">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        manager.is_active ? 'bg-background-tertiary' : 'bg-background-secondary opacity-75'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-text-primary">{manager.user_name || 'Usuário não encontrado'}</p>
                        <p className="text-sm text-text-secondary">
                          {manager.user_email} • {MANAGER_POSITION_LABELS[manager.position]}
                        </p>
                        <p className="text-xs text-text-tertiary">
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
                          className="px-3 py-1 bg-accent-blue-light text-text-primary rounded-lg hover:bg-accent-blue-dark"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemove(manager.id)}
                          className="px-3 py-1 bg-error-light text-error-text rounded-lg hover:bg-error-dark flex items-center gap-1"
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

        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-secondary bg-background-tertiary rounded-lg hover:bg-secondary-light"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}