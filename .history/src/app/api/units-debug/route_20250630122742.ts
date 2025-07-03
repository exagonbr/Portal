import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authOptionsDebug } from '@/lib/auth-debug'
import { z } from 'zod'
import { getInternalApiUrl } from '@/config/env';

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Schema de validação para criação de unidade
const createUnitSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  course_id: z.string().uuid('ID de curso inválido'),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0'),
  duration_hours: z.number().int().positive('Duração deve ser positiva').optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_published: z.boolean().default(false),
  content: z.object({
    introduction: z.string().optional(),
    topics: z.array(z.object({
      title: z.string(),
      description: z.string(),
      order: z.number().int().positive()
    })).optional(),
    resources: z.array(z.object({
      type: z.enum(['VIDEO', 'PDF', 'LINK', 'DOCUMENT', 'PRESENTATION']),
      title: z.string(),
      url: z.string().url(),
      duration_minutes: z.number().int().positive().optional()
    })).optional()
  }).optional(),
  assessment: z.object({
    type: z.enum(['QUIZ', 'ASSIGNMENT', 'PROJECT', 'EXAM']),
    passing_score: z.number().min(0).max(100),
    max_attempts: z.number().int().positive().optional()
  }).optional()
})

// GET - Listar unidades (versão debug sem autenticação obrigatória)

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [UNITS-DEBUG] Iniciando requisição GET /api/units-debug');
    
    // Tentar obter sessão com configuração original
    console.log('🔍 [UNITS-DEBUG] Testando sessão com authOptions original...');
    const originalSession = await getServerSession(authOptions);
    console.log('🔍 [UNITS-DEBUG] Sessão original:', {
      hasSession: !!originalSession,
      userEmail: originalSession?.user?.email,
      userRole: (originalSession?.user as any)?.role
    });
    
    // Tentar obter sessão com configuração de debug
    console.log('🔍 [UNITS-DEBUG] Testando sessão com authOptionsDebug...');
    const debugSession = await getServerSession(authOptionsDebug);
    console.log('🔍 [UNITS-DEBUG] Sessão debug:', {
      hasSession: !!debugSession,
      userEmail: debugSession?.user?.email,
      userRole: (debugSession?.user as any)?.role
    });
    
    // Usar qualquer sessão disponível ou continuar sem autenticação para debug
    const session = originalSession || debugSession;
    
    if (!session?.user) {
      console.warn('⚠️ [UNITS-DEBUG] Nenhuma sessão válida encontrada, continuando sem autenticação para debug');
      
      // Para debug, retornar dados simulados
      const mockUnits = [
        {
          id: 'unit-1',
          name: 'Unidade Simulada 1',
          description: 'Esta é uma unidade simulada para debug',
          type: 'school',
          active: true,
          institution_id: 'inst-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          institution: {
            id: 'inst-1',
            name: 'Instituição Simulada',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        {
          id: 'unit-2',
          name: 'Unidade Simulada 2',
          description: 'Segunda unidade simulada para debug',
          type: 'college',
          active: false,
          institution_id: 'inst-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          institution: {
            id: 'inst-1',
            name: 'Instituição Simulada',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: {
          items: mockUnits,
          pagination: {
            total: mockUnits.length,
            page: 1,
            limit: 100,
            totalPages: 1
          }
        },
        message: 'Dados simulados retornados (sem autenticação)',
        debug: {
          authenticationStatus: 'NO_SESSION',
          originalSession: !!originalSession,
          debugSession: !!debugSession,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('✅ [UNITS-DEBUG] Sessão válida encontrada, prosseguindo com requisição real');

    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    console.log('🔍 [UNITS-DEBUG] Fazendo requisição para backend:', {
      url: getInternalApiUrl(`/api/units${queryString ? `?${queryString}` : ''}`),
      queryString
    });

    const response = await fetch(getInternalApiUrl(`/api/units${queryString ? `?${queryString}` : ''}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('🔍 [UNITS-DEBUG] Resposta do backend:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [UNITS-DEBUG] Erro na resposta do backend:', errorData);
      
      return NextResponse.json({
          error: errorData.message || 'Failed to fetch units',
          debug: {
            backendStatus: response.status,
            backendStatusText: response.statusText,
            backendError: errorData,
            timestamp: new Date().toISOString()
          }
        },
        {
          status: response.status,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const data = await response.json()
    console.log('✅ [UNITS-DEBUG] Dados recebidos do backend:', {
      hasData: !!data,
      dataKeys: Object.keys(data || {}),
      itemsCount: data?.items?.length || data?.data?.items?.length || 0
    });
    
    return NextResponse.json({
      ...data,
      debug: {
        authenticationStatus: 'AUTHENTICATED',
        userEmail: session.user.email,
        userRole: (session.user as any)?.role,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('❌ [UNITS-DEBUG] Erro na requisição:', error)
    return NextResponse.json({
        error: 'Internal server error',
        debug: {
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      },
      {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    )
  }
}

// POST - Criar unidade (versão debug)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [UNITS-DEBUG] Iniciando requisição POST /api/units-debug');
    
    const session = await getServerSession(authOptions) || await getServerSession(authOptionsDebug);
    
    if (!session?.user) {
      console.warn('⚠️ [UNITS-DEBUG] Tentativa de criação sem autenticação');
      return NextResponse.json({
        error: 'Unauthorized - Authentication required for creating units',
        debug: {
          authenticationStatus: 'NO_SESSION',
          timestamp: new Date().toISOString()
        }
      }, {
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()
    console.log('🔍 [UNITS-DEBUG] Dados recebidos para criação:', {
      hasName: !!body.name,
      hasInstitutionId: !!body.institution_id,
      bodyKeys: Object.keys(body)
    });

    const response = await fetch(getInternalApiUrl('/units'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
          error: errorData.message || 'Failed to create unit',
          debug: {
            backendStatus: response.status,
            backendError: errorData,
            timestamp: new Date().toISOString()
          }
        },
        {
          status: response.status,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      ...data,
      debug: {
        authenticationStatus: 'AUTHENTICATED',
        userEmail: session.user.email,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('❌ [UNITS-DEBUG] Erro na criação:', error)
    return NextResponse.json({ 
        error: 'Internal server error',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).toISOString()
        }
      },
      { status: 500 }
    )
  }
}
