import { RoleResponseDto, PaginatedResponse, RoleFilterDto } from '@/types/api';

const roles: RoleResponseDto[] = [
  {
    id: 1,
    name: 'SYSTEM_ADMIN',
    description: 'Administrador do Sistema',
    active: true,
    users_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 2,
    name: 'TEACHER',
    description: 'Professor',
    active: true,
    users_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 3,
    name: 'STUDENT',
    description: 'Estudante',
    active: true,
    users_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
  },
];

export const getRoles = async (params: RoleFilterDto = {}): Promise<PaginatedResponse<RoleResponseDto>> => {
  console.log('Usando mock: getRoles');
  return Promise.resolve({
    items: roles,
    total: roles.length,
    page: params.page || 1,
    limit: params.limit || 10,
    totalPages: 1,
  });
};

export const roleService = {
  getRoles,
};