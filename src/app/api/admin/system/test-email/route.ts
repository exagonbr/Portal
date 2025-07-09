import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import nodemailer from 'nodemailer';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Interface para configurações SMTP
interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  fromAddress: string;
  fromName?: string;
}

// Interface para resultado do teste
interface EmailTestResult {
  success: boolean;
  message: string;
  details?: {
    connectionTime?: number;
    messageId?: string;
    testEmailSent?: boolean;
    smtpResponse?: string;
  };
  error?: {
    code?: string;
    message: string;
    command?: string;
  };
}

// Função auxiliar para verificar autenticação via JWT ou NextAuth
async function getAuthenticatedUser(request: NextRequest) {
  // Primeiro, tentar NextAuth
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role as UserRole,
      permissions: (session.user as any).permissions || []
    };
  }

  // Se não houver sessão NextAuth, verificar token JWT customizado
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwtDecode(token) as any;
      
      // Verificar se o token não expirou
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role as UserRole,
          permissions: decoded.permissions || []
        };
      }
    } catch (error) {
      console.error('❌ Erro ao decodificar token JWT:', error);
    }
  }

  return null;
}

// Função para validar configurações SMTP
function validateSMTPConfig(config: Partial<SMTPConfig>): string[] {
  const errors: string[] = [];

  if (!config.host?.trim()) {
    errors.push('Host SMTP é obrigatório');
  }

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Porta deve estar entre 1 e 65535');
  }

  if (!config.user?.trim()) {
    errors.push('Usuário SMTP é obrigatório');
  }

  if (!config.password?.trim()) {
    errors.push('Senha SMTP é obrigatória');
  }

  if (!config.fromAddress?.trim()) {
    errors.push('Endereço de origem é obrigatório');
  } else {
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.fromAddress)) {
      errors.push('Endereço de origem deve ter um formato válido');
    }
  }

  // Validar host (não permitir IPs privados em produção)
  if (config.host && process.env.NODE_ENV === 'production') {
    const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/;
    if (privateIPRegex.test(config.host)) {
      errors.push('Host não pode ser um IP privado em produção');
    }
  }

  return errors;
}

