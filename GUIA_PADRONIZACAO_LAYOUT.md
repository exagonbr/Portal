# Guia de Padronização do Layout - Portal Educacional

## Visão Geral

Este guia apresenta o novo sistema de layout padronizado baseado no design CRM empresarial, criado para proporcionar uma experiência mais acadêmica, profissional e fácil de usar em todas as páginas do Portal Educacional.

## Componentes Principais

### 1. StandardLayout
O componente principal que envolve todas as páginas:

```tsx
import StandardLayout from '@/components/StandardLayout';

<StandardLayout
  title="Título da Página"
  subtitle="Subtítulo opcional"
  showBreadcrumb={true}
  breadcrumbItems={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Página Atual' }
  ]}
  rightContent={<ComponenteBarraLateral />}
>
  {/* Conteúdo da página */}
</StandardLayout>
```

### 2. StandardSidebar
Menu lateral com navegação organizada por seções:
- **Principal**: Dashboard
- **Gestão Acadêmica**: Cursos, Aulas, Atividades, Avaliações
- **Comunicação**: Chat, Fórum, Ao Vivo, Notificações
- **Administração**: Painel Admin, Relatórios, Instituição, Grupos de Estudo

### 3. StandardHeader
Header com busca, notificações e menu do usuário integrados.

### 4. Componentes UI

#### StatCard
Cards para exibir estatísticas e métricas:

```tsx
import StatCard from '@/components/ui/StatCard';

<StatCard
  title="Total de Cursos"
  value={24}
  icon={<IconeComponente />}
  color="blue"
  change={{ value: 8, trend: 'up', period: 'desde o último mês' }}
/>
```

#### StandardTable
Tabela com funcionalidades avançadas:

```tsx
import StandardTable from '@/components/ui/StandardTable';

<StandardTable
  columns={colunas}
  data={dados}
  loading={carregando}
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100,
    onChange: (page, pageSize) => {}
  }}
  actions={{
    title: 'Ações',
    render: (record) => <BotoesAcao />
  }}
/>
```

## Como Aplicar em Páginas Existentes

### Passo 1: Importar Componentes
```tsx
import StandardLayout from '@/components/StandardLayout';
import StatCard from '@/components/ui/StatCard';
import StandardTable from '@/components/ui/StandardTable';
```

### Passo 2: Estruturar a Página
```tsx
export default function MinhaPage() {
  return (
    <StandardLayout
      title="Título da Página"
      subtitle="Descrição da página"
      showBreadcrumb
      breadcrumbItems={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Seção', href: '/secao' },
        { label: 'Página Atual' }
      ]}
      rightContent={<BarraLateralContent />}
    >
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* StatCards aqui */}
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Controles de filtro e busca */}
        </div>

        {/* Tabela ou Conteúdo Principal */}
        <StandardTable
          columns={colunas}
          data={dados}
          // outras props...
        />
      </div>
    </StandardLayout>
  );
}
```

### Passo 3: Criar Conteúdo da Barra Lateral (Opcional)
```tsx
const rightSidebarContent = (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
          Nova Ação
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
      {/* Conteúdo informativo */}
    </div>
  </div>
);
```

## Exemplos de Implementação

### Dashboard Principal
```tsx
// src/app/dashboard/page.tsx
export default function DashboardOverview() {
  return (
    <StandardLayout
      title="Dashboard"
      subtitle="Bem-vindo ao Portal Educacional"
    >
      <div className="space-y-6">
        {/* Saudação */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Olá, {user?.name}! 👋</h1>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabela de Atividades Recentes */}
        <StandardTable
          columns={tableColumns}
          data={recentActivities}
          loading={loading}
        />
      </div>
    </StandardLayout>
  );
}
```

