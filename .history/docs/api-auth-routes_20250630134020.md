# Documentação das Rotas de Autenticação

Este documento descreve as duas novas rotas de autenticação criadas para resolver os erros 404:

## 1. Rota `/api/auth/session`

### Descrição
Gerencia sessões de usuários autenticados, permitindo criar, consultar, atualizar e invalidar sessões.

### Endpoints Disponíveis

#### GET `/api/auth/session`
Obtém informações sobre sessões.

**Parâmetros de Query:**
- `sessionId` (opcional): ID específico da sessão
- `userId` (opcional): Listar sessões de um usuário específico
- `all` (opcional): `true` para listar todas as sessões (apenas admins)

**Exemplos:**
```bash
# Obter sessão atual
GET /api/auth/session

# Obter sessão específica
GET /api/auth/session?sessionId=session_123456

# Listar sessões de um usuário
GET /api/auth/session?userId=user123

# Listar todas as sessões (admin)
GET /api/auth/session?all=true
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id": "session_123456",
    "userId": "user123",
    "token": "jwt_token_here",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "isActive": true,
    "lastActivity": "2025-06-30T13:30:00.000Z",
    "expiresAt": "2025-07-01T13:30:00.000Z",
    "createdAt": "2025-06-30T13:30:00.000Z",
    "updatedAt": "2025-06-30T13:30:00.000Z"
  }
}
```

#### POST `/api/auth/session`
Cria uma nova sessão.

**Body:**
```json
{
  "userId": "user123",
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here", // opcional
  "userAgent": "Mozilla/5.0...", // opcional
  "ipAddress": "192.168.1.1", // opcional
  "expiresAt": "2025-07-01T13:30:00.000Z" // opcional
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id": "session_123456",
    "userId": "user123",
    "token": "jwt_token_here",
    "isActive": true,
    "lastActivity": "2025-06-30T13:30:00.000Z",
    "expiresAt": "2025-07-01T13:30:00.000Z",
    "createdAt": "2025-06-30T13:30:00.000Z",
    "updatedAt": "2025-06-30T13:30:00.000Z"
  },
  "message": "Sessão criada com sucesso"
}
```

#### PUT `/api/auth/session`
Atualiza uma sessão existente.

**Parâmetros de Query:**
- `sessionId` (obrigatório): ID da sessão a ser atualizada

**Body:**
```json
{
  "isActive": false, // opcional
  "lastActivity": "2025-06-30T13:35:00.000Z", // opcional
  "expiresAt": "2025-07-01T13:35:00.000Z" // opcional
}
```

#### DELETE `/api/auth/session`
Invalida/deleta sessões.

**Parâmetros de Query:**
- `sessionId` (opcional): ID específico da sessão
- `userId` (opcional): Invalidar todas as sessões de um usuário
- `all` (opcional): `true` para invalidar todas as sessões (apenas admins)

**Exemplos:**
```bash
# Invalidar sessão atual
DELETE /api/auth/session

# Invalidar sessão específica
DELETE /api/auth/session?sessionId=session_123456

# Invalidar todas as sessões de um usuário
DELETE /api/auth/session?userId=user123

# Invalidar todas as sessões (admin)
DELETE /api/auth/session?all=true
```

---

## 2. Rota `/api/auth/_log`

### Descrição
Gerencia logs de eventos de autenticação para auditoria e monitoramento de segurança.

### Endpoints Disponíveis

#### GET `/api/auth/_log`
Obtém logs de autenticação.

**Parâmetros de Query:**
- `userId` (opcional): Filtrar por usuário
- `email` (opcional): Filtrar por email
- `action` (opcional): Filtrar por ação (`LOGIN`, `LOGOUT`, `LOGIN_FAILED`, etc.)
- `status` (opcional): Filtrar por status (`SUCCESS`, `FAILED`, `WARNING`, `ERROR`)
- `startDate` (opcional): Data inicial (ISO string)
- `endDate` (opcional): Data final (ISO string)
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Limite por página (padrão: 50, máximo: 1000)
- `sortBy` (opcional): Campo para ordenação (`timestamp`, `action`, `status`)
- `sortOrder` (opcional): Ordem (`asc`, `desc`)

**Exemplos:**
```bash
# Obter logs recentes
GET /api/auth/_log

# Filtrar por usuário
GET /api/auth/_log?userId=user123

# Filtrar por ação e status
GET /api/auth/_log?action=LOGIN&status=FAILED

# Filtrar por período
GET /api/auth/_log?startDate=2025-06-30T00:00:00.000Z&endDate=2025-06-30T23:59:59.999Z

# Paginação
GET /api/auth/_log?page=2&limit=100
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_123456",
      "userId": "user123",
      "email": "user@example.com",
      "action": "LOGIN",
      "status": "SUCCESS",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-06-30T13:30:00.000Z",
      "details": "Login realizado com sucesso",
      "sessionId": "session_123456",
      "deviceInfo": {
        "type": "desktop",
        "os": "Windows",
        "browser": "Chrome"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  },
  "stats": {
    "total": 150,
    "last24h": 25,
    "byAction": {
      "LOGIN": 100,
      "LOGOUT": 30,
      "LOGIN_FAILED": 20
    },
    "byStatus": {
      "SUCCESS": 130,
      "FAILED": 20
    }
  }
}
```

