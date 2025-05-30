# Configuração de Push Notifications e Emails - Portal Sabercon

Este documento explica como configurar e usar as funcionalidades de push notifications e envio de emails no Portal Sabercon.

## 🚀 Funcionalidades Implementadas

### Push Notifications
- ✅ Service Worker configurado
- ✅ Registro de subscriptions no backend
- ✅ Envio de notificações push via API
- ✅ Interface para teste e configuração
- ✅ Suporte a VAPID keys

### Email Service
- ✅ Serviço de email com templates
- ✅ Suporte a SMTP
- ✅ Templates para diferentes tipos de email
- ✅ API para teste de configuração
- ✅ Integração com sistema de notificações

## 📋 Configuração do Backend

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` do backend:

```env
# PUSH NOTIFICATIONS (VAPID)
VAPID_EMAIL=your-email@example.com
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# EMAIL CONFIGURATION
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_TLS_REJECT_UNAUTHORIZED=true
EMAIL_FROM=noreply@portal.sabercon.com

# FRONTEND URL
FRONTEND_URL=http://localhost:3000
```

### 2. Gerar VAPID Keys

Execute o script para gerar as chaves VAPID:

```bash
cd backend
node scripts/generate-vapid-keys.js
```

Copie as chaves geradas para o arquivo `.env`.

### 3. Configurar SMTP

Para emails, configure um servidor SMTP. Exemplos:

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Servidor Local (desenvolvimento)
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

## 📋 Configuração do Frontend

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env.local` do frontend:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### 2. Service Worker

O service worker já está configurado em `/public/sw.js` e será registrado automaticamente.

## 🔧 Como Usar

### 1. Enviar Notificações

Acesse `/notifications/send` no frontend para:
- Criar notificações com título e mensagem
- Escolher entre push notifications e/ou email
- Selecionar destinatários (todos, por função, ou específicos)
- Testar configurações

### 2. APIs Disponíveis

#### Push Notifications
- `POST /api/push-subscriptions` - Registrar subscription
- `DELETE /api/push-subscriptions/:endpoint` - Remover subscription
- `POST /api/push-subscriptions/send` - Enviar notificação push

#### Notificações Gerais
- `POST /api/notifications/send` - Enviar notificação (push + email)
- `POST /api/notifications/email/test` - Testar configuração de email
- `GET /api/notifications/email/verify` - Verificar conexão SMTP

### 3. Exemplo de Uso da API

```javascript
// Enviar notificação push + email
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Nova Mensagem',
    message: 'Você tem uma nova mensagem no sistema',
    type: 'info',
    category: 'system',
    sendPush: true,
    sendEmail: true,
    recipients: {
      userIds: ['user1', 'user2'],
      emails: ['user1@example.com', 'user2@example.com']
    }
  })
});
```

## 🧪 Testes

### 1. Testar Push Notifications

1. Acesse `/notifications/send`
2. Verifique o status das push notifications
3. Clique em "Habilitar Push Notifications" se necessário
4. Use o botão "Testar Push Notification"

### 2. Testar Email

1. Acesse `/notifications/send`
2. Use o botão "Testar Email"
3. Verifique sua caixa de entrada

### 3. Verificar Configuração

```bash
# Verificar conexão SMTP
curl -X GET http://localhost:3001/api/notifications/email/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enviar email de teste
curl -X POST http://localhost:3001/api/notifications/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"to": "test@example.com"}'
```

## 🔍 Troubleshooting

### Push Notifications não funcionam

1. Verifique se as VAPID keys estão configuradas
2. Confirme que o service worker está registrado
3. Verifique as permissões do navegador
4. Teste em HTTPS (necessário para produção)

### Emails não são enviados

1. Verifique as configurações SMTP
2. Teste a conexão com `/api/notifications/email/verify`
3. Confirme as credenciais do servidor de email
4. Verifique os logs do backend

### Erros de CORS

1. Configure `CORS_ORIGIN` no backend
2. Verifique se `FRONTEND_URL` está correto

## 📚 Estrutura dos Arquivos

### Backend
```
backend/src/
├── services/
│   └── emailService.ts          # Serviço de email
├── controllers/
│   └── pushSubscriptionController.ts  # Controller de push notifications
├── routes/
│   ├── pushSubscription.ts      # Rotas de push notifications
│   └── notifications.ts         # Rotas de notificações gerais
└── config/
    └── env.ts                   # Configuração de variáveis de ambiente
```

### Frontend
```
src/
├── services/
│   └── pushNotificationService.ts  # Serviço de push notifications
├── components/
│   └── PushNotificationInitializer.tsx  # Inicializador
├── app/notifications/send/
│   └── page.tsx                 # Página de envio de notificações
└── public/
    └── sw.js                    # Service Worker
```

## 🎯 Próximos Passos

- [ ] Implementar templates de email personalizáveis
- [ ] Adicionar analytics de entrega
- [ ] Suporte a notificações agendadas
- [ ] Interface de gerenciamento de templates
- [ ] Integração com sistema de filas (Redis/Bull)

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Logs do backend em `backend/logs/`
- Console do navegador para erros de frontend
- Documentação da API em `/api/docs` 