### Página de Listagem (Cursos, Usuários, etc.)
```tsx
// src/app/courses/page.tsx
export default function CoursesPage() {
  return (
    <StandardLayout
      title="Gestão de Cursos"
      subtitle="Gerencie todos os cursos da plataforma"
      showBreadcrumb
      breadcrumbItems={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Cursos' }
      ]}
      rightContent={<AcoesRapidasSidebar />}
    >
      <div className="space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* StatCards */}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Controles de busca e filtro */}
        </div>

        {/* Tabela */}
        <StandardTable
          columns={courseColumns}
          data={courses}
          pagination={paginationConfig}
          actions={actionsConfig}
        />
      </div>
    </StandardLayout>
  );
}
```

## Páginas a Serem Atualizadas

### Alta Prioridade
1. **Dashboard Principal** ✅ (Concluído)
2. **Gestão de Cursos** ✅ (Concluído)
3. **Gestão de Usuários** (`/admin/users`)
4. **Atividades/Assignments** (`/assignments`)
5. **Relatórios** (`/reports`)

### Média Prioridade
6. **Aulas/Lessons** (`/lessons`)
7. **Avaliações/Quiz** (`/quiz`)
8. **Chat** (`/chat`)
9. **Fórum** (`/forum`)
10. **Ao Vivo** (`/live`)

### Baixa Prioridade
11. **Notificações** (`/notifications`)
12. **Grupos de Estudo** (`/study-groups`)
13. **Configurações** (`/settings`)
14. **Perfil** (`/profile`)

## Padrões de Design

### Cores
- **Primário**: Azul (#1e3a8a)
- **Secundário**: Verde (#059669)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Info**: Azul (#3b82f6)

### Tipografia
- **Títulos**: Inter, font-bold
- **Subtítulos**: Inter, font-semibold
- **Corpo**: Inter, font-normal
- **Pequeno**: Inter, font-medium

### Espaçamento
- **Gap entre elementos**: 6 (1.5rem)
- **Padding interno**: 6 (1.5rem)
- **Margin entre seções**: 8 (2rem)

### Bordas e Sombras
- **Borda padrão**: border-gray-200
- **Sombra suave**: shadow-sm
- **Borda arredondada**: rounded-lg (8px)

## Classes CSS Úteis

```css
/* Container principal */
.space-y-6 { /* Espaçamento vertical entre elementos */ }

/* Cards */
.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-6

/* Botões primários */
.px-4.py-2.bg-blue-600.text-white.rounded-lg.hover:bg-blue-700

/* Botões secundários */
.px-4.py-2.text-gray-600.border.border-gray-300.rounded-lg.hover:bg-gray-50

/* Inputs */
.w-full.px-3.py-2.border.border-gray-300.rounded-lg.focus:ring-2.focus:ring-blue-500

/* Badges de status */
.px-2.py-1.rounded-full.text-xs.font-medium
```

## Checklist de Implementação

Para cada página, seguir este checklist:

- [ ] Importar `StandardLayout`
- [ ] Definir título e subtítulo apropriados
- [ ] Configurar breadcrumb se necessário
- [ ] Criar cards de estatísticas relevantes
- [ ] Implementar filtros e busca se aplicável
- [ ] Usar `StandardTable` para listagens
- [ ] Adicionar barra lateral com ações rápidas
- [ ] Testar responsividade
- [ ] Verificar acessibilidade
- [ ] Validar com diferentes roles de usuário

## Benefícios do Novo Sistema

1. **Consistência Visual**: Todas as páginas seguem o mesmo padrão
2. **Melhor UX**: Interface mais intuitiva e profissional
3. **Manutenibilidade**: Componentes reutilizáveis e padronizados
4. **Responsividade**: Design adaptável para todos os dispositivos
5. **Acessibilidade**: Melhor suporte para leitores de tela
6. **Performance**: Componentes otimizados e carregamento eficiente

## Suporte e Documentação

Para dúvidas sobre implementação:
1. Consulte os exemplos neste guia
2. Veja a implementação em `/dashboard` e `/courses`
3. Analise os componentes em `/components/ui/`
4. Teste em diferentes telas e dispositivos

---

**Próximos Passos**: Aplicar gradualmente em todas as páginas, começando pelas de alta prioridade. 