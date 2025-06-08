import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar configurações do backend
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers: {
        'Authorization': `Bearer ${session.user?.id}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar configurações')
    }

    const settings = await response.json()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const updates = await request.json()

    // Enviar atualizações para o backend
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user?.id}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar configurações')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
} 