'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { mockStudents, mockTeachers, mockCourses } from '@/constants/mockData';
import UnitEditModal from '@/components/UnitEditModal';
import UnitAddModal from '@/components/UnitAddModal';

// Types
interface UnitDisplayData {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  location: string;
  status: 'Ativa' | 'Inativa' | 'Em Manutenção';
  imageUrl?: string;
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  type: 'Campus Principal' | 'Unidade' | 'Polo' | 'Extensão';
  address: string;
  phone?: string;
  email?: string;
  coordinator?: string;
}

interface FilterState {
  searchTerm: string;
  type: string;
  status: string;
  institution: string;
}

// Constants
const ITEMS_PER_PAGE = 6;
const UNIT_TYPES: UnitDisplayData['type'][] = ['Campus Principal', 'Unidade', 'Polo', 'Extensão'];
const UNIT_STATUSES: UnitDisplayData['status'][] = ['Ativa', 'Inativa', 'Em Manutenção'];
const COORDINATOR_NAMES = {
  first: ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda'],
  last: ['Silva', 'Santos', 'Oliveira', 'Costa', 'Pereira', 'Rodrigues']
};

// Helper functions
const generateUnitData = (
  institution: any,
  index: number,
  unitCourses: any[],
  unitStudents: Set<string>,
  unitTeachers: Set<string>
): UnitDisplayData => {
  const unitId = `unit-${institution.id}-${index + 1}`;
  const isMainCampus = index === 0;
  
  return {
    id: unitId,
    name: isMainCampus
      ? `${institution.name} - Campus Principal`
      : `${institution.name} - Unidade ${index}`,
    institutionId: institution.id,
    institutionName: institution.name,
    location: `Cidade ${institution.id}, Estado`,
    status: isMainCampus ? 'Ativa' : UNIT_STATUSES[Math.floor(Math.random() * UNIT_STATUSES.length)],
    imageUrl: `https://picsum.photos/seed/${unitId}/600/300`,
    studentCount: unitStudents.size,
    teacherCount: unitTeachers.size,
    courseCount: unitCourses.length,
    type: isMainCampus ? 'Campus Principal' : UNIT_TYPES[Math.floor(Math.random() * (UNIT_TYPES.length - 1)) + 1],
    address: `Rua ${institution.name}, ${Math.floor(Math.random() * 1000)}, Bairro Centro`,
    phone: `(11) ${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `contato@${institution.name.toLowerCase().replace(/\s/g, '')}-unidade${index + 1}.edu.br`,
    coordinator: `Prof. Dr. ${COORDINATOR_NAMES.first[Math.floor(Math.random() * COORDINATOR_NAMES.first.length)]} ${COORDINATOR_NAMES.last[Math.floor(Math.random() * COORDINATOR_NAMES.last.length)]}`
  };
};

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

const UnitCard: React.FC<{
  unit: UnitDisplayData;
  onEdit: (unit: UnitDisplayData) => void;
}> = ({ unit, onEdit }) => {
  const typeColors = {
    'Campus Principal': 'bg-accent-purple/20 text-accent-purple',
    'Unidade': 'bg-primary/10 text-primary',
    'Polo': 'bg-accent-blue/20 text-accent-blue',
    'Extensão': 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    'Ativa': 'bg-accent-green/20 text-accent-green',
    'Inativa': 'bg-error/20 text-error',
    'Em Manutenção': 'bg-accent-yellow/20 text-accent-yellow'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={unit.imageUrl}
          alt={unit.name}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[unit.type]}`}>
            {unit.type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{unit.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{unit.institutionName}</p>
            <p className="text-xs text-gray-500">{unit.location}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-sm ${statusColors[unit.status]}`}>
            {unit.status}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          {[
            { label: 'Alunos', value: unit.studentCount },
            { label: 'Professores', value: unit.teacherCount },
            { label: 'Cursos', value: unit.courseCount }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        {unit.coordinator && (
          <div className="text-sm text-gray-600 mb-4 border-t pt-3">
            <span className="font-medium">Coordenador:</span> {unit.coordinator}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(unit)}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Detalhes
            </button>
            <button
              onClick={() => onEdit(unit)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUnitsPage() {
  const { user } = useAuth();
  
  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitDisplayData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    type: '',
    status: '',
    institution: ''
  });

  // Memoized data
  const institutions = useMemo(
    () => Array.from(new Map(mockCourses.map(course => [course.institution.id, course.institution])).values()),
    []
  );

  const allUnits = useMemo(() => {
    const units: UnitDisplayData[] = [];
    
    institutions.forEach(institution => {
      const unitCount = Math.floor(Math.random() * 3) + 2;
      const institutionCourses = mockCourses.filter(c => c.institution.id === institution.id);
      
      for (let i = 0; i < unitCount; i++) {
        const unitCourses = institutionCourses.slice(
          Math.floor(institutionCourses.length / unitCount) * i,
          Math.floor(institutionCourses.length / unitCount) * (i + 1)
        );
        
        const unitStudents = new Set<string>();
        const unitTeachers = new Set<string>();
        
        unitCourses.forEach(course => {
          course.students.forEach(s => unitStudents.add(s));
          course.teachers.forEach(t => unitTeachers.add(t));
        });
        
        units.push(generateUnitData(institution, i, unitCourses, unitStudents, unitTeachers));
      }
    });
    
    return units;
  }, [institutions]);

  // Filtered and paginated data
  const filteredUnits = useMemo(() => {
    let result = allUnits;
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(unit =>
        unit.name.toLowerCase().includes(searchLower) ||
        unit.institutionName.toLowerCase().includes(searchLower) ||
        unit.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.type) {
      result = result.filter(unit => unit.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter(unit => unit.status === filters.status);
    }
    
    if (filters.institution) {
      result = result.filter(unit => unit.institutionId === filters.institution);
    }
    
    return result;
  }, [allUnits, filters]);

  const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);
  
  const paginatedUnits = useMemo(
    () => filteredUnits.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    ),
    [filteredUnits, currentPage]
  );

  // Statistics
  const statistics = useMemo(() => ({
    total: allUnits.length,
    active: allUnits.filter(u => u.status === 'Ativa').length,
    students: allUnits.reduce((sum, unit) => sum + unit.studentCount, 0),
    teachers: allUnits.reduce((sum, unit) => sum + unit.teacherCount, 0)
  }), [allUnits]);

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
      institution: ''
    });
    setCurrentPage(1);
  }, []);

  const handleOpenEditModal = useCallback((unit: UnitDisplayData) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedUnit(null);
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
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Unidades de Ensino</h1>
            <p className="text-gray-600">Gerencie as unidades e campus das instituições</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Importar Unidades
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Nova Unidade
            </button>
          </div>
        </header>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total de Unidades"
            value={statistics.total}
            trend={{ value: '↑ 3', label: 'este mês' }}
          />
          <StatCard
            title="Unidades Ativas"
            value={statistics.active}
            trend={{
              value: `${Math.round((statistics.active / statistics.total) * 100)}%`,
              label: 'do total'
            }}
          />
          <StatCard
            title="Total de Alunos"
            value={statistics.students}
            trend={{ value: '↑ 15%', label: 'este semestre' }}
          />
          <StatCard
            title="Total de Professores"
            value={statistics.teachers}
            trend={{ value: '↑ 8', label: 'novos este mês' }}
          />
        </section>

        {/* Filters */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Pesquisar unidades..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            />
            <select
              value={filters.institution}
              onChange={(e) => handleFilterChange('institution', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="">Todas as Instituições</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="">Tipo de Unidade</option>
              {UNIT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
            >
              <option value="">Status</option>
              {UNIT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={!Object.values(filters).some(v => v)}
            >
              Limpar Filtros
            </button>
          </div>
        </section>

        {/* Units Grid */}
        <main>
          {paginatedUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Nenhuma unidade encontrada com os filtros aplicados.</p>
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
                    {filteredUnits.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredUnits.length)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{filteredUnits.length}</span> unidades
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
      <UnitEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        unit={selectedUnit}
      />
      
      <UnitAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </>
  );
}
