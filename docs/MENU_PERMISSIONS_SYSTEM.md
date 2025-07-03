# Sistema de Permissões de Menu - Sem Cache para Dados Sensíveis

## 📋 Visão Geral

Este sistema foi desenvolvido para gerenciar permissões de menu de forma inteligente, garantindo que dados sensíveis relacionados a roles, permissões e navegação **nunca sejam cacheados**, assegurando que mudanças sejam refletidas imediatamente na interface do usuário.

## 🔒 Segurança e Cache Inteligente

### Detecção Automática de Dados Sensíveis

O sistema detecta automaticamente chaves sensíveis e desabilita o cache para elas:

```typescript
// Chaves sensíveis detectadas automaticamente
const sensitiveKeys = [
  'menu', 'nav', 'sidebar', 'role', 'permission', 'auth',
  'user-role', 'user-permissions', 'navigation', 'access-control',
  'system-admin-menu', 'dashboard-menu'
];
```

### Hook `useSmartCache` Modificado

```typescript
// ✅ Cache habilitado para dados normais
const { data } = useSmartCache({
  key: 'user-profile',
  fetcher: fetchUserProfile
});

// 🔒 Cache automaticamente desabilitado para dados sensíveis
const { data } = useSmartCache({
  key: 'menu-permissions-user-123',
  fetcher: fetchMenuPermissions
});
```

## 🎯 Hooks Disponíveis

### 1. `useMenuPermissions`

Hook principal para gerenciar permissões de itens de menu individuais.

```typescript
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

const menuItems = [
  { href: '/admin/users', label: 'Usuários', permission: 'canManageGlobalUsers' },
  { href: '/profile', label: 'Perfil' }, // Sem permissão = sempre acessível
];

const {
  permissions,           // Record<string, boolean> - Permissões calculadas
  filteredMenuItems,     // Array filtrado apenas com itens permitidos
  isLoading,            // Estado de carregamento
  error,                // Erro se houver
  userRole,             // Role atual do usuário
  hasMenuPermission,    // Função para verificar permissão de um item
  checkPermission,      // Função para verificar permissão específica
  revalidate,           // Função para forçar revalidação
  stats                 // Estatísticas (total, permitidos, negados, %)
} = useMenuPermissions(menuItems, {
  autoRevalidate: true,
  onPermissionsUpdate: (permissions) => {
    console.log('Permissões atualizadas:', permissions);
  }
});
```

### 2. `useMenuSectionPermissions`

Hook para gerenciar seções completas de menu.

```typescript
import { useMenuSectionPermissions } from '@/hooks/useMenuPermissions';

const menuSections = [
  {
    section: 'Administração',
    items: [
      { href: '/admin/users', label: 'Usuários', permission: 'canManageGlobalUsers' },
      { href: '/admin/system', label: 'Sistema', permission: 'canManageSystem' }
    ]
  }
];

const {
  filteredSections,     // Seções filtradas baseado nas permissões
  sectionStats,         // Estatísticas por seção
  ...otherProps         // Todas as propriedades do useMenuPermissions
} = useMenuSectionPermissions(menuSections);
```

### 3. `usePermissionCheck`

Hook simplificado para verificações de permissão.

```typescript
import { usePermissionCheck } from '@/hooks/useMenuPermissions';

const {
  hasAccess,            // boolean - Se tem acesso à permissão específica
  userRole,             // Role atual
  isLoading,            // Sempre false para verificações simples
  // ... todas as permissões específicas como propriedades
  canManageSystem,
  canManageGlobalUsers,
  // etc.
} = usePermissionCheck('canManageSystem');
```

## 🔧 Integração com Componentes

### StandardSidebar

O `StandardSidebar` foi atualizado para usar o sistema:

```typescript
// Antes: Filtro manual com hasPermission
const filteredItems = items.filter(item => {
  if (!item.permission) return true;
  return hasPermission(userRole, item.permission);
});

// Depois: Sistema inteligente sem cache
const { filteredMenuItems } = useMenuPermissions(
  items.map(item => ({
    href: item.href,
    label: item.label,
    permission: item.permission
  })),
  {
    autoRevalidate: true,
    onPermissionsUpdate: (permissions) => {
      console.log('Permissões atualizadas:', permissions);
    }
  }
);
```

### PermissionGuard

O `PermissionGuard` continua funcionando normalmente, mas agora se beneficia do sistema sem cache:

```typescript
<PermissionGuard permission="canManageSystem">
  <AdminPanel />
</PermissionGuard>
```

## 📊 Monitoramento e Debug

### Logs Automáticos

O sistema gera logs automáticos para debug:

```
🔒 [useSmartCache] Cache desabilitado para chave sensível: "menu-permissions-user-123"
🔐 [useMenuPermissions] Calculando permissões para role: SYSTEM_ADMIN
🔐 [useMenuPermissions] Usuários (/admin/users): ✅ Permitido - Permissão: canManageGlobalUsers
🔄 [useMenuPermissions] Role mudou para: TEACHER, revalidando permissões...
```

### Estatísticas em Tempo Real

```typescript
const { stats } = useMenuPermissions(menuItems);

console.log(`📊 Menu: ${stats.allowed}/${stats.total} itens (${stats.percentage}%)`);
// Output: 📊 Menu: 3/5 itens (60%)
```

## ⚡ Performance e Otimizações

### Cache Seletivo

