import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'

// Mock de configurações
const mockSettings = {
  general: {
    site_name: 'Portal Educacional',
    site_description: 'Sistema de gestão educacional',
    logo_url: '/logo.png',
    theme: 'light'
  },
  email: {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: 'noreply@portal.com',
    smtp_enabled: true
  },
  aws: {
    region: 'sa-east-1',
    s3_bucket: 'portal-files',
    enabled: true
  },
  security: {
    password_min_length: 8,
    session_timeout: 3600,
    two_factor_enabled: false
  }
}

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

    return NextResponse.json({
      success: true,
      data: mockSettings
    })

  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
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

    // Atualizar configurações (em produção, salvar no banco)
    Object.assign(mockSettings, body)

    return NextResponse.json({
      success: true,
      data: mockSettings,
      message: 'Configurações atualizadas com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 