import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Inserindo templates de email...');

  // Limpar tabela existente
  await knex('email_templates').del();

  // Templates básicos do sistema
  const templates = [
    {
      name: 'welcome',
      subject: 'Bem-vindo ao Portal Sabercon!',
      category: 'system',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao Portal Sabercon!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Seja bem-vindo ao Portal Sabercon! Sua conta foi criada com sucesso e você já pode começar a explorar nossa plataforma.
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Suas informações de acesso:</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li><strong>Email:</strong> {{email}}</li>
                <li><strong>Usuário:</strong> {{username}}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Acessar Portal
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Atenciosamente,<br>
              <strong>Equipe Portal Sabercon</strong>
            </p>
          </div>
        </div>
      `,
      text: 'Bem-vindo ao Portal Sabercon! Olá {{name}}, sua conta foi criada com sucesso. Email: {{email}}, Usuário: {{username}}. Acesse: {{loginUrl}}'
    },
    {
      name: 'password-reset',
      subject: 'Recuperação de Senha - Portal Sabercon',
      category: 'system',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperação de Senha</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Você solicitou a recuperação de sua senha. Clique no botão abaixo para redefinir sua senha:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ <strong>Importante:</strong> Este link expira em 1 hora por segurança.
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
            </p>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Atenciosamente,<br>
              <strong>Equipe Portal Sabercon</strong>
            </p>
          </div>
        </div>
      `,
      text: 'Recuperação de Senha - Portal Sabercon. Olá {{name}}, clique no link para redefinir sua senha: {{resetUrl}} (expira em 1 hora)'
    },
    {
      name: 'notification',
      subject: '{{subject}}',
      category: 'notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📢 {{title}}</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
            <div style="font-size: 16px; color: #374151; line-height: 1.6; margin: 20px 0;">
              {{message}}
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Atenciosamente,<br>
              <strong>Equipe Portal Sabercon</strong>
            </p>
          </div>
        </div>
      `,
      text: '{{title}} - Olá {{name}}, {{message}}'
    },
    {
      name: 'system-alert',
      subject: 'Alerta do Sistema - {{type}}',
      category: 'system',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Alerta do Sistema</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: #fee2e2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0 0 10px 0; font-weight: bold;">Tipo: {{type}}</p>
              <p style="color: #991b1b; margin: 0 0 10px 0;">Mensagem: {{message}}</p>
              <p style="color: #991b1b; margin: 0; font-size: 14px;">Data/Hora: {{timestamp}}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              <strong>Equipe Portal Sabercon</strong>
            </p>
          </div>
        </div>
      `,
      text: 'Alerta do Sistema - {{type}}: {{message}} em {{timestamp}}'
    },
    {
      name: 'email-verification',
      subject: 'Verifique seu endereço de email - Portal Sabercon',
      category: 'system',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✉️ Verificação de Email</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Obrigado por se registrar no Portal Sabercon! Para completar seu cadastro, precisamos verificar seu endereço de email.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verificar Email
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Se você não criou uma conta no Portal Sabercon, nenhuma outra ação é necessária.
            </p>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Atenciosamente,<br>
              <strong>Equipe Portal Sabercon</strong>
            </p>
          </div>
        </div>
      `,
      text: 'Verifique seu email - Portal Sabercon. Olá {{name}}, clique no link para verificar: {{verificationUrl}}'
    }
  ];

  await knex('email_templates').insert(templates);
  console.log('✅ Templates de email inseridos com sucesso!');
}
