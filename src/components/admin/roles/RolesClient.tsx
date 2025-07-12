'use client';

import React, { useState, useEffect } from 'react';
import { RoleDto } from '@/types/roles';
import { roleService } from '@/services/roleService';
import { RolesTable } from './RolesTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const RolesClient: React.FC = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchRoles = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await roleService.getRoles({ page, limit: pageSize });
      setRoles(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch roles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (role: RoleDto) => {
    // Lógica para editar
    console.log('Edit:', role);
  };

  const handleDelete = (role: RoleDto) => {
    // Lógica para deletar
    console.log('Delete:', role);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Função
        </Button>
      </div>
      <RolesTable
        roles={roles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};