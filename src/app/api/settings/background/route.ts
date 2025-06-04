import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados - em produção, usar um banco real
let backgroundSettingsData = {
  id: '1',
  type: 'video',
  videoFile: '/back_video1.mp4',
  customUrl: '',
  solidColor: '#1e3a8a'
}

export async function GET() {
  try {
    return NextResponse.json(backgroundSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações de background' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.type || !['video', 'url', 'color'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo de background inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    backgroundSettingsData = {
      ...backgroundSettingsData,
      ...body,
      id: backgroundSettingsData.id || '1'
    }

    return NextResponse.json(backgroundSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar configurações de background' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.type || !['video', 'url', 'color'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Tipo de background inválido' },
        { status: 400 }
      )
    }

    // Atualiza os dados
    backgroundSettingsData = {
      ...backgroundSettingsData,
      ...body
    }

    return NextResponse.json(backgroundSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações de background' },
      { status: 500 }
    )
  }
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

    return NextResponse.json({ message: 'Configurações de background resetadas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações de background' },
      { status: 500 }
    )
  }
} 