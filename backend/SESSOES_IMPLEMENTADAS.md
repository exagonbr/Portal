# Sistema de Sessões e Backend - Portal Sabercon

## 🔧 Funcionalidades Implementadas

### 1. Sistema de Sessões Robusto com Redis
- ✅ **SessionService**: Gerenciamento completo de sessões no Redis
- ✅ **Middleware de Autenticação**: Validação de JWT + sessões
- ✅ **Blacklist de Tokens**: Invalidação segura de tokens
- ✅ **Refresh Tokens**: Renovação automática de sessões
- ✅ **Multi-device Support**: Controle de sessões por dispositivo
- ✅ **TTL Configurável**: Tempo de vida flexível das sessões

### 2. Rotas de Sessões (/api/sessions)
- ✅ `POST /login` - Login com criação de sessão
- ✅ `POST /logout` - Logout com destruição de sessão
- ✅ `POST /logout-all` - Logout de todos os dispositivos
- ✅ `POST /refresh` - Renovação de token via refresh token
- ✅ `GET /list` - Listagem de sessões ativas do usuário
- ✅ `DELETE /destroy/:sessionId` - Remoção de sessão específica
- ✅ `GET /stats` - Estatísticas de sessões (Admin)
- ✅ `GET /validate` - Validação de sessão atual

### 3. Sistema de Dashboard (/api/dashboard)
- ✅ **DashboardService**: Analytics e métricas do sistema
- ✅ `GET /system` - Dashboard administrativo completo
- ✅ `GET /user` - Dashboard personalizado do usuário
- ✅ `GET /metrics/realtime` - Métricas em tempo real
- ✅ `GET /analytics` - Dados para gráficos (usuarios, sessões, atividade)
- ✅ `GET /summary` - Resumo baseado no role do usuário
- ✅ `GET /notifications` - Sistema de notificações
- ✅ `GET /health` - Status de saúde do sistema

### 4. Middleware Avançado
- ✅ **extractClientInfo**: Extração de informações do cliente (IP, User-Agent, Device)
- ✅ **validateJWTAndSession**: Validação completa JWT + sessão Redis
- ✅ **validateJWTOnly**: Validação apenas JWT (para casos específicos)
- ✅ **requireRole**: Controle de acesso baseado em roles
- ✅ **requirePermission**: Controle de acesso baseado em permissões
- ✅ **optionalAuth**: Autenticação opcional

### 5. Configuração Redis Otimizada
- ✅ **Conexões separadas**: Redis principal e para filas
- ✅ **TTL configuráveis**: Diferentes tempos para cada tipo de dado
- ✅ **Reconexão automática**: Tratamento de falhas de conexão
- ✅ **Métricas de performance**: Monitoramento de uso de memória

### 6. Script de Setup
- ✅ **setup.ts**: Configuração inicial completa do sistema
- ✅ **Verificação de dependências**: Redis, PostgreSQL
- ✅ **Criação de dados padrão**: Roles e usuário admin
- ✅ **Limpeza de sessões**: Remoção de dados expirados
- ✅ **Validação de configuração**: Verificação de variáveis importantes

## 🛠️ Tecnologias Utilizadas
- **Redis**: Cache e gerenciamento de sessões
- **JWT**: Tokens de autenticação
- **TypeORM**: ORM para PostgreSQL
- **Express**: Framework web
- **Swagger**: Documentação da API
- **TypeScript**: Tipagem estática

## 🚀 Como Usar

### 1. Configurar variáveis de ambiente:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=seu-jwt-secret-aqui
```

### 2. Executar setup inicial:
```bash
npm run setup
```

### 3. Iniciar servidor:
```bash
npm run dev
```

## 📊 Endpoints Principais

### Autenticação e Sessões
- `POST /api/sessions/login` - Login
- `POST /api/sessions/logout` - Logout
- `GET /api/sessions/list` - Listar sessões

### Dashboard e Analytics
- `GET /api/dashboard/user` - Dashboard do usuário
- `GET /api/dashboard/system` - Dashboard admin
- `GET /api/dashboard/analytics?type=users&period=week` - Analytics

### Documentação
- `GET /api/docs` - Swagger UI
- `GET /health` - Health check

## 🔒 Segurança
- ✅ Blacklist de tokens JWT
- ✅ Validação de sessões no Redis
- ✅ Controle de TTL por tipo de dados
- ✅ Detecção de dispositivos
- ✅ Rate limiting preparado
- ✅ CORS configurado
- ✅ Helmet para headers de segurança

## 📈 Monitoramento
- ✅ Métricas de sessões ativas
- ✅ Analytics de usuários
- ✅ Performance do Redis
- ✅ Health checks dos componentes
- ✅ Logs estruturados

## 🔑 Funcionalidades de Sessão

### Características Principais:
1. **Sessões Distribuídas**: Armazenadas no Redis para escalabilidade
2. **Device Tracking**: Identificação e controle por dispositivo
3. **Session Invalidation**: Logout remoto e blacklist de tokens
4. **Automatic Cleanup**: Limpeza automática de sessões expiradas
5. **Real-time Metrics**: Monitoramento em tempo real

### Fluxo de Autenticação:
1. **Login**: Cria sessão no Redis + gera JWT com sessionId
2. **Requests**: Valida JWT + verifica sessão no Redis
3. **Refresh**: Renova JWT mantendo a mesma sessão
4. **Logout**: Remove sessão do Redis + adiciona JWT à blacklist

## 📋 Scripts Disponíveis

```bash
# Setup inicial completo
npm run setup

# Desenvolvimento
npm run dev

# Produção
npm run build && npm run start

# Limpeza de sessões
node -e "require('./dist/services/SessionService').SessionService.cleanupExpiredSessions()"
```

O sistema está pronto para produção com todas as funcionalidades de sessões, dashboard e monitoramento implementadas! 