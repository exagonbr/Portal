'use client';

import React from 'react';
import { RoleDto } from '@/types/roles';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface RolesTableProps {
  roles: RoleDto[];
  onEdit: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const RolesTable: React.FC<RolesTableProps> = ({ roles, onEdit, onDelete, loading, pagination }) => {
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
      key: 'users_count',
      title: 'Usuários',
      dataIndex: 'users_count',
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
      render: (_: any, record: RoleDto) => (
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
      data={roles}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};