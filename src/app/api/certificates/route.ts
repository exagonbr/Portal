import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../lib/api-route-template';
import { getCorsHeaders } from '@/config/cors';

// Dados mockados para fallback
let mockCertificates = [
  {
    id: 1,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    path: '/certificates/cert-001.pdf',
    score: 85,
    tv_show_id: 101,
    user_id: 1001,
    document: '123.456.789-00',
    license_code: 'LIC-2023-001',
    tv_show_name: 'Curso de Matemática Básica',
    recreate: false
  },
  {
    id: 2,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    path: '/certificates/cert-002.pdf',
    score: 92,
    tv_show_id: 102,
    user_id: 1002,
    document: '987.654.321-00',
    license_code: 'LIC-2023-002',
    tv_show_name: 'Curso de Português Avançado',
    recreate: false
  },
  {
    id: 3,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    path: '/certificates/cert-003.pdf',
    score: 78,
    tv_show_id: 103,
    user_id: 1003,
    document: '111.222.333-44',
    license_code: 'LIC-2023-003',
    tv_show_name: 'Curso de Ciências',
    recreate: true
  }
];

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/certificates',
  name: 'certificates',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const searchParams = url.searchParams;
      
      // Parâmetros de paginação
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      
      // Filtros
      const userId = searchParams.get('user_id');
      const tvShowId = searchParams.get('tv_show_id');
      const score = searchParams.get('score');
      const document = searchParams.get('document');
      const licenseCode = searchParams.get('license_code');
      const tvShowName = searchParams.get('tv_show_name');
      const search = searchParams.get('search');
      
      console.log('📚 [API-CERTIFICATES] Usando dados mockados para fallback');
      
      // Aplicar filtros
      let filteredCertificates = [...mockCertificates];
      
      if (userId) {
        filteredCertificates = filteredCertificates.filter(cert => cert.user_id === parseInt(userId));
      }
      
      if (tvShowId) {
        filteredCertificates = filteredCertificates.filter(cert => cert.tv_show_id === parseInt(tvShowId));
      }
      
      if (score) {
        filteredCertificates = filteredCertificates.filter(cert => cert.score === parseInt(score));
      }
      
      if (document) {
        filteredCertificates = filteredCertificates.filter(cert => cert.document?.includes(document));
      }
      
      if (licenseCode) {
        filteredCertificates = filteredCertificates.filter(cert => cert.license_code?.includes(licenseCode));
      }
      
      if (tvShowName) {
        filteredCertificates = filteredCertificates.filter(cert => cert.tv_show_name?.toLowerCase().includes(tvShowName.toLowerCase()));
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCertificates = filteredCertificates.filter(cert => 
          cert.document?.toLowerCase().includes(searchLower) ||
          cert.license_code?.toLowerCase().includes(searchLower) ||
          cert.tv_show_name?.toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar paginação
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedCertificates = filteredCertificates.slice(start, end);
      
      return NextResponse.json({
        success: true,
        data: {
          items: paginatedCertificates,
          total: filteredCertificates.length,
          page,
          limit,
          totalPages: Math.ceil(filteredCertificates.length / limit)
        },
        message: 'Certificados encontrados (dados mockados)'
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('Error in certificates fallback:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar certificados',
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }
});

// POST handler para criar certificado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Criar novo certificado com dados mockados
    const newId = Math.max(...mockCertificates.map(c => c.id)) + 1;
    const newCertificate = {
      id: newId,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      ...body,
      recreate: body.recreate !== undefined ? body.recreate : true
    };
    
    mockCertificates.push(newCertificate);
    console.log('📝 [API-CERTIFICATES] Certificado criado com mock:', newCertificate);
    
    return NextResponse.json({
      success: true,
      data: newCertificate,
      message: 'Certificado criado com sucesso (dados mockados)'
    }, { 
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao criar certificado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT handler para atualizar certificado
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do certificado não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    const body = await request.json();
    
    // Atualizar certificado mockado
    const certificateIndex = mockCertificates.findIndex(c => c.id === parseInt(id));
    if (certificateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Certificado não encontrado' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    const updatedCertificate = {
      ...mockCertificates[certificateIndex],
      ...body,
      last_updated: new Date().toISOString()
    };
    
    mockCertificates[certificateIndex] = updatedCertificate;
    console.log('✏️ [API-CERTIFICATES] Certificado atualizado com mock:', updatedCertificate);
    
    return NextResponse.json({
      success: true,
      data: updatedCertificate,
      message: 'Certificado atualizado com sucesso (dados mockados)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao atualizar certificado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE handler para excluir certificado
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do certificado não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    // Excluir certificado mockado
    const certificateIndex = mockCertificates.findIndex(c => c.id === parseInt(id));
    if (certificateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Certificado não encontrado' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    mockCertificates = mockCertificates.filter(c => c.id !== parseInt(id));
    console.log('🗑️ [API-CERTIFICATES] Certificado excluído com mock:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Certificado excluído com sucesso (dados mockados)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao excluir certificado:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao excluir certificado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
