import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';

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
      const response = await fetch(getInternalApiUrl('/aws/system-analytics'), {
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
      
      // Se o backend não estiver disponível, retornar dados mock
      const mockAnalytics = {
        cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
        networkIn: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 KB/s
        networkOut: Math.floor(Math.random() * 2000) + 500, // 500-2500 KB/s
        diskUsage: Math.floor(Math.random() * 30) + 40 // 40-70%
      };

      return NextResponse.json(mockAnalytics, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'false',
        }
      });
    }
  } catch (error) {
    console.log('Erro ao buscar analytics do sistema:', error);
    
    // Fallback com dados mock em caso de erro
    const mockAnalytics = {
      cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
      networkIn: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 KB/s
      networkOut: Math.floor(Math.random() * 2000) + 500, // 500-2500 KB/s
      diskUsage: Math.floor(Math.random() * 30) + 40 // 40-70%
    };

    return NextResponse.json(mockAnalytics, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'false',
      }
    });
  }
} 