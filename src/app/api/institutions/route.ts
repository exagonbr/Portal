import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';
import { createCorsOptionsResponse } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

// Função para retornar dados mock das instituições
function getMockInstitutionsData(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  // Dados mock das instituições
  const allInstitutions = [
    {
      id: 1,
      name: 'Escola Municipal João Silva',
      company_name: 'Prefeitura Municipal - Educação',
      document: '12.345.678/0001-90',
      state: 'SP',
      district: 'Centro',
      street: 'Rua das Flores, 123',
      postal_code: '12345-678',
      accountable_contact: 'maria.santos@escola.gov.br',
      accountable_name: 'Maria Santos',
      contract_disabled: false,
      contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      contract_term_start: new Date().toISOString(),
      deleted: false,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Colégio Estadual Dom Pedro',
      company_name: 'Secretaria de Educação do Estado',
      document: '23.456.789/0001-01',
      state: 'SP',
      district: 'Vila Nova',
      street: 'Av. Principal, 456',
      postal_code: '23456-789',
      accountable_contact: 'joao.oliveira@colegio.sp.gov.br',
      accountable_name: 'João Oliveira',
      contract_disabled: false,
      contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      contract_term_start: new Date().toISOString(),
      deleted: false,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Instituto Federal de São Paulo',
      company_name: 'IFSP - Instituto Federal de São Paulo',
      document: '11.111.111/0001-11',
      state: 'SP',
      district: 'Centro Educacional',
      street: 'Av. Federal, 456',
      postal_code: '11111-111',
      accountable_contact: 'contato@ifsp.edu.br',
      accountable_name: 'Diretor IFSP',
      contract_disabled: false,
      contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      contract_term_start: new Date().toISOString(),
      deleted: false,
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
  ];

  // Filtrar por busca se fornecida
  let filteredInstitutions = allInstitutions;
  if (search && search.trim()) {
    const searchTerm = search.toLowerCase();
    filteredInstitutions = allInstitutions.filter(inst =>
      inst.name.toLowerCase().includes(searchTerm) ||
      inst.company_name.toLowerCase().includes(searchTerm) ||
      inst.document.includes(searchTerm)
    );
  }

  // Aplicar paginação
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedInstitutions = filteredInstitutions.slice(startIndex, endIndex);

  const mockResponse = {
    items: paginatedInstitutions,
    total: filteredInstitutions.length,
    page,
    limit,
    totalPages: Math.ceil(filteredInstitutions.length / limit)
  };

  console.log('🎭 Retornando dados mock:', {
    total: mockResponse.total,
    page: mockResponse.page,
    items: mockResponse.items.length
  });

  return NextResponse.json(mockResponse, { status: 200 });
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    console.log('🔗 BACKEND_URL:', getInternalApiUrl());
    
    // Preparar headers de autenticação
    const headers = prepareAuthHeaders(request);
    
    // Verificar se há um token válido de autenticação
    const authHeader = headers.Authorization;
    const hasValidAuthToken = authHeader && 
                              authHeader.startsWith('Bearer ') && 
                              authHeader.length > 'Bearer '.length &&
                              authHeader !== 'Bearer ';
    
    // Construir URL do backend com parâmetros
    // Se não houver token de autenticação válido, usar rota pública
    const routePath = hasValidAuthToken ? '/api/institutions' : '/api/institutions-public';
    const backendUrl = new URL(routePath, getInternalApiUrl());
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔗 Proxying to:', backendUrl.toString());
    console.log('📋 Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('🔐 Using route:', hasValidAuthToken ? 'AUTHENTICATED (/api/institutions)' : 'PUBLIC (/api/institutions-public)');

    // Preparar headers para a requisição
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Só incluir Authorization header se estivermos usando a rota autenticada
    if (hasValidAuthToken && authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: requestHeaders,
    });

    console.log('📡 Backend response status:', response.status);
    
    // Se falhar, retornar dados mock como fallback
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Backend error:', errorText);
      
      // Se for erro 401 na rota autenticada, tentar rota pública como fallback
      if (response.status === 401 && hasValidAuthToken) {
        console.log('🔄 Tentando fallback para rota pública...');
        const publicUrl = new URL('/api/institutions-public', getInternalApiUrl());
        searchParams.forEach((value, key) => {
          publicUrl.searchParams.append(key, value);
        });
        
        const fallbackResponse = await fetch(publicUrl.toString(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback para rota pública funcionou');
          return NextResponse.json(fallbackData, { status: fallbackResponse.status });
        }
      }
      
      // Fallback para dados mock se o backend falhar
      console.log('🎭 Backend falhou, retornando dados mock como fallback');
      return getMockInstitutionsData(searchParams);
    }
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.log('❌ Resposta não é JSON:', textResponse);
      return NextResponse.json(
        { success: false, message: 'Resposta do backend não é JSON válido' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('📄 Backend response data keys:', Object.keys(data));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('❌ Erro ao buscar instituições:', error);
    console.log('❌ Error details:', error instanceof Error ? error.message : String(error));
    
    // Fallback para dados mock em caso de erro
    console.log('🎭 Erro geral, retornando dados mock como fallback');
    const url = new URL(request.url);
    return getMockInstitutionsData(url.searchParams);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${getInternalApiUrl()}/api/institutions`, {
      method: 'POST',
      headers: prepareAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao criar instituição:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
