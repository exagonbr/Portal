'use client';

import React, { useState, useEffect } from 'react';
import { 
  School as SchoolIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { schoolService, School, CreateSchoolData, UpdateSchoolData } from '@/services/schoolService';
import { institutionService } from '@/services/institutionService';
import { InstitutionResponseDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Sistema de notificações melhorado
const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    // Aqui você pode integrar com uma biblioteca de toast como react-hot-toast ou criar um sistema customizado
    if (typeof window !== 'undefined') {
      // Criar notificação visual temporária
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>${message}</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    }
  },
  error: (message: string) => {
    console.error('❌ Error:', message);
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>${message}</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);
    }
  }
};

// Constantes para tipos de escola
const SCHOOL_TYPES = [
  { value: 'elementary', label: 'Fundamental I', description: 'Anos iniciais do ensino fundamental (1º ao 5º ano)' },
  { value: 'middle', label: 'Fundamental II', description: 'Anos finais do ensino fundamental (6º ao 9º ano)' },
  { value: 'high', label: 'Ensino Médio', description: 'Ensino médio regular (1º ao 3º ano)' },
  { value: 'technical', label: 'Técnico', description: 'Ensino técnico e profissionalizante' }
] as const;

type SchoolType = typeof SCHOOL_TYPES[number]['value'];

