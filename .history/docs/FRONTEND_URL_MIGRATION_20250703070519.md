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
