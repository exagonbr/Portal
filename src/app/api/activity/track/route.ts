import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/app/api/lib/auth';
import { z } from 'zod';

// Schema para validação dos dados de atividade
const trackActivitySchema = z.object({
  user_id: z.string().optional(),
  activity_type: z.string(),
  action: z.string(),
  session_id: z.string().optional(),
  details: z.record(z.any()).optional()
});

/**
 * Extrai o user_id de várias fontes possíveis
 */
async function extractUserId(request: NextRequest): Promise<string | null> {
  try {
    // 1. Tentar obter do token de autenticação
    const session = await authenticate(request);
    if (session?.user?.id) {
      return session.user.id.toString();
    }
    
    // 2. Tentar obter dos cookies
    const cookies = request.cookies;
    const userDataCookie = cookies.get('user_data');
    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.value));
        if (userData && userData.id) {
          return userData.id.toString();
        }
      } catch (error) {
        console.error('❌ Erro ao parsear cookie user_data:', error);
      }
    }
    
    // 3. Tentar obter de headers personalizados
    const userId = request.headers.get('x-user-id');
    if (userId) {
      return userId;
    }
    
    // 4. Tentar obter da URL
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    if (userIdParam) {
      return userIdParam;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair user_id:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parsear e validar dados
    const body = await request.json()
    
    // Se não há user_id no body, tentar obter de outras fontes
    if (!body.user_id || body.user_id === '') {
      const userId = await extractUserId(request);
      
      if (userId) {
        console.log('✅ user_id obtido de fontes alternativas:', userId);
        body.user_id = userId;
      } else {
        console.log('❌ Ignorando log de atividade: user_id é nulo ou vazio e não foi possível obtê-lo de outras fontes');
        return NextResponse.json(
          { success: false, error: 'user_id é obrigatório e não pode ser vazio' },
          { status: 400 }
        )
      }
    }
    
    const validatedData = trackActivitySchema.parse(body)

    // Obter informações da requisição
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Mapear ação para um tipo compatível
    let action: 'view' | 'complete' | 'pause' | 'resume' = 'view';
    if (validatedData.action === 'complete' || validatedData.activity_type.includes('complete')) {
      action = 'complete';
    } else if (validatedData.action === 'pause' || validatedData.activity_type.includes('pause')) {
      action = 'pause';
    } else if (validatedData.action === 'resume' || validatedData.activity_type.includes('resume')) {
      action = 'resume';
    }

    // Mapear tipo de conteúdo
    let contentType: 'video' | 'book' | 'course' | 'tvshow' = 'video';
    if (validatedData.activity_type.includes('book')) {
      contentType = 'book';
    } else if (validatedData.activity_type.includes('course')) {
      contentType = 'course';
    } else if (validatedData.activity_type.includes('tvshow')) {
      contentType = 'tvshow';
    }

    // Enviar para o backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/activity/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.accessToken ? `Bearer ${session.accessToken}` : ''
      },
      body: JSON.stringify({
        ...validatedData,
        ip_address: ip,
        user_agent: userAgent,
        content_type: contentType,
        action
      })
    })

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro ao rastrear atividade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao rastrear atividade' },
      { status: 500 }
    )
  }
}

// Endpoint para obter atividades do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || session.user?.id || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar se o usuário pode acessar as atividades
    const isAdmin = session.user?.role === 'SYSTEM_ADMIN'
    if (!isAdmin && userId !== session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar atividades do backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/activity/user/${userId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.accessToken ? `Bearer ${session.accessToken}` : ''
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data || []
    });

  } catch (error) {
    console.log('❌ Erro ao obter atividades:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}
