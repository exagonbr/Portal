'use client';

import React from 'react';
import { FilesDto } from '@/services/filesService';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface FilesTableProps {
  files: FilesDto[];
  onEdit: (file: FilesDto) => void;
  onDelete: (file: FilesDto) => void;
  onDownload: (file: FilesDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const FilesTable: React.FC<FilesTableProps> = ({ files, onEdit, onDelete, onDownload, loading, pagination }) => {
  const columns = [
    {
      key: 'name',
      title: 'Nome',
      dataIndex: 'name',
    },
    {
      key: 'content_type',
      title: 'Tipo',
      dataIndex: 'content_type',
    },
    {
      key: 'size',
      title: 'Tamanho',
      dataIndex: 'size',
      render: (size: number) => {
        if (!size) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
      },
    },
    {
      key: 'is_public',
      title: 'Visibilidade',
      dataIndex: 'is_public',
      render: (isPublic: boolean) => (
        <Badge variant={isPublic ? 'success' : 'secondary'}>{isPublic ? 'Público' : 'Privado'}</Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: FilesDto) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onDownload(record)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(record)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={files}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};