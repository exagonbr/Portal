# Implementação de CORS para APIs de Usuários

## Visão Geral

Este documento descreve a implementação específica de CORS (Cross-Origin Resource Sharing) para as APIs de usuários do Portal Sabercon. A implementação fornece controle granular de acesso baseado no tipo de operação e nível de segurança necessário.

## Arquitetura

### Arquivos Principais

1. **`/src/config/corsUsers.config.ts`** - Configurações centralizadas
2. **`/src/middleware/corsUsers.middleware.ts`** - Middlewares de CORS
3. **`/src/routes/users.ts`** - Aplicação dos middlewares nas rotas

### Tipos de CORS Implementados

#### 1. CORS Geral (`usersCorsMiddleware`)
- **Uso**: Endpoints padrão de usuários
- **Origens**: Lista configurável de domínios permitidos
- **Credenciais**: Habilitadas
- **Métodos**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Segurança**: Média

#### 2. CORS Administrativo (`usersAdminCorsMiddleware`)
- **Uso**: Operações administrativas (criar, editar, deletar usuários)
- **Origens**: Apenas domínios administrativos específicos
- **Credenciais**: Habilitadas
- **Métodos**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Segurança**: Alta

#### 3. CORS Público (`usersPublicCorsMiddleware`)
- **Uso**: Endpoints públicos (estatísticas, informações gerais)
- **Origens**: Todas (`*`)
- **Credenciais**: Desabilitadas
- **Métodos**: GET, OPTIONS, HEAD
- **Segurança**: Baixa

#### 4. CORS de Autenticação (`usersAuthCorsMiddleware`)
- **Uso**: Endpoints de login/autenticação
- **Origens**: Lista configurável
- **Credenciais**: Habilitadas
- **Métodos**: POST, OPTIONS
- **Segurança**: Alta

## Configuração

### Variáveis de Ambiente

```bash
# Origens permitidas para APIs gerais (separadas por vírgula)
ALLOWED_ORIGINS=https://app.exemplo.com,https://portal.exemplo.com

# Origens permitidas apenas para operações administrativas
ADMIN_ORIGINS=https://admin.exemplo.com

# Ambiente de desenvolvimento (mais permissivo)
NODE_ENV=development
```

### Origens Padrão

#### Desenvolvimento
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:8080`
- `http://localhost:4200` (Angular)
- `http://localhost:5173` (Vite)

#### Produção
- `https://portal.sabercon.com.br`
- `https://app.sabercon.com.br`
- `https://admin.sabercon.com.br`
- `https://www.sabercon.com.br`

## Implementação nas Rotas

### Aplicação dos Middlewares

```typescript
// CORS geral aplicado a todas as rotas
router.use(usersCorsMiddleware);

// CORS público para endpoints específicos
router.get('/stats-test', usersPublicCorsMiddleware, handler);

// CORS administrativo para operações sensíveis
router.post('/', usersAdminCorsMiddleware, authMiddleware, handler);
router.put('/:id', usersAdminCorsMiddleware, authMiddleware, handler);
router.delete('/:id', usersAdminCorsMiddleware, authMiddleware, handler);
```

### Endpoints e Seus Tipos de CORS

| Endpoint | Método | Tipo de CORS | Justificativa |
|----------|--------|--------------|---------------|
| `/users/stats-test` | GET | Público | Endpoint de teste |
| `/users/stats` | GET | Geral | Estatísticas com autenticação |
| `/users/me` | GET/PUT | Geral | Perfil do usuário logado |
| `/users/:id` | GET | Geral | Visualização de usuário |
| `/users` | GET | Administrativo | Listagem de usuários |
| `/users` | POST | Administrativo | Criação de usuário |
| `/users/:id` | PUT | Administrativo | Edição de usuário |
| `/users/:id` | DELETE | Administrativo | Exclusão de usuário |

## Headers de Segurança

### Headers Aplicados Automaticamente

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-API-Version: 1.0
X-Service: users-api
```

### Headers Administrativos Adicionais

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Admin-API: true
X-Security-Level: high
```

## Logging e Monitoramento

### Logs de CORS

Todos os middlewares de CORS geram logs detalhados:

```
🔒 [USERS-CORS] GET /users/me from origin: https://app.exemplo.com
✅ [USERS-CORS] CORS aprovado para GET /users/me

🛡️ [USERS-ADMIN-CORS] POST /users from origin: https://admin.exemplo.com
✅ [USERS-ADMIN-CORS] Acesso administrativo aprovado para POST /users

❌ [USERS-CORS] Origem rejeitada: https://site-malicioso.com
```

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `CORS_ORIGIN_NOT_ALLOWED` | Origem não permitida para APIs gerais |
| `CORS_ADMIN_ACCESS_DENIED` | Origem não autorizada para operações administrativas |

## Testes

### Testando CORS

```bash
# Teste de origem permitida
curl -H "Origin: https://app.sabercon.com.br" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     http://localhost:3001/api/users/me

# Teste de origem não permitida
curl -H "Origin: https://site-malicioso.com" \
     -X GET \
     http://localhost:3001/api/users/me
```

### Respostas Esperadas

#### Sucesso (200)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Erro CORS (403)
```json
{
  "success": false,
  "message": "Acesso negado pelo CORS",
  "error": "Origem não autorizada para acessar APIs de usuários",
  "code": "CORS_ORIGIN_NOT_ALLOWED"
}
```

## Manutenção

### Adicionando Novas Origens

1. **Para desenvolvimento**: Adicione em `corsUsers.config.ts`
2. **Para produção**: Configure via variável de ambiente `ALLOWED_ORIGINS`
3. **Para admin**: Configure via variável `ADMIN_ORIGINS`

### Modificando Configurações

Todas as configurações estão centralizadas em `/src/config/corsUsers.config.ts`:

```typescript
export const corsUsersConfig: CorsUsersConfig = {
  allowedOrigins: [
    // Adicione novas origens aqui
    'https://nova-origem.com'
  ],
  // ... outras configurações
};
```

## Segurança

### Boas Práticas Implementadas

1. **Princípio do Menor Privilégio**: Cada tipo de endpoint tem apenas as permissões necessárias
2. **Validação de Origem**: Verificação rigorosa de origens permitidas
3. **Headers de Segurança**: Aplicação automática de headers de proteção
4. **Logging Detalhado**: Monitoramento de todas as tentativas de acesso
5. **Configuração Centralizada**: Facilita manutenção e auditoria

### Considerações de Segurança

- **Nunca** use `origin: '*'` com `credentials: true`
- **Sempre** valide origens em produção
- **Monitore** logs de CORS para detectar tentativas de acesso não autorizadas
- **Mantenha** a lista de origens atualizada

## Troubleshooting

### Problemas Comuns

1. **Erro "CORS policy"**: Verifique se a origem está na lista permitida
2. **Credenciais não enviadas**: Certifique-se que `credentials: true` está configurado
3. **Preflight falha**: Verifique se OPTIONS está permitido nos métodos

### Debug

Ative logs detalhados verificando os console.log nos middlewares para identificar onde o CORS está falhando.