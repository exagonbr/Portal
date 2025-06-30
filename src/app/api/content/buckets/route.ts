import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

// Configuração S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

// Buckets configurados no projeto
const CONFIGURED_BUCKETS = {
  literario: {
    name: process.env.S3_BUCKET_LITERARIO || 'sabercon-library',
    label: 'Conteúdo Literário',
    category: 'literario',
    description: 'Livros, textos e material literário'
  },
  professor: {
    name: process.env.S3_BUCKET_PROFESSOR || 'editora-liberty',
    label: 'Conteúdo Professor',
    category: 'professor',
    description: 'Videos e Material de Apoio e Certificados'
  },
  aluno: {
    name: process.env.S3_BUCKET_ALUNO || 'editora-liberty',
    label: 'Conteúdo Aluno',
    category: 'aluno',
    description: 'Exercícios, jogos educativos e material para estudantes'
  }
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listAll = searchParams.get('listAll') === 'true'

    if (listAll) {
      // Listar todos os buckets da conta AWS
      try {
        const command = new ListBucketsCommand({})
        const response = await s3Client.send(command)
        
        const allBuckets = response.Buckets?.map(bucket => ({
          name: bucket.Name || '',
          creationDate: bucket.CreationDate?.toISOString() || '',
          isConfigured: Object.values(CONFIGURED_BUCKETS).some(cb => cb.name === bucket.Name)
        })) || []

        return NextResponse.json({
          configured: Object.values(CONFIGURED_BUCKETS, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
          all: allBuckets,
          total: allBuckets.length
        })
      } catch (awsError) {
        console.warn('Não foi possível listar todos os buckets AWS:', awsError)
        // Retornar apenas os buckets configurados se não conseguir listar
        return NextResponse.json({
          configured: Object.values(CONFIGURED_BUCKETS, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
          all: [],
          total: Object.keys(CONFIGURED_BUCKETS).length,
          warning: 'Não foi possível listar todos os buckets AWS. Mostrando apenas buckets configurados.'
        })
      }
    }

    // Retornar apenas buckets configurados
    return NextResponse.json({
      configured: Object.values(CONFIGURED_BUCKETS, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
      total: Object.keys(CONFIGURED_BUCKETS).length
    })

  } catch (error) {
    console.error('Erro ao listar buckets:', error)
    return NextResponse.json({ error: 'Erro interno do servidor ao listar buckets' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Adicionar novo bucket à configuração (para admin)
export async function POST(request: NextRequest) {
  try {
    const { name, label, category, description } = await request.json()

    if (!name || !label || !category) {
      return NextResponse.json(
        { error: 'Nome, label e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o bucket existe na AWS
    try {
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)
      const bucketExists = response.Buckets?.some(bucket => bucket.Name === name)

      if (!bucketExists) {
        return NextResponse.json({ error: 'Bucket não encontrado na sua conta AWS' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    } catch (awsError) {
      return NextResponse.json({ error: 'Erro ao verificar bucket na AWS' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Em uma implementação real, você salvaria esta configuração no banco de dados
    const newBucket = {
      name,
      label,
      category,
      description: description || '',
      addedAt: new Date().toISOString()
    }

    return NextResponse.json(newBucket, { 
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao adicionar bucket:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 