# Templates de Layout CRUD - Portal Educacional

Este diretório contém templates reutilizáveis que seguem os padrões estabelecidos no sistema para páginas CRUD administrativas.

## 📁 Arquivos

- **`AdminCrudPageTemplate.tsx`** - Template principal para páginas CRUD
- **`DataTable.tsx`** - Componente de tabela/cards responsivos
- **`ExampleCrudPage.tsx`** - Exemplo completo de uso dos templates
- **`README.md`** - Esta documentação

## 🎨 Padrões do Sistema

### Layout Principal
- **AuthenticatedLayout**: Usado como wrapper para incluir sidebar e header
- **Container**: `p-6 space-y-6` (interno, não usa container mx-auto)
- **Card Principal**: `bg-white rounded-xl shadow-sm border border-gray-200`
- **Header**: `p-6 border-b border-gray-200`
- **Content**: Flexível baseado no conteúdo

### Cores e Estilos
- **Texto Principal**: `text-gray-900`
- **Texto Secundário**: `text-gray-600`
- **Texto Terciário**: `text-gray-500`
- **Bordas**: `border-gray-200`
- **Backgrounds**: `bg-gray-50` (fundos secundários)

### Componentes Padrão
- **Buttons**: Usando `@/components/ui/Button`
- **Stats Cards**: Usando `@/components/ui/StandardCard`
- **Badges**: Usando `@/components/ui/Badge`
- **Icons**: Lucide React

## 🔧 AdminCrudPageTemplate

### Props Principais

```typescript
interface AdminCrudPageTemplateProps {
  // Header
  title: string
  subtitle?: string
  
  // Estatísticas
  stats?: StatData[]
  
  // Busca e filtros
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  
  // Estados
  loading: boolean
  refreshing?: boolean
  error?: string | null
  
  // Ações
  onRefresh: () => void
  onCreateNew?: () => void
  
  // Conteúdo
  children: ReactNode
  
  // Paginação
  pagination?: PaginationData
  onPageChange?: (page: number) => void
}
```

### Uso Básico

⚠️ **IMPORTANTE**: O template deve ser usado **DENTRO** do `AuthenticatedLayout` para exibir o menu lateral e header do sistema.

```typescript
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import AdminCrudPageTemplate from '@/components/templates/AdminCrudPageTemplate'

export default function MinhaPageCRUD() {
  return (
    <AuthenticatedLayout>
      <AdminCrudPageTemplate
        title="Minha Página"
        subtitle="Gerenciar dados"
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        loading={loading}
        onRefresh={handleRefresh}
        onCreateNew={handleCreateNew}
      >
        {/* Seu conteúdo aqui */}
      </AdminCrudPageTemplate>
    </AuthenticatedLayout>
  )
}
```

### Estrutura do Layout

```
AuthenticatedLayout (sidebar + header do sistema)
├── AdminCrudPageTemplate (p-6 space-y-6)
    ├── Card Principal (bg-white rounded-xl shadow-sm)
        ├── Header Section (p-6 border-b)
        │   ├── Title and Actions
        │   ├── Stats Cards
        │   └── Search and Filters
        ├── Content Section
        │   └── children (DataTable, etc.)
        └── Pagination (opcional)
```

## 📊 DataTable

### Características
- **Responsivo**: Tabela no desktop, cards no mobile
- **Customizável**: Colunas e ações configuráveis
- **Estados**: Loading, empty state
- **Interatividade**: Click em linhas, ações por item

### Configuração de Colunas

```typescript
import { useTableColumns } from '@/components/templates/DataTable'

const { createColumn, statusColumn, dateColumn, countColumn } = useTableColumns()

const columns = [
  createColumn('name', 'Nome', {
    render: (value, item) => (
      <div className="font-medium">{value}</div>
    )
  }),
  statusColumn('is_active', 'Status'),
  dateColumn('created_at', 'Criado em'),
  countColumn('items_count', 'Itens', 'blue')
]
```

### Configuração de Ações

```typescript
const actions = [
  {
    label: 'Visualizar',
    icon: Eye,
    onClick: (item) => handleView(item),
    variant: 'ghost',
    className: 'text-blue-600'
  },
  {
    label: 'Editar',
    icon: Edit,
    onClick: (item) => handleEdit(item),
    variant: 'ghost',
    className: 'text-green-600'
  },
  {
    label: 'Excluir',
    icon: Trash2,
    onClick: (item) => handleDelete(item),
    variant: 'ghost',
    className: 'text-red-600',
    show: (item) => item.can_delete // Opcional: mostrar apenas quando permitido
  }
]
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: `< 1024px` - Cards verticais
- **Desktop**: `>= 1024px` - Tabela horizontal

### Stats Cards
- **Mobile**: `grid-cols-2`
- **Desktop**: `grid-cols-{1-4}` baseado na quantidade

### Comportamentos Mobile
- Menu hambúrguer automático (via AuthenticatedLayout)
- Cards expansíveis
- Ações como botões com texto
- Touch-friendly

## 🎯 Estados e Feedback

### Loading States
```typescript
// Loading inicial
if (loading) return <LoadingSpinner />

