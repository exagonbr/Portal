# Sistema de Loading de Navegação

## Visão Geral

Implementação de um sistema de loading personalizado que aparece quando o usuário clica nos links do menu lateral, mostrando a mensagem "Estamos preparando tudo para você" com uma animação atrativa e efeito blur.

## Arquivos Criados/Modificados

### 1. Contexto de Loading (`src/contexts/NavigationLoadingContext.tsx`)
- **Função**: Gerencia o estado global do loading de navegação
- **Características**:
  - Contexto React para controlar visibilidade do loading
  - Overlay com blur e animações suaves
  - Mensagem personalizável
  - Animações com Framer Motion

### 2. Hook Personalizado (`src/hooks/useNavigationWithLoading.ts`)
- **Função**: Facilita a navegação com loading
- **Características**:
  - Intercepta navegação e mostra loading
  - Delay configurável antes da navegação
  - Suporte a `router.push()` e `router.replace()`
  - Integração com Next.js Router

### 3. Componentes de Sidebar Modificados
- **`src/components/StandardSidebar.tsx`**: Atualizado para usar o sistema de loading
- **`src/components/dashboard/DashboardSidebar.tsx`**: Atualizado para usar o sistema de loading

### 4. Provider Global (`src/providers/SimpleProviders.tsx`)
- **Modificação**: Adicionado `NavigationLoadingProvider` à árvore de providers

### 5. Página de Teste (`src/app/test-loading/page.tsx`)
- **Função**: Demonstra o funcionamento do sistema de loading

## Como Funciona

### 1. Fluxo de Navegação
```typescript
// Usuário clica no link do menu
handleClick() -> 
  showLoading("Estamos preparando tudo para você") -> 
  delay(600ms) -> 
  router.push(href) -> 
  hideLoading()
```

### 2. Componentes do Loading
- **Overlay**: Fundo com blur e transparência
- **Container**: Card centralizado com animações
- **Spinner**: Dois anéis rotativos (externo e interno)
- **Texto**: Mensagem principal + pontos animados
- **Animações**: Entrada/saída suaves com Framer Motion

### 3. Características Visuais
- **Blur**: `backdrop-filter: blur(12px)`
- **Transparência**: Fundo semi-transparente
- **Animações**: 
  - Rotação contínua dos anéis
  - Pontos saltitantes
  - Escala do centro pulsante
  - Entrada/saída suaves

## Uso

### 1. Em Componentes
```typescript
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

const { navigateWithLoading } = useNavigationWithLoading()

// Navegar com loading personalizado
navigateWithLoading('/dashboard', {
  message: 'Carregando Dashboard...',
  delay: 800
})
```

### 2. Nos Menus Laterais
Os menus já estão configurados automaticamente. Ao clicar em qualquer item:
- Mostra loading com "Estamos preparando tudo para você"
- Aguarda 600ms
- Navega para a página
- Esconde o loading

### 3. Configurações Disponíveis
```typescript
navigateWithLoading(href, {
  message?: string,     // Mensagem personalizada
  delay?: number,       // Delay antes da navegação (padrão: 800ms)
  replace?: boolean     // Usar router.replace() ao invés de push()
})
```

## Personalização

### 1. Mensagens
- Padrão: "Estamos preparando tudo para você"
- Personalizável por navegação
- Submensagem fixa: "Aguarde um momento..."

### 2. Timing
- Delay padrão: 600ms nos menus, 800ms no hook
- Animação de entrada: 300ms
- Animação de saída: 300ms

### 3. Estilos
- Usa o tema da aplicação (`useTheme()`)
- Cores adaptáveis ao tema claro/escuro
- Responsivo para mobile

## Integração com Temas

O loading se adapta automaticamente ao tema da aplicação:
- **Cores**: Primária, secundária, texto
- **Backgrounds**: Card, primary
- **Bordas**: Padrão do tema

## Teste

Acesse `/test-loading` para ver uma demonstração completa do sistema funcionando.

## Benefícios

1. **UX Melhorada**: Feedback visual imediato ao usuário
2. **Consistência**: Mesmo padrão em toda a aplicação
3. **Personalização**: Mensagens específicas por contexto
4. **Performance**: Loading não bloqueia a interface
5. **Acessibilidade**: Animações suaves e não agressivas

## Compatibilidade

- ✅ Next.js 13+ (App Router)
- ✅ React 18+
- ✅ Framer Motion
- ✅ TypeScript
- ✅ Mobile/Desktop
- ✅ Temas claro/escuro