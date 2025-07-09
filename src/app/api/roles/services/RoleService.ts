import { RoleRepository, RoleSearchParams } from '../repositories/RoleRepository';
import { Prisma } from '@prisma/client';

export interface RoleResponseDto {
  id: string;
  name: string;
  description: string;
  active: boolean;
  users_count: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export class RoleService {
  private repository: RoleRepository;

  constructor() {
    this.repository = new RoleRepository();
  }

  private mapToResponseDto(role: any): RoleResponseDto {
    return {
      id: String(role.id),
      name: role.display_name || '',
      description: role.authority || '',
      active: true, // Por enquanto todas as roles são ativas
      users_count: 0, // Por enquanto não temos contagem de usuários
      created_at: role.created_at.toISOString(),
      updated_at: role.updated_at.toISOString(),
      status: 'active' // Por enquanto todas as roles são ativas
    };
  }

  async findAll(params: RoleSearchParams): Promise<{
    roles: RoleResponseDto[];
    total: number;
  }> {
    const roles = await this.repository.findMany(params);
    return {
      roles: roles.map(this.mapToResponseDto),
      total: roles.length
    };
  }

  async findById(id: string): Promise<RoleResponseDto | null> {
    const role = await this.repository.findById(id);
    if (!role) return null;
    return this.mapToResponseDto(role);
  }

  async create(data: {
    name: string;
    description?: string;
  }): Promise<RoleResponseDto> {
    const role = await this.repository.create({
      display_name: data.name,
      authority: data.description || data.name,
      version: 1
    });
    return this.mapToResponseDto(role);
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
  }): Promise<RoleResponseDto> {
    const updateData: Prisma.rolesUpdateInput = {};
    if (data.name) updateData.display_name = data.name;
    if (data.description) updateData.authority = data.description;

    const role = await this.repository.update(id, updateData);
    return this.mapToResponseDto(role);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
} 