// Refreshing (sem bloquear UI)
<Button disabled={refreshing}>
  <RefreshCw className={refreshing ? 'animate-spin' : ''} />
</Button>
```

### Empty States
```typescript
<DataTable
  emptyStateIcon={Building2}
  emptyStateTitle="Nenhum item encontrado"
  emptyStateMessage="Clique em 'Criar Novo' para começar"
/>
```

### Error States
```typescript
<AdminCrudPageTemplate
  error="Erro ao carregar dados"
  onRefresh={handleRetry}
/>
```

## 🔍 Filtros e Busca

### Filtros Simples
```typescript
const filterFields = [
  {
    key: 'status',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { label: 'Tipo A', value: 'A' },
      { label: 'Tipo B', value: 'B' }
    ]
  }
]
```

### Busca
```typescript
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault()
  // Implementar lógica de busca
  loadData({ search: searchQuery })
}
```

## 📄 Paginação

```typescript
const pagination = {
  currentPage: 1,
  totalPages: 10,
  totalItems: 100,
  itemsPerPage: 10
}

<AdminCrudPageTemplate
  pagination={pagination}
  onPageChange={handlePageChange}
/>
```

## ⚡ Performance

### Otimizações Implementadas
- **useCallback** para handlers
- **useMemo** para cálculos pesados
- **Loading states** não bloqueantes
- **Lazy loading** de componentes

### Boas Práticas
```typescript
// ✅ Correto
const handleRefresh = useCallback(() => {
  setRefreshing(true)
  loadData().finally(() => setRefreshing(false))
}, [loadData])

// ❌ Evitar
const handleRefresh = () => {
  // Re-criado a cada render
}
```

## 🎨 Customização

### Classes CSS Personalizadas
```typescript
<AdminCrudPageTemplate
  containerClassName="custom-container"
  headerClassName="custom-header"
  contentClassName="custom-content"
/>
```

### Cores dos Stats
```typescript
const stats = [
  {
    icon: Users,
    title: 'Total',
    value: 100,
    subtitle: 'Usuários',
    color: 'blue' // blue, green, purple, amber, red, cyan, emerald, violet
  }
]
```

## 📝 Exemplo Completo

Veja `ExampleCrudPage.tsx` para um exemplo funcional completo que demonstra:

- **AuthenticatedLayout** como wrapper
- Configuração de todas as props
- Estados de loading/error
- Filtros e busca funcionais
- Tabela responsiva com ações
- Toast notifications
- Gestão de estado local

## 🔄 Integração com Serviços

```typescript
// Hook personalizado para dados
const useInstitutions = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const loadData = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await institutionService.getInstitutions(params)
      setData(response.items)
    } catch (error) {
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { data, loading, loadData }
}
```

## 🏗️ Estrutura para Páginas Admin

### Padrão Recomendado
```typescript
'use client'

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import AdminCrudPageTemplate from '@/components/templates/AdminCrudPageTemplate'
import DataTable, { useTableColumns } from '@/components/templates/DataTable'

export default function MinhaPageAdmin() {
  // Estados e lógica aqui...
  
  return (
    <AuthenticatedLayout>
      <AdminCrudPageTemplate
        title="Minha Entidade"
        subtitle="Descrição da página"
        // ... outras props
      >
        <DataTable
          data={data}
          columns={columns}
          actions={actions}
        />
      </AdminCrudPageTemplate>
    </AuthenticatedLayout>
  )
}
```

### Para Route Groups

Se estiver usando route groups como `(management)` ou `(admin)`, o `AuthenticatedLayout` pode já estar no `layout.tsx` do grupo:

```typescript
// src/app/(admin)/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
}

// src/app/(admin)/minha-pagina/page.tsx  
export default function MinhaPage() {
  return (
    <AdminCrudPageTemplate>
      {/* conteúdo */}
    </AdminCrudPageTemplate>
  )
}
```

## 🚀 Próximos Passos

1. **Formulários**: Templates para modais de criação/edição
2. **Filtros Avançados**: Datepickers, ranges, múltipla seleção
3. **Exportação**: Botões para CSV/PDF
4. **Bulk Actions**: Seleção múltipla e ações em lote
5. **Ordenação**: Colunas clicáveis para ordenar

---

**Nota**: Estes templates foram criados baseados nos padrões estabelecidos nas páginas existentes do sistema, especialmente `/admin/institutions/page.tsx`, garantindo consistência visual e funcional em todo o portal. O `AuthenticatedLayout` é **obrigatório** para exibir o menu lateral e header do sistema. 