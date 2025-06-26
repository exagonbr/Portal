'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2 as UnitIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { unitService, Unit, CreateUnitData, UpdateUnitData, UnitFilters } from '@/services/unitService';
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

interface UnitExtended extends Unit {
  studentsCount?: number;
  teachersCount?: number;
  coursesCount?: number;
  institutionName?: string;
}

export default function SystemAdminUnitsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [units, setUnits] = useState<UnitExtended[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitExtended | null>(null);
  const [formData, setFormData] = useState<CreateUnitData>({
    name: '',
    institution_id: ''
  });
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
      
      // Teste direto com fetch para debug
      console.log('🧪 Testando chamada direta à API...');
      try {
        const directResponse = await fetch('/api/institutions?active=true&limit=1000');
        console.log('📡 Direct fetch status:', directResponse.status);
        const directData = await directResponse.json();
        console.log('📊 Direct fetch data:', directData);
        
        if (directData.success && directData.data && directData.data.items) {
          console.log(`🎯 Found ${directData.data.items.length} institutions via direct fetch`);
          
          // Normalizar dados
          const institutionsArray = directData.data.items.map((institution: any) => ({
            id: institution.id,
            name: institution.name,
            code: institution.code || '',
            type: institution.type,
            description: institution.description,
            email: institution.email,
            phone: institution.phone,
            website: institution.website,
            address: institution.address,
            city: institution.city,
            state: institution.state,
            zip_code: institution.zip_code,
            logo_url: institution.logo_url,
            is_active: institution.active !== undefined ? institution.active : institution.is_active,
            schools_count: institution.schools_count || 0,
            users_count: institution.users_count || 0,
            active_courses: institution.active_courses || 0,
            created_at: institution.created_at,
            updated_at: institution.updated_at
          }));
          
          setInstitutions(institutionsArray);
          
          if (institutionsArray.length === 0) {
            console.warn('⚠️ Nenhuma instituição encontrada na resposta');
            toast.error('Nenhuma instituição encontrada. Verifique a conexão.');
          } else {
            console.log(`✅ ${institutionsArray.length} instituições carregadas com sucesso`);
          }
          return;
        }
      } catch (directError) {
        console.error('❌ Direct fetch failed:', directError);
      }
      
      // Fallback para o serviço original
      console.log('🔄 Tentando via serviço...');
      const institutionsResponse = await institutionService.getAll();
      console.log('📊 Instituições carregadas via serviço:', institutionsResponse);
      
      // O método getAll() já retorna um array diretamente, não um objeto com data
      let institutionsArray = Array.isArray(institutionsResponse) ? institutionsResponse : [];
      
      // Normalizar dados para garantir compatibilidade
      institutionsArray = institutionsArray.map(institution => ({
        id: institution.id,
        name: institution.name,
        code: institution.code || '',
        type: institution.type,
        description: institution.description,
        email: institution.email,
        phone: institution.phone,
        website: institution.website,
        address: institution.address,
        city: institution.city,
        state: institution.state,
        zip_code: institution.zip_code,
        logo_url: institution.logo_url,
        is_active: institution.active !== undefined ? institution.active : institution.is_active,
        schools_count: institution.schools_count || 0,
        users_count: institution.users_count || 0,
        active_courses: institution.active_courses || 0,
        created_at: institution.created_at,
        updated_at: institution.updated_at
      }));
      
      setInstitutions(institutionsArray);
      
      if (institutionsArray.length === 0) {
        console.warn('⚠️ Nenhuma instituição encontrada na resposta');
        toast.error('Nenhuma instituição encontrada. Verifique a conexão.');
      } else {
        console.log(`✅ ${institutionsArray.length} instituições carregadas com sucesso`);
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
      console.log('🔄 Carregando unidades...');

      // Carregar todas as unidades (SYSTEM_ADMIN vê todas)
      const filters: UnitFilters = {
        institution_id: selectedInstitution !== 'all' ? selectedInstitution : undefined,
        limit: 100
      };
      
      const response = await unitService.list(filters);
      console.log('📊 Unidades carregadas:', response);
      
      // Converter unidades para o formato esperado pelo frontend
      const unitsData = response.items.map(unit => {
        const institution = institutions.find(inst => inst.id === unit.institution_id);
        
        return {
          ...unit,
          studentsCount: Math.floor(Math.random() * 500), // Dados simulados
          teachersCount: Math.floor(Math.random() * 50),
          coursesCount: Math.floor(Math.random() * 20),
          institutionName: institution?.name || unit.institution?.name || 'Instituição não encontrada'
        };
      });
      
      setUnits(unitsData);
      console.log(`✅ ${unitsData.length} unidades carregadas com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim()) {
      toast.error('Nome da unidade é obrigatório');
      return;
    }
    
    if (!formData.institution_id) {
      toast.error('Selecione uma instituição');
      return;
    }
    
    if (formData.name.length < 3) {
      toast.error('Nome da unidade deve ter pelo menos 3 caracteres');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (editingUnit) {
        await unitService.update(editingUnit.id, formData as UpdateUnitData);
        toast.success('Unidade atualizada com sucesso!');
      } else {
        await unitService.create(formData);
        toast.success('Unidade criada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      await loadData(); // Aguardar o carregamento
    } catch (error: any) {
      console.error('Erro ao salvar unidade:', error);
      
      // Tratamento de erros mais específico
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Dados inválidos. Verifique as informações.');
      } else if (error.response?.status === 409) {
        toast.error('Já existe uma unidade com este nome nesta instituição.');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Erro ao salvar unidade. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (unit: UnitExtended) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      institution_id: unit.institution_id
    });
    setShowModal(true);
  };

  const handleToggleActive = async (unit: UnitExtended) => {
    try {
      const updateData: UpdateUnitData = {
        active: !unit.active
      };
      
      await unitService.update(unit.id, updateData);
      
      toast.success(unit.active ? 'Unidade desativada' : 'Unidade ativada');
      loadData();
    } catch (error) {
      toast.error('Erro ao alterar status da unidade');
    }
  };

  const handleDelete = async (unit: UnitExtended) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await unitService.delete(unit.id);
      toast.success('Unidade excluída com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir unidade');
    }
  };

  const resetForm = () => {
    setEditingUnit(null);
    setSubmitting(false);
    setFormData({
      name: '',
      institution_id: ''
    });
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (unit.institutionName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? unit.active : !unit.active);
    const matchesInstitution = selectedInstitution === 'all' || unit.institution_id === selectedInstitution;
    
    return matchesSearch && matchesStatus && matchesInstitution;
  });

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <UnitIcon className="w-8 h-8 text-primary" />
                  Gerenciamento de Unidades
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Administração global de todas as unidades do sistema ({units.length} unidades encontradas)
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
                      ? 'Nenhuma instituição disponível para criar unidades'
                      : 'Criar nova unidade'
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
                    Nova Unidade
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar unidades..."
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

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card Total de Unidades */}
            <div className="stat-card stat-card-blue">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <UnitIcon className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{units.length}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">UNIDADES</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Unidades</h3>
                  <p className="stat-card-subtitle">Registradas no sistema</p>
                </div>
              </div>
            </div>

            {/* Card Unidades Ativas */}
            <div className="stat-card stat-card-green">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <CheckCircle className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{units.filter(u => u.active).length}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">ATIVAS</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Unidades Ativas</h3>
                  <p className="stat-card-subtitle">Em funcionamento</p>
                </div>
              </div>
            </div>

            {/* Card Total de Cursos */}
            <div className="stat-card stat-card-purple">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <BookOpen className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{units.reduce((acc, u) => acc + (u.coursesCount || 0), 0)}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">CURSOS</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Cursos</h3>
                  <p className="stat-card-subtitle">Disponíveis</p>
                </div>
              </div>
            </div>

            {/* Card Total de Instituições */}
            <div className="stat-card stat-card-amber">
              <div className="stat-card-shine"></div>
              <div className="stat-card-particles">
                <div className="stat-card-particle-1"></div>
                <div className="stat-card-particle-2"></div>
                <div className="stat-card-particle-3"></div>
                <div className="stat-card-particle-4"></div>
              </div>
              <div className="stat-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="stat-card-icon-wrapper">
                    <Building2 className="stat-card-icon" />
                  </div>
                  <div className="text-right">
                    <p className="stat-card-value">{new Set(units.map(u => u.institution_id)).size}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="stat-card-indicator"></div>
                      <span className="stat-card-label">INSTITUIÇÕES</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="stat-card-title">Total de Instituições</h3>
                  <p className="stat-card-subtitle">Vinculadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Unidades em Cards */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando unidades...</span>
              </div>
            </div>
          ) : (
            <>
              {filteredUnits.length === 0 ? (
                <div className="text-center py-12">
                  <UnitIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm || selectedInstitution !== 'all' || filterStatus !== 'all'
                      ? 'Nenhuma unidade encontrada'
                      : 'Nenhuma unidade cadastrada'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedInstitution !== 'all' || filterStatus !== 'all'
                      ? 'Tente ajustar os filtros para encontrar o que procura.'
                      : 'Comece criando sua primeira unidade.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredUnits.map((unit) => (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="content-card"
                    >
                      {/* Header com gradiente e ícone */}
                      <div className="content-card-header">
                        <div className="content-card-header-gradient">
                          {/* Padrão de fundo */}
                          <div className="content-card-header-particles">
                            <div className="content-card-header-particle-1"></div>
                            <div className="content-card-header-particle-2"></div>
                            <div className="content-card-header-particle-3"></div>
                            <div className="content-card-header-particle-4"></div>
                          </div>
                          
                          {/* Conteúdo sobreposto */}
                          <div className="content-card-header-content">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="content-card-icon-wrapper bg-blue-500">
                                  <UnitIcon className="content-card-icon" />
                                </div>
                                <div>
                                  <h3 className="content-card-title">
                                    {unit.name}
                                  </h3>
                                  <p className="content-card-subtitle">
                                    {unit.institutionName}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActive(unit);
                                }}
                                title={`Clique para ${unit.active ? 'desativar' : 'ativar'}`}
                              >
                                <span className={`status-badge ${
                                  unit.active
                                    ? 'status-badge-active'
                                    : 'status-badge-inactive'
                                }`}>
                                  {unit.active ? 'Ativa' : 'Inativa'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="content-card-body">
                        {/* Tipo da unidade */}
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            Escola
                          </span>
                        </div>

                        {/* Estatísticas em grid */}
                        <div className="space-y-3 mb-4">
                          {/* Cursos - Destaque */}
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-700">
                                {unit.coursesCount || 0} curso{(unit.coursesCount || 0) !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-blue-600">Disponíveis</p>
                            </div>
                          </div>
                          
                          {/* Alunos e Professores */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg flex-1">
                              <Users className="w-4 h-4 text-green-500" />
                              <span className="font-medium">{unit.studentsCount || 0} alunos</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-lg flex-1">
                              <Users className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">{unit.teachersCount || 0} prof.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer do Card */}
                      <div className="content-card-footer">
                        <div className="flex items-center justify-between">
                          <div className="footer-action-text footer-action-text-blue">
                            <span>Gerenciar unidade</span>
                            <div className="footer-action-indicator"></div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(unit);
                              }}
                              className="action-button action-button-edit"
                              title="Editar unidade"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(unit);
                              }}
                              className="action-button action-button-delete"
                              title="Excluir unidade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Modal de Criação/Edição Simplificado */}
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
                        <UnitIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {editingUnit ? 'Atualize as informações da unidade' : 'Cadastre uma nova unidade no sistema'}
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
                            Nome da Unidade *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Ex: EMEF Levy Gonçalves de Oliveira"
                            required
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
                            {editingUnit ? 'Atualizando...' : 'Criando...'}
                          </>
                        ) : editingUnit ? (
                          <>
                            <Edit className="w-4 h-4" />
                            Atualizar Unidade
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Criar Unidade
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