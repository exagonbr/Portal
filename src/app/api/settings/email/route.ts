import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados - em produção, usar um banco real
let emailSettingsData = {
  id: '1',
  smtpServer: '',
  smtpPort: 587,
  encryption: 'tls',
  senderEmail: '',
  senderPassword: ''
}

export async function GET() {
  try {
    return NextResponse.json(emailSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações de email' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (body.smtpPort < 1 || body.smtpPort > 65535) {
      return NextResponse.json(
        { error: 'Porta SMTP deve estar entre 1 e 65535' },
        { status: 400 }
      )
    }

    if (!['tls', 'ssl', 'none'].includes(body.encryption)) {
      return NextResponse.json(
        { error: 'Tipo de criptografia inválido' },
        { status: 400 }
      )
    }

    // Validação de email
    if (body.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.senderEmail)) {
      return NextResponse.json(
        { error: 'Email de remetente inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    emailSettingsData = {
      ...emailSettingsData,
      ...body,
      id: emailSettingsData.id || '1'
    }

    return NextResponse.json(emailSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar configurações de email' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (body.smtpPort < 1 || body.smtpPort > 65535) {
      return NextResponse.json(
        { error: 'Porta SMTP deve estar entre 1 e 65535' },
        { status: 400 }
      )
    }

    if (!['tls', 'ssl', 'none'].includes(body.encryption)) {
      return NextResponse.json(
        { error: 'Tipo de criptografia inválido' },
        { status: 400 }
      )
    }

    // Validação de email
    if (body.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.senderEmail)) {
      return NextResponse.json(
        { error: 'Email de remetente inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    emailSettingsData = {
      ...emailSettingsData,
      ...body
    }

    return NextResponse.json(emailSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações de email' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Reset para valores padrão
    emailSettingsData = {
      id: '1',
      smtpServer: '',
      smtpPort: 587,
      encryption: 'tls',
      senderEmail: '',
      senderPassword: ''
    }

    return NextResponse.json({ message: 'Configurações de email resetadas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações de email' },
      { status: 500 }
    )
  }
} 