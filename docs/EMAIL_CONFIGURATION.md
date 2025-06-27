# Configuração de Email - Portal Sabercon

## Problema Comum: "Erro desconhecido" no Teste de Email

Se você está recebendo "Erro desconhecido" ao testar o envio de emails, isso geralmente indica que o serviço de email não está configurado corretamente.

## Configuração Necessária

### 1. Variáveis de Ambiente

No backend, você precisa configurar as seguintes variáveis de ambiente:

```bash
# Configurações SMTP obrigatórias
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASS=sua-senha-ou-token

# Configurações opcionais
SMTP_SECURE=false
SMTP_TLS_REJECT_UNAUTHORIZED=true
EMAIL_FROM=noreply@seudominio.com
```

### 2. Exemplos de Configuração

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_SECURE=false
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seuemail@outlook.com
SMTP_PASS=sua-senha
SMTP_SECURE=false
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
SMTP_SECURE=false
```

## Diagnóstico de Problemas

### 1. Verificar se as Variáveis Estão Definidas

Use o botão "Verificar Configuração" na página de envio de notificações para ver o status das configurações.

### 2. Logs do Servidor

Verifique os logs do backend para mensagens como:
- `⚠️ Email desabilitado: Configuração SMTP não encontrada`
- `✅ Servidor de email configurado com sucesso`
- `❌ Erro ao enviar email:`

### 3. Problemas Comuns

#### "Configuração SMTP não encontrada"
- **Causa**: Variável `SMTP_HOST` não está definida ou está como 'localhost'
- **Solução**: Defina `SMTP_HOST` com o servidor SMTP correto

#### "Erro na verificação da conexão"
- **Causa**: Credenciais incorretas ou servidor inacessível
- **Solução**: Verifique usuário, senha e configurações de firewall

#### "Erro de autenticação"
- **Causa**: Senha incorreta ou autenticação em duas etapas
- **Solução**: Use senha de aplicativo (Gmail) ou token de API

## Configuração no Desenvolvimento

### Arquivo .env local

Crie um arquivo `.env` no diretório `backend/` com suas configurações:

```bash
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_SECURE=false
EMAIL_FROM=noreply@seudominio.com

# Outras variáveis necessárias
JWT_SECRET=seu-jwt-secret
VAPID_EMAIL=seuemail@gmail.com
VAPID_PUBLIC_KEY=sua-chave-publica-vapid
VAPID_PRIVATE_KEY=sua-chave-privada-vapid
```

### Testando a Configuração

1. Reinicie o servidor backend após alterar as variáveis
2. Acesse `/notifications/send` no frontend
3. Use o botão "Verificar Configuração" para validar
4. Use o botão "Testar Email" para enviar um email de teste

## Segurança

### Senhas de Aplicativo

Para Gmail e outros provedores com 2FA:
1. Ative a autenticação em duas etapas
2. Gere uma senha específica para aplicativos
3. Use essa senha no `SMTP_PASS`

### Variáveis de Ambiente em Produção

- Nunca commite senhas no código
- Use variáveis de ambiente seguras na produção
- Considere usar serviços como SendGrid, Mailgun ou AWS SES

## Troubleshooting

### Se ainda não funcionar:

1. **Verifique os logs**: Console do backend mostra detalhes do erro
2. **Teste com telnet**: `telnet smtp.gmail.com 587`
3. **Firewall**: Certifique-se que a porta SMTP não está bloqueada
4. **DNS**: Verifique se o servidor SMTP é resolvível

### Contato

Se o problema persistir, verifique:
- Logs completos do backend
- Configurações de rede
- Políticas de segurança do provedor de email 