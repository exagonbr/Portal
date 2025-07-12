import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../lib/api-route-template';
import { getCorsHeaders } from '@/config/cors';
import { certificateService } from '@/services/certificateService';

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
      
      console.log('📚 [API-CERTIFICATES] Usando serviço para buscar certificados');
      
      // Construir objeto de filtros
      const filters: any = {
        page,
        limit,
        search
      };
      
      if (userId) filters.user_id = userId;
      if (tvShowId) filters.tv_show_id = tvShowId;
      if (score) filters.score = parseInt(score);
      if (document) filters.document = document;
      if (licenseCode) filters.license_code = licenseCode;
      if (tvShowName) filters.tv_show_name = tvShowName;
      
      // Usar o serviço de certificados
      const result = await certificateService.getCertificates(filters);
      
      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('Error in certificates service:', error);
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
    
    console.log('📝 [API-CERTIFICATES] Criando certificado com serviço');
    
    // Usar o serviço para criar o certificado
    const newCertificate = await certificateService.createCertificate(body);
    
    return NextResponse.json({
      success: true,
      data: newCertificate,
      message: 'Certificado criado com sucesso'
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
    
    console.log('✏️ [API-CERTIFICATES] Atualizando certificado com serviço:', id);
    
    // Usar o serviço para atualizar o certificado
    const updatedCertificate = await certificateService.updateCertificate(parseInt(id), body);
    
    return NextResponse.json({
      success: true,
      data: updatedCertificate,
      message: 'Certificado atualizado com sucesso'
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
    
    console.log('🗑️ [API-CERTIFICATES] Excluindo certificado com serviço:', id);
    
    // Usar o serviço para excluir o certificado
    await certificateService.deleteCertificate(parseInt(id));
    
    return NextResponse.json({
      success: true,
      message: 'Certificado excluído com sucesso'
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
