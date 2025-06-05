import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

// Simulação de banco de dados - em produção, usar um banco real
let securitySettingsData = {
  id: '1',
  minPasswordLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  twoFactorAuth: 'optional',
  sessionTimeout: 30
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(securitySettingsData)
  } catch (error) {
    console.error('Erro ao buscar configurações de segurança:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações de segurança' },
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
    
    // Atualiza os dados
    securitySettingsData = {
      ...securitySettingsData,
      ...body,
      id: securitySettingsData.id || '1'
    }

    return NextResponse.json(securitySettingsData)
  } catch (error) {
    console.error('Erro ao salvar configurações de segurança:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações de segurança' },
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