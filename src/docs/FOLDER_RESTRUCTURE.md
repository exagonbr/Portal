# Reestruturação de Pastas - Portal Educacional

## Problema Resolvido

O erro de hidratação `Uncaught TypeError: can't access property "call", originalFactory is undefined` foi causado por uma estrutura de pastas inadequada que não seguia as convenções do Next.js 13+ App Router.

## Nova Estrutura Implementada

```
src/app/
├── (main)/                    # Route Group para páginas principais
│   ├── layout.tsx            # Layout específico para páginas principais
│   ├── page.tsx              # Página inicial (redirecionamento)
│   ├── dashboard/            # Dashboards por tipo de usuário
│   ├── portal/               # Portal público
│   ├── profile/              # Perfil do usuário
│   ├── notifications/        # Sistema de notificações
│   ├── books/                # Biblioteca de livros
│   ├── forum/                # Fórum de discussões
│   ├── student/              # Área do estudante
│   ├── teacher/              # Área do professor
│   ├── guardian/             # Área do responsável
│   ├── coordinator/          # Área do coordenador
│   └── assignments/          # Tarefas e atividades
│
├── (auth)/                   # Route Group para autenticação
│   ├── layout.tsx           # Layout específico para autenticação
│   ├── auth/
│   │   ├── login/           # Página de login
│   │   └── register/        # Página de registro
│   ├── forgot-password/     # Recuperação de senha
│   └── auth-error/          # Erros de autenticação
│
├── admin/                   # Área administrativa (sem route group)
├── api/                     # API Routes
├── layout.tsx              # Layout raiz
└── template.tsx            # Template global
```

## Benefícios da Nova Estrutura

### 1. **Eliminação de Erros de Hidratação**
- Route groups `(main)` e `(auth)` isolam contextos diferentes
- Layouts específicos evitam conflitos de renderização
- Separação clara entre páginas públicas e autenticadas

### 2. **Melhor Organização**
- Agrupamento lógico por funcionalidade
- Layouts específicos para cada contexto
- Estrutura mais limpa e maintível

### 3. **Performance Otimizada**
- Carregamento de chunks mais eficiente
- Layouts específicos reduzem re-renderizações
- Melhor tree-shaking

## Mudanças de Rotas

### Rotas de Autenticação
- **Antes:** `/login` → **Agora:** `/auth/login`
- **Antes:** `/register` → **Agora:** `/auth/register`
- **Mantido:** `/forgot-password` (dentro do grupo auth)
- **Mantido:** `/auth-error` (dentro do grupo auth)

### Rotas Principais
- **Mantido:** `/` (página inicial)
- **Mantido:** `/dashboard/*` (todos os dashboards)
- **Mantido:** `/portal/*` (portal público)
- **Mantido:** Todas as outras rotas principais

## Arquivos Atualizados

### 1. **Layouts Criados**
- `src/app/(auth)/layout.tsx` - Layout para autenticação
- `src/app/(main)/layout.tsx` - Layout para páginas principais

### 2. **Páginas Movidas**
- `src/app/login/page.tsx` → `src/app/(auth)/auth/login/page.tsx`
- `src/app/register/page.tsx` → `src/app/(auth)/auth/register/page.tsx`
- `src/app/page.tsx` → `src/app/(main)/page.tsx`

### 3. **Referências Atualizadas**
- Todos os links e redirecionamentos para `/login` → `/auth/login`
- Atualizados em componentes, páginas e utilitários
- Template.tsx atualizado com novas rotas públicas

## Arquivos Modificados

### Componentes
- `src/components/ui/LogoutHandler.tsx`
- `src/components/examples/ClearDataExample.tsx`

### Páginas
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/auth-error/page.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/app/(main)/notifications/page.tsx`
- `src/app/(main)/notifications/send/page.tsx`
- `src/app/(main)/notifications/sent/page.tsx`
- `src/app/(main)/portal/videos/page.tsx`
- `src/app/admin/certificates/page.tsx`
- `src/app/test-login/page.tsx`
- `src/app/test-julia-login/page.tsx`
- `src/app/debug-token/page.tsx`
- `src/app/debug-auth-token/page.tsx`
- `src/app/debug-auth/page.tsx`

### Configuração
- `src/app/template.tsx`

## Como Testar

1. **Acesso às Rotas de Autenticação:**
   - Acesse `/auth/login` para login
   - Acesse `/auth/register` para registro

2. **Verificar Redirecionamentos:**
   - Logout deve redirecionar para `/auth/login`
   - Erros de autenticação devem redirecionar corretamente

3. **Testar Hidratação:**
   - Navegue entre páginas
   - Verifique se não há erros no console
   - Teste refresh das páginas

## Próximos Passos

1. **Testar em Produção:** Verificar se a estrutura funciona corretamente em build
2. **Atualizar Documentação:** Atualizar outros documentos que referenciem as rotas antigas
3. **Monitorar Erros:** Acompanhar logs para identificar possíveis referências perdidas

## Notas Técnicas

- Route groups `(folder)` não afetam a URL final
- Layouts são aplicados hierarquicamente
- Template.tsx continua sendo aplicado globalmente
- API routes não foram afetadas pela reestruturação