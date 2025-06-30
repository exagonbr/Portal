import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const { accessKeyId, secretAccessKey, region } = await request.json()

    if (!accessKeyId || !secretAccessKey || !region) {
      return NextResponse.json({ error: 'Credenciais AWS incompletas' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Configurar cliente S3
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })

    try {
      // Testar conexão listando buckets
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)
      
      const buckets = response.Buckets?.map(bucket => bucket.Name) || []

      return NextResponse.json({
        success: true,
        buckets,
        message: 'Conexão AWS estabelecida com sucesso!'
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    } catch (awsError: any) {
      console.error('Erro AWS:', awsError)
      return NextResponse.json({
        success: false,
        message: `Erro ao conectar com AWS: ${awsError.message || 'Verifique as credenciais'}`
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao testar conexão AWS:', error)
    return NextResponse.json({ error: 'Erro ao testar conexão AWS' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
