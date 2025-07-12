'use client';

import React from 'react';
import { ThemeDto } from '@/types/theme';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface ThemesTableProps {
  themes: ThemeDto[];
  onEdit: (theme: ThemeDto) => void;
  onDelete: (theme: ThemeDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const ThemesTable: React.FC<ThemesTableProps> = ({ themes, onEdit, onDelete, loading, pagination }) => {
  const columns = [
    {
      key: 'name',
      title: 'Nome',
      dataIndex: 'name',
    },
    {
      key: 'description',
      title: 'Descrição',
      dataIndex: 'description',
    },
    {
      key: 'is_active',
      title: 'Status',
      dataIndex: 'is_active',
      render: (isActive: boolean) => (isActive ? 'Ativo' : 'Inativo'),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: ThemeDto) => (
        <div className="flex space-x-2">
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
      data={themes}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};