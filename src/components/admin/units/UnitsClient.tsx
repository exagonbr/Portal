'use client';

import React, { useState, useEffect } from 'react';
import { UnitDto } from '@/types/unit';
import { unitService } from '@/services/unitService';
import { UnitsTable } from './UnitsTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const UnitsClient: React.FC = () => {
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchUnits = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await unitService.getAll({ page, limit: pageSize });
      setUnits(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch units', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (unit: UnitDto) => {
    // Lógica para editar
    console.log('Edit:', unit);
  };

  const handleDelete = (unit: UnitDto) => {
    // Lógica para deletar
    console.log('Delete:', unit);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Unidade
        </Button>
      </div>
      <UnitsTable
        units={units}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};