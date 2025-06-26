import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar configurações' },
        { status: 403 }
      )
    }

    // Fazer requisição para o backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const data = await backendResponse.json()

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    
    // Fallback para configurações mock em caso de erro
    const mockSettings = {
      // Configurações gerais
      site_name: 'Portal Educacional',
      site_title: 'Portal Educacional - Sistema de Gestão',
      site_url: 'https://portal.educacional.com',
      site_description: 'Sistema completo de gestão educacional',
      maintenance_mode: false,
      
      // Configurações de aparência
      logo_light: '/logo-light.png',
      logo_dark: '/logo-dark.png',
      background_type: 'video',
      main_background: '/back_video4.mp4',
      primary_color: '#1e3a8a',
      secondary_color: '#3b82f6',
      
      // Configurações AWS
      aws_access_key: 'AKIAYKBH43KYB2DJUQJL',
      aws_secret_key: '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',
      aws_region: 'sa-east-1',
      aws_bucket_main: '',
      aws_bucket_backup: '',
      aws_bucket_media: '',
      
      // Configurações de Email
      email_smtp_host: 'smtp.gmail.com',
      email_smtp_port: 587,
      email_smtp_user: 'sabercon@sabercon.com.br',
      email_smtp_password: 'Mayta#P1730*K',
      email_smtp_secure: true,
      email_from_name: 'Portal Educacional - Sabercon',
      email_from_address: 'noreply@sabercon.com.br',
      
      // Configurações de Notificações
      notifications_email_enabled: true,
      notifications_sms_enabled: false,
      notifications_push_enabled: true,
      notifications_digest_frequency: 'daily'
    }

    return NextResponse.json({
      success: true,
      data: mockSettings,
      fallback: true
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para alterar configurações' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Fazer requisição para o backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.token}`,
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
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para resetar configurações' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    let endpoint = ''
    switch (action) {
      case 'reset':
        endpoint = '/api/settings/reset'
        break
      case 'test-aws':
        endpoint = '/api/settings/test-aws'
        break
      case 'test-email':
        endpoint = '/api/settings/test-email'
        break
      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

    // Fazer requisição para o backend
    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
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
    console.error('Erro ao executar ação:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 