'use client'

import React, { useState, useEffect, useCallback } from 'react';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CourseEditModal } from '@/components/CourseEditModal';
import { useToast } from '@/components/ToastManager';
import { courseService, Course } from '@/services/courseService';
import { institutionService } from '@/services/institutionService';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export default function CoursesPage() {
  const { showError, showSuccess } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '' as 'active' | 'inactive' | '',
    category: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (filters.search) {
        queryParams.search = filters.search;
      }
      
      if (filters.status) {
        queryParams.status = filters.status;
      }
      
      if (filters.category) {
        queryParams.category = filters.category;
      }
      
      const response = await courseService.getAll(queryParams) as PaginatedResponse<Course>;
      setCourses(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      showError('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, showError]);

  useEffect(() => {
    loadCourses();
  }, [currentPage, filters, loadCourses]);

  const loadInstitutions = async () => {
    try {
      const response = await institutionService.getAll() as PaginatedResponse<{id: string | number, name: string}>;
      setInstitutions(response.items?.map(inst => ({
        id: String(inst.id),
        name: inst.name
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      showError('Erro ao carregar instituições');
    }
  };

  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: { id: string | number }) => {
    const course = courses.find(c => c.id === Number(item.id));
    if (course) {
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (item: { id: string | number }) => {
    const id = Number(item.id);
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      await courseService.delete(id);
      showSuccess('Curso excluído com sucesso!');
      loadCourses();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      showError('Erro ao excluir curso');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedCourse) {
        await courseService.update(selectedCourse.id, data);
        showSuccess('Curso atualizado com sucesso!');
      } else {
        await courseService.create(data);
        showSuccess('Curso criado com sucesso!');
      }
      setIsModalOpen(false);
      loadCourses();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      showError('Erro ao salvar curso');
      throw error;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const columns = [
    { 
      key: 'name',
      label: 'Nome',
      render: (item: any) => item.name
    },
    { 
      key: 'category',
      label: 'Categoria',
      render: (item: any) => item.category || '-'
    },
    { 
      key: 'duration',
      label: 'Duração',
      render: (item: any) => `${item.duration || 0} horas`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Button onClick={handleAdd}>Novo Curso</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Buscar cursos..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <Select
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value as string)}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' }
          ]}
        />
        <Select
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value as string)}
          options={[
            { value: '', label: 'Todas as categorias' },
            { value: 'TECNOLOGIA', label: 'Tecnologia' },
            { value: 'SAUDE', label: 'Saúde' },
            { value: 'EDUCACAO', label: 'Educação' },
            { value: 'NEGOCIOS', label: 'Negócios' }
          ]}
        />
      </div>

      <GenericCRUD
        title="Cursos"
        entityName="Curso"
        data={courses}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />

      {isModalOpen && (
        <CourseEditModal
          isOpen={isModalOpen}
          course={selectedCourse}
          title={selectedCourse ? 'Editar Curso' : 'Novo Curso'}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
    </DashboardLayout>
  );
} 