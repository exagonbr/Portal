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
  BookOpen
} from 'lucide-react';
import { unitService, Unit, CreateUnitData, UpdateUnitData, UnitFilters } from '@/services/unitService';
import { institutionService } from '@/services/institutionService';
import { InstitutionResponseDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ToastManager';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';



interface UnitExtended extends Unit {
  studentsCount?: number;
  teachersCount?: number;
  coursesCount?: number;
  institutionName?: string;
}

export default function SystemAdminUnitsPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitExtended[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitExtended | null>(null);
  const [formData, setFormData] = useState<CreateUnitData & { description?: string; type?: string }>({
    name: '',
    institution_id: '',
    description: '',
    type: 'school'
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<string>('all');
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
            showError('Nenhuma instituição encontrada. Verifique a conexão.');
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
        showError('Nenhuma instituição encontrada. Verifique a conexão.');
      } else {
        console.log(`✅ ${institutionsArray.length} instituições carregadas com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instituições:', error);
      showError('Erro ao carregar instituições. Verifique sua conexão.');
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
      console.log('📊 Resposta da API de unidades:', response);
      
      // O unitService.list() retorna PaginatedUnitResponse com { items: Unit[], pagination: {...} }
      if (!response || !response.items || !Array.isArray(response.items)) {
        console.warn('⚠️ Formato de resposta inválido:', response);
        throw new Error('Invalid response format from API');
      }
      
      console.log('📋 Array de unidades extraído:', response.items);
      
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
      showError('Erro ao carregar unidades');
      // Em caso de erro, definir array vazio para evitar crashes
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim()) {
      showError('Nome da unidade é obrigatório');
      return;
    }
    
    if (!formData.institution_id) {
      showError('Selecione uma instituição');
      return;
    }
    
    if (formData.name.length < 3) {
      showError('Nome da unidade deve ter pelo menos 3 caracteres');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (editingUnit) {
        await unitService.update(editingUnit.id, formData as UpdateUnitData);
        showSuccess('Unidade atualizada com sucesso!');
      } else {
        await unitService.create(formData);
        showSuccess('Unidade criada com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      await loadData(); // Aguardar o carregamento
    } catch (error: any) {
      console.error('Erro ao salvar unidade:', error);
      
      // Tratamento de erros mais específico
      if (error.response?.status === 400) {
        showError(error.response?.data?.message || 'Dados inválidos. Verifique as informações.');
      } else if (error.response?.status === 409) {
        showError('Já existe uma unidade com este nome nesta instituição.');
      } else if (error.response?.status === 401) {
        showError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        showError('Você não tem permissão para realizar esta ação.');
      } else {
        showError(error.response?.data?.message || error.message || 'Erro ao salvar unidade. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (unit: UnitExtended) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      institution_id: unit.institution_id,
      description: unit.description || '',
      type: unit.type || 'school'
    });
    setShowModal(true);
  };

  const handleToggleActive = async (unit: UnitExtended) => {
    try {
      const updateData: UpdateUnitData = {
        active: !unit.active
      };
      
      await unitService.update(unit.id, updateData);
      
      showSuccess(unit.active ? 'Unidade desativada' : 'Unidade ativada');
      loadData();
    } catch (error) {
      showError('Erro ao alterar status da unidade');
    }
  };

  const handleDelete = async (unit: UnitExtended) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await unitService.delete(unit.id);
      showSuccess('Unidade excluída com sucesso!');
      loadData();
    } catch (error) {
      showError('Erro ao excluir unidade');
    }
  };

  const resetForm = () => {
    setEditingUnit(null);
    setSubmitting(false);
    setFormData({
      name: '',
      institution_id: '',
      description: '',
      type: 'school'
    });
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (unit.institutionName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (unit.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? unit.active : !unit.active);
    const matchesInstitution = selectedInstitution === 'all' || unit.institution_id === selectedInstitution;
    const matchesType = filterType === 'all' || unit.type === filterType;
    
    return matchesSearch && matchesStatus && matchesInstitution && matchesType;
  });

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <AuthenticatedLayout>
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <UnitIcon className="w-6 h-6 text-blue-600" />
                  Gerenciamento de Unidades
                </h1>
                <p className="text-slate-600 mt-1">
                  Total: {units.length} unidades
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={loadingInstitutions || institutions.length === 0}
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors ${
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
          </div>

          {/* Filtros */}
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-800">Filtros de Unidades</h2>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Filtro por Busca */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Search className="h-4 w-4 text-blue-500" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome da unidade..."
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Filtro por Instituição */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Instituição
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  disabled={loadingInstitutions}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">
                    {loadingInstitutions ? 'Carregando...' : 'Todas as instituições'}
                  </option>
                  {!loadingInstitutions && institutions.map(institution => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
              </div>

              {/* Filtro por Tipo */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <UnitIcon className="h-4 w-4 text-blue-500" />
                  Tipo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="school">Escola</option>
                  <option value="college">Faculdade</option>
                  <option value="university">Universidade</option>
                  <option value="campus">Campus</option>
                </select>
              </div>
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

          {/* Lista de Unidades */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-lg text-slate-600">Carregando unidades...</span>
                </div>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-16 px-6">
                <UnitIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-xl font-bold text-slate-800">Nenhuma unidade encontrada</h3>
                <p className="mt-2 text-base text-slate-600 max-w-md mx-auto">
                  {searchTerm || selectedInstitution !== 'all' || filterStatus !== 'all'
                    ? "Tente ajustar seus filtros de busca para ver mais resultados."
                    : "Não há unidades cadastradas ainda."}
                </p>
              </div>
            ) : (
              <>
                {/* Tabela de unidades */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Unidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Instituição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredUnits.map((unit) => (
                        <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex-shrink-0">
                                <UnitIcon className="h-8 w-8 text-blue-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 truncate">{unit.name}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {unit.description || 'Sem descrição'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-slate-700 truncate">{unit.institutionName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              {unit.type === 'school' ? 'Escola' : 
                               unit.type === 'college' ? 'Faculdade' :
                               unit.type === 'university' ? 'Universidade' :
                               unit.type === 'campus' ? 'Campus' : 'Escola'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(unit)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                                unit.active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={`Clique para ${unit.active ? 'desativar' : 'ativar'}`}
                            >
                              <div className={`h-2 w-2 rounded-full ${unit.active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                              {unit.active ? "Ativa" : "Inativa"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(unit)}
                                className="p-1 rounded hover:bg-slate-100 transition-colors text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                title="Editar unidade"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(unit)}
                                className="p-1 rounded hover:bg-slate-100 transition-colors text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Excluir unidade"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Modal de Criação/Edição Simplificado */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
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
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Informações da Unidade
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome da Unidade *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
                            placeholder="Ex: EMEF Levy Gonçalves de Oliveira"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de Unidade *
                          </label>
                          <select
                            value={formData.type || 'school'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
                            required
                          >
                            <option value="school">Escola</option>
                            <option value="college">Faculdade</option>
                            <option value="university">Universidade</option>
                            <option value="campus">Campus</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors resize-none"
                          placeholder="Descrição opcional da unidade..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Instituição *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.institution_id}
                              onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors appearance-none"
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
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                              </div>
                            ) : (
                              <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                            )}
                          </div>
                          {!loadingInstitutions && institutions.length === 0 && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="text-amber-700 font-medium">
                                    Nenhuma instituição encontrada
                                  </p>
                                  <p className="text-amber-600 mt-1">
                                    Verifique sua conexão ou aguarde o carregamento.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={loadInstitutions}
                                    className="mt-2 text-amber-700 hover:text-amber-800 underline text-sm"
                                  >
                                    Tentar novamente
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {loadingInstitutions && (
                            <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              Carregando instituições...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={submitting || loadingInstitutions || institutions.length === 0}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editingUnit ? 'Atualizando...' : 'Criando...'}
                          </>
                        ) : (
                          <>
                            {editingUnit ? 'Atualizar Unidade' : 'Criar Unidade'}
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
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}