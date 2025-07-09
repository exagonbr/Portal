import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/prisma'
import { createStandardApiRoute } from '../lib/api-route-template'
import { roleService } from '@/services/roleService'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
})

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/roles',
  name: 'roles',
  fallbackFunction: async (req: NextRequest) => {
    console.log('🔄 [API-ROLES] Usando serviço de roles');
    
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      
      // Usar o serviço de roles
      const result = await roleService.getRoles({
        page,
        limit,
        search
      });
      
      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('❌ [API-ROLES] Erro ao buscar roles via serviço:', error);
      
      // Fallback para banco de dados local
      try {
        console.log('🔄 [API-ROLES] Tentando usar dados locais para roles');
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const search = url.searchParams.get('search');
    
        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
    
        // Tentar buscar do banco de dados
        const dbRoles = await prisma.roles.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            is_active: true,
            created_at: true,
            updated_at: true
          },
          orderBy: { name: 'asc' },
          take: Math.min(limit, 1000), // máximo 1000
        });

        // Converter para o formato esperado
        const roles = dbRoles.map(role => ({
          id: String(role.id),
          name: role.name || '',
          description: role.description || '',
          active: role.is_active,
          users_count: 0, // Campo mantido por compatibilidade
          created_at: role.created_at.toISOString(),
          updated_at: role.updated_at.toISOString(),
          status: role.is_active ? 'active' : 'inactive'
        }));

        return NextResponse.json({
          success: true,
          data: roles,
          total: roles.length,
          page: 1,
          limit: roles.length,
          totalPages: 1,
        }, {
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.warn('⚠️ [API-ROLES] Erro ao buscar do banco local:', dbError);
        
        // Usar dados mock como fallback
        const mockRoles = [
          { id: '1', name: 'Administrador', description: 'Acesso total ao sistema', active: true, users_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'active' },
          { id: '2', name: 'Professor', description: 'Acesso às funcionalidades de ensino', active: true, users_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'active' },
          { id: '3', name: 'Aluno', description: 'Acesso às funcionalidades de aprendizado', active: true, users_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'active' },
          { id: '4', name: 'Coordenador', description: 'Gerencia professores e turmas', active: true, users_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'active' },
          { id: '5', name: 'Secretaria', description: 'Acesso administrativo limitado', active: true, users_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'active' }
        ];

        return NextResponse.json({
          success: true,
          data: mockRoles,
          total: mockRoles.length,
          page: 1,
          limit: mockRoles.length,
          totalPages: 1,
        }, {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }
  }
});

