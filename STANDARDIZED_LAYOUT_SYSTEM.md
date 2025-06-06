# Sistema de Layout Padronizado

## Visão Geral
Sistema de componentes de layout padronizados para garantir consistência visual em todas as páginas do portal, com design acadêmico, cores neutras e foco em usabilidade.

## Princípios de Design

### 1. **Cores Acadêmicas e Neutras**
- **Primária**: Azul acadêmico (#3B82F6)
- **Secundária**: Cinzas neutros (#6B7280, #9CA3AF)
- **Sucesso**: Verde suave (#10B981)
- **Aviso**: Amarelo moderado (#F59E0B)
- **Erro**: Vermelho discreto (#EF4444)
- **Fundos**: Branco (#FFFFFF) e cinza claro (#F9FAFB)

### 2. **Tipografia Clara**
- Fontes sem serifa para melhor legibilidade
- Hierarquia clara com tamanhos consistentes
- Espaçamento adequado entre elementos

### 3. **Layout Responsivo**
- Mobile-first approach
- Breakpoints consistentes (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Containers com largura máxima de 1280px (7xl)

## Componentes de Layout

### PageLayout
Componente principal para estrutura de página.

```tsx
<PageLayout
  title="Título da Página"
  description="Descrição opcional"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Seção Atual' }
  ]}
  actions={<Button>Ação Principal</Button>}
>
  {/* Conteúdo da página */}
</PageLayout>
```

**Características:**
- Header fixo com breadcrumbs
- Título e descrição padronizados
- Área para ações no canto superior direito
- Container responsivo com padding adequado

### ContentSection
Seções de conteúdo com bordas e sombras sutis.

```tsx
<ContentSection
  title="Título da Seção"
  description="Descrição opcional"
  actions={<Button size="sm">Ação</Button>}
>
  {/* Conteúdo da seção */}
</ContentSection>
```

**Características:**
- Fundo branco com borda cinza clara
- Header opcional com título e ações
- Padding interno consistente
- Sombra sutil para profundidade

### StatCard
Cards para exibição de estatísticas.

```tsx
<StatCard
  title="Total de Itens"
  value="123"
  icon={<BookOpenIcon className="w-6 h-6" />}
  trend={{ value: 12, isPositive: true }}
/>
```

**Características:**
- Layout flexível com ícone opcional
- Suporte para tendências/comparações
- Tipografia hierárquica clara

### SearchBar
Barra de pesquisa padronizada.

```tsx
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Pesquisar..."
/>
```

**Características:**
- Ícone de lupa integrado
- Botão de limpar quando há texto
- Foco visual com anel azul
- Bordas arredondadas suaves

### Button
Botões com variantes consistentes.

```tsx
<Button 
  variant="primary" // primary, secondary, outline, ghost, danger, success
  size="md" // sm, md, lg
  leftIcon={<Icon />}
  isLoading={false}
>
  Texto do Botão
</Button>
```

**Variantes:**
- **Primary**: Fundo azul, texto branco
- **Secondary**: Fundo cinza claro
- **Outline**: Apenas borda
- **Ghost**: Sem fundo, hover sutil
- **Danger**: Vermelho para ações destrutivas
- **Success**: Verde para confirmações

## Padrões de Uso

### 1. Estrutura de Página Típica
```tsx
<ProtectedRoute requiredRole={[...]}>
  <PageLayout {...pageProps}>
    {/* Estatísticas */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard {...statProps} />
    </div>

    {/* Filtros e Busca */}
    <ContentSection className="mb-6">
      <SearchBar {...searchProps} />
      {/* Filtros adicionais */}
    </ContentSection>

    {/* Conteúdo Principal */}
    <ContentSection>
      {/* Grid ou lista de itens */}
    </ContentSection>
  </PageLayout>
</ProtectedRoute>
```

### 2. Espaçamento Consistente
- **Entre seções**: `mb-6` (24px)
- **Entre elementos**: `gap-4` (16px)
- **Padding interno**: `p-6` (24px)
- **Padding de cards**: `p-4` (16px)

### 3. Responsividade
- **Mobile**: Stacking vertical, full width
- **Tablet**: 2 colunas quando apropriado
- **Desktop**: 3-4 colunas para grids

### 4. Estados Vazios
```tsx
<div className="text-center py-12">
  <Icon className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-medium text-gray-900">
    Nenhum item encontrado
  </h3>
  <p className="mt-1 text-sm text-gray-500">
    Mensagem de ajuda
  </p>
  <div className="mt-6">
    <Button>Ação Sugerida</Button>
  </div>
</div>
```

## Benefícios

1. **Consistência Visual**: Todas as páginas seguem o mesmo padrão
2. **Manutenibilidade**: Alterações em um componente afetam todo o sistema
3. **Acessibilidade**: Cores com contraste adequado, hierarquia clara
4. **Performance**: Componentes otimizados e reutilizáveis
5. **Developer Experience**: API simples e intuitiva

## Migração

Para migrar uma página existente:

1. Substitua a estrutura por `PageLayout`
2. Use `ContentSection` para agrupar conteúdo
3. Substitua cards customizados por `StatCard`
4. Use `SearchBar` para campos de busca
5. Padronize botões com o componente `Button`
6. Ajuste espaçamentos seguindo os padrões

## Exemplo Completo

Ver implementação em `src/app/portal/books/page.tsx` como referência de uma página completamente padronizada. 