#### POST `/api/auth/_log`
Cria um novo log de autenticação.

**Body:**
```json
{
  "userId": "user123", // opcional
  "email": "user@example.com", // opcional
  "action": "LOGIN", // obrigatório
  "status": "SUCCESS", // obrigatório
  "details": "Login realizado com sucesso", // opcional
  "metadata": { // opcional
    "loginMethod": "email",
    "rememberMe": true
  },
  "sessionId": "session_123456" // opcional
}
```

**Ações Válidas:**
- `LOGIN`
- `LOGOUT`
- `LOGIN_FAILED`
- `TOKEN_REFRESH`
- `SESSION_EXPIRED`
- `PASSWORD_RESET`
- `ACCOUNT_LOCKED`
- `SUSPICIOUS_ACTIVITY`

**Status Válidos:**
- `SUCCESS`
- `FAILED`
- `WARNING`
- `ERROR`

#### PUT `/api/auth/_log`
Atualiza um log existente (apenas admins do sistema).

**Parâmetros de Query:**
- `logId` (obrigatório): ID do log a ser atualizado

**Body:**
```json
{
  "details": "Detalhes atualizados", // opcional
  "metadata": { // opcional
    "additionalInfo": "Informação adicional"
  }
}
```

#### DELETE `/api/auth/_log`
Deleta logs (apenas admins do sistema).

**Parâmetros de Query:**
- `logId` (opcional): ID específico do log
- `olderThan` (opcional): Data ISO string para deletar logs mais antigos
- `all` (opcional): `true` para deletar todos os logs

**Exemplos:**
```bash
# Deletar log específico
DELETE /api/auth/_log?logId=log_123456

# Deletar logs mais antigos que 30 dias
DELETE /api/auth/_log?olderThan=2025-05-30T00:00:00.000Z

# Deletar todos os logs (operação perigosa)
DELETE /api/auth/_log?all=true
```

---

## Recursos e Funcionalidades

### Segurança
- **Autenticação JWT**: Todas as operações verificam tokens válidos
- **Controle de Acesso**: Usuários só podem ver seus próprios dados (exceto admins)
- **Rate Limiting**: Proteção contra abuso nas rotas de sessão
- **Logs de Auditoria**: Todas as ações são registradas automaticamente

### Funcionalidades Especiais

#### Sessões
- **Limpeza Automática**: Sessões expiradas são removidas automaticamente
- **Detecção de Dispositivo**: Identifica se é mobile, tablet ou desktop
- **Múltiplas Sessões**: Suporte a múltiplas sessões por usuário
- **Invalidação em Cascata**: Ao deletar usuário, todas as sessões são invalidadas

#### Logs
- **Retenção Automática**: Logs mais antigos que 30 dias são removidos automaticamente
- **Detecção de Dispositivo**: Identifica OS, browser e tipo de dispositivo
- **Estatísticas**: Admins podem ver estatísticas agregadas
- **Busca Avançada**: Múltiplos filtros e ordenação

### Códigos de Status HTTP

#### Sucessos
- `200 OK`: Operação realizada com sucesso
- `201 Created`: Recurso criado com sucesso

#### Erros do Cliente
- `400 Bad Request`: Dados inválidos ou faltando
- `401 Unauthorized`: Token inválido ou ausente
- `403 Forbidden`: Sem permissão para a operação
- `404 Not Found`: Recurso não encontrado

#### Erros do Servidor
- `500 Internal Server Error`: Erro interno do servidor
- `502 Bad Gateway`: Erro de comunicação com backend
- `503 Service Unavailable`: Serviço temporariamente indisponível

### CORS
Ambas as rotas suportam CORS completo com:
- Todas as origens permitidas (`*`)
- Métodos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Headers personalizados suportados
- Preflight requests (`OPTIONS`) tratadas automaticamente

### Uso em Produção

#### Cache e Performance
- **Memória**: Atualmente usa cache em memória (desenvolvimento)
- **Produção**: Recomenda-se usar Redis ou banco de dados
- **Limpeza**: Limpeza automática de dados antigos

#### Monitoramento
- **Console Logs**: Todas as operações são logadas no console
- **Métricas**: Estatísticas disponíveis para admins
- **Alertas**: Logs de atividades suspeitas

#### Backup e Recuperação
- **Exportação**: Logs podem ser exportados via API
- **Retenção**: Configurável (padrão: 30 dias)
- **Auditoria**: Trilha completa de auditoria mantida