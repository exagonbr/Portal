import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../lib/api-route-template';
import { schoolService } from '@/services/schoolService';
import { getAuthentication } from '@/lib/auth-utils';
import { SchoolFilter } from '@/types/school';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/schools',
  name: 'schools',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const search = url.searchParams.get('search') || '';
      const institution_id = url.searchParams.get('institution_id');
      const is_active = url.searchParams.get('is_active');
      
      console.log('📚 [API-SCHOOLS] Buscando escolas com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit,
        search,
        institution_id,
        is_active: is_active ? is_active === 'true' : undefined
      };
      
      // Usar o serviço de escolas
      const result = await schoolService.getSchools(filters as SchoolFilter);
      
      console.log('✅ [API-SCHOOLS] Escolas encontradas:', result.items?.length);
      
      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('❌ [API-SCHOOLS] Erro ao buscar escolas:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    const body = await request.json();
    
    console.log('📝 [API-SCHOOLS] Criando escola com serviço');
    
    // Usar o serviço para criar a escola
    const newSchool = await schoolService.createSchool({
      ...body,
      created_by: authResult.user.id
    });
    
    console.log('✅ [API-SCHOOLS] Escola criada com sucesso');
    
    return NextResponse.json({
      success: true,
      data: newSchool,
      message: 'Escola criada com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-SCHOOLS] Erro ao criar escola:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT - Atualizar escola
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    // Obter ID da escola da URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID da escola não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    const body = await request.json();
    
    console.log('✏️ [API-SCHOOLS] Atualizando escola com serviço:', id);
    
    // Usar o serviço para atualizar a escola
    const updatedSchool = await schoolService.updateSchool(Number(id), {
      ...body,
      updated_by: authResult.user.id
    });
    
    console.log('✅ [API-SCHOOLS] Escola atualizada com sucesso');
    
    return NextResponse.json({
      success: true,
      data: updatedSchool,
      message: 'Escola atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-SCHOOLS] Erro ao atualizar escola:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE - Excluir escola
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    // Obter ID da escola da URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID da escola não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    console.log('🗑️ [API-SCHOOLS] Excluindo escola com serviço:', id);
    
    // Usar o serviço para excluir a escola
    await schoolService.deleteSchool(Number(id));
    
    console.log('✅ [API-SCHOOLS] Escola excluída com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'Escola excluída com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-SCHOOLS] Erro ao excluir escola:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 
