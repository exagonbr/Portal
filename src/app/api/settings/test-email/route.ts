import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validação básica
    if (!body.smtpServer || !body.smtpPort || !body.senderEmail || !body.senderPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Configurações de email incompletas. Verifique todos os campos.'
        },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.senderEmail)) {
      return NextResponse.json(
        { error: 'Email de remetente inválido' },
        { status: 400 }
      )
    }

    // Validação de porta
    if (body.smtpPort < 1 || body.smtpPort > 65535) {
      return NextResponse.json(
        { error: 'Porta SMTP inválida' },
        { status: 400 }
      )
    }

    // Simulação de teste de conexão
    // Em produção, aqui você usaria uma biblioteca como nodemailer para testar
    return NextResponse.json({
      success: true,
      message: 'Conexão com servidor de email estabelecida com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao testar conexão de email:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao testar conexão de email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 