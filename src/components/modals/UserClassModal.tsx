'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { UserClass, CreateUserClassData, UserClassRole, USER_CLASS_ROLE_LABELS, UserClassWithDetails } from '@/types/userClass';
import { userClassService } from '@/services/userClassService';
import { classService } from '@/services/classService';
import { userService } from '@/services/userService';
import { Class } from '@/types/class';
import { User } from '@/types/user';

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
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
      setClasses(classesResponse.data || []);
      setUsers(usersResponse.data || []);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Gerenciar Usuários da Turma
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

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'enroll'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('enroll')}
          >
            Matricular Usuário
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'manage'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Usuários Matriculados ({enrolledUsers.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              {searchTerm && (
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Função na Turma</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserClassRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={loading || !formData.user_id || !formData.class_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Matriculando...' : 'Matricular'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {enrolledUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum usuário matriculado nesta turma</p>
              ) : (
                <div className="space-y-2">
                  {enrolledUsers.map((userClass) => (
                    <div
                      key={userClass.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-300 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{userClass.user_name || 'Usuário não encontrado'}</p>
                        <p className="text-sm text-gray-500">
                          {userClass.user_email} • {USER_CLASS_ROLE_LABELS[userClass.role]}
                        </p>
                        <p className="text-xs text-gray-400">
                          Matriculado em: {new Date(userClass.enrollment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnenroll(userClass.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1"
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
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}