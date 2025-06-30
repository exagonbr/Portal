import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

import { getInternalApiUrl } from '@/config/env';

// Simulação de banco de dados
let emailSettingsData = {
  id: '1',
  smtpServer: '',
  smtpPort: 587,
  encryption: 'tls',
  senderEmail: '',
  senderPassword: ''
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    return NextResponse.json(emailSettingsData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de email:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações de email' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()
    
    // Atualiza os dados
    emailSettingsData = {
      ...emailSettingsData,
      ...body,
      id: emailSettingsData.id || '1'
    }

    return NextResponse.json(emailSettingsData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro ao salvar configurações de email:', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações de email' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
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

    return NextResponse.json({ message: 'Configurações de email resetadas' }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações de email' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
