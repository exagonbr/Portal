'use client'

import React, { useState, useEffect } from 'react';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClassEditModal } from '@/components/ClassEditModal';
import { toast } from 'react-hot-toast';
import { classService } from '@/services/classService';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';
import { ClassResponseDto } from '@/types/api';

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

  const loadData = async () => {
    try {
      const [coursesResponse, teachersResponse] = await Promise.all([
        courseService.list(),
        userService.list({ role: 'TEACHER' })
      ]);

      setCourses(coursesResponse.map(course => ({
        id: course.id,
        name: course.name
      })));

      setTeachers(teachersResponse.data.map(teacher => ({
        id: teacher.id,
        name: teacher.name
      })));
    } catch (error) {
      toast.error('Erro ao carregar dados');
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
      setClasses(response.data);
      setTotalItems(response.total);
    } catch (error) {
      toast.error('Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedClass(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (classData: ClassResponseDto) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      await classService.delete(id);
      toast.success('Turma excluída com sucesso!');
      loadClasses();
    } catch (error) {
      toast.error('Erro ao excluir turma');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedClass) {
        await classService.update(selectedClass.id, data);
        toast.success('Turma atualizada com sucesso!');
      } else {
        await classService.create(data);
        toast.success('Turma criada com sucesso!');
      }
      loadClasses();
    } catch (error) {
      toast.error('Erro ao salvar turma');
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
      key: 'course',
      label: 'Curso',
      render: (item: any) => item.course?.name || '-'
    },
    { 
      key: 'teacher',
      label: 'Professor',
      render: (item: any) => item.teacher?.name || '-'
    },
    { 
      key: 'students',
      label: 'Alunos',
      render: (item: any) => item.students?.length || 0
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
        <h1 className="text-2xl font-bold">Turmas</h1>
        <Button onClick={handleAdd}>Nova Turma</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar turmas..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.course_id}
          onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
        >
          <option value="">Todos os cursos</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.teacher_id}
          onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value })}
        >
          <option value="">Todos os professores</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.active}
          onChange={(e) => setFilters({ ...filters, active: e.target.value })}
        >
          <option value="">Todos os status</option>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </Select>
      </div>

      <GenericCRUD
        data={classes}
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
        <ClassEditModal
          classData={selectedClass}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
} 