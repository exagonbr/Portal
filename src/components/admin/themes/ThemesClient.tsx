'use client';

import React, { useState, useEffect } from 'react';
import { ThemeDto } from '@/types/theme';
import { themeService } from '@/services/themeService';
import { ThemesTable } from './ThemesTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const ThemesClient: React.FC = () => {
  const [themes, setThemes] = useState<ThemeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchThemes = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await themeService.getThemes({ page, limit: pageSize });
      setThemes(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch themes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (theme: ThemeDto) => {
    // Lógica para editar
    console.log('Edit:', theme);
  };

  const handleDelete = (theme: ThemeDto) => {
    // Lógica para deletar
    console.log('Delete:', theme);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tema
        </Button>
      </div>
      <ThemesTable
        themes={themes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};