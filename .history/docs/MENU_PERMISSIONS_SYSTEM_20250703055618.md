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
