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
import { unitService } from '@/services/unitService';
import { institutionService } from '@/services/institutionService';
import { UnitResponseDto, UnitCreateDto, UnitUpdateDto } from '@/types/api';
import { InstitutionResponseDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Função simples para notificações
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message)
};

interface SchoolUnit extends UnitResponseDto {
  principal?: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  type: 'elementary' | 'middle' | 'high' | 'technical';
  status: 'active' | 'inactive';
  institutionName?: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

export default function SystemAdminSchoolsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [schools, setSchools] = useState<SchoolUnit[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolUnit | null>(null);
  const [formData, setFormData] = useState<UnitCreateDto>({
    name: '',
    description: '',
    type: 'ESCOLA',
    institution_id: '',
    active: true
  });
  const [filterType, setFilterType] = useState<'all' | 'elementary' | 'middle' | 'high' | 'technical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadData();
  }, [selectedInstitution]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar instituições
      const institutionsResponse = await institutionService.getAll();
      setInstitutions(institutionsResponse.data || []);

      // Carregar todas as unidades do tipo escola (SYSTEM_ADMIN vê todas)
      let unitsData;
      const filters = {
        type: 'ESCOLA',
        institution_id: selectedInstitution !== 'all' ? selectedInstitution : undefined
      };
      
      const response = await unitService.list(filters);
      
      // Converter unidades para o formato de escolas
      const schoolsData = response.items.map(unit => {
        const institution = institutionsResponse.data?.find(inst => inst.id === unit.institution_id);
        
        return {
          ...unit,
          principal: 'Diretor', // Valor padrão
          studentsCount: Math.floor(Math.random() * 500),
          teachersCount: Math.floor(Math.random() * 50),
          classesCount: Math.floor(Math.random() * 30),
          type: ['elementary', 'middle', 'high', 'technical'][Math.floor(Math.random() * 4)] as 'elementary' | 'middle' | 'high' | 'technical',
          status: unit.active ? 'active' : 'inactive',
          institutionName: institution?.name || 'Instituição não encontrada',
          address: {
            street: '',
            number: '',
            city: '',
            state: '',
            zipCode: ''
          },
          contact: {
            phone: unit.description || '',
            email: '',
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
    
    try {
      if (editingSchool) {
        await unitService.update(editingSchool.id, formData as UnitUpdateDto);
        toast.success('Escola atualizada com sucesso!');
      } else {
        await unitService.create(formData);
        toast.success('Escola criada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar escola');
    }
  };

  const handleEdit = (school: SchoolUnit) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      description: school.description,
      type: 'ESCOLA',
      institution_id: school.institution_id,
      active: school.active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (school: SchoolUnit) => {
    try {
      const updateData: UnitUpdateDto = {
        active: !school.active
      };
      
      await unitService.update(school.id, updateData);
      
      toast.success(school.active ? 'Escola desativada' : 'Escola ativada');
      loadData();
    } catch (error) {
      toast.error('Erro ao alterar status da escola');
    }
  };

  const resetForm = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      description: '',
      type: 'ESCOLA',
      institution_id: '',
      active: true
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
    const labels = {
      elementary: 'Fundamental I',
      middle: 'Fundamental II',
      high: 'Ensino Médio',
      technical: 'Técnico'
    };
    return labels[type as keyof typeof labels] || type;
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
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Escola
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
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas as Instituições</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>

              {/* Filtro por Tipo */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os Tipos</option>
                <option value="elementary">Fundamental I</option>
                <option value="middle">Fundamental II</option>
                <option value="high">Ensino Médio</option>
                <option value="technical">Técnico</option>
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

          {/* Modal de Criação/Edição */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingSchool ? 'Editar Escola' : 'Nova Escola'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome da Escola
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instituição
                      </label>
                      <select
                        value={formData.institution_id}
                        onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Selecione uma instituição</option>
                        {institutions.map(institution => (
                          <option key={institution.id} value={institution.id}>
                            {institution.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Escola ativa
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                      >
                        {editingSchool ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 