- ✅ **Dados normais**: Continuam usando cache para performance
- 🔒 **Dados sensíveis**: Sempre buscam informações frescas
- 🎯 **Detecção automática**: Não requer configuração manual

### Revalidação Inteligente

```typescript
// Revalidação automática quando role muda
const { revalidate } = useMenuPermissions(menuItems, {
  autoRevalidate: true // Padrão: true
});

// Revalidação manual quando necessário
await revalidate();
```

### Debounce e Throttling

O sistema inclui otimizações para evitar múltiplas requisições:

```typescript
// Evita múltiplas requisições simultâneas
if (lastFetchRef.current && !forceRefresh && !shouldBypass) {
  return await lastFetchRef.current;
}
```

## 🚀 Exemplos de Uso

### Exemplo Básico

```typescript
function MyMenu() {
  const menuItems = [
    { href: '/admin', label: 'Admin', permission: 'canManageSystem' },
    { href: '/profile', label: 'Perfil' }
  ];

  const { filteredMenuItems, isLoading } = useMenuPermissions(menuItems);

  if (isLoading) return <div>Carregando menu...</div>;

  return (
    <nav>
      {filteredMenuItems.map(item => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### Exemplo com Seções

```typescript
function MySidebar() {
  const sections = [
    {
      section: 'Administração',
      items: [
        { href: '/admin/users', label: 'Usuários', permission: 'canManageGlobalUsers' },
        { href: '/admin/system', label: 'Sistema', permission: 'canManageSystem' }
      ]
    }
  ];

  const { filteredSections } = useMenuSectionPermissions(sections);

  return (
    <aside>
      {filteredSections.map(section => (
        <div key={section.section}>
          <h3>{section.section}</h3>
          {section.items.map(item => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}
```

### Exemplo com Verificação Condicional

```typescript
function AdminButton() {
  const { checkPermission } = useMenuPermissions();

  if (!checkPermission('canManageSystem')) {
    return null;
  }

  return <button>Gerenciar Sistema</button>;
}
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Permissões não atualizando**
   ```typescript
   // Forçar revalidação
   const { revalidate } = useMenuPermissions(menuItems);
   await revalidate();
   ```

2. **Performance lenta**
   ```typescript
   // Verificar se autoRevalidate está causando muitas requisições
   const { } = useMenuPermissions(menuItems, {
     autoRevalidate: false // Desabilitar se necessário
   });
   ```

3. **Logs excessivos**
   ```typescript
   // Remover callbacks de debug em produção
   const { } = useMenuPermissions(menuItems, {
     onPermissionsUpdate: undefined // Remover em produção
   });
   ```

## 📈 Métricas e Monitoramento

### Estatísticas Disponíveis

```typescript
const { stats, sectionStats } = useMenuSectionPermissions(sections);

// Estatísticas gerais
console.log('Total de itens:', stats.total);
console.log('Itens permitidos:', stats.allowed);
console.log('Itens negados:', stats.denied);
console.log('Percentual de acesso:', stats.percentage + '%');

// Estatísticas por seção
sectionStats.forEach(stat => {
  console.log(`${stat.section}: ${stat.allowed}/${stat.total}`);
});
```

### Monitoramento de Performance

```typescript
// Medir tempo de cálculo de permissões
console.time('menu-permissions');
const { filteredMenuItems } = useMenuPermissions(menuItems);
console.timeEnd('menu-permissions');
```

## 🔧 Configuração Avançada

### Customização de Chaves Sensíveis

Para adicionar novas chaves sensíveis, modifique o array em `useSmartCache.ts`:

```typescript
const sensitiveKeys = [
  'menu', 'nav', 'sidebar', 'role', 'permission', 'auth',
  'user-role', 'user-permissions', 'navigation', 'access-control',
  'system-admin-menu', 'dashboard-menu',
  'custom-sensitive-key' // Adicionar aqui
];
```

### Bypass Manual do Cache

```typescript
const { data } = useSmartCache({
  key: 'some-data',
  fetcher: fetchData,
  bypassCache: true // Forçar bypass manual
});
```

## 🎯 Melhores Práticas

1. **Use `autoRevalidate: true`** para dados de menu críticos
2. **Implemente `onPermissionsUpdate`** para debug durante desenvolvimento
3. **Remova callbacks de debug** em produção
4. **Use `usePermissionCheck`** para verificações simples
5. **Prefira `useMenuSectionPermissions`** para menus complexos
6. **Monitore as estatísticas** para otimizar a experiência do usuário

## 🔄 Migração

### De Sistema Antigo

```typescript
// Antes
const filteredItems = items.filter(item => 
  hasPermission(userRole, item.permission)
);

// Depois
const { filteredMenuItems } = useMenuPermissions(items);
```

### Compatibilidade

O sistema é totalmente compatível com:
- ✅ `PermissionGuard`
- ✅ `StandardSidebar`
- ✅ Hooks existentes de autenticação
- ✅ Sistema de roles atual

## 📚 Referências

- [`useSmartCache.ts`](../src/hooks/useSmartCache.ts) - Hook base com cache inteligente
- [`useMenuPermissions.ts`](../src/hooks/useMenuPermissions.ts) - Hooks de permissões de menu
- [`StandardSidebar.tsx`](../src/components/StandardSidebar.tsx) - Implementação no sidebar
- [`MenuPermissionExample.tsx`](../src/components/examples/MenuPermissionExample.tsx) - Exemplo completo