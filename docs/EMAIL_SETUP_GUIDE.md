# Guia de Configuração de Email - Portal Sabercon

## Visão Geral

O sistema de email do Portal Sabercon agora suporta **fallback automático** entre configurações de variáveis de ambiente (.env) e configurações do banco de dados. Isso significa que o sistema tentará usar as configurações do .env primeiro, e se não estiverem disponíveis, buscará as configurações no banco de dados.

## Como Funciona o Fallback

1. **Primeira tentativa**: O sistema verifica se `SMTP_HOST` está configurado no arquivo `.env`
2. **Fallback**: Se não estiver configurado ou for 'localhost', o sistema busca as configurações no banco de dados
3. **Reconfiguração automática**: Quando as configurações do banco são atualizadas, o serviço é automaticamente reconfigurado

## Configuração via Variáveis de Ambiente (.env)

### Configurações Obrigatórias
```bash
# Configurações do sistema (obrigatórias)
VAPID_EMAIL=your-email@example.com
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
JWT_SECRET=your-jwt-secret-key
```

### Configurações de Email (opcionais)
```bash
# Se configuradas, terão prioridade sobre o banco de dados
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_TLS_REJECT_UNAUTHORIZED=true
EMAIL_FROM=noreply@yoursite.com
```

## Configuração via Interface Admin

### Acessando as Configurações
1. Faça login como administrador do sistema
2. Acesse **Admin > Configurações**
3. Clique na aba **Email**

### Campos Disponíveis
- **Servidor SMTP**: Endereço do servidor (ex: smtp.gmail.com)
- **Porta SMTP**: Porta do servidor (587 para TLS, 465 para SSL)
- **Usuário SMTP**: Seu email ou usuário
- **Senha SMTP**: Senha do email ou senha de app
- **Nome do Remetente**: Nome que aparecerá no email
- **Email do Remetente**: Email que aparecerá como remetente
- **Usar TLS/SSL**: Checkbox para conexão segura

### Botões de Ação
- **Enviar Email de Teste**: Testa a configuração enviando um email
- **Reconfigurar Email**: Força a reconfiguração do serviço de email

## Exemplos de Configuração

### Gmail
```
Servidor SMTP: smtp.gmail.com
Porta: 587
Usuário: seuemail@gmail.com
Senha: sua-senha-de-app (não a senha normal!)
TLS/SSL: Marcado
```

**Importante**: Para Gmail, você precisa:
1. Ativar a verificação em duas etapas
2. Gerar uma "senha de app" específica

### Outlook/Hotmail
```
Servidor SMTP: smtp-mail.outlook.com
Porta: 587
Usuário: seuemail@outlook.com
Senha: sua-senha-normal
TLS/SSL: Marcado
```

### SendGrid
```
Servidor SMTP: smtp.sendgrid.net
Porta: 587
Usuário: apikey
Senha: sua-api-key-do-sendgrid
TLS/SSL: Marcado
```

## Diagnóstico de Problemas

### Verificar Status do Email
Use o endpoint `/api/notifications/email/verify` para verificar o status:

```bash
curl -X GET https://portal.sabercon.com.br/api/notifications/email/verify \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Logs do Sistema
O sistema registra logs detalhados:

- ✅ **Sucesso**: "Servidor de email configurado com sucesso"
- ⚠️ **Aviso**: "Email desabilitado: Configuração SMTP não encontrada"
- 🔍 **Info**: "Buscando configurações de email do banco de dados..."
- 🔄 **Reconfiguração**: "Reconfigurando serviço de email..."

### Problemas Comuns

#### 1. "Configuração de email não encontrada"
**Causa**: Nem .env nem banco de dados têm configurações válidas
**Solução**: Configure pelo menos uma das duas opções

#### 2. "Erro na verificação da conexão"
**Causa**: Credenciais incorretas ou servidor inacessível
**Solução**: Verifique as credenciais e conectividade

#### 3. Email não enviado mas sem erro
**Causa**: Sistema em modo "graceful degradation"
**Solução**: Verifique os logs e reconfigure o email

## Reconfiguração Manual

### Via Interface Admin
1. Acesse **Admin > Configurações > Email**
2. Clique em **Reconfigurar Email**

### Via API
```bash
curl -X POST https://portal.sabercon.com.br/api/settings/reconfigure-email \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Monitoramento

O sistema monitora automaticamente:
- Status da conexão SMTP
- Tentativas de envio de email
- Erros de configuração
- Fallbacks entre .env e banco de dados

## Boas Práticas

1. **Use .env para produção**: Mais seguro para credenciais sensíveis
2. **Configure fallback no banco**: Permite alterações sem restart
3. **Teste regularmente**: Use o botão de teste na interface
4. **Monitore logs**: Acompanhe os logs para identificar problemas
5. **Senhas de app**: Use senhas específicas para aplicações (Gmail, Outlook)

## Suporte

Se você continuar com problemas:
1. Verifique os logs do backend
2. Teste a configuração manualmente
3. Use o endpoint de verificação de status
4. Force a reconfiguração do serviço 