import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/prisma'
import { createStandardApiRoute } from '../lib/api-route-template'
import { userService } from '@/services/userService'

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/users',
  name: 'users',
  fallbackFunction: async (req: NextRequest) => {
    console.log('🔄 [API-USERS] Usando serviço de usuários');
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      const role = url.searchParams.get('role');
      const status = url.searchParams.get('status');

      // Usar o serviço de usuários
      const result = await userService.getUsers({
        page,
        limit,
        search,
        role_id: role,
        status
      });

      console.log('✅ [API-USERS] Dados obtidos com sucesso:', result.items?.length);

      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('❌ [API-USERS] Erro ao buscar usuários:', error);
      
      // Fallback para banco de dados local
      try {
        console.log('🔄 [API-USERS] Tentando usar dados locais do banco Prisma');
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const search = url.searchParams.get('search');

        // Usar consulta SQL bruta para contornar problemas de schema
        let users;
        if (search) {
          users = await prisma.$queryRaw`
            SELECT u.id, u.full_name, u.email, u.enabled, u.role_id, u.institution_id, u.date_created, u.last_updated
            FROM "users" u
            WHERE u.full_name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'}
            ORDER BY u.full_name ASC
            LIMIT ${Math.min(limit, 1000)}
          `;
        } else {
          users = await prisma.$queryRaw`
            SELECT u.id, u.full_name, u.email, u.enabled, u.role_id, u.institution_id, u.date_created, u.last_updated
            FROM "users" u
            ORDER BY u.full_name ASC
            LIMIT ${Math.min(limit, 1000)}
          `;
        }

        // Converter BigInt para string para serialização JSON
        const serializedUsers = users.map((user: any) => ({
          id: user.id.toString(),
          name: user.full_name,
          full_name: user.full_name,
          email: user.email,
          enabled: user.enabled ?? true,
          is_active: user.enabled ?? true,
          role_id: user.role_id ? user.role_id.toString() : null,
          institution_id: user.institution_id ? user.institution_id.toString() : null,
          date_created: user.date_created ? user.date_created.toISOString() : new Date().toISOString(),
          last_updated: user.last_updated ? user.last_updated.toISOString() : new Date().toISOString(),
        }));

        console.log('✅ [API-USERS] Dados locais obtidos com sucesso:', serializedUsers.length);

        return NextResponse.json({
          items: serializedUsers,
          total: serializedUsers.length,
          page: 1,
          limit: limit,
          totalPages: 1,
        }, {
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        });
      } catch (dbError) {
        console.error('❌ [API-USERS] Erro ao acessar banco local:', dbError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erro ao buscar usuários',
            error: String(dbError)
          },
          { status: 500 }
        );
      }
    }
  }
});

// POST handler - Criar usuário
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    console.log('📝 [API-USERS] Criando usuário com serviço');
    
    // Usar o serviço para criar o usuário
    const newUser = await userService.createUser(data);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT handler - Atualizar usuário
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    console.log('✏️ [API-USERS] Atualizando usuário com serviço:', id);
    
    // Usar o serviço para atualizar o usuário
    const updatedUser = await userService.updateUser(id, data);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE handler - Excluir usuário
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ [API-USERS] Excluindo usuário com serviço:', id);
    
    // Usar o serviço para excluir o usuário
    await userService.deleteUser(Number(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

