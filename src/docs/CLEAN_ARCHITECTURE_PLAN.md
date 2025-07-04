# Clean Architecture Plan - Portal Educacional

## 🎯 Objetivo
Criar uma estrutura clean e organizada para eliminar erros de hidratação e seguir as melhores práticas do Next.js 13+ App Router.

## 🏗️ Nova Estrutura Proposta

### 1. **Route Groups Organizados**
```
src/app/
├── (auth)/                    # Autenticação isolada
│   ├── layout.tsx            # Layout específico para auth
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── forgot-password/
│   └── auth-error/
│
├── (dashboard)/              # Dashboards por role
│   ├── layout.tsx           # Layout específico para dashboards
│   ├── admin/
│   ├── student/
│   ├── teacher/
│   ├── coordinator/
│   ├── guardian/
│   └── institution-manager/
│
├── (portal)/                # Portal público e conteúdo
│   ├── layout.tsx          # Layout específico para portal
│   ├── books/
│   ├── collections/
│   ├── courses/
│   ├── videos/
│   └── assignments/
│
├── (management)/           # Gestão e administração
│   ├── layout.tsx         # Layout específico para gestão
│   ├── institutions/
│   ├── schools/
│   ├── classes/
│   ├── users/
│   └── roles/
│
├── (system)/              # Sistema e configurações
│   ├── layout.tsx        # Layout específico para sistema
│   ├── settings/
│   ├── monitoring/
│   ├── analytics/
│   └── maintenance/
│
├── api/                   # API Routes (sem route group)
├── layout.tsx            # Layout raiz
└── page.tsx              # Página inicial
```

### 2. **Componentes Organizados por Domínio**
```
src/components/
├── ui/                    # Componentes base reutilizáveis
│   ├── Button/
│   ├── Modal/
│   ├── Card/
│   ├── Input/
│   └── index.ts
│
├── layout/               # Componentes de layout
│   ├── Header/
│   ├── Sidebar/
│   ├── Navigation/
│   └── index.ts
│
├── auth/                 # Componentes de autenticação
│   ├── LoginForm/
│   ├── RegisterForm/
│   ├── AuthGuard/
│   └── index.ts
│
├── dashboard/            # Componentes de dashboard
│   ├── StatCard/
│   ├── Chart/
│   ├── ActivityTable/
│   └── index.ts
│
├── portal/              # Componentes do portal
│   ├── BookViewer/
│   ├── VideoPlayer/
│   ├── CollectionCard/
│   └── index.ts
│
├── forms/               # Formulários específicos
│   ├── UserForm/
│   ├── ClassForm/
│   ├── CourseForm/
│   └── index.ts
│
└── providers/           # Context providers
    ├── AuthProvider/
    ├── ThemeProvider/
    ├── NotificationProvider/
    └── index.ts
```

### 3. **Hooks Organizados**
```
src/hooks/
├── auth/
│   ├── useAuth.ts
│   ├── useSession.ts
│   └── index.ts
│
├── api/
│   ├── useUsers.ts
│   ├── useCourses.ts
│   ├── useClasses.ts
│   └── index.ts
│
├── ui/
│   ├── useModal.ts
│   ├── useToast.ts
│   ├── useLocalStorage.ts
│   └── index.ts
│
└── dashboard/
    ├── useStats.ts
    ├── useAnalytics.ts
    └── index.ts
```

### 4. **Utilitários e Configurações**
```
src/lib/
├── auth/
│   ├── config.ts
│   ├── utils.ts
│   └── index.ts
│
├── api/
│   ├── client.ts
│   ├── endpoints.ts
│   └── index.ts
│
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   ├── constants.ts
│   └── index.ts
│
└── config/
    ├── database.ts
    ├── environment.ts
    └── index.ts
```

### 5. **Tipos Organizados**
```
src/types/
├── auth/
│   ├── user.ts
│   ├── session.ts
│   └── index.ts
│
├── api/
│   ├── responses.ts
│   ├── requests.ts
│   └── index.ts
│
├── ui/
│   ├── components.ts
│   ├── forms.ts
│   └── index.ts
│
└── domain/
    ├── education.ts
    ├── institution.ts
    ├── course.ts
    └── index.ts
```

## 🔧 Implementação

### Fase 1: Reestruturação de Route Groups
1. Criar novos route groups com layouts específicos
2. Mover páginas para grupos apropriados
3. Atualizar referências de rotas

### Fase 2: Reorganização de Componentes
1. Criar estrutura modular de componentes
2. Implementar barrel exports (index.ts)
3. Separar por domínio e responsabilidade

### Fase 3: Hooks e Utilitários
1. Organizar hooks por categoria
2. Criar utilitários específicos
3. Implementar configurações centralizadas

### Fase 4: Tipos e Validações
1. Organizar tipos por domínio
2. Criar schemas de validação
3. Implementar tipos compartilhados

## 🎯 Benefícios Esperados

1. **Eliminação de Erros de Hidratação**
   - Route groups isolam contextos
   - Layouts específicos evitam conflitos
   - Componentes bem organizados

2. **Melhor Manutenibilidade**
   - Código organizado por domínio
   - Fácil localização de arquivos
   - Reutilização de componentes

3. **Performance Otimizada**
   - Code splitting automático
   - Carregamento lazy de componentes
   - Bundles menores

4. **Developer Experience**
   - Estrutura intuitiva
   - Imports organizados
   - Tipagem forte