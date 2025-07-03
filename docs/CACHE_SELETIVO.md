# Sistema de Cache Seletivo

## Visão Geral

O sistema de cache foi modificado para implementar uma estratégia seletiva, focando apenas em:

1. **Itens Básicos**: Fontes, configurações, manifests
2. **Imagens**: PNG, JPG, SVG, ícones, avatars
3. **Menus**: Navegação básica e estruturas de menu

## Mudanças Implementadas

### Service Worker (`public/sw.js`)

- **Cache Seletivo**: Substituiu o "NO-CACHE ABSOLUTO" por cache inteligente
- **Estratégias por Tipo**:
  - **Imagens**: Cache First (prioriza cache)
  - **Menus**: Stale While Revalidate (cache com revalidação em background)
  - **Recursos Básicos**: Cache First
  - **Dados Dinâmicos**: Network First (sempre da rede)

### Hook useSmartCache (`src/hooks/useSmartCache.ts`)

- **Função `shouldCache()`**: Identifica chaves cacheáveis
- **Função `shouldBypassCache()`**: Identifica dados sensíveis
- **Logs Melhorados**: Indica estratégia de cache para cada chave

### Cache Manager (`src/utils/cacheManager.ts`)

- **Modo Seletivo**: Nova configuração `selectiveMode: true`
- **Verificação de Chaves**: Só cacheia itens permitidos
- **Limpeza Inteligente**: Remove apenas cache de itens cacheáveis

## Padrões Cacheáveis

### Imagens
- `image`, `img`, `photo`, `picture`, `avatar`, `icon`, `logo`

### Menus e Navegação
- `menu`, `nav`, `sidebar`, `navigation`, `breadcrumb`

### Recursos Básicos
- `font`, `style`, `theme`, `config`, `manifest`, `favicon`

## Padrões Sempre Frescos (Não Cacheados)

### Dados Dinâmicos
- APIs que não sejam de menu/navegação
- Arquivos HTML, JS, CSS, TS
- Rotas do Next.js (`/_next/`)
- Páginas de dashboard, portal, admin

### Dados Sensíveis
- `role`, `permission`, `auth`, `user-role`, `user-permissions`
- `access-control`, `security`, `session`, `token`

## Benefícios

1. **Performance**: Cache para recursos estáticos (imagens, fontes)
2. **Segurança**: Dados sensíveis sempre frescos
3. **UX**: Menus carregam rapidamente com revalidação em background
4. **Controle**: Sistema seletivo evita cache desnecessário

## Configuração

```typescript
// Cache Manager configurado automaticamente
const cacheManager = new CacheManager({
  selectiveMode: true,        // Ativa modo seletivo
  enableServiceWorker: true,  // Service Worker ativo
  enableMemoryCache: true,    // Cache em memória
  defaultTTL: 300,           // 5 minutos
  staleWhileRevalidate: true // SWR ativo
});
```

## Uso

### Hook Padrão
```typescript
const { data, isLoading } = useSmartCache({
  key: 'user-avatar',  // Será cacheado (imagem)
  fetcher: fetchAvatar
});
```

### Hook de Menu
```typescript
const { data } = useMenuCache({
  key: 'main-menu',    // Será cacheado com SWR
  fetcher: fetchMenu
});
```

### Dados Sensíveis
```typescript
const { data } = useSmartCache({
  key: 'user-permissions', // Não será cacheado
  fetcher: fetchPermissions,
  bypassCache: true        // Força bypass
});
```

## Monitoramento

Use `getCacheStats()` para verificar o status do cache:

```typescript
const stats = await getCacheStats();
console.log('Cache seletivo:', stats.selectiveMode);
console.log('Itens em cache:', stats.memory.size);
```

## Logs de Debug

O sistema gera logs para facilitar o debug:

- `💾 [useSmartCache] Cache habilitado para: "user-avatar"`
- `🔒 [useSmartCache] Cache desabilitado para: "user-permissions"`
- `🚫 [useSmartCache] Não cacheável: "api-data"`

## Migração

O sistema é retrocompatível. Chaves existentes que não se enquadram nos padrões cacheáveis automaticamente usarão Network First (sempre da rede).