import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../../lib/api-route-template';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

// Dados mockados para fallback
const mockStats = {
  totalCertificates: 125,
  recreatable: 45,
  programs: 12,
  usersWithCerts: 87
};

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/certificates/stats',
  name: 'certificates-stats',
  fallbackFunction: async (req: NextRequest) => {
    try {
      console.log('📚 [API-CERTIFICATES-STATS] Usando dados mockados para fallback');
      
      return NextResponse.json({
        success: true,
        data: mockStats,
        message: 'Estatísticas de certificados encontradas (dados mockados)'
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      });
    } catch (error) {
      console.error('Error in certificates stats fallback:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar estatísticas de certificados',
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