import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { API_CONFIG } from '@/config/constants'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role_id: z.string().uuid('ID de role inválido'),
  institution_id: z.string().uuid('ID de instituição inválido').optional(),
  school_id: z.string().uuid('ID de escola inválido').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
})

// GET - Listar usuários (Proxy para o Backend)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // A verificação de permissão deve ser feita no backend, mas podemos ter uma camada aqui também
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para listar usuários' }, { status: 403 })
    }

    // Encaminha todos os parâmetros de query para o backend
    const { searchParams } = new URL(request.url)
    const backendUrl = `${API_CONFIG.BASE_URL}/users?${searchParams.toString()}`

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${session.user?.id}`, // Assumindo que o ID do usuário é o token
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      console.error('Erro ao buscar usuários do backend:', errorData)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários no backend', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro no proxy ao listar usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar usuário (Proxy para o Backend)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para criar usuários' }, { status: 403 })
    }

    const body = await request.json()

    // Valida o corpo da requisição antes de enviar para o backend
    const validationResult = createUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const backendUrl = `${API_CONFIG.BASE_URL}/users`
    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.user?.id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationResult.data)
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('Erro ao criar usuário no backend:', data)
        return NextResponse.json(
            { error: 'Erro ao criar usuário no backend', details: data },
            { status: response.status }
        )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Erro no proxy ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}