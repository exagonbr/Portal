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
      const response = await institutionService.list();
      setInstitutions(response.data.map(inst => ({
        id: inst.id,
        name: inst.name
      })));
    } catch (error) {
      toast.error('Erro ao carregar instituições');
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.search(filters.search, {
        page: currentPage,
        institution_id: filters.institution_id || undefined,
        level: filters.level || undefined,
        type: filters.type || undefined,
        active: filters.active ? filters.active === 'true' : undefined
      });
      setCourses(response.data);
      setTotalItems(response.total);
    } catch (error) {
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (course: CourseResponseDto) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      await courseService.delete(id);
      toast.success('Curso excluído com sucesso!');
      loadCourses();
    } catch (error) {
      toast.error('Erro ao excluir curso');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedCourse) {
        await courseService.update(selectedCourse.id, data);
        toast.success('Curso atualizado com sucesso!');
      } else {
        await courseService.create(data);
        toast.success('Curso criado com sucesso!');
      }
      loadCourses();
    } catch (error) {
      toast.error('Erro ao salvar curso');
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
          onChange={(e) => setFilters({ ...filters, institution_id: e.target.value })}
        >
          <option value="">Todas as instituições</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          <option value="">Todos os níveis</option>
          <option value="FUNDAMENTAL">Ensino Fundamental</option>
          <option value="MEDIO">Ensino Médio</option>
          <option value="SUPERIOR">Ensino Superior</option>
          <option value="POS_GRADUACAO">Pós-Graduação</option>
          <option value="MESTRADO">Mestrado</option>
          <option value="DOUTORADO">Doutorado</option>
        </Select>
        <Select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Todos os tipos</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="EAD">EAD</option>
          <option value="HIBRIDO">Híbrido</option>
        </Select>
      </div>

      <GenericCRUD
        data={courses}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        pagination={{
          currentPage,
          totalItems,
          onPageChange: setCurrentPage
        }}
      />

      {isModalOpen && (
        <CourseEditModal
          course={selectedCourse}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
} 