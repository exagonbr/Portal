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
    console.log('🔍 API Settings GET - Rota pública, sem verificação de autenticação')

    // Tentar múltiplos endpoints possíveis
    const endpoints = [
      '/api/settings/public',
      '/settings/public',
      '/api/system-settings/public'
    ]

    let lastError = null
    
    for (const endpoint of endpoints) {
      try {
        const backendUrl = getInternalApiUrl(endpoint)
        console.log('🌐 Tentando conectar com backend:', backendUrl)
        
        const backendResponse = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          // Timeout de 5 segundos
          signal: AbortSignal.timeout(5000)
        })

        console.log('🌐 Resposta do backend:', backendResponse.status, backendResponse.statusText)

        if (backendResponse.ok) {
          const response = await backendResponse.json()
          console.log('✅ Dados recebidos do backend:', Object.keys(response))
          
          // Se a resposta tem sucesso e dados categorizados, achatar a estrutura
          if (response.success && response.data) {
            const flatData: any = {}
            
            // Achatar as categorias em um único objeto
            Object.values(response.data).forEach((category: any) => {
              if (typeof category === 'object' && category !== null) {
                Object.assign(flatData, category)
              }
            })
            
            return NextResponse.json({
              success: true,
              data: flatData
            }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
          }
          
          return NextResponse.json(response, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
        }
        
        lastError = `${backendResponse.status} - ${await backendResponse.text()}`
      } catch (err) {
        console.log(`❌ Erro ao tentar ${endpoint}:`, err)
        lastError = err
      }
    }

    throw new Error(`Todos os endpoints falharam. Último erro: ${lastError}`)

  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error)
    
    // Fallback com configurações padrão expandidas
    console.log('🔄 Usando configurações padrão como fallback')
    return NextResponse.json({
      success: true,
      fallback: true,
      data: {
        site_name: 'Portal Sabercon',
        site_title: 'Portal Educacional Sabercon',
        site_url: 'https://portal.sabercon.com.br',
        site_description: 'Sistema completo de gestão educacional',
        maintenance_mode: false,
        logo_light: '/logo-light.png',
        logo_dark: '/logo-dark.png',
        background_type: 'video',
        main_background: '/back_video4.mp4',
        primary_color: '#1e3a8a',
        secondary_color: '#3b82f6',
        aws_access_key: 'AKIAYKBH43KYB2DJUQJL',
        aws_secret_key: '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',
        aws_region: 'sa-east-1',
        aws_bucket_main: '',
        aws_bucket_backup: '',
        aws_bucket_media: '',
        email_smtp_host: 'smtp.gmail.com',
        email_smtp_port: 587,
        email_smtp_user: 'sabercon@sabercon.com.br',
        email_smtp_password: 'Mayta#P1730*K',
        email_smtp_secure: true,
        email_from_name: 'Portal Educacional - Sabercon',
        email_from_address: 'noreply@sabercon.com.br',
        notifications_email_enabled: true,
        notifications_sms_enabled: false,
        notifications_push_enabled: true,
        notifications_digest_frequency: 'daily'
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
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