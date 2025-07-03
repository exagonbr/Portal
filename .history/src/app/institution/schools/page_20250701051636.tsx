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
  Building2
} from 'lucide-react';
import { unitService } from '@/services/unitService';
import { institutionService } from '@/services/institutionService';
import { UnitResponseDto, UnitCreateDto, UnitUpdateDto } from '@/types/api';
import { InstitutionResponseDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Função simples para notificações (substitui react-hot-toast)
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.log('❌ Error:', message)
};

interface SchoolUnit extends UnitResponseDto {
  principal?: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  type: 'elementary' | 'middle' | 'high' | 'technical';
  status: 'active' | 'inactive';
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

export default function InstitutionSchoolsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [schools, setSchools] = useState<SchoolUnit[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolUnit | null>(null);
  const [formData, setFormData] = useState<UnitCreateDto>({
    name: '',
    description: '',
    type: 'ESCOLA', // Tipo padrão para unidades escolares
    institution_id: '',
    active: true
  });
  const [filterType, setFilterType] = useState<'all' | 'elementary' | 'middle' | 'high' | 'technical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedInstitution]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar instituições
      const institutionsResponse = await institutionService.getAll();
      setInstitutions(institutionsResponse || []);

      // Carregar unidades do tipo escola
      let unitsData;
      const filters = {
        type: 'ESCOLA',
        institution_id: selectedInstitution || undefined
      };
      
      const response = await unitService.list(filters);
      
      // Converter unidades para o formato de escolas para compatibilidade com a UI
      const schoolsData = response.items.map(unit => {
        // Extrair informações de contato e endereço da descrição ou usar valores padrão
        let addressInfo = { street: '', number: '', city: '', state: '', zipCode: '' };
        let contactInfo = { phone: unit.description || '', email: '', website: '' };
        
        return {
          ...unit,
          principal: 'Diretor', // Valor padrão ou campo a ser preenchido posteriormente
          studentsCount: Math.floor(Math.random() * 500), // Simulação de dados
          teachersCount: Math.floor(Math.random() * 50), // Simulação de dados
          classesCount: Math.floor(Math.random() * 30), // Simulação de dados
          type: ['elementary', 'middle', 'high', 'technical'][Math.floor(Math.random() * 4)] as 'elementary' | 'middle' | 'high' | 'technical', // Simulação de dados
          status: (unit.active ? 'active' : 'inactive') as 'active' | 'inactive',
          address: addressInfo,
          contact: {
            phone: unit.description || '',
            email: '',
            website: ''
          }
        } as SchoolUnit;
      });
      
      setSchools(schoolsData);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchool) {
        const updated = await unitService.update(editingSchool.id, formData as UnitUpdateDto);
        toast.success('Escola atualizada com sucesso!');
        loadData(); // Recarregar os dados após atualização
      } else {
        const created = await unitService.create(formData);
        toast.success('Escola criada com sucesso!');
        loadData(); // Recarregar os dados após criação
      }
      
      setShowModal(false);
      resetForm();
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
      // Atualizar o status da unidade
      const updateData: UnitUpdateDto = {
        active: !school.active
      };
      
      await unitService.update(school.id, updateData);
      
      if (school.active) {
        toast.success('Escola desativada');
      } else {
        toast.success('Escola ativada');
      }
      
      loadData(); // Recarregar os dados após alteração do status
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
                         (school.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || school.type === filterType;
    const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      elementary: 'Fundamental I',
      middle: 'Fundamental II',
      high: 'Ensino Médio',
      technical: 'Técnico'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      elementary: theme.colors.status.info,
      middle: theme.colors.status.warning,
      high: theme.colors.status.success,
      technical: theme.colors.primary.DEFAULT
    }
    return colors[type as keyof typeof colors] || theme.colors.text.secondary
  }

  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'active').length,
    totalStudents: schools.reduce((acc, s) => acc + s.studentsCount, 0),
    totalTeachers: schools.reduce((acc, s) => acc + s.teachersCount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
              Gestão de Escolas
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Gerencie as escolas da instituição
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: 'white'
            }}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Nova Escola
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.primary.light + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.primary.DEFAULT }}>
                school
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Escolas</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.success + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.success }}>
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Escolas Ativas</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.info + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.info }}>
                group
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Alunos</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.warning + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.warning }}>
                groups
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Professores</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.totalTeachers}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.text.secondary }}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar escolas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary
              }}
            />
          </div>
        </div>

        {/* Filtro por Tipo */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
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
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </motion.div>

      {/* Lista de Escolas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school, index) => (
          <motion.div
            key={school.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            {/* Header */}
            <div className="p-4" style={{ backgroundColor: getTypeColor(school.type) + '10' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.text.primary }}>
                    {school.name}
                  </h3>
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Código: {school.id.substring(0, 8)}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getTypeColor(school.type) + '20',
                        color: getTypeColor(school.type)
                      }}>
                  {getTypeLabel(school.type)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {/* Diretor */}
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-base"
                      style={{ color: theme.colors.text.tertiary }}>
                  person
                </span>
                <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  Diretor(a): {school.principal || 'Não informado'}
                </span>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-2 mb-3">
                <span className="material-symbols-outlined text-base"
                      style={{ color: theme.colors.text.tertiary }}>
                  location_on
                </span>
                <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  {school.address?.street || 'Endereço não informado'}
                </span>
              </div>

              {/* Contato */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    phone
                  </span>
                  <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {school.contact?.phone || 'Telefone não informado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    email
                  </span>
                  <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {school.contact?.email || 'Email não informado'}
                  </span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded"
                     style={{ backgroundColor: theme.colors.background.secondary }}>
                  <p className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    {school.studentsCount}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.text.secondary }}>Alunos</p>
                </div>
                <div className="text-center p-2 rounded"
                     style={{ backgroundColor: theme.colors.background.secondary }}>
                  <p className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    {school.teachersCount}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.text.secondary }}>Professores</p>
                </div>
                <div className="text-center p-2 rounded"
                     style={{ backgroundColor: theme.colors.background.secondary }}>
                  <p className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    {school.classesCount}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.text.secondary }}>Turmas</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Link
                  href={`/institution/schools/${school.id}`}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-center text-sm transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    color: 'white'
                  }}
                >
                  Gerenciar
                </Link>
                <button
                  onClick={() => handleToggleActive(school)}
                  className="px-3 py-2 rounded-lg transition-colors border"
                  style={{
                    borderColor: theme.colors.border.DEFAULT,
                    color: theme.colors.text.secondary
                  }}
                >
                  <span className="material-symbols-outlined text-xl">
                    {school.active ? 'unpublished' : 'check_circle'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            school
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma escola encontrada
          </p>
        </motion.div>
      )}
    </div>
  );
}