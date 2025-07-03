import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    
    // Permitir bypass para desenvolvimento com query param ?test=true
    const testMode = request.nextUrl.searchParams.get('test') === 'true' && process.env.NODE_ENV === 'development';
    
    if (!testMode && (!authResult || !authResult.user)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido ou sessão não encontrada' 
        },
        { status: 401 }
      );
    }

    // Seguramente obter o usuário do resultado da autenticação
    let user = authResult?.user || null;
    
    // Em modo de teste, simular um usuário admin
    if (testMode) {
      user = {
        id: 'test-user',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'SYSTEM_ADMIN',
        institution_id: 'test-institution',
        permissions: []
      };
    }

    // Verificar se temos um usuário válido
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuário não encontrado na sessão' 
        },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão (admin ou SYSTEM_ADMIN)
    const hasPermission = hasRequiredRole(user.role, ['admin', 'SYSTEM_ADMIN']);
    if (!hasPermission) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Acesso negado. Permissões insuficientes.' 
        },
        { status: 403 }
      );
    }

    // Gerar métricas em tempo real simuladas com valores realistas
    const now = new Date();
    const hour = now.getHours();
    
    // Simular variação baseada no horário do dia
    const isBusinessHours = hour >= 8 && hour <= 18;
    const baseMultiplier = isBusinessHours ? 1.0 : 0.6;
    
    // Simular picos de uso no meio da manhã e tarde
    const peakHour = hour === 10 || hour === 14;
    const peakMultiplier = peakHour ? 1.3 : 1.0;
    
    const finalMultiplier = baseMultiplier * peakMultiplier;

    // Métricas realistas baseadas em sistemas educacionais
    const activeUsers = Math.floor((1200 + Math.random() * 300) * finalMultiplier);
    const activeSessions = Math.floor(activeUsers * (1.1 + Math.random() * 0.3)); // Mais sessões que usuários
    
    // Simulação de uso de memória Redis
    const baseMemoryMB = 45 + Math.random() * 15; // 45-60MB
    const cacheMemory = `${baseMemoryMB.toFixed(1)}MB`;
    
    // Dados de uptime do sistema
    const uptimeSeconds = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7); // Até 7 dias
    
    const metrics = {
      activeUsers,
      activeSessions,
      cacheMemory,
      timestamp: now.toISOString(),
      system: {
        uptime: uptimeSeconds,
        memoryUsage: {
          rss: Math.floor(104857600 + Math.random() * 10485760),
          heapTotal: Math.floor(83886080 + Math.random() * 8388608),
          heapUsed: Math.floor(67108864 + Math.random() * 6710886),
          external: Math.floor(8388608 + Math.random() * 838860),
          arrayBuffers: Math.floor(1048576 + Math.random() * 104857)
        },
        loadAverage: [
          Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
          Math.round((0.4 + Math.random() * 1.2) * 100) / 100,
          Math.round((0.3 + Math.random() * 1.0) * 100) / 100
        ]
      },
      database: {
        connections: Math.floor(15 + Math.random() * 25),
        queryTime: Math.round((10 + Math.random() * 30) * 100) / 100
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error: any) {
    console.error('Erro ao obter métricas em tempo real:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
