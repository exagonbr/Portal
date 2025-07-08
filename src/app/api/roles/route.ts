import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { mockRoles, findRoleByName } from './mockDatabase'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prepareAuthHeaders } from '../lib/auth-headers'
import { getInternalApiUrl } from '@/config/env'
import { prisma } from '@/lib/prisma'
import { createStandardApiRoute } from '../lib/api-route-template'
import { Prisma } from '@prisma/client'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
})

// Definindo o tipo para os roles do banco de dados
interface RoleResponseDto {
  id: string;
  name: string;
  description: string;
  active: boolean;
  users_count: number;
  created_at: string;
  updated_at: string;
  status: string;
}

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/roles',
  name: 'roles',
  fallbackFunction: async (req: NextRequest) => {
    console.log('🔄 [API-ROLES] Usando dados locais para roles');
    
        try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const search = url.searchParams.get('search')
  
      const where: any = {}
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }
  
      try {
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
        })

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
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        });
      }
      
    } catch (error) {
      console.error('❌ [API-ROLES] Erro geral:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar funções',
          error: String(error)
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }
});

// POST - Criar role
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para criar roles' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const roleData = validationResult.data

    // Verificar se já existe role com mesmo nome
    const existingRole = findRoleByName(roleData.name)
    if (existingRole) {
      return NextResponse.json({ error: 'Já existe uma role com este nome' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Criar role
    const newRole = await prisma.roles.create({
      data: {
        name: roleData.name,
        description: roleData.description || null,
        is_active: roleData.is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Converter para o formato da resposta
    const roleResponse: RoleResponseDto = {
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
    })

  } catch (error) {
    console.log('Erro ao criar role:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar role (redireciona para o endpoint correto)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para atualizar roles' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID da role é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Buscar role existente
    const existingRole = mockRoles.get(id)
    if (!existingRole) {
      return NextResponse.json({ error: 'Role não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Atualizar role
    const updatedRole = {
      ...existingRole,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }
    
    mockRoles.set(id, updatedRole)

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao atualizar role:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}
