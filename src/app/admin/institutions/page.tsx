'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { mockStudents, mockTeachers, mockCourses } from '@/constants/mockData';
import InstitutionEditModal from '@/components/InstitutionEditModal';
import InstitutionAddModal from '@/components/InstitutionAddModal';

// Types
interface Unit {
  id: string;
  name: string;
}

interface InstitutionDisplayData {
  id: string;
  name: string;
  location: string;
  status: 'Ativa' | 'Inativa' | 'Pendente';
  imageUrl?: string;
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  unitCount: number;
  type: 'Universidade' | 'Escola' | 'Centro de Treinamento' | 'Instituto';
  address?: string;
  units?: Unit[];
}

interface FilterState {
  searchTerm: string;
  type: string;
  status: string;
  sortBy: string;
}

// Constants
const ITEMS_PER_PAGE = 6;
const INSTITUTION_TYPES: InstitutionDisplayData['type'][] = ['Universidade', 'Escola', 'Centro de Treinamento', 'Instituto'];
const INSTITUTION_STATUSES: InstitutionDisplayData['status'][] = ['Ativa', 'Inativa', 'Pendente'];
const LOCATIONS = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Porto Alegre, RS', 'Curitiba, PR'];

// Components
const StatCard: React.FC<{
  title: string;
  value: number | string;
  trend?: { value: string; label: string };
  color?: string;
}> = ({ title, value, trend, color = 'green' }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    {trend && (
      <div className="mt-4 flex items-center">
        <span className={`text-${color}-500 text-sm`}>{trend.value}</span>
        <span className="text-gray-500 text-sm ml-2">{trend.label}</span>
      </div>
    )}
  </div>
);

