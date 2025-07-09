import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';
import { ResourceDistribution } from '@/types/analytics';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
      'Content-Length': '0',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'false',
          }
        }
      );
    }

    try {
      // Tentar fazer a requisição para o backend
      const response = await fetch(getInternalApiUrl('/aws/resource-distribution'), {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Backend não disponível');
      }

      const data = await response.json();
      
      return NextResponse.json(data, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'false',
        }
      });
    } catch (backendError) {
      console.log('Erro ao conectar com o backend:', backendError);
      
      // Se o backend não estiver disponível, gerar dados mock
      const mockResourceDistribution: ResourceDistribution[] = [
        { resourceName: 'EC2', usageCount: 350, percentage: 35 },
        { resourceName: 'RDS', usageCount: 250, percentage: 25 },
        { resourceName: 'S3', usageCount: 200, percentage: 20 },
        { resourceName: 'Lambda', usageCount: 120, percentage: 12 },
        { resourceName: 'CloudFront', usageCount: 80, percentage: 8 }
      ];

      return NextResponse.json(mockResourceDistribution, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'false',
        }
      });
    }
  } catch (error) {
    console.log('Erro ao buscar distribuição de recursos:', error);
    
    // Fallback com dados mock em caso de erro
    const mockResourceDistribution: ResourceDistribution[] = [
      { resourceName: 'EC2', usageCount: 350, percentage: 35 },
      { resourceName: 'RDS', usageCount: 250, percentage: 25 },
      { resourceName: 'S3', usageCount: 200, percentage: 20 },
      { resourceName: 'Lambda', usageCount: 120, percentage: 12 },
      { resourceName: 'CloudFront', usageCount: 80, percentage: 8 }
    ];

    return NextResponse.json(mockResourceDistribution, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'false',
      }
    });
  }
} 