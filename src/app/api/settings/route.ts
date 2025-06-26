import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication } from '@/lib/auth-utils'
import { getInternalApiUrl } from '@/config/env'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Fazer requisição para o backend usando URL configurada
    const backendUrl = getInternalApiUrl('/api/settings')
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao carregar configurações:', error)
    
    // Fallback com configurações padrão
    return NextResponse.json({
      success: true,
      fallback: true,
      data: {
        site_name: 'Portal Sabercon',
        site_title: 'Portal Educacional Sabercon',
        site_url: 'https://portal.sabercon.com.br',
        maintenance_mode: false,
        background_type: 'video',
        main_background: '/back_video.mp4'
      }
    })
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
    const backendUrl = getInternalApiUrl('/api/settings')
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
    return NextResponse.json(data)

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
    
    let endpoint = '/api/settings'
    
    // Determinar endpoint baseado na ação
    if (action === 'reset') {
      endpoint = '/api/settings/reset'
    } else if (action === 'test-aws') {
      endpoint = '/api/settings/test-aws'
    } else if (action === 'test-email') {
      endpoint = '/api/settings/test-email'
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
    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro na ação de configurações:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 