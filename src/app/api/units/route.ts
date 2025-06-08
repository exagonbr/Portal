import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de unidade
const createUnitSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  course_id: z.string().uuid('ID de curso inválido'),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0'),
  duration_hours: z.number().int().positive('Duração deve ser positiva').optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_published: z.boolean().default(false),
  content: z.object({
    introduction: z.string().optional(),
    topics: z.array(z.object({
      title: z.string(),
      description: z.string(),
      order: z.number().int().positive()
    })).optional(),
    resources: z.array(z.object({
      type: z.enum(['VIDEO', 'PDF', 'LINK', 'DOCUMENT', 'PRESENTATION']),
      title: z.string(),
      url: z.string().url(),
      duration_minutes: z.number().int().positive().optional()
    })).optional()
  }).optional(),
  assessment: z.object({
    type: z.enum(['QUIZ', 'ASSIGNMENT', 'PROJECT', 'EXAM']),
    passing_score: z.number().min(0).max(100),
    max_attempts: z.number().int().positive().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockUnits = new Map()

// GET - Listar unidades
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const course_id = searchParams.get('course_id')
    const is_active = searchParams.get('is_active')
    const is_published = searchParams.get('is_published')

    // Buscar unidades (substituir por query real)
    let units = Array.from(mockUnits.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'TEACHER') {
      // Professor vê apenas unidades dos cursos que leciona
      // Implementar lógica de verificação
    } else if (userRole === 'STUDENT') {
      // Aluno vê apenas unidades publicadas dos cursos matriculados
      units = units.filter(unit => unit.is_published && unit.is_active)
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      units = units.filter(unit => 
        unit.name.toLowerCase().includes(searchLower) ||
        (unit.description && unit.description.toLowerCase().includes(searchLower))
      )
    }

    if (course_id) {
      units = units.filter(unit => unit.course_id === course_id)
    }

    if (is_active !== null) {
      units = units.filter(unit => unit.is_active === (is_active === 'true'))
    }

    if (is_published !== null) {
      units = units.filter(unit => unit.is_published === (is_published === 'true'))
    }

    // Ordenar por curso e ordem
    units.sort((a, b) => {
      if (a.course_id !== b.course_id) {
        return a.course_id.localeCompare(b.course_id)
      }
      return a.order - b.order
    })

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUnits = units.slice(startIndex, endIndex)

    // Adicionar informações extras
    const unitsWithInfo = paginatedUnits.map(unit => ({
      ...unit,
      lessons_count: unit.lessons?.length || 0,
      completed_by: unit.completed_by?.length || 0,
      average_score: unit.average_score || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: unitsWithInfo,
        pagination: {
          page,
          limit,
          total: units.length,
          totalPages: Math.ceil(units.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar unidades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar unidade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar unidades' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createUnitSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const unitData = validationResult.data

    // Verificar se a ordem já existe no curso
    const existingOrder = Array.from(mockUnits.values()).find(
      unit => unit.course_id === unitData.course_id && 
              unit.order === unitData.order
    )

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Já existe uma unidade com esta ordem neste curso' },
        { status: 409 }
      )
    }

    // Se for professor, verificar se tem permissão no curso
    if (userRole === 'TEACHER') {
      // Implementar verificação se o professor leciona no curso
      // Por enquanto, permitir
    }

    // Criar unidade
    const newUnit = {
      id: `unit_${Date.now()}`,
      ...unitData,
      lessons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockUnits.set(newUnit.id, newUnit)

    return NextResponse.json({
      success: true,
      data: newUnit,
      message: 'Unidade criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar unidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 