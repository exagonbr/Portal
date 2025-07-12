'use client';

import React, { useState, useEffect } from 'react';
import { InstitutionDto } from '@/types/institution';
import { institutionService } from '@/services/institutionService';
import { InstitutionsTable } from './InstitutionsTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const InstitutionsClient: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchInstitutions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await institutionService.getAll({ page, limit: pageSize });
      setInstitutions(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (institution: InstitutionDto) => {
    // Lógica para editar
    console.log('Edit:', institution);
  };

  const handleDelete = (institution: InstitutionDto) => {
    // Lógica para deletar
    console.log('Delete:', institution);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Instituição
        </Button>
      </div>
      <InstitutionsTable
        institutions={institutions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};