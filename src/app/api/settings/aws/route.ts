import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Retorna os dados simulados diretamente
    return NextResponse.json(awsSettingsData)
  } catch (error) {
    console.error('Erro ao buscar configurações AWS:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações AWS' },
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
    if (!body.region) {
      return NextResponse.json(
        { error: 'Região é obrigatória' },
        { status: 400 }
      )
    }

    // Atualiza os dados simulados
    awsSettingsData = {
      ...awsSettingsData,
      ...body,
      id: awsSettingsData.id || '1'
    }

    return NextResponse.json(awsSettingsData)
  } catch (error) {
    console.error('Erro ao salvar configurações AWS:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações AWS' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Reset para valores padrão
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