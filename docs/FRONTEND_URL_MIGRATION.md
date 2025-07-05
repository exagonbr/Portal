# Migração para uso da variável FRONTEND_URL

## Resumo
Este documento descreve as alterações realizadas para substituir todas as URLs hardcoded por referências à variável de ambiente `FRONTEND_URL`.

## Arquivos Modificados

### Frontend

#### 1. `.env`
- **Linha 7**: `NEXTAUTH_URL` agora usa `${FRONTEND_URL}`
- **Linha 18**: `ALLOWED_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 19**: `ADMIN_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 33**: `GOOGLE_CALLBACK_URL` agora usa `${FRONTEND_URL}/api/auth/google/callback`

#### 2. `next.config.ts`
- **Linha 18**: CSP `connect-src` agora usa hostname extraído de `FRONTEND_URL`
- **Linha 121**: Configuração de imagens agora usa hostname extraído de `FRONTEND_URL`
- **Linhas 498-502**: `backendUrl` já estava usando `FRONTEND_URL` corretamente
- **Linhas 558-562**: `NEXT_PUBLIC_API_URL` já estava usando `FRONTEND_URL` corretamente

#### 3. `src/config/env.ts`
- **Linha 21**: `frontendUrl` já estava usando `process.env.FRONTEND_URL`
- **Linhas 26, 30, 34, 41, 43**: Todas as URLs já estavam usando `frontendUrl`
- **Linhas 53, 56, 58**: Fallback URLs já estavam usando `FRONTEND_URL`
- **Linhas 98, 111**: Fallback URLs já estavam usando `FRONTEND_URL`

### Backend

#### 4. `backend/src/config/env.ts`
- **Linha 23**: `FRONTEND_URL` agora usa `process.env.FRONTEND_URL` com fallback

#### 5. `backend/src/config/jwt.ts`
- **Linha 31**: `ISSUER` agora extrai hostname de `FRONTEND_URL`

#### 6. `backend/src/config/passport.ts`
- **Linha 20**: `callbackURL` agora usa `${FRONTEND_URL}/api/auth/google/callback`

#### 7. `backend/src/config/swagger.ts`
- **Linha 45**: URL do servidor agora usa `process.env.FRONTEND_URL`

#### 8. `backend/src/config/corsUsers.config.ts`
- **Linhas 22-23**: `allowedOrigins` agora usa `FRONTEND_URL` e `${FRONTEND_URL}/api`
- **Linhas 38-39**: `adminOrigins` agora usa `FRONTEND_URL` e `${FRONTEND_URL}/api`

#### 9. `backend/src/config/serverInitializer.ts`
- **Linhas 79-81**: URLs de log agora usam `FRONTEND_URL`

#### 10. `backend/src/index-fixed.ts`
- **Linhas 205-207**: URLs de log agora usam `FRONTEND_URL`

#### 11. `backend/env.production.portal`
- **Linha 2**: Comentário agora usa `${FRONTEND_URL}/api`
- **Linha 10**: `API_BASE_URL` agora usa `${FRONTEND_URL}/api`
- **Linha 32**: `CORS_ORIGIN` agora usa `${FRONTEND_URL}`
- **Linha 33**: `ALLOWED_ORIGINS` agora usa `${FRONTEND_URL}`
- **Linha 49**: `SMTP_FROM` agora usa hostname extraído de `FRONTEND_URL`

#### 12. `backend/.env`
- **Linha 8**: `NEXTAUTH_URL` agora usa `${FRONTEND_URL}`
- **Linha 18**: `ALLOWED_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 19**: `ADMIN_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 34**: `GOOGLE_CALLBACK_URL` agora usa `${FRONTEND_URL}/api/auth/google/callback`

#### 13. `backend/.env.cors.example`
- **Linha 15**: `ALLOWED_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 18**: Comentário agora usa `${FRONTEND_URL}`
- **Linha 26**: `ADMIN_ORIGINS` agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 57**: Exemplo agora usa `${FRONTEND_URL}` e `${FRONTEND_URL}/api`
- **Linha 58**: Exemplo agora usa `${FRONTEND_URL}`
- **Linha 70**: Exemplo agora usa `${FRONTEND_URL}`
- **Linha 102**: Exemplo de curl agora usa `${FRONTEND_URL}/api/users/me`

#### 14. `backend/.env.example`
- **Linha 43**: `CORS_ORIGIN` agora usa `${FRONTEND_URL}`

## Benefícios da Migração

1. **Flexibilidade**: Facilita mudanças de domínio sem necessidade de alterar múltiplos arquivos
2. **Manutenibilidade**: Centraliza a configuração de URL em uma única variável
3. **Ambientes**: Permite diferentes URLs para desenvolvimento, staging e produção
4. **Consistência**: Garante que todas as partes do sistema usem a mesma URL base

## Como Usar

Para alterar a URL do frontend, basta modificar a variável `FRONTEND_URL` no arquivo `.env`:

```bash
# Exemplo para produção
FRONTEND_URL=https://portal.sabercon.com.br

# Exemplo para staging
FRONTEND_URL=https://staging.portal.sabercon.com.br

# Exemplo para desenvolvimento local
FRONTEND_URL=http://localhost:3000
```

## Arquivos que Ainda Contêm URLs Hardcoded

Os seguintes tipos de arquivos ainda podem conter URLs hardcoded, mas são menos críticos:

1. **Arquivos de teste** (`*.test.js`, `*.test.ts`)
2. **Scripts de teste** (`test-*.js`)
3. **Documentação** (`*.md`)
4. **Arquivos de configuração Docker** (`Dockerfile`, `docker-compose.yml`)

Estes arquivos podem ser atualizados conforme necessário, mas não afetam o funcionamento principal da aplicação.

## Verificação

Para verificar se todas as URLs foram migradas corretamente, execute:

```bash
# Buscar por URLs hardcoded restantes
grep -r "portal\.sabercon\.com\.br" src/ --exclude-dir=node_modules
grep -r "portal\.sabercon\.com\.br" backend/src/ --exclude-dir=node_modules
```

## Data da Migração
7 de janeiro de 2025