import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { getSafeConnection } from '@/lib/database-safe'
import { getAuthentication } from '@/lib/auth-utils'
import nodemailer from 'nodemailer'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// Função para carregar configurações de email do banco de dados
async function loadEmailSettings() {
  try {
    const connection = await getSafeConnection();
    const settings = await connection('system_settings')
      .select('key', 'value')
      .where('category', 'email');
    
    const emailConfig: Record<string, any> = {};
    settings.forEach((setting: any) => {
      emailConfig[setting.key] = setting.value;
    });
    
    return {
      host: emailConfig.email_smtp_host || 'smtp.gmail.com',
      port: parseInt(emailConfig.email_smtp_port || '587'),
      secure: emailConfig.email_smtp_secure === 'true',
      user: emailConfig.email_smtp_user || 'noreply@sabercon.com.br',
      pass: emailConfig.email_smtp_password || 'wcba xeda vopf nbwh',
      fromName: emailConfig.email_from_name || 'Portal Educacional - Sabercon',
      fromAddress: emailConfig.email_from_address || 'noreply@sabercon.com.br'
    };
  } catch (error) {
    console.error('❌ Erro ao carregar configurações de email:', error);
    // Fallback para configurações padrão
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: 'noreply@sabercon.com.br',
      pass: 'wcba xeda vopf nbwh',
      fromName: 'Portal Educacional - Sabercon',
      fromAddress: 'noreply@sabercon.com.br'
    };
  }
}

