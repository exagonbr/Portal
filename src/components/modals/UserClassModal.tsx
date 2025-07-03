'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus, Users, GraduationCap } from 'lucide-react';
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
      console.log('Erro ao carregar dados:', error);
    }
  };

  const loadEnrolledUsers = async (classId: string) => {
    try {
      const response = await userClassService.getByClass(classId);
      setEnrolledUsers(response.data || []);
    } catch (error) {
      console.log('Erro ao carregar usuários matriculados:', error);
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
<<<<<<< HEAD
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
=======
    <div className="fixed inset-0 bg-sidebar-bg/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card-modern w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header moderno */}
        <div className="p-6 border-b border-border-light bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Gerenciar Usuários da Turma
                </h2>
                <p className="text-text-tertiary text-sm">
                  Matricule e gerencie usuários nas turmas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="button-icon hover:bg-error/10 hover:text-error group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
>>>>>>> master
        </div>

        {/* Error Alert modernizado */}
        {error && (
<<<<<<< HEAD
          <div className="mb-4 p-3 bg-error-light border border-error-dark text-error-text rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-1 mb-4 flex-shrink-0">
=======
          <div className="mx-6 mt-4 rounded-xl bg-error/10 border border-error/20 p-4 animate-slide-down">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-error/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.004-.833-.77-2.5 1.732-2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-error">Erro</h3>
                <p className="text-sm text-text-secondary mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs modernos */}
        <div className="flex border-b border-border-light bg-background-tertiary mx-6 mt-4 rounded-xl overflow-hidden">
>>>>>>> master
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'enroll'
<<<<<<< HEAD
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
=======
                ? 'bg-primary text-white shadow-lg'
                : 'text-text-secondary hover:text-primary hover:bg-background-hover'
>>>>>>> master
            }`}
            onClick={() => setActiveTab('enroll')}
          >
            <UserPlus className="w-4 h-4" />
            Matricular Usuário
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'manage'
<<<<<<< HEAD
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
=======
                ? 'bg-primary text-white shadow-lg'
                : 'text-text-secondary hover:text-primary hover:bg-background-hover'
>>>>>>> master
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <Users className="w-4 h-4" />
            Matriculados ({enrolledUsers.length})
          </button>
        </div>

<<<<<<< HEAD
        <div className="flex-1 overflow-hidden">
=======
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
>>>>>>> master
          {activeTab === 'enroll' ? (
            <form onSubmit={handleEnroll} className="space-y-6">
              {!classId && (
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Selecionar Turma
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => {
                      setFormData({ ...formData, class_id: e.target.value });
                      if (e.target.value) {
                        loadEnrolledUsers(e.target.value);
                      }
                    }}
<<<<<<< HEAD
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
=======
                    className="input-field-modern"
>>>>>>> master
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

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Buscar Usuário
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Digite o nome ou email do usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD
                    placeholder="Buscar por nome ou email..."
                    className="w-full pl-10 pr-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
=======
                    className="input-field-modern pl-10"
>>>>>>> master
                  />
                </div>
              </div>

<<<<<<< HEAD
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
=======
              {!userId && (
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Usuário Disponível
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="input-field-modern"
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
>>>>>>> master
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Função na Turma
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserClassRole })}
<<<<<<< HEAD
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
=======
                    className="input-field-modern"
>>>>>>> master
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
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Data de Matrícula
                  </label>
                  <input
                    type="date"
                    value={enrollmentDateStr}
                    onChange={(e) => setEnrollmentDateStr(e.target.value)}
<<<<<<< HEAD
                    className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-primary"
=======
                    className="input-field-modern"
>>>>>>> master
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border-light">
                <button
                  type="submit"
<<<<<<< HEAD
                  disabled={loading || !formData.user_id || !formData.class_id}
                  className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-dark disabled:opacity-50 flex items-center gap-2"
=======
                  disabled={loading}
                  className="button-primary flex-1 group"
>>>>>>> master
                >
                  {loading ? (
                    <div className="loading-spinner w-4 h-4 border-white/30 border-t-white mr-2"></div>
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  {loading ? 'Matriculando...' : 'Matricular Usuário'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="button-outline flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
<<<<<<< HEAD
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
=======
            <div className="space-y-6">
              {/* Header de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label">Total de Alunos</p>
                      <p className="stat-value text-primary">
                        {enrolledUsers.filter(u => u.role === 'STUDENT').length}
                      </p>
>>>>>>> master
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label">Professores</p>
                      <p className="stat-value text-secondary">
                        {enrolledUsers.filter(u => u.role === 'TEACHER').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label">Total Geral</p>
                      <p className="stat-value text-accent-green">{enrolledUsers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent-green" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de usuários matriculados */}
              <div className="space-y-4">
                {enrolledUsers.length > 0 ? (
                  enrolledUsers.map((userClass) => (
                    <div key={userClass.id} className="card hover-lift p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {userClass.user_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">
                              {userClass.user_name}
                            </h3>
                            <p className="text-sm text-text-tertiary">
                              {userClass.user_email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`badge ${
                                userClass.role === 'TEACHER' ? 'badge-primary' : 
                                userClass.role === 'STUDENT' ? 'badge-info' : 'badge-success'
                              }`}>
                                {USER_CLASS_ROLE_LABELS[userClass.role]}
                              </span>
                              <span className="text-xs text-text-muted">
                                Desde {new Date(userClass.enrollment_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnenroll(userClass.id)}
                          className="button-icon hover:bg-error/10 hover:text-error group"
                          title="Remover usuário"
                        >
                          <UserMinus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-background-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Nenhum usuário matriculado
                    </h3>
                    <p className="text-text-tertiary">
                      Use a aba "Matricular Usuário" para adicionar pessoas à turma.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD

        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-secondary bg-background-tertiary rounded-lg hover:bg-secondary-light"
          >
            Fechar
          </button>
        </div>
=======
>>>>>>> master
      </div>
    </div>
  );
}