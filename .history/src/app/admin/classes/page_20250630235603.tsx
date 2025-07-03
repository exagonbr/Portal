'use client'

import React, { useState, useEffect } from 'react';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClassEditModal } from '@/components/ClassEditModal';
import { useToast } from '@/components/ToastManager';
import { classService } from '@/services/classService';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';
import { ClassResponseDto, ClassCreateDto, ClassUpdateDto } from '@/types/api';

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassResponseDto | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    course_id: '',
    teacher_id: '',
    status: '',
    active: ''
  });
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadClasses();
  }, [currentPage, filters]);

  const { showSuccess, showError } = useToast();
  
  const loadData = async () => {
    try {
      const [coursesResponse, teachersResponse] = await Promise.all([
        courseService.getCourses(),
        userService.getUsers({ roleId: 'TEACHER' })
      ]);

      setCourses(coursesResponse.items.map(course => ({
        id: course.id,
        name: course.name
      })));

      setTeachers(teachersResponse.items.map(teacher => ({
        id: String(teacher.id),
        name: teacher.name
      })));
    } catch (error) {
      showError('Erro ao carregar dados');
    }
  };

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const response = await classService.search(filters.search, {
        page: currentPage,
        course_id: filters.course_id || undefined,
        teacher_id: filters.teacher_id || undefined,
        status: filters.status || undefined,
        active: filters.active ? filters.active === 'true' : undefined
      });
      // Tratando response.items de forma segura para evitar erros de tipo
      // Convertendo para unknown primeiro para evitar erro de tipo
      const items = response.items;
      if (Array.isArray(items)) {
        setClasses(items as unknown as ClassResponseDto[]);
      } else {
        setClasses([]);
      }
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      showError('Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: { id: string | number }) => {
    // Encontrar a classe completa pelo ID
    const classData = classes.find(c => c.id === item.id);
    if (classData) {
      setSelectedClass(classData);
      setIsModalOpen(true);
    } else {
      showError('Classe não encontrada');
    }
  };

  const handleDelete = async (item: { id: string | number }) => {
    const id = String(item.id);
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      await classService.deactivate(id);
      showSuccess('Turma excluída com sucesso!');
      loadClasses();
    } catch (error) {
      showError('Erro ao excluir turma');
    }
  };

  const handleSave = async (data: ClassCreateDto | ClassUpdateDto) => {
    try {
      if (selectedClass) {
        // Para atualização, usamos o tipo ClassUpdateDto
        await classService.update(selectedClass.id, data as ClassUpdateDto);
        showSuccess('Turma atualizada com sucesso!');
      } else {
        // Para criação, garantimos que data seja tratado como ClassCreateDto
        await classService.create(data as ClassCreateDto);
        showSuccess('Turma criada com sucesso!');
      }
      loadClasses();
    } catch (error) {
      showError('Erro ao salvar turma');
      throw error;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (item: ClassResponseDto) => item.name
    },
    {
      key: 'course',
      label: 'Curso',
      render: (item: ClassResponseDto) => item.course?.name || '-'
    },
    {
      key: 'teacher',
      label: 'Professor',
      render: (item: ClassResponseDto) => item.teacher?.name || '-'
    },
    {
      key: 'students',
      label: 'Alunos',
      render: (item: ClassResponseDto) => item.students?.length || 0
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: ClassResponseDto) => (
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
        <h1 className="text-2xl font-bold">Turmas</h1>
        <Button onClick={handleAdd}>Nova Turma</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar turmas..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="p-2 border rounded-md"
          value={filters.course_id}
          onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
        >
          <option value="">Todos os cursos</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded-md"
          value={filters.teacher_id}
          onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value })}
        >
          <option value="">Todos os professores</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded-md"
          value={filters.active}
          onChange={(e) => setFilters({ ...filters, active: e.target.value })}
        >
          <option value="">Todos os status</option>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
      </div>

      <GenericCRUD
        title="Turmas"
        entityName="Turma"
        data={classes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && (
        <ClassEditModal
          classData={selectedClass}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
} 