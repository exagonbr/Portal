import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Interface para configuração do Gmail
interface GmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from?: string;
}

// Interface para opções do email
interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Headers CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Função para criar transporter do Gmail otimizado
function createGmailTransporter(config: GmailConfig) {
  return nodemailer.createTransport({
    service: 'gmail', // Usar serviço pré-configurado do Gmail
    host: config.host || 'smtp.gmail.com',
    port: config.port || 587,
    secure: false, // Usar STARTTLS (recomendado para Gmail)
    requireTLS: true, // Forçar TLS
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      // Aceitar certificados auto-assinados (útil para desenvolvimento)
      rejectUnauthorized: false,
    },
    // Configurações específicas do Gmail para evitar problemas
    connectionTimeout: 60000, // 60 segundos
    greetingTimeout: 30000, // 30 segundos
    socketTimeout: 60000, // 60 segundos
  });
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 [GoogleEmail API] Iniciando envio de email...');

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autorizado - Faça login para enviar emails',
          error: 'UNAUTHORIZED'
        },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();
    const { config, options } = body;

    // Validar dados da configuração
    if (!config || !config.user || !config.pass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Configuração de email incompleta',
          error: 'INVALID_CONFIG'
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Validar dados do email
    if (!options || !options.subject || !options.to) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados do email incompletos (assunto e destinatário são obrigatórios)',
          error: 'INVALID_EMAIL_DATA'
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    if (!options.html && !options.text) {
      return NextResponse.json(
        {
          success: false,
          message: 'Conteúdo do email é obrigatório (HTML ou texto)',
          error: 'INVALID_EMAIL_DATA'
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Validar destinatários
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const invalidEmails = recipients.filter((email: string) => !isValidEmail(email));
    
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Emails inválidos encontrados: ${invalidEmails.join(', ')}`,
          error: 'INVALID_RECIPIENTS'
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    console.log('🔧 [GoogleEmail API] Criando transporter...');
    
    // Criar transporter do Gmail
    const transporter = createGmailTransporter(config);

    // Testar conexão (opcional, mas recomendado)
    try {
      await transporter.verify();
      console.log('✅ [GoogleEmail API] Conexão verificada com sucesso');
    } catch (verifyError: any) {
      console.error('❌ [GoogleEmail API] Erro na verificação:', verifyError);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro na verificação da conexão com Gmail',
          error: 'CONNECTION_FAILED',
          details: verifyError.message
        },
        {
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Preparar opções do email
    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from || config.from || `Portal Sabercon <${config.user}>`,
      to: recipients.join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    console.log('📤 [GoogleEmail API] Enviando email...');
    console.log(`📧 Para: ${recipients.length} destinatário(s)`);
    console.log(`📋 Assunto: ${options.subject}`);

    // Enviar email com retry
    let success = false;
    let messageId: string | undefined;
    let lastError: any = null;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 [GoogleEmail API] Tentativa ${attempt}/${maxAttempts}`);
        
        const info = await transporter.sendMail(mailOptions);
        messageId = info.messageId;
        success = true;
        
        console.log(`✅ [GoogleEmail API] Email enviado com sucesso na tentativa ${attempt}`);
        console.log(`📨 Message ID: ${messageId}`);
        break;
        
      } catch (sendError: any) {
        lastError = sendError;
        console.error(`❌ [GoogleEmail API] Tentativa ${attempt} falhou:`, sendError.message);
        
        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ [GoogleEmail API] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (success) {
      // Log de sucesso detalhado
      console.log('🎉 [GoogleEmail API] Email enviado com sucesso!');
      
      return NextResponse.json(
        {
          success: true,
          message: `Email enviado com sucesso para ${recipients.length} destinatário(s)`,
          messageId,
          recipients: recipients.length,
          timestamp: new Date().toISOString()
        },
        {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    } else {
      // Log de erro detalhado
      console.error('💥 [GoogleEmail API] Todas as tentativas falharam');
      console.error('📋 Último erro:', lastError);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Falha no envio após todas as tentativas',
          error: 'SEND_FAILED',
          details: lastError?.message || 'Erro desconhecido',
          attempts: maxAttempts
        },
        {
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

  } catch (error: any) {
    console.error('💥 [GoogleEmail API] Erro geral:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR',
        details: error.message
      },
      {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Suporte para OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }
  );
} 