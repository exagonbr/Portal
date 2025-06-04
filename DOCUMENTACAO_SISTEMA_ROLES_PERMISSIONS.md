# 🎯 Sistema de Roles e Permissions - Redirecionamento Automático Pós-Login

## 📋 Visão Geral

O sistema implementa um redirecionamento automático baseado no **ROLE** e **PERMISSIONS** de cada usuário após o login. Cada usuário é direcionado para seu dashboard específico com funcionalidades personalizadas.

## 🏗️ Arquitetura do Sistema

### 1. **Tipos de Usuário (Roles)**

| Role | Descrição | Dashboard |
|------|-----------|-----------|
| `student` | Aluno | `/dashboard/student` |
| `teacher` | Professor | `/dashboard/teacher` |
| `system_admin` | Administrador do Sistema | `/dashboard/system-admin` |
| `institution_manager` | Gestor da Instituição | `/dashboard/institution-manager` |
| `academic_coordinator` | Coordenador Acadêmico | `/dashboard/coordinator` |
| `guardian` | Responsável/Guardião | `/dashboard/guardian` |

### 2. **Sistema de Permissions**

```typescript
type Permission =
  | 'create:user'
  | 'read:user'
  | 'update:user'
  | 'delete:user'
  | 'create:course'
  | 'read:course'
  | 'update:course'
  | 'delete:course'
  | 'manage:institution'
  | 'view:reports'
  | 'manage:students'
```

## 🔄 Fluxo de Redirecionamento

### Processo Automático:

1. **Login realizado** → Usuário fornece credenciais
2. **Autenticação** → Backend valida e retorna dados do usuário
3. **Verificação de Role** → Sistema identifica o perfil do usuário
4. **Normalização** → Role é convertida para formato padrão
5. **Mapeamento** → Role é mapeada para dashboard específico
6. **Validação de Permissions** → Verifica se usuário tem acesso
7. **Redirecionamento** → Usuário é direcionado para seu dashboard

### Logs Detalhados:

```
🔐 [LOGIN] Iniciando processo de login:
   Email: usuario@exemplo.com

✅ [LOGIN] Login realizado com sucesso:
   Usuário: João Silva
   Role: TEACHER
   Permissões: 5 definidas

🔍 [LOGIN] Conversão de role:
   Role original: "TEACHER"
   Role normalizada: "teacher"

✅ [LOGIN] Dashboard encontrado:
   Caminho: /dashboard/teacher
   Descrição: Dashboard do Professor - Gestão de cursos, alunos e conteúdos
   Funcionalidades: 6 disponíveis

✅ [LOGIN] Redirecionamento executado com sucesso para: /dashboard/teacher
```

## 🛡️ Proteção de Rotas (Middleware)

O middleware protege automaticamente todas as rotas e garante que:

- ✅ Usuários não autenticados são redirecionados para `/login`
- ✅ Usuários autenticados não podem acessar `/login` ou `/register`
- ✅ Acesso a `/dashboard` redireciona para dashboard específico
- ✅ Usuários só podem acessar seu próprio dashboard
- ✅ Admins têm acesso a todos os dashboards
- ✅ Managers têm acesso ampliado (exceto admin)

## 📊 Dashboards e Funcionalidades

### 🎓 **Aluno (`/dashboard/student`)**
**Permissões Necessárias:** `read:course`

**Funcionalidades:**
- Visualizar cursos matriculados
- Acessar lições e materiais
- Realizar atividades e avaliações
- Acompanhar progresso
- Participar de fóruns de discussão
- Chat com professores

### 👨‍🏫 **Professor (`/dashboard/teacher`)**
**Permissões Necessárias:** `read:course`, `create:course`, `manage:students`

**Funcionalidades:**
- Gerenciar cursos e lições
- Criar e editar conteúdos
- Acompanhar progresso dos alunos
- Corrigir atividades e provas
- Comunicar-se com alunos
- Gerar relatórios de desempenho

### 🔧 **Administrador do Sistema (`/dashboard/system-admin`)**
**Permissões Necessárias:** `create:user`, `update:user`, `delete:user`, `manage:institution`, `view:reports`

**Funcionalidades:**
- Gerenciar todos os usuários
- Administrar instituições
- Configurar sistema
- Visualizar relatórios globais
- Gerenciar permissões
- Backup e manutenção

### 🏢 **Gestor da Instituição (`/dashboard/institution-manager`)**
**Permissões Necessárias:** `manage:institution`, `manage:students`, `view:reports`

**Funcionalidades:**
- Gerenciar usuários da instituição
- Supervisionar cursos e turmas
- Visualizar relatórios institucionais
- Configurar políticas da instituição
- Acompanhar métricas de desempenho

### 📚 **Coordenador Acadêmico (`/dashboard/coordinator`)**
**Permissões Necessárias:** `manage:students`, `view:reports`, `read:course`

**Funcionalidades:**
- Coordenar programas acadêmicos
- Supervisionar professores
- Acompanhar desempenho acadêmico
- Planejar currículos
- Gerenciar calendário acadêmico

### 👨‍👩‍👧‍👦 **Responsável (`/dashboard/guardian`)**
**Permissões Necessárias:** `read:user`

**Funcionalidades:**
- Acompanhar progresso do filho/tutelado
- Visualizar notas e frequência
- Comunicar-se com professores
- Receber notificações importantes
- Agendar reuniões

