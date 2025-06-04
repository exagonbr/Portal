import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados - em produção, usar um banco real
let awsSettingsData = {
  id: '1',
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1',
  s3BucketName: '',
  cloudWatchNamespace: 'Portal/Metrics',
  updateInterval: 30,
  enableRealTimeUpdates: true
}

export async function GET() {
  try {
    return NextResponse.json(awsSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações AWS' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.region) {
      return NextResponse.json(
        { error: 'Região é obrigatória' },
        { status: 400 }
      )
    }

    // Atualiza os dados (em produção, salvar no banco)
    awsSettingsData = {
      ...awsSettingsData,
      ...body,
      id: awsSettingsData.id || '1'
    }

    return NextResponse.json(awsSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar configurações AWS' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.region) {
      return NextResponse.json(
        { error: 'Região é obrigatória' },
        { status: 400 }
      )
    }

    // Atualiza os dados (em produção, atualizar no banco)
    awsSettingsData = {
      ...awsSettingsData,
      ...body
    }

    return NextResponse.json(awsSettingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações AWS' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Reset para valores padrão (em produção, deletar do banco)
    awsSettingsData = {
      id: '1',
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
      s3BucketName: '',
      cloudWatchNamespace: 'Portal/Metrics',
      updateInterval: 30,
      enableRealTimeUpdates: true
    }

    return NextResponse.json({ message: 'Configurações AWS resetadas' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar configurações AWS' },
      { status: 500 }
    )
  }
} 