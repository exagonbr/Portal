'use client'

import React, { useState, useEffect } from 'react';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CourseEditModal } from '@/components/CourseEditModal';
import { useToast } from '@/components/ToastManager';
import { courseService } from '@/services/courseService';
import { institutionService } from '@/services/institutionService';
import { CourseResponseDto } from '@/types/api';

export default function CoursesPage() {
  const { showError, showSuccess } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseResponseDto | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    institution_id: '',
    level: '',
    type: '',
    active: ''
  });
  const [courses, setCourses] = useState<CourseResponseDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [currentPage, filters]);

  const loadInstitutions = async () => {
    try {
      const response = await institutionService.getAll();
      setInstitutions(response.map(inst => ({
        id: inst.id,
        name: inst.name
      })));
    } catch (error) {
      showError('Erro ao carregar instituições');
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getCourses({
        page: currentPage,
        filters: {
          search: filters.search || undefined,
          institution_id: filters.institution_id || undefined,
          level: filters.level || undefined,
          type: filters.type || undefined,
          active: filters.active ? filters.active === 'true' : undefined
        }
      });
      setCourses(response.items);
      setTotalItems(response.pagination.total);
    } catch (error) {
      showError('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: { id: string | number }) => {
    const course = courses.find(c => c.id === item.id);
    if (course) {
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (item: { id: string | number }) => {
    const id = String(item.id);
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      await courseService.deleteCourse(id);
      showSuccess('Curso excluído com sucesso!');
      loadCourses();
    } catch (error) {
      showError('Erro ao excluir curso');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, data);
        showSuccess('Curso atualizado com sucesso!');
      } else {
        await courseService.createCourse(data);
        showSuccess('Curso criado com sucesso!');
      }
      loadCourses();
    } catch (error) {
      showError('Erro ao salvar curso');
      throw error;
    }
  };

  const columns = [
    { 
      key: 'name',
      label: 'Nome',
      render: (item: any) => item.name
    },
    { 
      key: 'level',
      label: 'Nível',
      render: (item: any) => item.level
    },
    { 
      key: 'type',
      label: 'Tipo',
      render: (item: any) => item.type
    },
    {
      key: 'institution',
      label: 'Instituição',
      render: (item: any) => item.institution?.name || '-'
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Button onClick={handleAdd}>Novo Curso</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar cursos..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.institution_id}
          onChange={(value) => setFilters({ ...filters, institution_id: value as string })}
          options={[
            { value: '', label: 'Todas as instituições' },
            ...institutions.map((inst) => ({
              value: inst.id,
              label: inst.name
            }))
          ]}
        />
        <Select
          value={filters.level}
          onChange={(value) => setFilters({ ...filters, level: value as string })}
          options={[
            { value: '', label: 'Todos os níveis' },
            { value: 'FUNDAMENTAL', label: 'Ensino Fundamental' },
            { value: 'MEDIO', label: 'Ensino Médio' },
            { value: 'SUPERIOR', label: 'Ensino Superior' },
            { value: 'POS_GRADUACAO', label: 'Pós-Graduação' },
            { value: 'MESTRADO', label: 'Mestrado' },
            { value: 'DOUTORADO', label: 'Doutorado' }
          ]}
        />
        <Select
          value={filters.type}
          onChange={(value) => setFilters({ ...filters, type: value as string })}
          options={[
            { value: '', label: 'Todos os tipos' },
            { value: 'PRESENCIAL', label: 'Presencial' },
            { value: 'EAD', label: 'EAD' },
            { value: 'HIBRIDO', label: 'Híbrido' }
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
  );
} 