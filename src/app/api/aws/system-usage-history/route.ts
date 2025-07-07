import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';
import { SystemUsageDataPoint } from '@/types/analytics';

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

    // Obter o parâmetro 'hours' da URL
    const url = new URL(request.url);
    const hours = parseInt(url.searchParams.get('hours') || '24', 10);

    try {
      // Tentar fazer a requisição para o backend
      const response = await fetch(getInternalApiUrl(`/aws/system-usage-history?hours=${hours}`), {
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
      const mockData: SystemUsageDataPoint[] = [];
      const now = new Date();
      
      // Gerar dados para o número de horas solicitado
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
        
        // Gerar valores aleatórios com alguma variação realista
        const baseUsers = 100 + Math.floor(Math.random() * 50);
        const baseCpu = 30 + Math.floor(Math.random() * 20);
        const baseMemory = 4000 + Math.floor(Math.random() * 2000);
        
        // Adicionar variação baseada na hora do dia
        const hour = new Date(timestamp).getHours();
        const timeMultiplier = hour >= 8 && hour <= 18 ? 1.5 : 1; // Mais uso durante o horário comercial
        
        mockData.push({
          timestamp,
          activeUsers: Math.floor(baseUsers * timeMultiplier),
          cpuUsagePercent: Math.min(100, Math.floor(baseCpu * timeMultiplier)),
          memoryUsageMb: Math.floor(baseMemory * timeMultiplier)
        });
      }

      return NextResponse.json(mockData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'false',
        }
      });
    }
  } catch (error) {
    console.log('Erro ao buscar histórico de uso do sistema:', error);
    
    // Fallback com dados mock em caso de erro
    const mockData: SystemUsageDataPoint[] = [];
    const now = new Date();
    const hours = 24; // Valor padrão
    
    // Gerar dados para as últimas 24 horas
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
      mockData.push({
        timestamp,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        cpuUsagePercent: Math.floor(Math.random() * 40) + 20,
        memoryUsageMb: Math.floor(Math.random() * 2000) + 3000
      });
    }

    return NextResponse.json(mockData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'false',
      }
    });
  }
} 