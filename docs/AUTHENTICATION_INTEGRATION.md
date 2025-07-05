# Integração de Autenticação - Portal Sabercon

## Visão Geral

Este documento descreve a nova estrutura de autenticação integrada entre o frontend (Next.js) e o backend (Node.js/Express).

## Arquitetura

### Frontend (Next.js)
- **Middleware**: `src/middleware.ts` - Protege rotas e valida autenticação
- **Serviço de Auth**: `src/services/auth.ts` - Funções de autenticação
- **API Routes**: 
  - `/api/auth/login` - Login de usuários
  - `/api/auth/logout` - Logout de usuários
  - `/api/auth/register` - Registro de usuários
  - `/api/auth/validate` - Validação de tokens

### Backend (Node.js)
- Porta padrão: 3001
- Endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/register`
  - `GET /api/v1/auth/validate`

## Como Testar

### 1. Iniciar o Backend

```bash
cd backend
npm install
npm run dev
```

O backend deve estar rodando em `https://portal.sabercon.com.br/api`

### 2. Iniciar o Frontend

Em outro terminal:

```bash
npm install
npm run dev
```

O frontend estará em `https://portal.sabercon.com.br`

### 3. Página de Teste

Acesse: `https://portal.sabercon.com.br/test-auth-integration`

Esta página permite:
- Testar a conexão com o backend
- Fazer login com diferentes roles
- Verificar o redirecionamento automático para dashboards

### 4. Usuários de Teste

| Email | Senha | Role | Dashboard |
|-------|-------|------|-----------|
| student@example.com | teste123 | student | /dashboard/student |
| teacher@example.com | teste123 | teacher | /dashboard/teacher |
| admin@example.com | teste123 | system_admin | /dashboard/system-admin |
| coordinator@example.com | teste123 | academic_coordinator | /dashboard/coordinator |
| manager@example.com | teste123 | institution_manager | /dashboard/institution-manager |
| guardian@example.com | teste123 | guardian | /dashboard/guardian |

## Fluxo de Autenticação

1. **Login**:
   - Usuário envia credenciais para `/api/auth/login`
   - Frontend faz requisição para backend
   - Backend valida e retorna token JWT
   - Frontend armazena token em cookies httpOnly
   - Usuário é redirecionado para dashboard apropriado

2. **Validação de Rotas**:
   - Middleware intercepta todas as requisições
   - Verifica token nos cookies
   - Valida token com backend se necessário
   - Permite ou bloqueia acesso baseado na role

3. **Logout**:
   - Remove tokens dos cookies
   - Invalida sessão no backend
   - Redireciona para página de login

## Configuração de Ambiente

### Frontend (.env.local)
```env
BACKEND_URL=https://portal.sabercon.com.br/api
API_VERSION=v1
NEXTAUTH_URL=https://portal.sabercon.com.br
NEXTAUTH_SECRET=your-secret-key-here
```

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://portal.sabercon.com.br
```

## Troubleshooting

### Erro: "Conexão recusada"
- Verifique se o backend está rodando na porta 3001
- Confirme as variáveis de ambiente

### Erro: "Token inválido"
- Limpe os cookies do navegador
- Faça login novamente

### Dashboard não carrega
- Verifique o console do navegador
- Confirme que a role do usuário está correta
- Verifique os logs do middleware

## Segurança

- Tokens JWT são armazenados em cookies httpOnly
- CORS configurado para aceitar apenas origem autorizada
- Validação de roles em múltiplas camadas
- Sessões expiram após 24 horas

## Próximos Passos

1. Implementar refresh tokens
2. Adicionar 2FA (autenticação de dois fatores)
3. Implementar rate limiting
4. Adicionar logs de auditoria
5. Implementar recuperação de senha