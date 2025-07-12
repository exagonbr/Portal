'use client';

import React, { useState, useEffect } from 'react';
import { UserDto } from '@/types/user';
import { userService } from '@/services/userService';
import { UsersTable } from './UsersTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const UsersClient: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await userService.getUsers({ page, limit: pageSize });
      setUsers(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (user: UserDto) => {
    // Lógica para editar
    console.log('Edit:', user);
  };

  const handleDelete = (user: UserDto) => {
    // Lógica para deletar
    console.log('Delete:', user);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>
      <UsersTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};