// Função para testar conectividade do email
async function testEmailConnection(emailConfig: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexão
    await transporter.verify();
    
    return {
      success: true,
      message: 'Conexão com servidor de email estabelecida com sucesso'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro na conexão: ${error.message}`,
      error: error.code || 'UNKNOWN_ERROR'
    };
  }
}

// Função para enviar email de teste
async function sendTestEmail(emailConfig: any, testEmail: string = 'noreply@sabercon.com.br') {
  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
      to: testEmail,
      subject: 'Teste de Conectividade - Portal Educacional',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">🔧 Teste de Conectividade</h2>
          <p>Este é um email de teste para verificar se o sistema de envio está funcionando corretamente.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">📧 Configurações Testadas:</h3>
            <ul style="color: #374151;">
              <li><strong>Servidor SMTP:</strong> ${emailConfig.host}</li>
              <li><strong>Porta:</strong> ${emailConfig.port}</li>
              <li><strong>Segurança:</strong> ${emailConfig.secure ? 'SSL/TLS' : 'STARTTLS'}</li>
              <li><strong>Usuário:</strong> ${emailConfig.user}</li>
              <li><strong>Remetente:</strong> ${emailConfig.fromAddress}</li>
            </ul>
          </div>
          
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
            <p style="color: #166534; margin: 0;">
              <strong>✅ Sucesso!</strong> O sistema de email está funcionando corretamente.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Data/Hora: ${new Date().toLocaleString('pt-BR')}<br>
            Sistema: Portal Educacional - Sabercon
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: `Email de teste enviado com sucesso para ${testEmail}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao enviar email de teste: ${error.message}`,
      error: error.code || 'UNKNOWN_ERROR'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando o padrão da aplicação
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado - Token de autenticação necessário' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('🔑 [Notification API] Usuário autenticado:', session.user?.email);

    const body = await request.json()
    console.log('🔍 [Notification API] Dados recebidos:', JSON.stringify(body, null, 2))

    // Verificar se é uma requisição de teste de conectividade
    if (body.action === 'test_connectivity') {
      const emailConfig = await loadEmailSettings();
      const testResult = await testEmailConnection(emailConfig);
      
      if (testResult.success) {
        // Se a conexão foi bem-sucedida, enviar email de teste
        const sendResult = await sendTestEmail(emailConfig, body.testEmail || 'noreply@sabercon.com.br');
        
        return NextResponse.json({
          success: sendResult.success,
          message: sendResult.success 
            ? `✅ Conectividade testada com sucesso! ${sendResult.message}`
            : `❌ Falha no teste: ${sendResult.message}`,
          data: {
            connection: testResult,
            email: sendResult,
            config: {
              host: emailConfig.host,
              port: emailConfig.port,
              secure: emailConfig.secure,
              user: emailConfig.user,
              fromAddress: emailConfig.fromAddress
            }
          }
        }, {
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `❌ Falha na conectividade: ${testResult.message}`,
          data: {
            connection: testResult,
            config: {
              host: emailConfig.host,
              port: emailConfig.port,
              secure: emailConfig.secure,
              user: emailConfig.user,
              fromAddress: emailConfig.fromAddress
            }
          }
        }, {
          status: 500,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        });
      }
    }

    // Carregar configurações de email do banco de dados
    const emailConfig = await loadEmailSettings();

    // Validar canal de envio
    const channel = body.channel?.toUpperCase() || 'EMAIL'
    if (!['EMAIL', 'SMS', 'PUSH'].includes(channel)) {
      return NextResponse.json({
        success: false,
        message: 'Canal de notificação inválido. Use EMAIL, SMS ou PUSH'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar dados obrigatórios
    if (!body.subject && !body.title) {
      return NextResponse.json({
        success: false,
        message: 'Assunto é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Verificar se é um template ou mensagem direta
    let messageContent = ''
    let templateData = null

    if (body.templateId) {
      // Carregar template pelo ID
      templateData = await loadTemplate(body.templateId)
      
      if (!templateData) {
        return NextResponse.json({
          success: false,
          message: `Template com ID ${body.templateId} não encontrado`
        }, {
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        })
      }
      
      // Aplicar dados ao template
      messageContent = applyTemplateData(templateData.content, body.templateData || {})
    } else if (body.message) {
      // Usar mensagem direta
      messageContent = body.message
    } else {
      return NextResponse.json({
        success: false,
        message: 'É necessário fornecer uma mensagem ou um ID de template'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Extrair todos os destinatários dos diferentes tipos
    console.log('🔍 [Notification API] Dados de destinatários recebidos:', JSON.stringify(body.recipients, null, 2))
    console.log('🔍 [Notification API] Canal selecionado:', channel)
    console.log('🔍 [Notification API] Corpo completo da requisição:', JSON.stringify(body, null, 2))
    
    // Processar diferentes formatos de destinatários
    let recipientsData = body.recipients
    
    // Formato 1: Array direto de emails (legado)
    if (Array.isArray(body.recipients)) {
      console.log('🔄 [Notification API] Convertendo array direto para formato objeto')
      recipientsData = { emails: body.recipients }
    }
    
    // Formato 2: Array de objetos com type/value/label (novo formato do frontend)
    if (Array.isArray(body.recipients) && body.recipients.length > 0 && 
        typeof body.recipients[0] === 'object' && 'type' in body.recipients[0]) {
      console.log('🔄 [Notification API] Convertendo formato de objetos para emails')
      
      const emails = body.recipients.filter((r: any) => r.type === 'email').map((r: any) => r.value)
      const users = body.recipients.filter((r: any) => r.type === 'user').map((r: any) => r.value)
      const roles = body.recipients.filter((r: any) => r.type === 'role').map((r: any) => r.value)
      
      recipientsData = { emails, users, roles }
    }
    
    const recipients = await extractRecipients(recipientsData, channel)
    
    // Se não houver destinatários, retornar erro
    if (recipients.length === 0) {
      console.error('❌ [Notification API] Nenhum destinatário encontrado')
      console.error('❌ [Notification API] Estrutura recebida:', JSON.stringify(body.recipients, null, 2))
      
      return NextResponse.json({
        success: false,
        message: 'Nenhum destinatário válido encontrado',
        debug: {
          receivedData: body.recipients,
          channel: channel,
          supportedFormats: {
            'Array direto': ['email1@test.com', 'email2@test.com'],
            'Objeto com emails': { emails: ['email1@test.com'] },
            'Objeto com users': { users: ['userId1', 'userId2'] },
            'Objeto com roles': { roles: ['admin', 'teacher'] }
          }
        }
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar destinatários de acordo com o canal
    const invalidRecipients = validateRecipients(recipients, channel)
    
    if (invalidRecipients.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Destinatários inválidos para ${channel}: ${invalidRecipients.join(', ')}`
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Criar objeto para a fila de notificações (simulado)
    const queueResult = {
      id: `queue_${Date.now()}`,
      type: body.type || 'info',
      description: body.subject || body.title,
      createdAt: new Date().toISOString()
    }

    // Enviar notificação pelo canal apropriado usando as credenciais do banco
    const result = await sendNotification({
      channel,
      recipients,
      subject: body.subject || body.title,
      message: messageContent,
      html: body.html || (templateData?.isHtml ?? false),
      templateId: body.templateId,
      templateData: body.templateData,
      priority: body.priority || 'medium',
      category: body.category || channel.toLowerCase(),
      type: body.type || 'info',
      metadata: body.metadata || {},
      emailConfig // Passar as configurações do banco
    })

    // Criar registro da notificação enviada
    const notification = {
      id: queueResult.id || `notification_${Date.now()}`,
      title: body.subject || body.title,
      message: messageContent,
      type: body.type || 'info',
      category: body.category || channel.toLowerCase(),
      priority: body.priority || 'medium',
      sender_id: session.user?.id || null,
      sender_name: session.user?.name || session.user?.email || null,
      recipients,
      recipient_count: recipients.length,
      channels: [channel],
      template_id: body.templateId || null,
      template_data: body.templateData || null,
      status: result.success ? 'sent' : 'failed',
      error: result.error || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: notification
    }, {
      status: result.success ? 200 : 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`❌ [Notification API] Erro ao enviar notificação:`, error)
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// Função para carregar um template pelo ID
async function loadTemplate(templateId: string) {
  // Aqui você buscaria o template no banco de dados
  
  // Simulação de templates
  const templates = {
    'welcome': {
      id: 'welcome',
      name: 'Boas-vindas',
      content: 'Olá {{name}}, bem-vindo ao nosso sistema!',
      isHtml: false
    },
    'boas-vindas': {
      id: 'boas-vindas',
      name: 'Boas-vindas',
      content: 'Olá {{name}}, bem-vindo ao nosso sistema!',
      isHtml: false
    },
    'comunicado': {
      id: 'comunicado',
      name: 'Comunicado',
      content: 'Prezados, este é um comunicado importante: {{message}}',
      isHtml: false
    },
    'lembrete': {
      id: 'lembrete',
      name: 'Lembrete',
      content: 'Olá! Este é um lembrete sobre: {{message}}',
      isHtml: false
    },
    'newsletter': {
      id: 'newsletter',
      name: 'Newsletter',
      content: 'Newsletter semanal: {{message}}',
      isHtml: false
    },
    'password_reset': {
      id: 'password_reset',
      name: 'Redefinição de Senha',
      content: '<h1>Redefinição de Senha</h1><p>Olá {{name}},</p><p>Clique <a href="{{resetLink}}">aqui</a> para redefinir sua senha.</p>',
      isHtml: true
    },
    'notification': {
      id: 'notification',
      name: 'Notificação Geral',
      content: '{{message}}',
      isHtml: false
    }
  }
  
  // @ts-ignore - Simulação
  return templates[templateId] || null
}

// Função para aplicar dados a um template
function applyTemplateData(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{{${key}}}`
  })
}

// Função para extrair destinatários
async function extractRecipients(recipientsData: any, channel: string): Promise<string[]> {
  console.log('🔍 [extractRecipients] Iniciando extração:', { recipientsData, channel })
  
  if (!recipientsData) {
    console.log('❌ [extractRecipients] Nenhum dado de destinatários fornecido')
    return []
  }
  
  const allRecipients: string[] = []
  
  // Se recipientsData é um array direto (formato legado)
  if (Array.isArray(recipientsData)) {
    console.log('✅ [extractRecipients] Formato array direto:', recipientsData.length)
    if (channel === 'EMAIL') {
      allRecipients.push(...recipientsData)
    }
  }
  
  // Se recipientsData é um objeto
  if (typeof recipientsData === 'object' && !Array.isArray(recipientsData)) {
    // Destinatários diretos (emails, telefones, tokens)
    if (recipientsData.direct && Array.isArray(recipientsData.direct)) {
      console.log('✅ [extractRecipients] Encontrados destinatários diretos:', recipientsData.direct.length)
      allRecipients.push(...recipientsData.direct)
    }
    
    // Emails diretos (formato usado pelo frontend)
    if (recipientsData.emails && Array.isArray(recipientsData.emails)) {
      console.log('✅ [extractRecipients] Encontrados emails diretos:', recipientsData.emails.length)
      if (channel === 'EMAIL') {
        allRecipients.push(...recipientsData.emails)
      }
    }
    
    // Suporte para formato legado com recipients.recipients.emails (aninhado)
    if (recipientsData.recipients && typeof recipientsData.recipients === 'object') {
      console.log('✅ [extractRecipients] Estrutura aninhada detectada')
      if (recipientsData.recipients.emails && Array.isArray(recipientsData.recipients.emails)) {
        console.log('✅ [extractRecipients] Emails em estrutura aninhada:', recipientsData.recipients.emails.length)
        if (channel === 'EMAIL') {
          allRecipients.push(...recipientsData.recipients.emails)
        }
      }
    }
    
    // IDs de usuários
    if (recipientsData.users && Array.isArray(recipientsData.users)) {
      console.log('✅ [extractRecipients] Encontrados usuários:', recipientsData.users.length)
      // Aqui você buscaria os dados de contato dos usuários no banco de dados
      // Simulação: converter IDs de usuários para contatos
      const userContacts = await Promise.all(recipientsData.users.map(async (userId: string) => {
        // Simulação - aqui você buscaria no banco de dados
        return channel === 'EMAIL' ? `user_${userId}@example.com` :
               channel === 'SMS' ? `+55119${userId.padStart(8, '0')}` :
               channel === 'PUSH' ? `device_token_${userId}` : null
      }))
      
      allRecipients.push(...userContacts.filter(Boolean) as string[])
    }
    
    // Papéis/funções
    if (recipientsData.roles && Array.isArray(recipientsData.roles)) {
      console.log('✅ [extractRecipients] Encontradas funções:', recipientsData.roles.length)
      // Aqui você buscaria todos os contatos dos usuários com esses papéis
      // Simulação: converter papéis para contatos
      for (const role of recipientsData.roles) {
        // Simulação - aqui você buscaria no banco de dados
        if (channel === 'EMAIL') {
          allRecipients.push(`${role}_group@example.com`)
        } else if (channel === 'SMS') {
          allRecipients.push(`+5511999${role.slice(0, 6)}`)
        } else if (channel === 'PUSH') {
          allRecipients.push(`group_token_${role}`)
        }
      }
    }
  }
  
  console.log('🔍 [extractRecipients] Total de destinatários encontrados:', allRecipients.length)
  console.log('🔍 [extractRecipients] Destinatários:', allRecipients)
  
  // Remover duplicatas
  const finalRecipients = Array.from(new Set(allRecipients))
  console.log('🔍 [extractRecipients] Destinatários finais (sem duplicatas):', finalRecipients.length)
  
  return finalRecipients
}

// Função para validar destinatários de acordo com o canal
function validateRecipients(recipients: string[], channel: string): string[] {
  const invalidRecipients: string[] = []
  
  for (const recipient of recipients) {
    if (channel === 'EMAIL') {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(recipient)) {
        invalidRecipients.push(recipient)
      }
    } else if (channel === 'SMS') {
      // Validar formato de telefone (simplificado)
      const phoneRegex = /^\+\d{10,15}$/
      if (!phoneRegex.test(recipient)) {
        invalidRecipients.push(recipient)
      }
    } else if (channel === 'PUSH') {
      // Validar token de dispositivo (simplificado)
      if (recipient.length < 10) {
        invalidRecipients.push(recipient)
      }
    }
  }
  
  return invalidRecipients
}

// Função para enviar notificação pelo canal apropriado
async function sendNotification(params: {
  channel: string,
  recipients: string[],
  subject: string,
  message: string,
  html?: boolean,
  templateId?: string,
  templateData?: Record<string, any>,
  priority?: string,
  category?: string,
  type?: string,
  metadata?: Record<string, any>,
  emailConfig?: any
}): Promise<{ success: boolean, message: string, error?: any }> {
  try {
    const { channel, recipients, subject, message, html, emailConfig } = params
    
    // Usar configurações do banco de dados para envio real
    if (channel === 'EMAIL' && emailConfig) {
      try {
                 const transporter = nodemailer.createTransport({
           host: emailConfig.host,
           port: emailConfig.port,
           secure: emailConfig.secure,
           auth: {
             user: emailConfig.user,
             pass: emailConfig.pass,
           },
           tls: {
             rejectUnauthorized: false
           }
         });

        // Enviar para todos os destinatários
        const emailPromises = recipients.map(async (recipient) => {
          const mailOptions = {
            from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
            to: recipient,
            subject: subject,
            html: html ? message : undefined,
            text: html ? undefined : message,
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Email enviado para: ${recipient}`);
        });

        await Promise.all(emailPromises);
        
        return {
          success: true,
          message: `Notificação enviada com sucesso para ${recipients.length} destinatário(s) via ${channel}`
        };
      } catch (emailError: any) {
        console.error('❌ Erro ao enviar email:', emailError);
        return {
          success: false,
          message: `Erro ao enviar notificação via ${channel}: ${emailError.message}`,
          error: emailError
        };
      }
    }
    
    // Simular envio para outros canais
    switch (channel) {
      case 'SMS':
        // Integração com serviço de SMS (ex: Twilio, AWS SNS)
        break
        
      case 'PUSH':
        // Integração com serviço de notificações push (ex: Firebase Cloud Messaging)
        break
    }
    
    // Simular delay do envio para outros canais
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: `Notificação enviada com sucesso para ${recipients.length} destinatário(s) via ${channel}`
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar notificação via ${params.channel}`,
      error
    }
  }
} 