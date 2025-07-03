# Configuração de URLs com Variáveis de Ambiente

## Resumo das Alterações

Este documento descreve as alterações realizadas para centralizar o uso das variáveis de ambiente `FRONTEND_URL` e `NEXTAUTH_URL` nos redirecionamentos com `router.push` em toda a aplicação.

## Variáveis de Ambiente Utilizadas

- **FRONTEND_URL**: URL principal do frontend (ex: `https://portal.sabercon.com.br`)
- **NEXTAUTH_URL**: URL alternativa para autenticação (ex: `https://portal.sabercon.com.br`)

## Função Utilitária Criada

### `src/utils/urlBuilder.ts`

Criada uma biblioteca de funções utilitárias para construir URLs de forma consistente:

- `buildUrl(path)`: Constrói URL completa usando as variáveis de ambiente
- `buildLoginUrl(params?)`: Constrói URL de login com parâmetros opcionais
- `buildDashboardUrl(role)`: Constrói URL de dashboard baseada na role do usuário
- `isExternalUrl(url)`: Verifica se uma URL é externa

## Arquivos Modificados

### Contextos e Hooks

1. **`src/contexts/AuthContext.tsx`**
   - Linha 88: Logout redirecionamento
   - Linha 149: Login redirecionamento para dashboard

2. **`src/hooks/useOptimizedAuth.ts`**
   - Linha 68: Redirecionamento após login
   - Linha 114: Redirecionamento após logout
   - Linha 128: Redirecionamento em caso de erro

3. **`src/hooks/useRedirectWithClearData.ts`**
   - Linha 18: Redirecionamento para login com limpeza de dados
   - Linha 22: Redirecionamento de fallback

4. **`src/hooks/usePermissionCheck.ts`**
   - Linha 30: Redirecionamento para login quando não autenticado
   - Linha 36: Redirecionamento quando sem permissão

5. **`src/hooks/useRoleRedirect.ts`**
   - Múltiplas linhas: Todos os redirecionamentos baseados em role

### Componentes

6. **`src/components/ui/LogoutHandler.tsx`**
   - Linha 106: Redirecionamento após logout
   - Linha 122: Redirecionamento de fallback

7. **`src/components/AuthenticatedLayout.tsx`**
   - Linha 24: Redirecionamento para login quando não autenticado
   - Linha 31: Redirecionamento baseado em role

8. **`src/app/page.tsx`**
   - Linha 20: Redirecionamento para login
   - Linhas 29-47: Redirecionamentos baseados em role do usuário

## Benefícios das Alterações

1. **Centralização**: Todas as URLs são construídas usando as variáveis de ambiente
2. **Consistência**: Uso padronizado das funções utilitárias
3. **Manutenibilidade**: Fácil alteração de URLs em um local central
4. **Flexibilidade**: Suporte a URLs absolutas e relativas
5. **Fallback**: Graceful degradation quando variáveis não estão definidas

## Como Usar

### Exemplo Básico
```typescript
import { buildUrl, buildLoginUrl, buildDashboardUrl } from '@/utils/urlBuilder';

// URL simples
router.push(buildUrl('/dashboard'));

// URL de login com parâmetros
router.push(buildLoginUrl({ error: 'unauthorized' }));

// URL de dashboard baseada em role
router.push(buildDashboardUrl('STUDENT'));
```

### Configuração no .env
```env
FRONTEND_URL=https://portal.sabercon.com.br
NEXTAUTH_URL=https://portal.sabercon.com.br
```

## Compatibilidade

- ✅ URLs absolutas são preservadas
- ✅ URLs relativas funcionam como fallback
- ✅ Parâmetros de query string são suportados
- ✅ Diferentes roles de usuário são suportadas
- ✅ Backward compatibility mantida

## Próximos Passos

1. Testar em ambiente de desenvolvimento
2. Testar em ambiente de produção
3. Monitorar logs para identificar possíveis problemas
4. Considerar adicionar mais funções utilitárias conforme necessário

## Arquivos Restantes

Ainda existem outros arquivos com `router.push` que podem ser refatorados no futuro, mas os principais pontos de autenticação e redirecionamento já foram cobertos.