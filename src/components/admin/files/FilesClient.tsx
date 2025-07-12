'use client';

import React, { useState, useEffect } from 'react';
import { FilesDto, filesService } from '@/services/filesService';
import { FilesTable } from './FilesTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const FilesClient: React.FC = () => {
  const [files, setFiles] = useState<FilesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFiles = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await filesService.getFiles({ page, limit: pageSize });
      setFiles(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (file: FilesDto) => {
    // Lógica para editar
    console.log('Edit:', file);
  };

  const handleDelete = (file: FilesDto) => {
    // Lógica para deletar
    console.log('Delete:', file);
  };

  const handleDownload = (file: FilesDto) => {
    // Lógica para download
    console.log('Download:', file);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Arquivo
        </Button>
      </div>
      <FilesTable
        files={files}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};