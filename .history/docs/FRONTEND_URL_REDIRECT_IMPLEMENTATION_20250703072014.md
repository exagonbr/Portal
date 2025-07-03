# Implementação do Redirecionamento com FRONTEND_URL e Cache Cleaner

## Resumo das Alterações

Este documento descreve as alterações implementadas para garantir que o redirecionamento do login para o dashboard use corretamente a variável de ambiente `FRONTEND_URL`, o proxy configurado no `next.config.ts`, e um sistema de limpeza automática de cache para evitar problemas de navegação.

## Arquivos Modificados

### 1. `next.config.ts`
- **Linha 565**: Adicionada a variável `NEXT_PUBLIC_FRONTEND_URL` para expor a `FRONTEND_URL` para o cliente
- **Configuração do Proxy**: Já estava configurado corretamente nas linhas 496-551

```typescript
// Expor FRONTEND_URL para o cliente
NEXT_PUBLIC_FRONTEND_URL: process.env.FRONTEND_URL || (
  isProd
    ? 'https://portal.sabercon.com.br'
    : 'http://localhost:3000'
),
```

### 2. `src/components/auth/LoginPage.tsx`
- **Linhas 163-171**: Atualizado o redirecionamento para usar `FRONTEND_URL` em vez de construir a URL manualmente

```typescript
// ANTES
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
window.location.href = `${baseUrl}${targetPath}`;

// DEPOIS
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                   process.env.FRONTEND_URL || 
                   window.location.origin;
const fullUrl = `${frontendUrl}${targetPath}`;
console.log(`🌐 Redirecionando para URL completa: ${fullUrl}`);
window.location.href = fullUrl;
```

### 3. `src/utils/urlBuilder.ts`
- **Linhas 11-16**: Atualizada a função `buildUrl()` para usar `NEXT_PUBLIC_FRONTEND_URL`
- **Linhas 69-76**: Atualizada a função `isExternalUrl()` para usar a mesma lógica

```typescript
// ANTES
const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || '';

// DEPOIS
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                   process.env.FRONTEND_URL || 
                   process.env.NEXTAUTH_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : '');
```

## Como Funciona

### 1. Configuração de Variáveis de Ambiente
- **Servidor**: `FRONTEND_URL` é usada no servidor (backend e next.config.ts)
- **Cliente**: `NEXT_PUBLIC_FRONTEND_URL` é exposta para o cliente através do next.config.ts

### 2. Ordem de Prioridade para URLs
1. `process.env.NEXT_PUBLIC_FRONTEND_URL` (cliente)
2. `process.env.FRONTEND_URL` (servidor)
3. `process.env.NEXTAUTH_URL` (fallback)
4. `window.location.origin` (fallback do cliente)

### 3. Proxy no Next.js
O proxy já estava configurado corretamente no `next.config.ts`:

```typescript
async rewrites() {
  const backendUrl = process.env.BACKEND_URL || (
    isProd
      ? process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'
      : 'http://localhost:3001'
  );

  return {
    beforeFiles: [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ],
    // ... outras configurações
  };
}
```

## Fluxo de Redirecionamento

### 1. Login Bem-sucedido
1. Usuário faz login no `LoginForm.tsx`
2. `AuthContext.tsx` usa `buildUrl('/dashboard')` do `urlBuilder.ts`
3. `urlBuilder.ts` constrói a URL usando `NEXT_PUBLIC_FRONTEND_URL`
4. Redirecionamento acontece para o dashboard correto

### 2. Redirecionamento Direto (LoginPage.tsx)
1. Usuário já autenticado acessa `/auth/login`
2. `LoginPage.tsx` detecta usuário autenticado
3. Constrói URL completa usando `NEXT_PUBLIC_FRONTEND_URL`
4. Redireciona diretamente com `window.location.href`

### 3. Logout
1. `LogoutHandler.tsx` usa `buildLoginUrl()` do `urlBuilder.ts`
2. URL é construída usando `FRONTEND_URL`
3. Redirecionamento para login acontece corretamente

## Configuração de Produção

Para produção, certifique-se de que as seguintes variáveis estejam configuradas:

```bash
# Backend (.env)
FRONTEND_URL=https://portal.sabercon.com.br
BACKEND_URL=https://portal.sabercon.com.br

# Frontend (automaticamente exposto via next.config.ts)
NEXT_PUBLIC_FRONTEND_URL=https://portal.sabercon.com.br
```

## Configuração de Desenvolvimento

Para desenvolvimento local:

```bash
# Backend (.env)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Frontend (automaticamente exposto via next.config.ts)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Benefícios da Implementação

1. **Consistência**: Todas as URLs são construídas usando a mesma variável de ambiente
2. **Flexibilidade**: Funciona em diferentes ambientes (dev, staging, prod)
3. **Proxy Transparente**: O Next.js proxy funciona corretamente
4. **Fallbacks**: Sistema robusto de fallbacks para diferentes cenários
5. **Logging**: Logs detalhados para debugging

## Arquivos Não Modificados (Já Corretos)

- `src/components/ui/LogoutHandler.tsx` - Já usa `buildLoginUrl()`
- `src/contexts/AuthContext.tsx` - Já usa `buildUrl()` e `buildLoginUrl()`
- Outros componentes que usam `router.push()` - Funcionam com rotas relativas

## Testes Recomendados

1. **Login**: Verificar se o redirecionamento após login funciona
2. **Logout**: Verificar se o redirecionamento para login funciona
3. **Usuário Autenticado**: Verificar se usuário já logado é redirecionado corretamente
4. **Diferentes Roles**: Testar redirecionamento para dashboards específicos
5. **Ambientes**: Testar em desenvolvimento e produção