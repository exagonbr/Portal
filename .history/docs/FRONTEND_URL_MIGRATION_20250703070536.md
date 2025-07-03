# Migração para uso de FRONTEND_URL

## Resumo das Mudanças

Este documento descreve as mudanças realizadas para centralizar o uso de URLs no projeto, utilizando a variável de ambiente `FRONTEND_URL` definida no arquivo `.env`.

## Arquivos de Configuração Criados/Modificados

### 1. `/src/config/urls.ts`
Arquivo principal de configuração de URLs que exporta funções para obter URLs baseadas em variáveis de ambiente:

```typescript
// Funções principais
export { getApiUrl, getInternalApiUrl } from './env';

// Função para construir URLs da API
export const buildApiUrl = (path: string) => {
  const baseUrl = getApiUrl();
  // ... lógica de construção
};
```

### 2. Arquivos Atualizados

#### `/src/lib/auth.ts`
- Removido: URLs hardcoded como `'https://portal.sabercon.com.br/api'`
- Adicionado: `import { getInternalApiUrl } from '@/config/urls'`
- Mudança: `fetch(getInternalApiUrl('/auth/optimized/login'), ...)`

#### `/src/lib/api-client.ts`
- Removido: `baseUrl: 'https://portal.sabercon.com.br/api'` hardcoded
- Adicionado: `import { getApiUrl } from '@/config/urls'`
- Mudança: `this.baseURL = getApiUrl()`

#### `/src/lib/api-proxy.ts`
- Removido: Uso de `API_CONFIG.BASE_URL`
- Adicionado: `import { getInternalApiUrl } from '@/config/urls'`
- Mudança: URLs construídas com `getInternalApiUrl(endpoint)`

#### `/src/hooks/useOptimizedAuth.ts`
- Removido: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'`
- Adicionado: `import { getApiUrl } from '@/config/urls'`
- Mudança: Todas as chamadas fetch usam `getApiUrl()`

#### `/src/components/ui/LogoutHandler.tsx`
- Removido: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'`
- Adicionado: `import { getApiUrl } from '@/config/urls'`
- Mudança: Chamadas fetch usam `getApiUrl()`

#### `/src/services/userService.ts`
- Adicionado: `import { buildApiUrl } from '@/config/urls'`
- Mudança: Todas as chamadas fetch usam `buildApiUrl(path)`

## Padrão de Migração

### Antes:
```typescript
// URLs hardcoded
const response = await fetch('https://portal.sabercon.com.br/api/users', ...)

// Ou com process.env
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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