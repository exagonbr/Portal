import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RoleService } from '../services/RoleService';
import { getCorsHeaders } from '@/config/cors';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional()
});

// Schema de validação para atualização de role
const updateRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional()
});

export class RoleController {
  private service: RoleService;

  constructor() {
    this.service = new RoleService();
  }

  async list(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const search = url.searchParams.get('search') || undefined;

      const { roles, total } = await this.service.findAll({ search, limit });

      return NextResponse.json({
        success: true,
        data: roles,
        total,
        page: 1,
        limit,
        totalPages: 1
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });

    } catch (error) {
      console.error('Erro ao listar roles:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
      );
    }
  }

  async getById(request: NextRequest, id: string) {
    try {
      const session = await getAuthentication(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      const role = await this.service.findById(id);
      if (!role) {
        return NextResponse.json(
          { success: false, error: 'Role não encontrada' },
          { status: 404, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      return NextResponse.json({
        success: true,
        data: role
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });

    } catch (error) {
      console.error('Erro ao buscar role:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
      );
    }
  }

  async create(request: NextRequest) {
    try {
      const session = await getAuthentication(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
        return NextResponse.json(
          { success: false, error: 'Sem permissão para criar roles' },
          { status: 403, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      const body = await request.json();

      const validationResult = createRoleSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        }, {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }

      const role = await this.service.create(validationResult.data);

      return NextResponse.json({
        success: true,
        data: role,
        message: 'Role criada com sucesso'
      }, {
        status: 201,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });

    } catch (error) {
      console.error('Erro ao criar role:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
      );
    }
  }

  async update(request: NextRequest, id: string) {
    try {
      const session = await getAuthentication(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
        return NextResponse.json(
          { success: false, error: 'Sem permissão para atualizar roles' },
          { status: 403, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      const body = await request.json();

      const validationResult = updateRoleSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        }, {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }

      const role = await this.service.update(id, validationResult.data);

      return NextResponse.json({
        success: true,
        data: role,
        message: 'Role atualizada com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });

    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
      );
    }
  }

  async delete(request: NextRequest, id: string) {
    try {
      const session = await getAuthentication(request);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
        return NextResponse.json(
          { success: false, error: 'Sem permissão para deletar roles' },
          { status: 403, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
        );
      }

      await this.service.delete(id);

      return NextResponse.json({
        success: true,
        message: 'Role deletada com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });

    } catch (error) {
      console.error('Erro ao deletar role:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500, headers: getCorsHeaders(request.headers.get('origin') || undefined) }
      );
    }
  }
} 