import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
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

    // Simulação de teste de conexão
    // Em produção, aqui você usaria o AWS SDK para testar a conexão
    if (!body.accessKeyId || !body.secretAccessKey || !body.region) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciais AWS incompletas. Verifique Access Key, Secret Key e Região.'
        },
        { status: 400 }
      )
    }

    // Simula um teste bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Conexão com AWS S3 estabelecida com sucesso!'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('Erro ao testar conexão S3:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao testar conexão S3',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 
