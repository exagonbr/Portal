'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { UserClass, CreateUserClassData, UserClassRole, USER_CLASS_ROLE_LABELS, UserClassWithDetails } from '@/types/userClass';
import { userClassService } from '@/services/userClassService';
import { classService } from '@/services/classService';
import { userService } from '@/services/userService';
import { ClassResponseDto, UserResponseDto } from '@/types/api';

interface UserClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId?: string;
  userId?: string;
}

export default function UserClassModal({ isOpen, onClose, onSuccess, classId, userId }: UserClassModalProps) {
  const [formData, setFormData] = useState<CreateUserClassData>({
    user_id: '',
    class_id: '',
    role: 'STUDENT' as UserClassRole,
    enrollment_date: new Date()
  });
  const [enrollmentDateStr, setEnrollmentDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<UserClassWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'enroll' | 'manage'>('enroll');

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (classId) {
        setFormData(prev => ({ ...prev, class_id: classId }));
        loadEnrolledUsers(classId);
      }
      if (userId) {
        setFormData(prev => ({ ...prev, user_id: userId }));
      }
    }
  }, [isOpen, classId, userId]);

  const loadData = async () => {
    try {
      const [classesResponse, usersResponse] = await Promise.all([
        classService.list({ limit: 100 }),
        userService.list({ limit: 100 })
      ]);
      setClasses(classesResponse.items || []);
      setUsers(usersResponse.items || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadEnrolledUsers = async (classId: string) => {
    try {
      const response = await userClassService.getByClass(classId);
      setEnrolledUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários matriculados:', error);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userClassService.create({
        ...formData,
        enrollment_date: new Date(enrollmentDateStr)
      });
      onSuccess();
      if (formData.class_id) {
        loadEnrolledUsers(formData.class_id);
      }
      // Limpar formulário
      setFormData({
        user_id: '',
        class_id: classId || '',
        role: 'STUDENT' as UserClassRole,
        enrollment_date: new Date()
      });
      setEnrollmentDateStr(new Date().toISOString().split('T')[0]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao matricular usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (userClassId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário da turma?')) {
      return;
    }

    try {
      await userClassService.delete(userClassId);
      if (formData.class_id) {
        loadEnrolledUsers(formData.class_id);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao remover usuário');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = filteredUsers.filter(user => 
    !enrolledUsers.some(enrolled => enrolled.user_id === user.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-primary bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">Gerenciar Usuários da Turma</h2>
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

        <div className="flex space-x-1 mb-4 flex-shrink-0">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'enroll'
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('enroll')}
          >
            Matricular Usuário
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'manage'
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Usuários Matriculados ({enrolledUsers.length})
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'enroll' ? (
            <form onSubmit={handleEnroll}>
              {!classId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Turma</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => {
                      setFormData({ ...formData, class_id: e.target.value });
                      if (e.target.value) {
                        loadEnrolledUsers(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              {searchTerm && (
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Função na Turma</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserClassRole })}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    required
                  >
                    {Object.entries(USER_CLASS_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Matrícula</label>
                  <input
                    type="date"
                    value={enrollmentDateStr}
                    onChange={(e) => setEnrollmentDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={loading || !formData.user_id || !formData.class_id}
                  className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-dark disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Matriculando...' : 'Matricular'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {enrolledUsers.length === 0 ? (
                <p className="text-center text-text-secondary py-8">Nenhum usuário matriculado nesta turma</p>
              ) : (
                <div className="space-y-2">
                  {enrolledUsers.map((userClass) => (
                    <div
                      key={userClass.id}
                      className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{userClass.user_name || 'Usuário não encontrado'}</p>
                        <p className="text-sm text-text-secondary">
                          {userClass.user_email} • {USER_CLASS_ROLE_LABELS[userClass.role]}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Matriculado em: {new Date(userClass.enrollment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnenroll(userClass.id)}
                        className="px-3 py-1 bg-error-light text-error rounded-lg hover:bg-error-dark flex items-center gap-1"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remover
                      </button>
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