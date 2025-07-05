import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


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

    const { host, port, user, password, secure, fromAddress } = await request.json()

    if (!host || !port || !user || !password) {
      return NextResponse.json({ error: 'Configurações de email incompletas' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
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
        to: session.user?.email || '',
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
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    } catch (emailError: any) {
      console.log('Erro ao enviar email:', emailError)
      return NextResponse.json({
        success: false,
        message: `Erro ao enviar email: ${emailError.message || 'Verifique as configurações'}`
      }, { status: 400 })
    }
  } catch (error) {
    console.log('Erro ao testar email:', error)
    return NextResponse.json({ error: 'Erro ao testar configuração de email' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
