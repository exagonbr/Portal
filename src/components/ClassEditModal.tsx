'use client'

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Switch } from './Switch';
import { toast } from 'react-hot-toast';
import { ClassResponseDto, ClassCreateDto, ClassUpdateDto } from '@/types/api';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';

interface ClassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClassCreateDto | ClassUpdateDto) => Promise<void>;
  class?: ClassResponseDto;
  title: string;
}

export function ClassEditModal({ isOpen, onClose, onSave, class: classData, title }: ClassEditModalProps) {
  const [formData, setFormData] = useState<ClassCreateDto | ClassUpdateDto>({
    name: '',
    description: '',
    status: '',
    course_id: '',
    teacher_id: '',
    active: true
  });
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        description: classData.description,
        status: classData.status,
        course_id: classData.course_id,
        teacher_id: classData.teacher_id,
        active: classData.active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: '',
        course_id: '',
        teacher_id: '',
        active: true
      });
    }
  }, [classData]);

  useEffect(() => {
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
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
      toast.success('Turma salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar turma');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            <option value="">Selecione um status</option>
            <option value="PLANNED">Planejada</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Curso</label>
          <Select
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            required
          >
            <option value="">Selecione um curso</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Professor</label>
          <Select
            value={formData.teacher_id}
            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
            required
          >
            <option value="">Selecione um professor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center">
          <Switch
            checked={formData.active}
            onChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <span className="ml-2 text-sm text-gray-700">Ativo</span>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}