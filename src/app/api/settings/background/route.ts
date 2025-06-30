import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

import { getInternalApiUrl } from '@/config/env';

// Simulação de banco de dados - em produção, usar um banco real
let backgroundSettingsData = {
  id: '1',
  type: 'video',
  videoFile: '/back_video1.mp4',
  customUrl: '',
  solidColor: '#1e3a8a'
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

    return NextResponse.json(backgroundSettingsData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de background:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações de background' }, { 
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
    
    // Validação básica
    if (!body.type || !['video', 'url', 'color'].includes(body.type)) {
      return NextResponse.json({ error: 'Tipo de background inválido' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Atualiza os dados
    backgroundSettingsData = {
      ...backgroundSettingsData,
      ...body,
      id: backgroundSettingsData.id || '1'
    }

    return NextResponse.json(backgroundSettingsData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro ao salvar configurações de background:', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações de background' }, { 
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
    backgroundSettingsData = {
      id: '1',
      type: 'video',
      videoFile: '/back_video1.mp4',
      customUrl: '',
      solidColor: '#1e3a8a'
    }

    return NextResponse.json({ message: 'Configurações de background resetadas' }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações de background' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
