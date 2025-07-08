import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface RoleSearchParams {
  search?: string;
  limit?: number;
}

export class RoleRepository {
  async findMany(params: RoleSearchParams) {
    const { search, limit = 50 } = params;

    const where: Prisma.rolesWhereInput = {};
    if (search) {
      where.OR = [
        { display_name: { contains: search, mode: 'insensitive' } },
        { authority: { contains: search, mode: 'insensitive' } }
      ];
    }

    return prisma.roles.findMany({
      where,
      select: {
        id: true,
        authority: true,
        display_name: true,
        version: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { display_name: 'asc' },
      take: Math.min(limit, 1000)
    });
  }

  async findById(id: string | number) {
    return prisma.roles.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        authority: true,
        display_name: true,
        version: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async create(data: Prisma.rolesCreateInput) {
    return prisma.roles.create({
      data,
      select: {
        id: true,
        authority: true,
        display_name: true,
        version: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async update(id: string | number, data: Prisma.rolesUpdateInput) {
    return prisma.roles.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        authority: true,
        display_name: true,
        version: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async delete(id: string | number) {
    return prisma.roles.delete({
      where: { id: Number(id) }
    });
  }
} 