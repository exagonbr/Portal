'use client';

import React from 'react';
import { InstitutionDto } from '@/types/institution';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface InstitutionsTableProps {
  institutions: InstitutionDto[];
  onEdit: (institution: InstitutionDto) => void;
  onDelete: (institution: InstitutionDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const InstitutionsTable: React.FC<InstitutionsTableProps> = ({ institutions, onEdit, onDelete, loading, pagination }) => {
  const columns = [
    {
      key: 'name',
      title: 'Nome',
      dataIndex: 'name',
    },
    {
      key: 'document',
      title: 'CNPJ',
      dataIndex: 'document',
    },
    {
      key: 'is_active',
      title: 'Status',
      dataIndex: 'is_active',
      render: (isActive: boolean) => (isActive ? 'Ativa' : 'Inativa'),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: InstitutionDto) => (
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
      data={institutions}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};