interface SchoolUnit extends School {
  principal?: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  type: SchoolType;
  status: 'active' | 'inactive';
  institutionName?: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

interface ExtendedCreateSchoolData extends CreateSchoolData {
  type?: SchoolType;
}

interface ExtendedUpdateSchoolData extends UpdateSchoolData {
  type?: SchoolType;
}

export default function SystemAdminSchoolsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [schools, setSchools] = useState<SchoolUnit[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolUnit | null>(null);
  const [formData, setFormData] = useState<ExtendedCreateSchoolData>({
    name: '',
    code: '',
    description: '',
    institution_id: '',
    type: 'elementary',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    is_active: true
  });
  const [filterType, setFilterType] = useState<'all' | SchoolType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (!loadingInstitutions) {
      loadData();
    }
  }, [selectedInstitution, loadingInstitutions]);

  const loadInstitutions = async () => {
    try {
      setLoadingInstitutions(true);
      console.log('🔄 Carregando instituições...');
      
      const institutionsResponse = await institutionService.getAll();
      console.log('📊 Instituições carregadas:', institutionsResponse);
      
      setInstitutions(institutionsResponse.data || []);
      
      if (!institutionsResponse.data || institutionsResponse.data.length === 0) {
        toast.error('Nenhuma instituição encontrada. Verifique a conexão.');
      } else {
        console.log(`✅ ${institutionsResponse.data.length} instituições carregadas com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instituições:', error);
      toast.error('Erro ao carregar instituições. Verifique sua conexão.');
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar todas as escolas (SYSTEM_ADMIN vê todas)
      const filters = {
        institution_id: selectedInstitution !== 'all' ? selectedInstitution : undefined,
        limit: 100
      };
      
      const response = await schoolService.list(filters);
      
      // Converter escolas para o formato esperado pelo frontend
      const schoolsData = response.items.map(school => {
        const institution = institutions.find(inst => inst.id === school.institution_id);
        
        return {
          ...school,
          principal: 'Diretor', // Valor padrão
          studentsCount: school.studentsCount || Math.floor(Math.random() * 500),
          teachersCount: school.teachersCount || Math.floor(Math.random() * 50),
          classesCount: school.classesCount || Math.floor(Math.random() * 30),
          type: (school.type || 'elementary') as SchoolType,
          status: school.is_active ? 'active' : 'inactive' as 'active' | 'inactive',
          active: school.is_active,
          institutionName: institution?.name || 'Instituição não encontrada',
          contact: {
            phone: school.phone || '',
            email: school.email || '',
            website: ''
          }
        };
      });
      
      setSchools(schoolsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim()) {
      toast.error('Nome da escola é obrigatório');
      return;
    }
    
    if (!formData.code?.trim()) {
      toast.error('Código da escola é obrigatório');
      return;
    }
    
    if (!formData.institution_id) {
      toast.error('Selecione uma instituição');
      return;
    }
    
    if (!formData.type) {
      toast.error('Selecione um tipo de escola');
      return;
    }
    
    if (formData.name.length < 3) {
      toast.error('Nome da escola deve ter pelo menos 3 caracteres');
      return;
    }
    
    if (formData.code.length < 2) {
      toast.error('Código da escola deve ter pelo menos 2 caracteres');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (editingSchool) {
        await schoolService.update(editingSchool.id, formData as ExtendedUpdateSchoolData);
        toast.success('Escola atualizada com sucesso!');
      } else {
        await schoolService.create(formData);
        toast.success('Escola criada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      await loadData(); // Aguardar o carregamento
    } catch (error: any) {
      console.error('Erro ao salvar escola:', error);
      
      // Tratamento de erros mais específico
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Dados inválidos. Verifique as informações.');
      } else if (error.response?.status === 409) {
        toast.error('Já existe uma escola com este nome nesta instituição.');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Erro ao salvar escola. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (school: SchoolUnit) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code || '',
      description: school.description || '',
      institution_id: school.institution_id,
      type: school.type || 'elementary',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      zip_code: school.zip_code || '',
      phone: school.contact?.phone || '',
      email: school.contact?.email || '',
      is_active: school.is_active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (school: SchoolUnit) => {
    try {
      const updateData: ExtendedUpdateSchoolData = {
        is_active: !school.is_active
      };
      
      await schoolService.update(school.id, updateData);
      
      toast.success(school.is_active ? 'Escola desativada' : 'Escola ativada');
      loadData();
    } catch (error) {
      toast.error('Erro ao alterar status da escola');
    }
  };

  const resetForm = () => {
    setEditingSchool(null);
    setSubmitting(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      institution_id: '',
      type: 'elementary',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      is_active: true
    });
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.institutionName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || school.type === filterType;
    const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
    const matchesInstitution = selectedInstitution === 'all' || school.institution_id === selectedInstitution;
    
    return matchesSearch && matchesType && matchesStatus && matchesInstitution;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      elementary: 'bg-green-100 text-green-800',
      middle: 'bg-blue-100 text-blue-800',
      high: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const typeData = SCHOOL_TYPES.find(t => t.value === type);
    return typeData ? typeData.label : type;
  };

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <SchoolIcon className="w-8 h-8 text-primary" />
                  Gerenciamento de Escolas
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Administração global de todas as escolas do sistema
                </p>
              </div>
                                  <button
                      onClick={() => setShowModal(true)}
                      disabled={loadingInstitutions || institutions.length === 0}
                      className={`bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        loadingInstitutions || institutions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={
                        loadingInstitutions 
                          ? 'Aguarde o carregamento das instituições' 
                          : institutions.length === 0 
                            ? 'Nenhuma instituição disponível para criar escolas' 
                            : 'Criar nova escola'
                      }
                    >
                      {loadingInstitutions ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Nova Escola
                        </>
                      )}
                    </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar escolas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filtro por Instituição */}
              <div className="relative">
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={loadingInstitutions}
                >
                  <option value="all">
                    {loadingInstitutions ? 'Carregando...' : 'Todas as Instituições'}
                  </option>
                  {!loadingInstitutions && institutions.map(institution => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
                {loadingInstitutions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Filtro por Tipo */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Tipos</option>
                {SCHOOL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Filtro por Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Escolas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{schools.length}</p>
                </div>
                <SchoolIcon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Escolas Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{schools.filter(s => s.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Alunos</p>
                  <p className="text-2xl font-bold text-blue-600">{schools.reduce((acc, s) => acc + s.studentsCount, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Professores</p>
                  <p className="text-2xl font-bold text-purple-600">{schools.reduce((acc, s) => acc + s.teachersCount, 0)}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Lista de Escolas */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando escolas...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Escola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Instituição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Alunos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Professores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSchools.map((school) => (
                      <motion.tr
                        key={school.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <SchoolIcon className="w-5 h-5 text-primary mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {school.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {school.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {school.institutionName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(school.type)}`}>
                            {getTypeLabel(school.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {school.studentsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {school.teachersCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(school)}
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              school.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {school.status === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ativa
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inativa
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(school)}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSchools.length === 0 && (
                <div className="text-center py-8">
                  <SchoolIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedInstitution !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Nenhuma escola encontrada com os filtros aplicados.'
                      : 'Nenhuma escola cadastrada ainda.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modal de Criação/Edição Melhorado */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <SchoolIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingSchool ? 'Editar Escola' : 'Nova Escola'}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {editingSchool ? 'Atualize as informações da escola' : 'Cadastre uma nova escola no sistema'}
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
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Informações Básicas
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome da Escola *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Ex: Escola Municipal João Silva"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Código *
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Ex: ESC-001"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            rows={3}
                            placeholder="Descreva brevemente a escola, sua missão ou características especiais..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Instituição *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.institution_id}
                              onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
                              required
                              disabled={loadingInstitutions}
                            >
                              {loadingInstitutions ? (
                                <option value="">Carregando instituições...</option>
                              ) : institutions.length === 0 ? (
                                <option value="">Nenhuma instituição disponível</option>
                              ) : (
                                <option value="">Selecione uma instituição</option>
                              )}
                              {!loadingInstitutions && institutions.map(institution => (
                                <option key={institution.id} value={institution.id}>
                                  {institution.name} {institution.code ? `(${institution.code})` : ''}
                                </option>
                              ))}
                            </select>
                            {loadingInstitutions ? (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                              </div>
                            ) : (
                              <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            )}
                          </div>
                          {!loadingInstitutions && institutions.length === 0 && (
                            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="text-amber-700 dark:text-amber-300 font-medium">
                                    Nenhuma instituição encontrada
                                  </p>
                                  <p className="text-amber-600 dark:text-amber-400 mt-1">
                                    Verifique sua conexão ou aguarde o carregamento.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={loadInstitutions}
                                    className="mt-2 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline text-sm"
                                  >
                                    Tentar novamente
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {loadingInstitutions && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              Carregando instituições...
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Escola *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as SchoolType })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
                              required
                            >
                              <option value="">Selecione o tipo</option>
                              {SCHOOL_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                          {formData.type && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {SCHOOL_TYPES.find(t => t.value === formData.type)?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informações de Localização */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Localização
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Endereço
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Rua, número, complemento"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Nome da cidade"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Estado
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
                          >
                            <option value="">Selecione</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={formData.zip_code}
                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informações de Contato */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        Contato
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="(00) 0000-0000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="contato@escola.edu.br"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Configurações */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Configurações
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {formData.is_active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                Status da Escola
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.is_active ? 'Escola ativa e operacional' : 'Escola inativa ou em manutenção'}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={formData.is_active}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 ${
                          submitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editingSchool ? 'Atualizando...' : 'Criando...'}
                          </>
                        ) : editingSchool ? (
                          <>
                            <Edit className="w-4 h-4" />
                            Atualizar Escola
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Criar Escola
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 