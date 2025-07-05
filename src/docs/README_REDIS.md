# 🚀 Sistema de Sessões Redis - Portal Educacional

## 📋 Resumo da Implementação

Este documento descreve a implementação completa do sistema de gerenciamento de sessões usando Redis no Portal Educacional, fornecendo escalabilidade, performance e segurança aprimoradas.

## ✨ Funcionalidades Implementadas

### 🔧 Componentes Principais

1. **Configuração Redis** (`src/config/redis.ts`)
   - Cliente Redis configurado com ioredis
   - Suporte a Redis local e em nuvem
   - Reconexão automática e tratamento de erros

2. **Serviço de Sessões** (`src/services/sessionService.ts`)
   - Criação e gerenciamento de sessões
   - Rastreamento de usuários ativos
   - Limpeza automática de sessões expiradas

3. **APIs REST** (`src/app/api/sessions/`)
   - `/api/sessions` - Listar e remover sessões
   - `/api/sessions/validate` - Validar e estender sessões

4. **Middleware Integrado** (`src/middleware.ts`)
   - Validação automática de sessões
   - Redirecionamento baseado em autenticação

5. **Interface de Administração**
   - Componente `SessionManager` para administradores
   - Página `/admin/sessions` para monitoramento

6. **Hooks React**
   - `useSessionMonitor` - Monitoramento de sessões
   - `useSessionValidation` - Validação de sessão atual

## 🛠️ Instalação e Configuração

### 1. Instalar Redis

```bash
# Windows (Chocolatey)
choco install redis-64

# macOS (Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Iniciar Redis
redis-server
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Configurar Redis local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 3. Testar Conexão Redis

```bash
# Executar teste de conexão
npm run test:redis
```

## 🔄 Fluxo de Funcionamento

### Login do Usuário
1. Usuário faz login com credenciais
2. Sistema valida credenciais
3. Cria sessão no Redis com TTL de 24h
4. Define cookies seguros (`session_id`, `auth_token`)
5. Adiciona usuário à lista de ativos

### Validação de Requisições
1. Middleware intercepta todas as requisições
2. Extrai `session_id` do cookie
3. Valida sessão no Redis
4. Atualiza última atividade
5. Permite ou nega acesso

### Logout do Usuário
1. Remove sessão específica do Redis
2. Atualiza listas de usuários ativos
3. Limpa todos os cookies
4. Redireciona para login

## 📊 Estrutura de Dados Redis

### Chaves Utilizadas

```
session:{sessionId}          # Dados da sessão individual
user_sessions:{userId}       # Set com IDs das sessões do usuário
active_users                 # Set com IDs dos usuários ativos
```

### Exemplo de Dados de Sessão

```json
{
  "userId": "user123",
  "user": {
    "id": "user123",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "teacher"
  },
  "createdAt": 1640995200000,
  "lastActivity": 1640995200000,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": "Windows - Chrome"
}
```

## 🔐 Segurança Implementada

### Cookies Seguros
- `Secure`: Apenas HTTPS
- `SameSite=Strict`: Proteção CSRF
- `HttpOnly`: Não acessível via JavaScript

### Rastreamento de Sessões
- IP Address tracking
- User Agent detection
- Device information
- Timestamp de última atividade

### Controle de Acesso
- TTL automático (24 horas)
- Limpeza de sessões expiradas
- Logout forçado de sessões específicas

## 📈 Monitoramento e Administração

### Interface Web (`/admin/sessions`)
- Estatísticas de usuários ativos
- Lista de sessões por usuário
- Remoção manual de sessões
- Limpeza de sessões expiradas

### Comandos Redis Úteis

```bash
# Ver todas as sessões
redis-cli KEYS "session:*"

# Contar sessões ativas
redis-cli EVAL "return #redis.call('keys', 'session:*')" 0

# Ver usuários ativos
redis-cli SMEMBERS active_users

# Limpar sessões expiradas manualmente
redis-cli EVAL "
  local keys = redis.call('keys', 'session:*')
  local count = 0
  for i=1,#keys do
    local ttl = redis.call('ttl', keys[i])
    if ttl <= 0 then
      redis.call('del', keys[i])
      count = count + 1
    end
  end
  return count
" 0
```

## 🚀 Uso em Produção

### Redis em Nuvem

#### Redis Cloud
```env
REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-password
REDIS_TLS=true
```

#### AWS ElastiCache
```env
REDIS_HOST=your-cluster.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Configurações de Performance

```javascript
// Configuração otimizada para produção
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4, // IPv4
  connectTimeout: 10000,
  commandTimeout: 5000,
};
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Redis não conecta**
   ```bash
   # Verificar se Redis está rodando
   redis-cli ping
   # Deve retornar: PONG
   ```

2. **Sessões não persistem**
   - Verificar TTL configurado
   - Confirmar que Redis não está sendo limpo
   - Verificar logs de erro no console

3. **Performance lenta**
   - Monitorar uso de memória Redis
   - Implementar limpeza automática
   - Considerar clustering Redis

### Logs de Debug

```javascript
// Ativar logs detalhados
console.log('✅ Redis conectado com sucesso');
console.log('❌ Erro na conexão Redis:', error);
console.log('🔄 Reconectando ao Redis...');
console.log('🧹 Sessões expiradas limpas:', count);
```

## 📚 Arquivos Criados/Modificados

### Novos Arquivos
- `src/config/redis.ts` - Configuração Redis
- `src/services/sessionService.ts` - Serviço de sessões
- `src/app/api/sessions/route.ts` - API de sessões
- `src/app/api/sessions/validate/route.ts` - API de validação
- `src/components/admin/SessionManager.tsx` - Interface admin
- `src/app/admin/sessions/page.tsx` - Página admin
- `src/hooks/useSessionMonitor.ts` - Hooks React
- `scripts/test-redis.js` - Script de teste
- `docs/REDIS_SESSIONS.md` - Documentação completa
- `.env.example` - Exemplo de configuração

### Arquivos Modificados
- `src/middleware.ts` - Integração Redis
- `src/services/auth.ts` - Criação de sessões
- `package.json` - Script de teste Redis

## 🎯 Próximos Passos

1. **Rate Limiting**
   - Implementar limitação de tentativas de login
   - Controlar requisições por IP

2. **Métricas Avançadas**
   - Dashboard em tempo real
   - Alertas de segurança
   - Análise de padrões de uso

3. **Alta Disponibilidade**
   - Clustering Redis
   - Backup automático
   - Failover automático

4. **Otimizações**
   - Compressão de dados de sessão
   - Particionamento por região
   - Cache de segundo nível

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `docs/REDIS_SESSIONS.md`
2. Execute o teste de conexão: `npm run test:redis`
3. Verifique os logs do Redis e da aplicação
4. Acesse a interface de administração em `/admin/sessions`

---

**✨ Sistema Redis implementado com sucesso! Suas sessões agora são gerenciadas de forma escalável e segura.**