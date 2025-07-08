import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { CORS_HEADERS } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const backendUrl = getInternalApiUrl(`/tv-shows/${resolvedParams.id}`);
    
    console.log(`🔍 Buscando TV Show ID: ${resolvedParams.id} em ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: await prepareAuthHeaders(request),
      // Adicionar timeout para evitar travamentos
      signal: AbortSignal.timeout(30000) // 30 segundos
    });

    console.log(`📡 Resposta do backend: ${response.status} ${response.statusText}`);
    
    // Verificar se a resposta é válida
    if (!response.ok) {
      console.error(`❌ Backend retornou erro: ${response.status}`);
      
      // Se for 502 (Bad Gateway), retornar erro específico
      if (response.status === 502) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Serviço temporariamente indisponível - problema de infraestrutura',
            code: 'SERVICE_UNAVAILABLE'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: `Erro do servidor: ${response.status}` },
        { status: response.status }
      );
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Resposta não é JSON válido:', contentType);
      
      // Tentar ler o conteúdo para debug
      const textContent = await response.text();
      console.error('Conteúdo recebido:', textContent.substring(0, 200));
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Servidor retornou formato inválido - esperado JSON',
          code: 'INVALID_RESPONSE_FORMAT'
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log(`✅ TV Show encontrado: ${data?.data?.name || 'Nome não disponível'}`);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Erro ao buscar TV Show:', error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro de conexão com o servidor',
          code: 'CONNECTION_ERROR'
        },
        { status: 503 }
      );
    }
    
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro de formato de dados do servidor',
          code: 'PARSE_ERROR'
        },
        { status: 502 }
      );
    }
    
    // Timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Timeout - operação demorou muito',
          code: 'TIMEOUT_ERROR'
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const backendUrl = getInternalApiUrl(`/tv-shows/${resolvedParams.id}`);

    console.log(`🔄 [TV-SHOW-API] Atualizando TV Show ID: ${resolvedParams.id}`);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: await prepareAuthHeaders(request),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error(`❌ [TV-SHOW-API] PUT - Resposta não é JSON. Status: ${response.status}`);
      
      return NextResponse.json({
        success: false,
        message: `Erro de comunicação com o backend (${response.status})`,
        details: { status: response.status, contentType }
      }, { 
        status: response.status >= 500 ? 503 : response.status,
        headers: CORS_HEADERS 
      });
    }

    const data = await response.json();
    console.log(`✅ [TV-SHOW-API] TV Show atualizado com sucesso`);

    return NextResponse.json(data, { 
      status: response.status,
      headers: CORS_HEADERS 
    });
    
  } catch (error) {
    console.error('❌ [TV-SHOW-API] Erro ao atualizar TV Show:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: 'Timeout na comunicação com o backend'
      }, { status: 504, headers: CORS_HEADERS });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const backendUrl = getInternalApiUrl(`/tv-shows/${resolvedParams.id}`);
    
    console.log(`🗑️ [TV-SHOW-API] Excluindo TV Show ID: ${resolvedParams.id}`);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: await prepareAuthHeaders(request),
      signal: AbortSignal.timeout(30000)
    });

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error(`❌ [TV-SHOW-API] DELETE - Resposta não é JSON. Status: ${response.status}`);
      
      return NextResponse.json({
        success: false,
        message: `Erro de comunicação com o backend (${response.status})`,
        details: { status: response.status, contentType }
      }, { 
        status: response.status >= 500 ? 503 : response.status,
        headers: CORS_HEADERS 
      });
    }

    const data = await response.json();
    console.log(`✅ [TV-SHOW-API] TV Show excluído com sucesso`);

    return NextResponse.json(data, { 
      status: response.status,
      headers: CORS_HEADERS 
    });
    
  } catch (error) {
    console.error('❌ [TV-SHOW-API] Erro ao excluir TV Show:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: 'Timeout na comunicação com o backend'
      }, { status: 504, headers: CORS_HEADERS });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500, headers: CORS_HEADERS });
  }
}