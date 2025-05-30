import { NextRequest, NextResponse } from 'next/server'

// Para agora, vou usar uma versão simplificada sem AWS SDK até que as dependências sejam instaladas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    // Mock data com informações de referência
    const mockFilesWithReferences = {
      literario: [
        {
          id: 'lit_1',
          name: 'Dom Casmurro.pdf',
          type: 'PDF',
          size: '2.4 MB',
          bucket: 'literario-bucket',
          lastModified: '2024-01-15',
          description: 'Clássico da literatura brasileira',
          url: 'https://literario-bucket.s3.amazonaws.com/dom-casmurro.pdf',
          hasDbReference: true,
          dbRecord: {
            id: 'db_1',
            createdAt: '2024-01-15',
            uploadedBy: 'admin',
            tags: ['literatura', 'clássico']
          }
        },
        {
          id: 'lit_2',
          name: 'Vidas Secas.epub',
          type: 'EPUB',
          size: '1.8 MB',
          bucket: 'literario-bucket',
          lastModified: '2024-02-10',
          description: 'Romance regionalista de Graciliano Ramos',
          url: 'https://literario-bucket.s3.amazonaws.com/vidas-secas.epub',
          hasDbReference: false,
          dbRecord: null
        },
        {
          id: 'lit_3',
          name: 'O Cortiço.pdf',
          type: 'PDF',
          size: '3.1 MB',
          bucket: 'literario-bucket',
          lastModified: '2024-03-01',
          description: 'Sem descrição',
          url: 'https://literario-bucket.s3.amazonaws.com/o-cortico.pdf',
          hasDbReference: false,
          dbRecord: null
        }
      ],
      professor: [
        {
          id: 'prof_1',
          name: 'Plano de Aula - Matemática.docx',
          type: 'DOCX',
          size: '856 KB',
          bucket: 'professor-bucket',
          lastModified: '2024-03-05',
          description: 'Plano de aula para ensino fundamental',
          url: 'https://professor-bucket.s3.amazonaws.com/plano-matematica.docx',
          hasDbReference: true,
          dbRecord: {
            id: 'db_2',
            createdAt: '2024-03-05',
            uploadedBy: 'prof.silva',
            tags: ['matemática', 'plano-aula']
          }
        },
        {
          id: 'prof_2',
          name: 'Apresentação História.pptx',
          type: 'PPTX',
          size: '15.2 MB',
          bucket: 'professor-bucket',
          lastModified: '2024-02-28',
          description: 'Slides sobre história do Brasil',
          url: 'https://professor-bucket.s3.amazonaws.com/apresentacao-historia.pptx',
          hasDbReference: false,
          dbRecord: null
        }
      ],
      aluno: [
        {
          id: 'alun_1',
          name: 'Exercícios Matemática 6º Ano.pdf',
          type: 'PDF',
          size: '3.2 MB',
          bucket: 'aluno-bucket',
          lastModified: '2024-03-10',
          description: 'Lista de exercícios para estudantes',
          url: 'https://aluno-bucket.s3.amazonaws.com/exercicios-mat-6ano.pdf',
          hasDbReference: true,
          dbRecord: {
            id: 'db_3',
            createdAt: '2024-03-10',
            uploadedBy: 'admin',
            tags: ['exercícios', 'matemática', '6ano']
          }
        },
        {
          id: 'alun_2',
          name: 'Jogo Educativo.zip',
          type: 'ZIP',
          size: '45.8 MB',
          bucket: 'aluno-bucket',
          lastModified: '2024-01-20',
          description: 'Jogo interativo de ciências',
          url: 'https://aluno-bucket.s3.amazonaws.com/jogo-educativo.zip',
          hasDbReference: false,
          dbRecord: null
        },
        {
          id: 'alun_3',
          name: 'Video Aula Fisica.mp4',
          type: 'MP4',
          size: '120.5 MB',
          bucket: 'aluno-bucket',
          lastModified: '2024-03-15',
          description: 'Sem descrição',
          url: 'https://aluno-bucket.s3.amazonaws.com/video-fisica.mp4',
          hasDbReference: false,
          dbRecord: null
        }
      ]
    }

    const files = mockFilesWithReferences[category as keyof typeof mockFilesWithReferences] || []
    
    return NextResponse.json(files)

  } catch (error) {
    console.error('Erro ao verificar referências:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar referência no banco para arquivo existente no S3
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { s3Key, category, name, description, tags } = body

    if (!s3Key || !category) {
      return NextResponse.json(
        { error: 'S3 Key e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Simular criação de referência no banco
    const newRecord = {
      id: `ref_${Date.now()}`,
      name: name || s3Key.split('/').pop(),
      originalName: s3Key.split('/').pop(),
      type: s3Key.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: 0,
      sizeFormatted: 'Desconhecido',
      bucket: `${category}-bucket`,
      s3Key: s3Key,
      s3Url: `https://${category}-bucket.s3.amazonaws.com/${s3Key}`,
      description: description || 'Referência criada manualmente',
      category: category,
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: 'admin',
      isActive: true,
      tags: tags || []
    }

    return NextResponse.json(newRecord, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar referência:', error)
    return NextResponse.json(
      { error: 'Erro ao criar referência no banco' },
      { status: 500 }
    )
  }
} 