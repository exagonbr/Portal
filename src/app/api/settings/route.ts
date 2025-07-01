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
      '/settings/public',
      '/system-settings/public'
    ]

    let lastError = null
    
    for (const endpoint of endpoints) {
      try {
        const backendUrl = getInternalApiUrl(endpoint)
        console.log('🌐 Tentando conectar com backend:', backendUrl)
        
        // Criar AbortController para timeout manual
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
        
        const backendResponse = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        console.log('🌐 Resposta do backend:', backendResponse.status, backendResponse.statusText)

        if (backendResponse.ok) {
          const responseText = await backendResponse.text()
          console.log('📄 Raw response from backend:', responseText.substring(0, 200) + '...')
          
          // Verificar se a resposta não está vazia
          if (!responseText.trim()) {
            throw new Error('Empty response from backend')
          }
          
          let response
          try {
            response = JSON.parse(responseText)
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError)
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`)
          }
          
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
        
        const errorText = await backendResponse.text()
        lastError = `${backendResponse.status} - ${errorText}`
      } catch (err: any) {
        console.log(`❌ Erro ao tentar ${endpoint}:`, err.message || err)
        lastError = err.message || err.toString()
        
        // Se for erro de timeout/abort, tentar próximo endpoint rapidamente
        if (err.name === 'AbortError' || err.message?.includes('timeout')) {
          console.log('⏰ Timeout detectado, tentando próximo endpoint...')
          continue
        }
      }
    }

    throw new Error(`Todos os endpoints falharam. Último erro: ${lastError}`)

  } catch (error: any) {
    console.error('❌ Erro ao carregar configurações:', error.message || error)
    
    // Fallback com configurações padrão expandidas
    console.log('🔄 Usando configurações padrão como fallback')
    
    try {
      return NextResponse.json({
        success: true,
        fallback: true,
        error: error.message || 'Erro desconhecido',
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
    } catch (fallbackError: any) {
      console.error('❌ Erro crítico no fallback:', fallbackError)
      
      // Último recurso - resposta JSON mínima
      return new NextResponse(JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        details: {
          error: error.message || 'Erro desconhecido',
          fallbackError: fallbackError.message || 'Erro no fallback'
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request.headers.get('origin') || undefined)
        }
      })
    }
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
