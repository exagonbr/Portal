import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../../lib/api-route-template';
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
  endpoint: '/api/certificates/:id',
  name: 'certificates-detail',
  fallbackFunction: async (req: NextRequest, params: any) => {
    try {
      const id = params?.id;
      
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'ID do certificado não fornecido' },
          { 
            status: 400,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          }
        );
      }
      
      // Buscar certificado mockado
      const certificate = mockCertificates.find(c => c.id === parseInt(id));
      
      if (!certificate) {
        return NextResponse.json(
          { success: false, message: 'Certificado não encontrado' },
          { 
            status: 404,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          }
        );
      }
      
      console.log('📚 [API-CERTIFICATES] Usando dados mockados para fallback de certificado:', id);
      
      return NextResponse.json({
        success: true,
        data: certificate,
        message: 'Certificado encontrado (dados mockados)'
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('Error in certificate detail fallback:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar certificado',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }
});

// PUT handler para atualizar certificado
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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