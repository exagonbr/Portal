'use client';

import React, { useState, useEffect } from 'react';
import { AuthorDto } from '@/types/author';
import { authorService } from '@/services/authorService';
import { AuthorsTable } from './AuthorsTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const AuthorsClient: React.FC = () => {
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchAuthors = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await authorService.getAuthors({ page, limit: pageSize });
      setAuthors(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch authors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (author: AuthorDto) => {
    // Lógica para editar
    console.log('Edit:', author);
  };

  const handleDelete = (author: AuthorDto) => {
    // Lógica para deletar
    console.log('Delete:', author);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Autor
        </Button>
      </div>
      <AuthorsTable
        authors={authors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};