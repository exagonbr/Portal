import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// Configuração do transporter do Nodemailer
const createTransporter = () => {
  // Usar variáveis de ambiente para configuração SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || 'no-reply@sabercon.com.br',
      pass: process.env.SMTP_PASS || 'wcba xeda vopf nbwh',
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });
};

// Função para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Endpoint para envio direto de email
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.subject || !body.message) {
      return NextResponse.json({
        success: false,
        message: 'Assunto e mensagem são obrigatórios'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Validar destinatários
    const recipients = [];
    
    // Adicionar emails diretos
    if (body.recipients?.emails && Array.isArray(body.recipients.emails)) {
      for (const email of body.recipients.emails) {
        if (isValidEmail(email)) {
          recipients.push(email);
        }
      }
    }
    
    // Se não houver destinatários válidos
    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum destinatário válido encontrado'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Criar transporter
    const transporter = createTransporter();

    // Verificar conexão com o servidor SMTP
    try {
      await transporter.verify();
      console.log('✅ Conexão com servidor SMTP estabelecida');
    } catch (verifyError) {
      console.error('❌ Erro ao verificar conexão SMTP:', verifyError);
      return NextResponse.json({
        success: false,
        message: 'Erro ao conectar ao servidor de email. Verifique as configurações SMTP.'
      }, {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Preparar email
    const mailOptions = {
      from: 'Portal Sabercon <no-reply@sabercon.com.br>',
      to: recipients.join(', '),
      subject: body.subject,
      html: body.html ? body.message : undefined,
      text: !body.html ? body.message : undefined,
    };

    // Enviar email com retry
    let success = false;
    let error: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!success && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`📧 Tentativa ${attempts} de envio de email para ${recipients.length} destinatário(s)`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso:', info.messageId);
        success = true;
      } catch (err) {
        error = err;
        console.error(`❌ Tentativa ${attempts} falhou:`, err);
        
        // Aguardar antes de tentar novamente (exponential backoff)
        if (attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 1000;
          console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Retornar resposta
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Email enviado com sucesso para ${recipients.length} destinatário(s)!`,
        data: {
          recipients: recipients.length,
          subject: body.subject,
          timestamp: new Date().toISOString()
        }
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    } else {
      console.error('❌ Todas as tentativas de envio falharam:', error);
      return NextResponse.json({
        success: false,
        message: `Falha ao enviar email após ${maxAttempts} tentativas: ${error?.message || 'Erro desconhecido'}`
      }, {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint de envio direto de email:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
} 