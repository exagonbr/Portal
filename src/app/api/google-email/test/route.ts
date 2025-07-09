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
    secure: true, // Usar STARTTLS (recomendado para Gmail)
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [GoogleEmail Test] Iniciando teste de configuração...');

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Não autorizado - Faça login para testar configurações',
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
    const { config } = body;

    // Validar dados da configuração
    if (!config || !config.user || !config.pass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Configuração de email incompleta para teste',
          error: 'INVALID_CONFIG'
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    console.log('🔧 [GoogleEmail Test] Criando transporter para teste...');
    console.log(`📧 [GoogleEmail Test] Testando com usuário: ${config.user}`);
    console.log(`🏠 [GoogleEmail Test] Host: ${config.host || 'smtp.gmail.com'}`);
    console.log(`🔌 [GoogleEmail Test] Porta: ${config.port || 587}`);
    
    // Criar transporter do Gmail
    const transporter = createGmailTransporter(config);

    // Testar conexão
    try {
      console.log('🔍 [GoogleEmail Test] Verificando conexão SMTP...');
      
      await transporter.verify();
      
      console.log('✅ [GoogleEmail Test] Conexão SMTP verificada com sucesso');
      
      // Tentar enviar um email de teste (opcional)
      try {
        console.log('📤 [GoogleEmail Test] Enviando email de teste...');
        
        const testMailOptions: nodemailer.SendMailOptions = {
          from: config.from || `Portal Sabercon <${config.user}>`,
          to: session.user?.email || config.user, // Enviar para o próprio usuário
          subject: 'Teste de Configuração - Portal Sabercon',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a8a;">🎉 Teste de Email Bem-sucedido!</h2>
              <p>Este é um email de teste enviado pelo <strong>Portal Sabercon</strong>.</p>
              <p>Se você recebeu este email, a configuração do Gmail está funcionando corretamente.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Configuração Validada</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Conexão SMTP: <strong>OK</strong></li>
                  <li>Autenticação: <strong>OK</strong></li>
                  <li>Envio de email: <strong>OK</strong></li>
                </ul>
              </div>
              
              <hr style="border: none; height: 1px; background-color: #e9ecef; margin: 20px 0;">
              
              <p style="color: #6c757d; font-size: 12px;">
                Email de teste enviado em: ${new Date().toLocaleString('pt-BR')}<br>
                Usuário: ${session.user?.name || session.user?.email}<br>
                Sistema: Portal Educacional Sabercon
              </p>
            </div>
          `,
          text: `
            Teste de Email Bem-sucedido!
            
            Este é um email de teste enviado pelo Portal Sabercon.
            Se você recebeu este email, a configuração do Gmail está funcionando corretamente.
            
            Configuração Validada:
            - Conexão SMTP: OK
            - Autenticação: OK
            - Envio de email: OK
            
            Email de teste enviado em: ${new Date().toLocaleString('pt-BR')}
            Usuário: ${session.user?.name || session.user?.email}
            Sistema: Portal Educacional Sabercon
          `
        };

        const info = await transporter.sendMail(testMailOptions);
        
        console.log('✅ [GoogleEmail Test] Email de teste enviado com sucesso');
        console.log(`📨 [GoogleEmail Test] Message ID: ${info.messageId}`);
        
        return NextResponse.json(
          {
            success: true,
            message: 'Configuração testada com sucesso! Email de teste enviado.',
            details: {
              smtpConnection: 'OK',
              authentication: 'OK',
              emailSent: 'OK',
              messageId: info.messageId,
              recipient: session.user?.email || config.user,
              timestamp: new Date().toISOString()
            }
          },
          {
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
        
      } catch (emailError: any) {
        console.warn('⚠️ [GoogleEmail Test] Conexão OK, mas erro no envio de teste:', emailError.message);
        
        return NextResponse.json(
          {
            success: true,
            message: 'Conexão SMTP válida, mas erro no envio de teste',
            details: {
              smtpConnection: 'OK',
              authentication: 'OK',
              emailSent: 'FAILED',
              error: emailError.message,
              note: 'A conexão está funcionando, mas pode haver problemas com configurações específicas do email'
            }
          },
          {
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }
      
    } catch (verifyError: any) {
      console.error('❌ [GoogleEmail Test] Erro na verificação da conexão:', verifyError);
      
      // Analisar o tipo de erro para dar feedback mais específico
      let errorMessage = 'Erro na verificação da conexão com Gmail';
      let troubleshootingTips: string[] = [];
      
      if (verifyError.message.includes('EAUTH') || verifyError.message.includes('535')) {
        errorMessage = 'Erro de autenticação - Credenciais inválidas';
        troubleshootingTips = [
          'Verifique se o email e senha estão corretos',
          'Para Gmail, use uma "Senha de App" em vez da senha normal',
          'Certifique-se de que a verificação em 2 etapas está ativada',
          'Gere uma nova Senha de App específica para este sistema'
        ];
      } else if (verifyError.message.includes('ECONNECTION') || verifyError.message.includes('ETIMEDOUT')) {
        errorMessage = 'Erro de conexão com o servidor Gmail';
        troubleshootingTips = [
          'Verifique sua conexão com a internet',
          'Confirme se o firewall não está bloqueando a porta 587',
          'Tente novamente em alguns minutos'
        ];
      } else if (verifyError.message.includes('ENOTFOUND')) {
        errorMessage = 'Servidor SMTP não encontrado';
        troubleshootingTips = [
          'Verifique se o host está correto (smtp.gmail.com)',
          'Confirme sua conexão DNS'
        ];
      }
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: 'CONNECTION_FAILED',
          details: {
            originalError: verifyError.message,
            troubleshooting: troubleshootingTips
          }
        },
        {
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

  } catch (error: any) {
    console.error('💥 [GoogleEmail Test] Erro geral no teste:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor durante o teste',
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