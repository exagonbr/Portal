'use client';

import React from 'react';
import { UnitDto } from '@/types/unit';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface UnitsTableProps {
  units: UnitDto[];
  onEdit: (unit: UnitDto) => void;
  onDelete: (unit: UnitDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const UnitsTable: React.FC<UnitsTableProps> = ({ units, onEdit, onDelete, loading, pagination }) => {
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
      render: (isActive: boolean) => (isActive ? 'Ativa' : 'Inativa'),
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: UnitDto) => (
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
      data={units}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};