// Função para testar conexão SMTP
async function testSMTPConnection(config: SMTPConfig): Promise<EmailTestResult> {
  const startTime = Date.now();
  let transporter: nodemailer.Transporter | null = null;

  try {
    console.log('🔍 Iniciando teste de conexão SMTP:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      timestamp: new Date().toISOString()
    });

    // Criar transporter
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true para 465, false para outras portas
      auth: {
        user: config.user,
        pass: config.password,
      },
      // Configurações de timeout
      connectionTimeout: 30000, // 30 segundos
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // Configurações de debug para desenvolvimento
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    // Verificar conexão
    console.log('🔗 Verificando conexão SMTP...');
    if (!transporter) {
      throw new Error('Falha ao criar transporter SMTP');
    }
    await transporter.verify();
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Conexão SMTP estabelecida em ${connectionTime}ms`);

    // Tentar enviar email de teste
    console.log('📧 Enviando email de teste...');
    const testEmailOptions = {
      from: config.fromName 
        ? `"${config.fromName}" <${config.fromAddress}>`
        : config.fromAddress,
      to: config.fromAddress, // Enviar para o próprio remetente como teste
      subject: `[Teste SMTP] Configuração validada - ${new Date().toLocaleString('pt-BR')}`,
      text: `Este é um email de teste para validar a configuração SMTP.

📊 Detalhes da Configuração:
• Servidor: ${config.host}:${config.port}
• Seguro: ${config.secure ? 'Sim (SSL/TLS)' : 'Não (STARTTLS)'}
• Usuário: ${config.user}
• Horário: ${new Date().toLocaleString('pt-BR')}

Se você recebeu este email, a configuração SMTP está funcionando corretamente!

--
Portal Educacional - Sistema de Notificações`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Teste SMTP Realizado com Sucesso</h2>
          
          <p>Este é um email de teste para validar a configuração SMTP.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">📊 Detalhes da Configuração:</h3>
            <ul style="color: #6b7280;">
              <li><strong>Servidor:</strong> ${config.host}:${config.port}</li>
              <li><strong>Seguro:</strong> ${config.secure ? 'Sim (SSL/TLS)' : 'Não (STARTTLS)'}</li>
              <li><strong>Usuário:</strong> ${config.user}</li>
              <li><strong>Horário:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
          </div>
          
          <p style="color: #059669; font-weight: bold;">
            Se você recebeu este email, a configuração SMTP está funcionando corretamente!
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Portal Educacional - Sistema de Notificações
          </p>
        </div>
      `
    };

    if (!transporter) {
      throw new Error('Transporter não está disponível para envio');
    }
    const info = await transporter.sendMail(testEmailOptions);
    console.log('✅ Email de teste enviado:', info.messageId);

    return {
      success: true,
      message: 'Conexão SMTP testada com sucesso! Email de teste enviado.',
      details: {
        connectionTime,
        messageId: info.messageId,
        testEmailSent: true,
        smtpResponse: info.response
      }
    };

  } catch (error: any) {
    console.error('❌ Erro no teste SMTP:', error);

    // Mapear tipos de erro comum
    let errorMessage = 'Erro desconhecido na conexão SMTP';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Servidor SMTP não encontrado. Verifique o host.';
      errorCode = 'HOST_NOT_FOUND';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexão recusada. Verifique a porta e se o servidor está ativo.';
      errorCode = 'CONNECTION_REFUSED';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout na conexão. Verifique firewall e conectividade.';
      errorCode = 'CONNECTION_TIMEOUT';
    } else if (error.responseCode === 535) {
      errorMessage = 'Credenciais inválidas. Verifique usuário e senha.';
      errorCode = 'INVALID_CREDENTIALS';
    } else if (error.responseCode === 550) {
      errorMessage = 'Email rejeitado pelo servidor. Verifique o endereço de origem.';
      errorCode = 'EMAIL_REJECTED';
    } else if (error.message?.includes('STARTTLS')) {
      errorMessage = 'Erro na configuração TLS/SSL. Verifique a porta e configuração segura.';
      errorCode = 'TLS_ERROR';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: `Falha no teste SMTP: ${errorMessage}`,
      error: {
        code: errorCode,
        message: errorMessage,
        command: error.command
      }
    };
  } finally {
    // Fechar conexão se existir
    if (transporter) {
      try {
        transporter.close();
      } catch (closeError) {
        console.warn('⚠️ Erro ao fechar conexão SMTP:', closeError);
      }
    }
  }
}

// OPTIONS - CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// POST - Testar conexão de email
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (NextAuth ou JWT customizado)
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Não autorizado - Faça login para continuar' 
        },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Verificar se é admin do sistema
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      console.warn(`🚫 Tentativa de acesso negado para usuário ${user.email} (role: ${user.role})`);
      return NextResponse.json(
        { 
          success: false,
          message: 'Acesso negado. Apenas administradores do sistema podem testar conexões SMTP.' 
        },
        { 
          status: 403,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter configurações de email do corpo da requisição
    const body = await request.json();
    const config: Partial<SMTPConfig> = {
      host: body.host?.trim(),
      port: parseInt(body.port),
      user: body.user?.trim(),
      password: body.password,
      secure: Boolean(body.secure),
      fromAddress: body.fromAddress?.trim(),
      fromName: body.fromName?.trim() || 'Portal Educacional'
    };

    console.log('🔍 Teste SMTP solicitado por:', {
      userId: user.id,
      userEmail: user.email,
      host: config.host,
      port: config.port,
      secure: config.secure,
      timestamp: new Date().toISOString()
    });

    // Validar configurações
    const validationErrors = validateSMTPConfig(config);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Configurações inválidas',
        errors: validationErrors
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Executar teste SMTP
    const testResult = await testSMTPConnection(config as SMTPConfig);

    // Log do resultado
    if (testResult.success) {
      console.log('✅ Teste SMTP bem-sucedido:', {
        userId: user.id,
        host: config.host,
        connectionTime: testResult.details?.connectionTime,
        messageId: testResult.details?.messageId
      });
    } else {
      console.error('❌ Teste SMTP falhou:', {
        userId: user.id,
        host: config.host,
        error: testResult.error
      });
    }

    return NextResponse.json(testResult, {
      status: testResult.success ? 200 : 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error: any) {
    console.error('💥 Erro crítico no teste de email:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao testar conexão de email',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}