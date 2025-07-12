'use client';

import React from 'react';
import { UserDto } from '@/types/user';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface UsersTableProps {
  users: UserDto[];
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete, loading, pagination }) => {
  const columns = [
    {
      key: 'name',
      title: 'Nome',
      dataIndex: 'name',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
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
      render: (_: any, record: UserDto) => (
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
      data={users}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};