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
const response = await fetch(`${apiUrl}/users`, ...)
```

### Depois:
```typescript
import { buildApiUrl, getApiUrl } from '@/config/urls';

// Para endpoints da API
const response = await fetch(buildApiUrl('/users'), ...)

// Para URL base
const apiUrl = getApiUrl();
```

## Próximos Passos

Para completar a migração em outros arquivos:

1. **Identificar arquivos com URLs hardcoded:**
   ```bash
   grep -r "fetch.*https://" src/
   grep -r "fetch.*http://localhost" src/
   grep -r "process.env.*API_URL" src/
   ```

2. **Para cada arquivo encontrado:**
   - Adicionar import: `import { buildApiUrl, getApiUrl } from '@/config/urls'`
   - Substituir URLs hardcoded por chamadas às funções apropriadas
   - Testar as mudanças

3. **Arquivos que ainda precisam ser migrados:**
   - Componentes em `/src/app/`
   - Outros serviços em `/src/services/`
   - Utilitários em `/src/utils/`

## Benefícios

1. **Centralização:** Todas as URLs são gerenciadas em um único lugar
2. **Flexibilidade:** Fácil mudança entre ambientes (dev/staging/prod)
3. **Manutenibilidade:** Reduz duplicação de código
4. **Segurança:** URLs sensíveis ficam em variáveis de ambiente

## Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contenha:

```env
FRONTEND_URL=https://portal.sabercon.com.br
API_URL=http://localhost:3001/api
BACKEND_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Para produção, ajuste conforme necessário.