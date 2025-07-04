'use client';

import React, { useState } from 'react';
import {
  Building2 as UnitIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';
import { UnitResponseDto, UnitCreateDto, InstitutionResponseDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserRole } from '@/types/roles';
import { useToast } from '@/components/ToastManager';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

// Interface estendida para dados da UI
interface UnitExtended extends UnitResponseDto {
  studentsCount?: number;
  teachersCount?: number;
  coursesCount?: number;
  institutionName?: string;
}

// Dados mockados estáticos alinhados com os DTOs de api.ts
const mockInstitutions: InstitutionResponseDto[] = [
  {
    id: 1,
    name: 'Rede Educacional Futuro Brilhante',
    accountable_contact: 'diretoria@futurobrilhante.edu.br',
    accountable_name: 'Maria Helena Rodrigues',
    company_name: 'Futuro Brilhante Educação Ltda',
    contract_disabled: false,
    contract_term_end: '2025-12-31T23:59:59.000Z',
    contract_term_start: '2023-01-01T00:00:00.000Z',
    deleted: false,
    district: 'Jardim América',
    document: '12.345.678/0001-90',
    postal_code: '01454-000',
    state: 'SP',
    street: 'Av. Brigadeiro Faria Lima, 2170',
    has_library_platform: true,
    has_principal_platform: true,
    has_student_platform: true
  },
  {
    id: 2,
    name: 'Instituto Educacional Nova Era',
    accountable_contact: 'contato@novaera.edu.br',
    accountable_name: 'João Carlos Mendes',
    company_name: 'Nova Era Ensino e Pesquisa S.A.',
    contract_disabled: false,
    contract_term_end: '2026-06-30T23:59:59.000Z',
    contract_term_start: '2022-07-01T00:00:00.000Z',
    deleted: false,
    district: 'Botafogo',
    document: '98.765.432/0001-10',
    postal_code: '22250-040',
    state: 'RJ',
    street: 'Rua Voluntários da Pátria, 45',
    has_library_platform: true,
    has_principal_platform: false,
    has_student_platform: true
  },
  {
    id: 3,
    name: 'Grupo Educacional Conhecimento',
    accountable_contact: 'administracao@conhecimento.edu.br',
    accountable_name: 'Ana Paula Silva',
    company_name: 'Conhecimento Educação e Cultura EIRELI',
    contract_disabled: false,
    contract_term_end: '2025-03-31T23:59:59.000Z',
    contract_term_start: '2023-04-01T00:00:00.000Z',
    deleted: false,
    district: 'Asa Sul',
    document: '45.678.901/0001-23',
    postal_code: '70390-100',
    state: 'DF',
    street: 'SQS 308 Bloco A',
    has_library_platform: true,
    has_principal_platform: true,
    has_student_platform: true
  }
];

const mockUnits: UnitExtended[] = [
  {
    id: 101,
    name: 'Escola Futuro Brilhante - Unidade Centro',
    institution_id: '1',
    description: 'Unidade principal com ensino fundamental I e II completo. Infraestrutura moderna com laboratórios de ciências e informática.',
    type: 'school',
    active: true,
    studentsCount: 856,
    teachersCount: 42,
    coursesCount: 24,
    institutionName: 'Rede Educacional Futuro Brilhante',
    created_at: '2023-01-15T10:30:00.000Z',
    updated_at: '2024-11-20T14:45:00.000Z'
  },
  {
    id: 102,
    name: 'Colégio Futuro Brilhante - Vila Nova',
    institution_id: '1',
    description: 'Unidade focada em ensino médio e preparação para vestibulares. Conta com programa bilíngue e atividades extracurriculares.',
    type: 'school',
    active: true,
    studentsCount: 620,
    teachersCount: 38,
    coursesCount: 18,
    institutionName: 'Rede Educacional Futuro Brilhante',
    created_at: '2023-03-10T09:00:00.000Z',
    updated_at: '2024-12-01T16:20:00.000Z'
  },
  {
    id: 103,
    name: 'Escola Futuro Brilhante - Jardim Primavera',
    institution_id: '1',
    description: 'Especializada em educação infantil e fundamental I. Metodologia lúdica e espaços adaptados para crianças.',
    type: 'school',
    active: true,
    studentsCount: 320,
    teachersCount: 28,
    coursesCount: 12,
    institutionName: 'Rede Educacional Futuro Brilhante',
    created_at: '2023-02-20T11:15:00.000Z',
    updated_at: '2024-10-15T13:30:00.000Z'
  },
  {
    id: 201,
    name: 'Instituto Nova Era - Campus Principal',
    institution_id: '2',
    description: 'Campus universitário com cursos de graduação e pós-graduação em diversas áreas do conhecimento.',
    type: 'university',
    active: true,
    studentsCount: 3500,
    teachersCount: 180,
    coursesCount: 45,
    institutionName: 'Instituto Educacional Nova Era',
    created_at: '2022-07-15T08:00:00.000Z',
    updated_at: '2024-12-10T17:00:00.000Z'
  },
  {
    id: 202,
    name: 'Faculdade Nova Era - Tecnologia',
    institution_id: '2',
    description: 'Unidade especializada em cursos de tecnologia, engenharia e ciências exatas.',
    type: 'college',
    active: true,
    studentsCount: 1200,
    teachersCount: 65,
    coursesCount: 15,
    institutionName: 'Instituto Educacional Nova Era',
    created_at: '2022-09-01T10:00:00.000Z',
    updated_at: '2024-11-25T15:45:00.000Z'
  },
  {
    id: 203,
    name: 'Centro de Extensão Nova Era',
    institution_id: '2',
    description: 'Oferece cursos livres, extensão universitária e programas de educação continuada.',
    type: 'campus',
    active: false,
    studentsCount: 450,
    teachersCount: 25,
    coursesCount: 30,
    institutionName: 'Instituto Educacional Nova Era',
    created_at: '2023-01-20T09:30:00.000Z',
    updated_at: '2024-06-15T11:00:00.000Z'
  },
  {
    id: 301,
    name: 'Escola Conhecimento - Asa Norte',
    institution_id: '3',
    description: 'Unidade com ensino fundamental e médio, reconhecida pela excelência acadêmica e projetos sociais.',
    type: 'school',
    active: true,
    studentsCount: 980,
    teachersCount: 52,
    coursesCount: 28,
    institutionName: 'Grupo Educacional Conhecimento',
    created_at: '2023-04-10T08:30:00.000Z',
    updated_at: '2024-12-05T14:20:00.000Z'
  },
  {
    id: 302,
    name: 'Colégio Conhecimento - Lago Sul',
    institution_id: '3',
    description: 'Unidade premium com programa internacional IB e infraestrutura de ponta.',
    type: 'school',
    active: true,
    studentsCount: 420,
    teachersCount: 35,
    coursesCount: 20,
    institutionName: 'Grupo Educacional Conhecimento',
    created_at: '2023-05-15T10:00:00.000Z',
    updated_at: '2024-11-30T16:00:00.000Z'
  },
  {
    id: 303,
    name: 'Centro de Idiomas Conhecimento',
    institution_id: '3',
    description: 'Especializado no ensino de línguas estrangeiras com metodologia imersiva.',
    type: 'campus',
    active: true,
    studentsCount: 650,
    teachersCount: 30,
    coursesCount: 12,
    institutionName: 'Grupo Educacional Conhecimento',
    created_at: '2023-06-01T11:30:00.000Z',
    updated_at: '2024-12-01T13:45:00.000Z'
  }
];

export default function SystemAdminUnitsPage() {
  const { showSuccess, showError } = useToast();
  const [units, setUnits] = useState<UnitExtended[]>(mockUnits);
  const [institutions] = useState<InstitutionResponseDto[]>(mockInstitutions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitExtended | null>(null);
  const [formData, setFormData] = useState<UnitCreateDto>({
    name: '',
    institution_id: '',
    description: '',
    type: 'school',
    active: true,
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const resetForm = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      institution_id: '',
      description: '',
      type: 'school',
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.institution_id) {
      showError('Nome da unidade e instituição são obrigatórios.');
      return;
    }

    const institutionIdNum = parseInt(formData.institution_id, 10);
    const institutionName = institutions.find(i => i.id === institutionIdNum)?.name || 'Desconhecida';

    if (editingUnit) {
      const updatedUnits = units.map(u =>
        u.id === editingUnit.id ? { ...editingUnit, ...formData, institution_id: formData.institution_id, institutionName } : u
      );
      setUnits(updatedUnits);
      showSuccess('Unidade atualizada com sucesso!');
    } else {
      const newUnit: UnitExtended = {
        id: Math.floor(Math.random() * 10000) + 1,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        institution_id: formData.institution_id,
        active: formData.active ?? true,
        studentsCount: 0,
        teachersCount: 0,
        coursesCount: 0,
        institutionName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUnits([...units, newUnit]);
      showSuccess('Unidade criada com sucesso!');
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (unit: UnitExtended) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      institution_id: unit.institution_id,
      description: unit.description || '',
      type: unit.type || 'school',
      active: unit.active,
    });
    setShowModal(true);
  };

  const handleToggleActive = (unit: UnitExtended) => {
    const updatedUnits = units.map(u =>
      u.id === unit.id ? { ...u, active: !u.active } : u
    );
    setUnits(updatedUnits);
    showSuccess(unit.active ? 'Unidade desativada' : 'Unidade ativada');
  };

  const handleDelete = (unit: UnitExtended) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      const updatedUnits = units.filter(u => u.id !== unit.id);
      setUnits(updatedUnits);
      showSuccess('Unidade excluída com sucesso!');
    }
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
    <AuthenticatedLayout requiredPermission="canManageSchools">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <UnitIcon className="w-6 h-6 text-blue-600" />
              Gerenciamento de Unidades
            </h1>
            <p className="text-slate-600 mt-1">Total: {filteredUnits.length} unidades</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Unidade
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, instituição..."
              className="w-full rounded-lg border-slate-300"
            />
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full rounded-lg border-slate-300"
            >
              <option value="all">Todas as instituições</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id.toString()}>{inst.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full rounded-lg border-slate-300"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-lg border-slate-300"
            >
              <option value="all">Todos os tipos</option>
              <option value="school">Escola</option>
              <option value="college">Faculdade</option>
              <option value="university">Universidade</option>
              <option value="campus">Campus</option>
            </select>
          </div>
        </div>

        {/* Lista de Unidades */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-600">Unidade</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-600">Instituição</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-600">Tipo</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUnits.length > 0 ? filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50">
                    <td className="p-4">{unit.name}</td>
                    <td className="p-4">{unit.institutionName}</td>
                    <td className="p-4">{unit.type}</td>
                    <td className="p-4">
                      <span onClick={() => handleToggleActive(unit)} className={`cursor-pointer px-2 py-1 text-xs rounded-full ${unit.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {unit.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(unit)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">
                      Nenhuma unidade encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da Unidade"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                  <select
                    value={formData.institution_id}
                    onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione uma instituição</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id.toString()}>{inst.name}</option>
                    ))}
                  </select>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição"
                    className="w-full p-2 border rounded-md"
                  />
                  <select
                    value={formData.type || 'school'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="school">Escola</option>
                    <option value="college">Faculdade</option>
                    <option value="university">Universidade</option>
                    <option value="campus">Campus</option>
                  </select>
                  <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingUnit ? 'Atualizar' : 'Criar'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}