import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de unidade
const updateUnitSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0').optional(),
  duration_hours: z.number().int().positive('Duração deve ser positiva').optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_published: z.boolean().optional(),
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

import { getInternalApiUrl } from '@/config/env';

// GET - Buscar unidade por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`getInternalApiUrl('/api/api/units/${params.id}')`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch unit' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar unidade
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`getInternalApiUrl('/api/api/units/${params.id}')`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to update unit' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remover unidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`getInternalApiUrl('/api/api/units/${params.id}')`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete unit' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: 'Unit deleted successfully' })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 