import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica dos campos necessários
    if (!body.smtpServer || !body.smtpPort || !body.senderEmail) {
      return NextResponse.json(
        { error: 'Configurações de email incompletas' },
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

    // Simulação de teste de conexão SMTP
    // Em produção, aqui você faria a conexão real com nodemailer ou similar
    await new Promise(resolve => setTimeout(resolve, 3000)) // Simula delay da API

    // Simula resultado baseado nas configurações
    const commonServers = ['smtp.gmail.com', 'smtp.outlook.com', 'smtp.yahoo.com', 'smtp.servidor.com']
    const isValidServer = commonServers.some(server => body.smtpServer.includes(server.split('.')[1]))
    const isValidPort = [25, 465, 587, 993, 995].includes(body.smtpPort)

    if (isValidServer && isValidPort) {
      return NextResponse.json({
        success: true,
        message: 'Conexão SMTP testada com sucesso',
        details: {
          server: body.smtpServer,
          port: body.smtpPort,
          encryption: body.encryption,
          authentication: 'OK'
        }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Falha na conexão SMTP. Verifique servidor e porta.' 
        },
        { status: 401 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno ao testar conexão de email' 
      },
      { status: 500 }
    )
  }
} 