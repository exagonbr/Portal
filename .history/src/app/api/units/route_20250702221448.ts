import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { getInternalApiUrl } from '@/config/env'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

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

// GET - Listar unidades

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(`http://localhost:3001/api/units${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch units' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.log('Error fetching units:', error)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar unidade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    const response = await fetch('http://localhost:3001/api/units', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to create unit' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.log('Error creating unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
