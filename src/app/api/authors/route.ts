import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';
import { authorService } from '@/services/authorService';

export const dynamic = 'force-dynamic';

// Função para lidar com requisições OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse();
}

// Função para lidar com requisições GET
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    console.log('📚 [API-AUTHORS] Buscando autores com serviço');
    
    // Construir objeto de filtros
    const filters = {
      page,
      limit,
      search
    };
    
    // Usar o serviço de autores
    const result = await authorService.getAuthors(filters);
    
    console.log('✅ [API-AUTHORS] Autores encontrados:', result.items?.length);
    
    // Retornar resposta com headers CORS
    return NextResponse.json(result, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-AUTHORS] Erro ao buscar autores:', error);
    return NextResponse.json(
      { 
        items: [], 
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Função para lidar com requisições POST
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

    // Obter dados do corpo da requisição
    const body = await request.json();
    
    console.log('📝 [API-AUTHORS] Criando autor com serviço');
    
    // Usar o serviço para criar o autor
    const newAuthor = await authorService.createAuthor(body);
    
    console.log('✅ [API-AUTHORS] Autor criado com sucesso');
    
    // Retornar resposta com headers CORS
    return NextResponse.json({
      success: true,
      data: newAuthor,
      message: 'Autor criado com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-AUTHORS] Erro ao criar autor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Função para lidar com requisições PUT
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

    // Obter ID do autor da URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do autor não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();
    
    console.log('✏️ [API-AUTHORS] Atualizando autor com serviço:', id);
    
    // Usar o serviço para atualizar o autor
    const updatedAuthor = await authorService.updateAuthor(parseInt(id), body);
    
    console.log('✅ [API-AUTHORS] Autor atualizado com sucesso');
    
    // Retornar resposta com headers CORS
    return NextResponse.json({
      success: true,
      data: updatedAuthor,
      message: 'Autor atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-AUTHORS] Erro ao atualizar autor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Função para lidar com requisições DELETE
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

    // Obter ID do autor da URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do autor não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    console.log('🗑️ [API-AUTHORS] Excluindo autor com serviço:', id);
    
    // Usar o serviço para excluir o autor
    await authorService.deleteAuthor(parseInt(id));
    
    console.log('✅ [API-AUTHORS] Autor excluído com sucesso');
    
    // Retornar resposta com headers CORS
    return NextResponse.json({
      success: true,
      message: 'Autor excluído com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-AUTHORS] Erro ao excluir autor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Função para lidar com requisições PATCH (alternar status)
export async function PATCH(request: NextRequest) {
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

    // Obter ID do autor da URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do autor não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    console.log('🔄 [API-AUTHORS] Alternando status do autor com serviço:', id);
    
    // Usar o serviço para alternar o status do autor
    const updatedAuthor = await authorService.toggleAuthorStatus(parseInt(id));
    
    console.log('✅ [API-AUTHORS] Status do autor alternado com sucesso');
    
    // Retornar resposta com headers CORS
    return NextResponse.json({
      success: true,
      data: updatedAuthor,
      message: 'Status do autor alternado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-AUTHORS] Erro ao alternar status do autor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 