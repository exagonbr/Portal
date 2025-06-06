import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { host, port, user, password, secure, fromAddress } = await request.json()

    if (!host || !port || !user || !password) {
      return NextResponse.json(
        { error: 'Configurações de email incompletas' },
        { status: 400 }
      )
    }

    // Criar transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure || port === 465,
      auth: {
        user,
        pass: password
      }
    })

    try {
      // Verificar conexão
      await transporter.verify()

      // Enviar email de teste
      await transporter.sendMail({
        from: fromAddress || user,
        to: session.user.email,
        subject: 'Teste de Configuração de Email - Portal Educacional',
        html: `
          <h2>Teste de Email Bem-sucedido!</h2>
          <p>Este é um email de teste enviado pelo Portal Educacional.</p>
          <p>Se você recebeu este email, as configurações de email estão funcionando corretamente.</p>
          <hr>
          <p><small>Email enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'Email de teste enviado com sucesso!'
      })
    } catch (emailError: any) {
      console.error('Erro ao enviar email:', emailError)
      return NextResponse.json({
        success: false,
        message: `Erro ao enviar email: ${emailError.message || 'Verifique as configurações'}`
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao testar email:', error)
    return NextResponse.json(
      { error: 'Erro ao testar configuração de email' },
      { status: 500 }
    )
  }
} 