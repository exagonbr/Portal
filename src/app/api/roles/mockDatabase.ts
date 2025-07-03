import { RoleResponseDto } from '@/types/api';
import { UserRole, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_PERMISSIONS } from '@/types/roles';

// Mock database para roles
export const mockRoles = new Map<string, RoleResponseDto>();

// Inicializa com roles padrão baseadas no enum UserRole
Object.values(UserRole).forEach((role, index) => {
  const roleId = `role_${index + 1}`;
  mockRoles.set(roleId, {
    id: roleId,
    name: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role],
    permissions: Object.entries(ROLE_PERMISSIONS[role])
      .filter(([_, value]) => value === true)
      .map(([key]) => key),
    status: 'active',
    active: true,
    users_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
});

// Funções auxiliares
export function findRoleByName(name: string): RoleResponseDto | undefined {
  return Array.from(mockRoles.values()).find(
    role => role.name.toLowerCase() === name.toLowerCase()
  );
}

export function findRoleById(id: string): RoleResponseDto | undefined {
  return mockRoles.get(id);
}

export function getRoleStats() {
  const roles = Array.from(mockRoles.values());
  const total = roles.length;
  const active = roles.filter(role => role.active).length;
  const inactive = total - active;
  
  // Simula contagem de usuários por role
  const usersCount: Record<string, number> = {};
  roles.forEach(role => {
    usersCount[role.id] = role.users_count || Math.floor(Math.random() * 50);
  });
  
  return {
    total,
    active,
    inactive,
    usersCount
  };
}