import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados - em produção, usar um banco real
let securitySettingsData = {
  id: '1',
  minPasswordLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  twoFactorAuth: 'optional',
  sessionTimeout: 30
}

export async function GET() {
  try {
    return NextResponse.json(securitySettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações de segurança' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (body.minPasswordLength < 6 || body.minPasswordLength > 128) {
      return NextResponse.json(
        { error: 'Tamanho mínimo da senha deve estar entre 6 e 128 caracteres' },
        { status: 400 }
      )
    }

    if (!['optional', 'required', 'disabled'].includes(body.twoFactorAuth)) {
      return NextResponse.json(
        { error: 'Configuração de 2FA inválida' },
        { status: 400 }
      )
    }

    if (body.sessionTimeout < 5 || body.sessionTimeout > 1440) {
      return NextResponse.json(
        { error: 'Timeout de sessão deve estar entre 5 e 1440 minutos' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    securitySettingsData = {
      ...securitySettingsData,
      ...body,
      id: securitySettingsData.id || '1'
    }

    return NextResponse.json(securitySettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar configurações de segurança' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (body.minPasswordLength < 6 || body.minPasswordLength > 128) {
      return NextResponse.json(
        { error: 'Tamanho mínimo da senha deve estar entre 6 e 128 caracteres' },
        { status: 400 }
      )
    }

    if (!['optional', 'required', 'disabled'].includes(body.twoFactorAuth)) {
      return NextResponse.json(
        { error: 'Configuração de 2FA inválida' },
        { status: 400 }
      )
    }

    if (body.sessionTimeout < 5 || body.sessionTimeout > 1440) {
      return NextResponse.json(
        { error: 'Timeout de sessão deve estar entre 5 e 1440 minutos' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    securitySettingsData = {
      ...securitySettingsData,
      ...body
    }

    return NextResponse.json(securitySettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações de segurança' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Reset para valores padrão
    securitySettingsData = {
      id: '1',
      minPasswordLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      twoFactorAuth: 'optional',
      sessionTimeout: 30
    }

    return NextResponse.json({ message: 'Configurações de segurança resetadas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações de segurança' },
      { status: 500 }
    )
  }
} 