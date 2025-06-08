'use client'

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { CourseEditModal } from '@/components/CourseEditModal';
import { toast } from 'react-hot-toast';
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
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Nível', accessorKey: 'level' },
    { header: 'Tipo', accessorKey: 'type' },
    {
      header: 'Instituição',
      accessorKey: 'institution',
      cell: ({ row }: any) => row.original.institution?.name || '-'
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.active ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'
        }`}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      header: 'Ações',
      accessorKey: 'actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            Excluir
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Button variant="default" onClick={handleAdd}>Novo Curso</Button>
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

      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalItems,
          onPageChange: setCurrentPage
        }}
      />

      <CourseEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        course={selectedCourse}
        title={selectedCourse ? 'Editar Curso' : 'Novo Curso'}
      />
    </div>
  );
} 