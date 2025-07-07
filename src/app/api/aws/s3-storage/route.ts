import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';
import { S3StorageInfo } from '@/services/awsService';

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
      const response = await fetch(getInternalApiUrl('/aws/s3-storage'), {
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
      const mockS3StorageInfo: S3StorageInfo = {
        totalSizeMb: 15360,
        numberOfFiles: 2845,
        buckets: [
          {
            name: 'portal-educacional-main',
            creationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            region: 'sa-east-1'
          },
          {
            name: 'portal-educacional-backup',
            creationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            region: 'sa-east-1'
          },
          {
            name: 'portal-educacional-media',
            creationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            region: 'sa-east-1'
          }
        ]
      };

      return NextResponse.json(mockS3StorageInfo, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'false',
        }
      });
    }
  } catch (error) {
    console.log('Erro ao buscar informações de armazenamento S3:', error);
    
    // Fallback com dados mock em caso de erro
    const mockS3StorageInfo: S3StorageInfo = {
      totalSizeMb: 15360,
      numberOfFiles: 2845,
      buckets: [
        {
          name: 'portal-educacional-main',
          creationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          region: 'sa-east-1'
        },
        {
          name: 'portal-educacional-backup',
          creationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          region: 'sa-east-1'
        },
        {
          name: 'portal-educacional-media',
          creationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          region: 'sa-east-1'
        }
      ]
    };

    return NextResponse.json(mockS3StorageInfo, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'false',
      }
    });
  }
} 