const InstitutionCard: React.FC<{
  institution: InstitutionDisplayData;
  onEdit: (institution: InstitutionDisplayData) => void;
}> = ({ institution, onEdit }) => {
  const statusColors = {
    'Ativa': 'bg-accent-green/20 text-accent-green',
    'Inativa': 'bg-error/20 text-error',
    'Pendente': 'bg-accent-yellow/20 text-accent-yellow'
  };

  const typeColors = {
    'Universidade': 'text-accent-purple',
    'Escola': 'text-primary',
    'Centro de Treinamento': 'text-accent-blue',
    'Instituto': 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={institution.imageUrl}
          alt={institution.name}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-sm ${statusColors[institution.status]}`}>
            {institution.status}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{institution.name}</h3>
          <p className="text-sm text-gray-600">
            {institution.location} • <span className={`font-medium ${typeColors[institution.type]}`}>{institution.type}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-1 mb-4">
          {[
            { label: 'Alunos', value: institution.studentCount, icon: '👥' },
            { label: 'Professores', value: institution.teacherCount, icon: '👨‍🏫' },
            { label: 'Cursos', value: institution.courseCount, icon: '📚' },
            { label: 'Unidades', value: institution.unitCount, icon: '🏢' }
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
              <span className="text-gray-600 flex items-center gap-1">
                <span>{icon}</span> {label}
              </span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(institution)}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Gerenciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminInstitutionsPage() {
  const { user } = useAuth();
  
  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDisplayData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    type: '',
    status: '',
    sortBy: 'name'
  });

  // Memoized data
  const institutionsData = useMemo(() => {
    const institutionsMap = new Map<string, {
      id: string;
      name: string;
      courses: Set<string>;
      students: Set<string>;
      teachers: Set<string>;
      type: InstitutionDisplayData['type'];
    }>();

    mockCourses.forEach(course => {
      const instId = course.institution.id;
      if (!institutionsMap.has(instId)) {
        institutionsMap.set(instId, {
          id: instId,
          name: course.institution.name,
          courses: new Set(),
          students: new Set(),
          teachers: new Set(),
          type: (course.institution.type as InstitutionDisplayData['type']) || 'Escola',
        });
      }
      const instData = institutionsMap.get(instId)!;
      instData.courses.add(course.id);
      course.students.forEach(studentId => instData.students.add(studentId));
      course.teachers.forEach(teacherId => instData.teachers.add(teacherId));
    });

    return Array.from(institutionsMap.values()).map(inst => {
      const randomStatus = Math.random();
      const status: InstitutionDisplayData['status'] =
        randomStatus > 0.8 ? 'Inativa' :
        randomStatus > 0.7 ? 'Pendente' : 'Ativa';
      
      const unitCount = Math.floor(Math.random() * 5) + 1;
      
      return {
        id: inst.id,
        name: inst.name,
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        status,
        imageUrl: `https://picsum.photos/seed/${inst.id}/600/300`,
        studentCount: inst.students.size,
        teacherCount: inst.teachers.size,
        courseCount: inst.courses.size,
        unitCount,
        type: inst.type,
        address: `Rua Exemplo, ${Math.floor(Math.random() * 1000)}, Bairro Centro`,
        units: Array.from({ length: unitCount }, (_, i) => ({
          id: `unit-${inst.id}-${i + 1}`,
          name: i === 0 ? `${inst.name} - Campus Principal` : `${inst.name} - Unidade ${i}`
        }))
      };
    });
  }, []);

  // Filtered and sorted data
  const filteredInstitutions = useMemo(() => {
    let result = [...institutionsData];
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(inst =>
        inst.name.toLowerCase().includes(searchLower) ||
        inst.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(inst => inst.type === filters.type);
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(inst => inst.status === filters.status);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'students':
          return b.studentCount - a.studentCount;
        case 'date':
          // Mock date sorting - in real app would use actual dates
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });
    
    return result;
  }, [institutionsData, filters]);

  const totalPages = Math.ceil(filteredInstitutions.length / ITEMS_PER_PAGE);
  
  const paginatedInstitutions = useMemo(
    () => filteredInstitutions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    ),
    [filteredInstitutions, currentPage]
  );

  // Statistics
  const statistics = useMemo(() => ({
    total: institutionsData.length,
    students: mockStudents.length,
    teachers: mockTeachers.length,
    courses: mockCourses.length
  }), [institutionsData]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      type: '',
      status: '',
      sortBy: 'name'
    });
    setCurrentPage(1);
  }, []);

  const handleOpenEditModal = useCallback((institution: InstitutionDisplayData) => {
    setSelectedInstitution(institution);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedInstitution(null);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Instituições</h1>
            <p className="text-gray-600">Gerencie as instituições de ensino cadastradas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Importar Dados
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Nova Instituição
            </button>
          </div>
        </header>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total de Instituições"
            value={statistics.total}
            trend={{ value: '↑ 2', label: 'este mês' }}
          />
          <StatCard
            title="Alunos Ativos"
            value={statistics.students}
            trend={{ value: '↑ 8%', label: 'este mês' }}
          />
          <StatCard
            title="Professores"
            value={statistics.teachers}
            trend={{ value: '↑ 12', label: 'este mês' }}
          />
          <StatCard
            title="Cursos Ativos"
            value={statistics.courses}
            trend={{ value: '↑ 5', label: 'este mês' }}
          />
        </section>

        {/* Filters */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Pesquisar instituições..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="">Todos os Tipos</option>
              {INSTITUTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="">Todos os Status</option>
              {INSTITUTION_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="students">Ordenar por Alunos</option>
              <option value="date">Ordenar por Data</option>
            </select>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={!Object.values(filters).some(v => v && v !== 'name')}
            >
              Limpar Filtros
            </button>
          </div>
        </section>

        {/* Institutions Grid */}
        <main>
          {paginatedInstitutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedInstitutions.map((institution) => (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-500 text-lg">Nenhuma instituição encontrada com os filtros aplicados.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:text-primary-dark font-medium transition-colors duration-200"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </main>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-between" aria-label="Pagination">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {filteredInstitutions.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredInstitutions.length)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{filteredInstitutions.length}</span> instituições
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      pages.push(1);
                      
                      if (currentPage > 3) {
                        pages.push('...');
                      }
                      
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }
                      
                      if (currentPage < totalPages - 2) {
                        pages.push('...');
                      }
                      
                      if (!pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                            page === currentPage
                              ? 'z-10 bg-primary/10 border-primary text-primary'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          aria-current={page === currentPage ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Next"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </nav>
        )}
      </div>
      
      {/* Modals */}
      <InstitutionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        institution={selectedInstitution}
      />
      
      <InstitutionAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </>
  );
}