## 🧩 Como Usar nos Componentes

### 1. **Verificar Permissões**

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MeuComponente() {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  // Verificar uma permissão específica
  const podeGerenciarUsuarios = hasPermission('manage:students');

  // Verificar múltiplas permissões (TODAS necessárias)
  const podeGerenciarCursos = hasAllPermissions(['create:course', 'update:course']);

  // Verificar múltiplas permissões (QUALQUER uma)
  const temAlgumAcesso = hasAnyPermission(['read:course', 'view:reports']);

  return (
    <div>
      {podeGerenciarUsuarios && (
        <button>Gerenciar Usuários</button>
      )}
    </div>
  );
}
```

### 2. **Componente Condicional**

```tsx
import { ConditionalFeature } from '@/components/DashboardAccessInfo';

function Dashboard() {
  return (
    <div>
      {/* Funcionalidade que precisa de UMA permissão específica */}
      <ConditionalFeature requiredPermissions="create:course">
        <button>Criar Novo Curso</button>
      </ConditionalFeature>

      {/* Funcionalidade que precisa de TODAS as permissões */}
      <ConditionalFeature 
        requiredPermissions={['manage:students', 'view:reports']}
        requireAll={true}
      >
        <div>Relatório de Alunos</div>
      </ConditionalFeature>

      {/* Funcionalidade que precisa de QUALQUER permissão */}
      <ConditionalFeature 
        requiredPermissions={['read:course', 'manage:students']}
        requireAll={false}
        fallback={<p>Acesso negado</p>}
      >
        <div>Área de Conteúdo</div>
      </ConditionalFeature>
    </div>
  );
}
```

### 3. **Informações do Dashboard**

```tsx
import { DashboardAccessInfo } from '@/components/DashboardAccessInfo';

function MinhaPage() {
  return (
    <div>
      {/* Versão completa */}
      <DashboardAccessInfo />
      
      {/* Versão compacta */}
      <DashboardAccessInfo compact={true} />
      
      {/* Sem mostrar funcionalidades */}
      <DashboardAccessInfo showFeatures={false} />
    </div>
  );
}
```

### 4. **Hook Personalizado**

```tsx
import { useFeatureAccess } from '@/components/DashboardAccessInfo';

function MeuComponente() {
  const { checkFeatureAccess, canAccessPath } = useFeatureAccess();

  const podeEditarPerfil = checkFeatureAccess('update:user');
  const podeGerenciarCursos = checkFeatureAccess(['create:course', 'update:course']);
  const acessoAdminPage = canAccessPath('/dashboard/system-admin');

  return (
    <div>
      {podeEditarPerfil && <button>Editar Perfil</button>}
      {acessoAdminPage.canAccess && <a href="/dashboard/system-admin">Admin</a>}
    </div>
  );
}
```

## 🔍 Verificação de Acesso

### Programaticamente:

```tsx
import { canAccessDashboard } from '@/utils/dashboardPermissions';

// Verificar se usuário pode acessar um dashboard
const accessCheck = canAccessDashboard(
  'teacher', // role do usuário
  ['read:course', 'create:course'], // permissões do usuário
  '/dashboard/teacher' // caminho que quer acessar
);

if (accessCheck.canAccess) {
  console.log('✅ Acesso permitido');
} else {
  console.log('❌ Acesso negado:', accessCheck.reason);
}
```

## 🚨 Tratamento de Erros

### Cenários Cobertos:

1. **Role Inválida**: Usuário redirecionado para página de erro
2. **Permissions Insuficientes**: Acesso negado com mensagem explicativa
3. **Dashboard Inexistente**: Fallback para dashboard genérico
4. **Token Expirado**: Redirecionamento automático para login
5. **Backend Indisponível**: Modo degradado com acesso limitado

### Logs de Debug:

```
❌ Role inválida detectada: INVALID_ROLE (normalizada: null)
⚠️ Usuário sem permissões adequadas: Permissões insuficientes. Faltam: create:course, manage:students
🔄 Redirecionando para dashboard correto: /dashboard/student
```

## 🛠️ Manutenção e Extensão

### Adicionar Nova Role:

1. **Atualizar tipos** em `src/types/auth.ts`
2. **Adicionar mapeamento** em `src/utils/roleRedirect.ts`
3. **Definir permissões** em `src/utils/dashboardPermissions.ts`
4. **Criar dashboard** em `src/app/dashboard/[nova-role]/`
5. **Atualizar middleware** se necessário

### Adicionar Nova Permission:

1. **Atualizar tipo Permission** em `src/types/auth.ts`
2. **Adicionar à configuração** em `src/utils/dashboardPermissions.ts`
3. **Implementar verificações** nos componentes

## 🎯 Benefícios Implementados

- ✅ **Segurança**: Controle rigoroso de acesso
- ✅ **Experiência do Usuário**: Redirecionamento automático
- ✅ **Flexibilidade**: Sistema extensível
- ✅ **Manutenibilidade**: Código bem organizado
- ✅ **Debug**: Logs detalhados para troubleshooting
- ✅ **Performance**: Verificações otimizadas
- ✅ **Compatibilidade**: Suporte a roles em português/inglês

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar os logs no console do navegador
2. Consultar esta documentação
3. Verificar se as permissões estão corretas no backend
4. Validar se a role está mapeada corretamente