// POST - Criar role
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para criar roles' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const body = await request.json();

    // Validar dados
    const validationResult = createRoleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const roleData = validationResult.data;
    
    console.log('📝 [API-ROLES] Criando role com serviço');
    
    try {
      // Usar o serviço para criar a role
      const newRole = await roleService.createRole({
        name: roleData.name,
        description: roleData.description || '',
        is_active: roleData.is_active
      });
      
      return NextResponse.json({
        success: true,
        data: newRole,
        message: 'Role criada com sucesso'
      }, { 
        status: 201,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    } catch (serviceError) {
      console.error('❌ [API-ROLES] Erro ao criar role via serviço:', serviceError);
      
      // Fallback para banco de dados local
      try {
        // Verificar se já existe role com mesmo nome
        const existingRole = await prisma.roles.findFirst({
          where: { name: roleData.name }
        });
        
        if (existingRole) {
          return NextResponse.json({ error: 'Já existe uma role com este nome' }, { 
            status: 409,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          });
        }
        
        // Criar role no banco local
        const newRole = await prisma.roles.create({
          data: {
            name: roleData.name,
            description: roleData.description || null,
            is_active: roleData.is_active,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Converter para o formato da resposta
        const roleResponse = {
          id: String(newRole.id),
          name: newRole.name || '',
          description: newRole.description || '',
          active: newRole.is_active,
          users_count: 0,
          created_at: newRole.created_at.toISOString(),
          updated_at: newRole.updated_at.toISOString(),
          status: newRole.is_active ? 'active' : 'inactive'
        };

        return NextResponse.json({
          success: true,
          data: roleResponse,
          message: 'Role criada com sucesso'
        }, { 
          status: 201,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.error('❌ [API-ROLES] Erro ao criar role no banco local:', dbError);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { 
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }
  } catch (error) {
    console.log('Erro ao criar role:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// PUT - Atualizar role
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para atualizar roles' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da role é obrigatório' }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('✏️ [API-ROLES] Atualizando role com serviço:', id);
    
    try {
      // Usar o serviço para atualizar a role
      const updatedRole = await roleService.updateRole(Number(id), {
        name: updateData.name,
        description: updateData.description,
        is_active: updateData.is_active
      });
      
      return NextResponse.json({
        success: true,
        data: updatedRole,
        message: 'Role atualizada com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    } catch (serviceError) {
      console.error('❌ [API-ROLES] Erro ao atualizar role via serviço:', serviceError);
      
      // Fallback para banco de dados local
      try {
        // Buscar role existente
        const existingRole = await prisma.roles.findUnique({
          where: { id: Number(id) }
        });
        
        if (!existingRole) {
          return NextResponse.json({ error: 'Role não encontrada' }, { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          });
        }
        
        // Atualizar role
        const updatedRole = await prisma.roles.update({
          where: { id: Number(id) },
          data: {
            name: updateData.name !== undefined ? updateData.name : existingRole.name,
            description: updateData.description !== undefined ? updateData.description : existingRole.description,
            is_active: updateData.is_active !== undefined ? updateData.is_active : existingRole.is_active,
            updated_at: new Date()
          }
        });
        
        // Converter para o formato da resposta
        const roleResponse = {
          id: String(updatedRole.id),
          name: updatedRole.name || '',
          description: updatedRole.description || '',
          active: updatedRole.is_active,
          users_count: 0,
          created_at: updatedRole.created_at.toISOString(),
          updated_at: updatedRole.updated_at.toISOString(),
          status: updatedRole.is_active ? 'active' : 'inactive'
        };
        
        return NextResponse.json({
          success: true,
          data: roleResponse,
          message: 'Role atualizada com sucesso'
        }, {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.error('❌ [API-ROLES] Erro ao atualizar role no banco local:', dbError);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { 
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }
  } catch (error) {
    console.log('Erro ao atualizar role:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// DELETE - Excluir role
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para excluir roles' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'ID da role é obrigatório' }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('🗑️ [API-ROLES] Excluindo role com serviço:', id);
    
    try {
      // Usar o serviço para excluir a role
      await roleService.deleteRole(Number(id));
      
      return NextResponse.json({
        success: true,
        message: 'Role excluída com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    } catch (serviceError) {
      console.error('❌ [API-ROLES] Erro ao excluir role via serviço:', serviceError);
      
      // Fallback para banco de dados local
      try {
        // Verificar se a role existe
        const existingRole = await prisma.roles.findUnique({
          where: { id: Number(id) }
        });
        
        if (!existingRole) {
          return NextResponse.json({ error: 'Role não encontrada' }, { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          });
        }
        
        // Excluir role
        await prisma.roles.delete({
          where: { id: Number(id) }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Role excluída com sucesso'
        }, {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.error('❌ [API-ROLES] Erro ao excluir role no banco local:', dbError);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { 
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }
  } catch (error) {
    console.log('Erro ao excluir role:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// PATCH - Alternar status da role
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para alterar status de roles' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'ID da role é obrigatório' }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('🔄 [API-ROLES] Alternando status da role com serviço:', id);
    
    try {
      // Usar o serviço para alternar o status da role
      const updatedRole = await roleService.toggleRoleStatus(Number(id));
      
      return NextResponse.json({
        success: true,
        data: updatedRole,
        message: 'Status da role alternado com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    } catch (serviceError) {
      console.error('❌ [API-ROLES] Erro ao alternar status da role via serviço:', serviceError);
      
      // Fallback para banco de dados local
      try {
        // Buscar role existente
        const existingRole = await prisma.roles.findUnique({
          where: { id: Number(id) }
        });
        
        if (!existingRole) {
          return NextResponse.json({ error: 'Role não encontrada' }, { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          });
        }
        
        // Alternar status da role
        const updatedRole = await prisma.roles.update({
          where: { id: Number(id) },
          data: {
            is_active: !existingRole.is_active,
            updated_at: new Date()
          }
        });
        
        // Converter para o formato da resposta
        const roleResponse = {
          id: String(updatedRole.id),
          name: updatedRole.name || '',
          description: updatedRole.description || '',
          active: updatedRole.is_active,
          users_count: 0,
          created_at: updatedRole.created_at.toISOString(),
          updated_at: updatedRole.updated_at.toISOString(),
          status: updatedRole.is_active ? 'active' : 'inactive'
        };
        
        return NextResponse.json({
          success: true,
          data: roleResponse,
          message: 'Status da role alternado com sucesso'
        }, {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.error('❌ [API-ROLES] Erro ao alternar status da role no banco local:', dbError);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { 
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }
  } catch (error) {
    console.log('Erro ao alternar status da role:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}
