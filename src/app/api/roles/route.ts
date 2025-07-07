import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { mockRoles, findRoleByName } from './mockDatabase'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prepareAuthHeaders } from '../lib/auth-headers'
import { getInternalApiUrl } from '@/config/env'
import { prisma } from '@/lib/prisma'
import { createStandardApiRoute } from '../lib/api-route-template'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
})

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/roles',
  name: 'roles',
  fallbackFunction: async (req: NextRequest) => {
    console.log('🔄 [API-ROLES] Usando dados locais para roles');
    
    try {
      // Tentar buscar do banco local primeiro
      let roles = [];
      try {
        roles = await prisma.role.findMany({
          orderBy: { name: 'asc' },
        });
      } catch (dbError) {
        console.warn('⚠️ [API-ROLES] Erro ao buscar do banco local:', dbError);
      }
      
      // Se não encontrou no banco, usar dados mock
      if (!roles || roles.length === 0) {
        console.log('🔄 [API-ROLES] Usando dados mock para roles');
        roles = [
          { id: '1', name: 'Administrador', description: 'Acesso total ao sistema' },
          { id: '2', name: 'Professor', description: 'Acesso às funcionalidades de ensino' },
          { id: '3', name: 'Aluno', description: 'Acesso às funcionalidades de aprendizado' },
          { id: '4', name: 'Coordenador', description: 'Gerencia professores e turmas' },
          { id: '5', name: 'Secretaria', description: 'Acesso administrativo limitado' }
        ];
      } else {
        // Converter IDs para string se necessário
        roles = roles.map(role => ({
          ...role,
          id: String(role.id)
        }));
      }

      console.log('✅ [API-ROLES] Dados locais obtidos com sucesso:', roles.length);

      // Formatar resposta no padrão esperado pela API
      return NextResponse.json({
        items: roles,
        total: roles.length,
        page: 1,
        limit: roles.length,
        totalPages: 1,
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('❌ [API-ROLES] Erro ao gerar dados fallback:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar funções',
          error: String(error)
        },
        { status: 500 }
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
    const newRole = {
      id: `role_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      status: 'active',
      active: roleData.is_active,
      users_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockRoles.set(newRole.id, newRole)

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Role criada com sucesso'
    }, { status: 201 })

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
