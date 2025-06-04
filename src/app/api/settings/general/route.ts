import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados - em produção, usar um banco real
let generalSettingsData = {
  id: '1',
  platformName: 'Portal Educacional',
  systemUrl: 'https://portal.educacional.com',
  supportEmail: 'suporte@portal.educacional.com'
}

export async function GET() {
  try {
    return NextResponse.json(generalSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações gerais' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.platformName || !body.systemUrl || !body.supportEmail) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.supportEmail)) {
      return NextResponse.json(
        { error: 'Email de suporte inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    generalSettingsData = {
      ...generalSettingsData,
      ...body,
      id: generalSettingsData.id || '1'
    }

    return NextResponse.json(generalSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar configurações gerais' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.platformName || !body.systemUrl || !body.supportEmail) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.supportEmail)) {
      return NextResponse.json(
        { error: 'Email de suporte inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    generalSettingsData = {
      ...generalSettingsData,
      ...body
    }

    return NextResponse.json(generalSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações gerais' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Reset para valores padrão
    generalSettingsData = {
      id: '1',
      platformName: 'Portal Educacional',
      systemUrl: 'https://portal.educacional.com',
      supportEmail: 'suporte@portal.educacional.com'
    }

    return NextResponse.json({ message: 'Configurações gerais resetadas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações gerais' },
      { status: 500 }
    )
  }
} 