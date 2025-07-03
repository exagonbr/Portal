# Sistema de Gerenciamento de Sessões com Redis

Este documento descreve a implementação completa do sistema de gerenciamento de sessões usando Redis no Portal Educacional.

## 📋 Visão Geral

O sistema de sessões Redis foi implementado para fornecer:
- **Escalabilidade**: Suporte a múltiplas instâncias da aplicação
- **Performance**: Acesso rápido aos dados de sessão
- **Segurança**: Controle granular sobre sessões ativas
- **Monitoramento**: Visibilidade completa das sessões ativas

## 🏗️ Arquitetura

### Componentes Principais

1. **Redis Client** (`src/config/redis.ts`)
   - Configuração e conexão com Redis
   - Suporte a Redis local e em nuvem
   - Monitoramento de conexão

2. **Session Service** (`src/services/sessionService.ts`)
   - Gerenciamento completo de sessões
   - CRUD de sessões
   - Limpeza automática de sessões expiradas

3. **API Routes** (`src/app/api/sessions/`)
   - Endpoints REST para gerenciar sessões
   - Validação e extensão de sessões

4. **Middleware** (`src/middleware.ts`)
   - Validação automática de sessões
   - Integração com sistema de autenticação

5. **Admin Interface** (`src/components/admin/SessionManager.tsx`)
   - Interface para administradores
   - Monitoramento e controle de sessões

## 🚀 Instalação e Configuração

### 1. Instalar Redis

#### Redis Local (Desenvolvimento)
```bash
# Windows (usando Chocolatey)
choco install redis-64

# macOS (usando Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Iniciar Redis
redis-server
```

#### Redis em Nuvem (Produção)
- **Redis Cloud**: https://redis.com/redis-enterprise-cloud/
- **AWS ElastiCache**: https://aws.amazon.com/elasticache/
- **Azure Cache for Redis**: https://azure.microsoft.com/services/cache/

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure as variáveis:

```env
# Redis Local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# Redis Produção
# REDIS_HOST=your-redis-host.com
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password
# REDIS_TLS=true
```

### 3. Instalar Dependências

```bash
npm install redis ioredis connect-redis express-session @types/express-session
```

## 📊 Estrutura de Dados no Redis

### Chaves Utilizadas

1. **Sessões**: `session:{sessionId}`
   ```json
   {
     "userId": "user123",
     "user": { /* dados do usuário */ },
     "createdAt": 1640995200000,
     "lastActivity": 1640995200000,
     "ipAddress": "192.168.1.1",
     "userAgent": "Mozilla/5.0...",
     "deviceInfo": "Windows - Chrome"
   }
   ```

2. **Sessões por Usuário**: `user_sessions:{userId}`
   ```
   Set contendo IDs das sessões ativas do usuário
   ```

3. **Usuários Ativos**: `active_users`
   ```
   Set contendo IDs dos usuários com sessões ativas
   ```

### TTL (Time To Live)

- **Sessões**: 24 horas (86400 segundos)
- **Refresh Tokens**: 7 dias (604800 segundos)
- **Cache Temporário**: 15 minutos (900 segundos)

## 🔧 API Endpoints

### GET /api/sessions
Lista sessões ativas ou estatísticas gerais.

**Parâmetros:**
- `userId` (opcional): Lista sessões de um usuário específico

**Resposta:**
```json
{
  "activeUsers": 15,
  "activeSessions": 23
}
```

### DELETE /api/sessions
Remove sessões.

**Parâmetros:**
- `sessionId`: Remove uma sessão específica
- `userId`: Remove todas as sessões de um usuário
- `action=cleanup`: Limpa sessões expiradas

### POST /api/sessions/validate
Valida uma sessão.

**Body:**
```json
{
  "sessionId": "uuid-session-id"
}
```

**Resposta:**
```json
{
  "valid": true,
  "session": {
    "sessionId": "uuid",
    "userId": "user123",
    "user": { /* dados do usuário */ },
    "lastActivity": "2023-12-31T23:59:59.000Z"
  }
}
```

### PUT /api/sessions/validate
Estende uma sessão.

**Body:**
```json
{
  "sessionId": "uuid-session-id",
  "extendBy": 86400
}
```

## 🛡️ Segurança

### Medidas Implementadas

1. **Cookies Seguros**
   - `Secure`: Apenas HTTPS
   - `SameSite=Strict`: Proteção CSRF
   - `HttpOnly`: Não acessível via JavaScript

2. **Validação de Sessão**
   - Verificação automática no middleware
   - Limpeza de sessões expiradas
   - Rastreamento de IP e User-Agent

3. **Controle de Acesso**
   - Sessões por usuário limitadas
   - Logout forçado de sessões específicas
   - Monitoramento de atividade suspeita

## 📈 Monitoramento

### Interface de Administração

Acesse `/admin/sessions` para:
- Visualizar estatísticas de sessões
- Listar sessões por usuário
- Remover sessões específicas
- Limpar sessões expiradas

### Comandos Redis Úteis

```bash
# Listar todas as sessões
redis-cli KEYS "session:*"

# Contar sessões ativas
redis-cli EVAL "return #redis.call('keys', 'session:*')" 0

# Ver usuários ativos
redis-cli SMEMBERS active_users

# Ver sessões de um usuário
redis-cli SMEMBERS user_sessions:USER_ID

# Limpar todas as sessões (CUIDADO!)
redis-cli FLUSHDB
```

## 🔄 Fluxo de Autenticação

### Login
1. Usuário faz login
2. Sistema valida credenciais
3. Cria sessão no Redis
4. Define cookies seguros
5. Retorna sucesso

### Validação de Requisição
1. Middleware intercepta requisição
2. Extrai session_id do cookie
3. Valida sessão no Redis
4. Atualiza última atividade
5. Permite ou nega acesso

### Logout
1. Usuário faz logout
2. Remove sessão do Redis
3. Limpa cookies
4. Atualiza listas de usuários ativos

## 🚨 Troubleshooting

### Problemas Comuns

1. **Redis não conecta**
   ```bash
   # Verificar se Redis está rodando
   redis-cli ping
   # Deve retornar: PONG
   ```

2. **Sessões não persistem**
   - Verificar configuração de TTL
   - Confirmar que Redis não está sendo limpo
   - Verificar logs de erro

3. **Performance lenta**
   - Monitorar uso de memória Redis
   - Implementar limpeza automática
   - Considerar particionamento

### Logs Importantes

```javascript
// Ativar logs detalhados
console.log('✅ Redis conectado com sucesso');
console.log('❌ Erro na conexão Redis:', error);
console.log('🔄 Reconectando ao Redis...');
```

## 📚 Referências

- [Redis Documentation](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [Next.js Middleware](https://nextjs.org/docs/middleware)
- [Session Management Best Practices](https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html)

## 🔮 Próximos Passos

1. **Implementar Rate Limiting**
   - Limitar tentativas de login
   - Controlar requisições por IP

2. **Adicionar Métricas**
   - Tempo de resposta
   - Uso de memória
   - Sessões por período

3. **Clustering Redis**
   - Alta disponibilidade
   - Distribuição de carga
   - Backup automático

4. **Notificações em Tempo Real**
   - WebSockets para admin
   - Alertas de segurança
   - Dashboard em tempo real