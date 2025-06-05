# Guia de Implementação do Sistema de Temas

## Visão Geral

O sistema de temas foi implementado para permitir uma experiência visual consistente e personalizável em toda a aplicação. Oferecemos três temas distintos:

- **Acadêmico**: Cores profissionais com azul, verde e vermelho
- **Corporativo**: Elegante com azul escuro, roxo e dourado  
- **Moderno**: Tema escuro com roxo vibrante, ciano e rosa

## Componentes Implementados

### 1. Componentes Base UI

#### Modal (`src/components/ui/Modal.tsx`)
```tsx
import Modal from '@/components/ui/Modal'

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Título do Modal"
  size="lg" // sm | md | lg | xl | full
>
  {/* Conteúdo */}
</Modal>
```

#### Input (`src/components/ui/Input.tsx`)
```tsx
import Input from '@/components/ui/Input'

<Input
  label="Nome"
  placeholder="Digite seu nome"
  leftIcon="person"
  rightIcon="check"
  error="Campo obrigatório"
  helperText="Texto de ajuda"
  variant="default" // default | filled | outlined
  size="md" // sm | md | lg
/>
```

#### Select (`src/components/ui/Select.tsx`)
```tsx
import Select from '@/components/ui/Select'

<Select
  label="Escolha uma opção"
  options={[
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' }
  ]}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  multiple={false}
  searchable={true}
/>
```

#### Textarea (`src/components/ui/Textarea.tsx`)
```tsx
import Textarea from '@/components/ui/Textarea'

<Textarea
  label="Descrição"
  placeholder="Digite uma descrição..."
  autoResize={true}
  showCharCount={true}
  maxLength={500}
  rows={3}
/>
```

#### Table (`src/components/ui/Table.tsx`)
```tsx
import Table from '@/components/ui/Table'

<Table
  columns={[
    { key: 'name', title: 'Nome', sortable: true },
    { key: 'email', title: 'Email' }
  ]}
  data={tableData}
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100,
    onChange: (page, pageSize) => {}
  }}
  striped
  hoverable
/>
```

#### Button (`src/components/ui/Button.tsx`)
```tsx
import { Button } from '@/components/ui/Button'

<Button
  variant="primary" // primary | secondary | accent | success | warning | error | ghost | outline
  size="md" // xs | sm | md | lg | xl
  icon={<span className="material-symbols-outlined">add</span>}
  gradient
  glow
  fullWidth
>
  Clique aqui
</Button>
```

#### Card (`src/components/ui/Card.tsx`)
```tsx
import { Card } from '@/components/ui/Card'

<Card
  shadow="lg" // sm | md | lg | xl | none
  gradient
  glass
  hover
  padding="md" // sm | md | lg | xl
>
  {/* Conteúdo */}
</Card>
```

### 2. Componentes de Dashboard

#### StatsGrid (`src/components/dashboard/StatsGrid.tsx`)
```tsx
import StatsGrid from '@/components/dashboard/StatsGrid'

<StatsGrid
  userRole={UserRole.TEACHER}
  stats={[]} // Usa stats padrão por role se vazio
  loading={false}
/>
```

#### DashboardPageLayout (`src/components/dashboard/DashboardPageLayout.tsx`)
```tsx
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

<DashboardPageLayout
  title="Dashboard do Professor"
  subtitle="Gerencie suas turmas e atividades"
  showThemeSelector={true}
  actions={<Button>Nova Atividade</Button>}
>
  {/* Conteúdo da página */}
</DashboardPageLayout>
```

## Como Aplicar o Sistema de Temas

### 1. Usar o Hook useTheme

```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, currentThemeType, setTheme } = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary 
    }}>
      {/* Conteúdo */}
    </div>
  )
}
```

### 2. Aplicar Cores do Tema

