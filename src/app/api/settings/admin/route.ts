import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication } from '@/lib/auth-utils'
import { getInternalApiUrl } from '@/config/env'
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors'

export const dynamic = 'force-dynamic'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Settings Admin GET - Iniciando validação de autenticação...')
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Authorization header:', authHeader ? 'Presente' : 'Ausente')
    
    const authResult = await getAuthentication(request)
    console.log('🔍 Resultado da autenticação:', authResult ? 'Sucesso' : 'Falha')
    
    if (!authResult || !authResult.user) {
      console.error('❌ Autenticação falhou - acesso negado para rota administrativa')
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Autenticação bem-sucedida, usuário:', authResult.user?.email)

    // Fazer requisição para o backend usando URL configurada (endpoint administrativo)
    const backendUrl = getInternalApiUrl('/settings')
    console.log('🌐 Tentando conectar com backend (endpoint administrativo):', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    console.log('🌐 Resposta do backend:', backendResponse.status, backendResponse.statusText)

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ Erro do backend:', backendResponse.status, errorText)
      throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`)
    }

    const data = await backendResponse.json()
    console.log('✅ Dados recebidos do backend:', Object.keys(data))
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao carregar configurações administrativas:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Fazer requisição para o backend usando URL configurada
    const backendUrl = getInternalApiUrl('/settings')
    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body
    
    let endpoint = '/settings'
    
    // Determinar endpoint baseado na ação
    if (action === 'reset') {
      endpoint = '/settings/reset'
    } else if (action === 'test-aws') {
      endpoint = '/settings/test-aws'
    } else if (action === 'test-email') {
      endpoint = '/settings/test-email'
    }
    
    // Fazer requisição para o backend usando URL configurada
    const backendUrl = getInternalApiUrl(endpoint)
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro na ação de configurações:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
