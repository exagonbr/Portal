'use client';

import React, { useState, useEffect } from 'react';
import { SubjectDto } from '@/types/subject';
import { subjectService } from '@/services/subjectService';
import { SubjectsTable } from './SubjectsTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const SubjectsClient: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchSubjects = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await subjectService.getSubjects({ page, limit: pageSize });
      setSubjects(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (subject: SubjectDto) => {
    // Lógica para editar
    console.log('Edit:', subject);
  };

  const handleDelete = (subject: SubjectDto) => {
    // Lógica para deletar
    console.log('Delete:', subject);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Disciplina
        </Button>
      </div>
      <SubjectsTable
        subjects={subjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};