```tsx
// Cores principais
theme.colors.primary.DEFAULT
theme.colors.primary.dark
theme.colors.primary.light
theme.colors.primary.contrast

// Cores de fundo
theme.colors.background.primary
theme.colors.background.secondary
theme.colors.background.tertiary
theme.colors.background.card
theme.colors.background.hover

// Cores de texto
theme.colors.text.primary
theme.colors.text.secondary
theme.colors.text.tertiary
theme.colors.text.disabled
theme.colors.text.inverse

// Cores de status
theme.colors.status.success
theme.colors.status.warning
theme.colors.status.error
theme.colors.status.info

// Bordas
theme.colors.border.DEFAULT
theme.colors.border.light
theme.colors.border.dark
theme.colors.border.focus

// Sombras
theme.shadows.sm
theme.shadows.md
theme.shadows.lg
theme.shadows.xl
```

### 3. Converter Componentes Existentes

#### Antes:
```tsx
<div className="bg-white text-gray-900 border border-gray-200">
  <h1 className="text-2xl font-bold text-gray-900">Título</h1>
  <p className="text-gray-600">Descrição</p>
</div>
```

#### Depois:
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function Component() {
  const { theme } = useTheme()
  
  return (
    <div style={{
      backgroundColor: theme.colors.background.card,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.DEFAULT}`
    }}>
      <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
        Título
      </h1>
      <p style={{ color: theme.colors.text.secondary }}>
        Descrição
      </p>
    </div>
  )
}
```

### 4. Adicionar ThemeSelector

```tsx
import { ThemeSelector } from '@/components/ui/ThemeSelector'

// Em qualquer lugar da aplicação
<ThemeSelector />
```

## Padrões de Implementação

### 1. Formulários
```tsx
<form className="space-y-4">
  <Input
    label="Email"
    type="email"
    leftIcon="mail"
    required
  />
  
  <Select
    label="Cargo"
    options={roleOptions}
    searchable
  />
  
  <Textarea
    label="Observações"
    autoResize
    showCharCount
    maxLength={500}
  />
  
  <div className="flex gap-3 justify-end">
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary" gradient>Salvar</Button>
  </div>
</form>
```

### 2. Tabelas de Dados
```tsx
<Card>
  <Table
    columns={columns}
    data={data}
    pagination={pagination}
    striped
    hoverable
    onRow={(record) => ({
      onClick: () => handleRowClick(record)
    })}
  />
</Card>
```

### 3. Dashboards
```tsx
<DashboardPageLayout title="Dashboard">
  <StatsGrid userRole={userRole} stats={customStats} />
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <Card>
      {/* Gráfico ou conteúdo */}
    </Card>
    
    <Card glass>
      {/* Outro conteúdo */}
    </Card>
  </div>
</DashboardPageLayout>
```

## Migração de Componentes

### Checklist de Migração

1. [ ] Importar `useTheme` hook
2. [ ] Substituir classes de cores fixas por `style` com cores do tema
3. [ ] Usar componentes UI ao invés de elementos HTML puros
4. [ ] Adicionar animações com Framer Motion onde apropriado
5. [ ] Testar com todos os 3 temas

### Exemplo de Migração Completa

```tsx
// ANTES
export function OldComponent() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Título
      </h2>
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded"
        placeholder="Digite algo..."
      />
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Enviar
      </button>
    </div>
  )
}

// DEPOIS
import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export function NewComponent() {
  const { theme } = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card shadow="md" padding="lg">
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: theme.colors.text.primary }}
        >
          Título
        </h2>
        
        <Input
          placeholder="Digite algo..."
          className="mb-4"
        />
        
        <Button variant="primary" gradient>
          Enviar
        </Button>
      </Card>
    </motion.div>
  )
}
```

## Demonstração

Para ver todos os componentes em ação com os diferentes temas:

```
http://localhost:3000/dashboard/theme-demo
```

## Próximos Passos

1. Migrar todas as páginas existentes para usar o sistema de temas
2. Criar variações de componentes específicas por role
3. Adicionar mais temas personalizados
4. Implementar preferências de tema por usuário
5. Adicionar modo escuro/claro automático baseado no horário

## Suporte

Para dúvidas ou sugestões sobre o sistema de temas, consulte:
- Documentação dos componentes em `/src/components/ui/`
- Exemplos de implementação em `/src/app/dashboard/theme-demo/page.tsx`
- Configuração de temas em `/src/config/themes.ts` 