import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

// Simulação de banco de dados - em produção, usar um banco real
let generalSettingsData = {
  id: '1',
  platformName: 'Portal Educacional',
  systemUrl: 'https://portal.educacional.com',
  supportEmail: 'suporte@portal.educacional.com'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(generalSettingsData)
  } catch (error) {
    console.error('Erro ao buscar configurações gerais:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações gerais' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

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
    console.error('Erro ao salvar configurações gerais:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações gerais' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
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