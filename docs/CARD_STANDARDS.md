# Diretrizes de Padronização para Cards - Portal

Este documento define os padrões visuais e estruturais para todos os cards utilizados na aplicação Portal.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Cards de Estatísticas](#cards-de-estatísticas)
3. [Cards de Conteúdo](#cards-de-conteúdo)
4. [Classes CSS Padronizadas](#classes-css-padronizadas)
5. [Exemplos de Implementação](#exemplos-de-implementação)
6. [Responsividade](#responsividade)
7. [Acessibilidade](#acessibilidade)

## 🎯 Visão Geral

Todos os cards da aplicação devem seguir um padrão visual consistente que inclui:

- **Design moderno** com gradientes e animações suaves
- **Responsividade** completa para todos os dispositivos
- **Acessibilidade** com contraste adequado e navegação por teclado
- **Interatividade** com hover effects e transições
- **Consistência** visual em toda a aplicação

## 📊 Cards de Estatísticas

### Estrutura Básica

```jsx
<div className="stat-card stat-card-blue">
  <div className="stat-card-shine"></div>
  <div className="stat-card-particles">
    <div className="stat-card-particle-1"></div>
    <div className="stat-card-particle-2"></div>
    <div className="stat-card-particle-3"></div>
    <div className="stat-card-particle-4"></div>
  </div>
  <div className="stat-card-content">
    <div className="flex items-center justify-between mb-4">
      <div className="stat-card-icon-wrapper">
        <Icon className="stat-card-icon" />
      </div>
      <div className="text-right">
        <p className="stat-card-value">{value}</p>
        <div className="flex items-center justify-end gap-2 mt-2">
          <div className="stat-card-indicator"></div>
          <span className="stat-card-label">LABEL</span>
        </div>
      </div>
    </div>
    <div>
      <h3 className="stat-card-title">Título</h3>
      <p className="stat-card-subtitle">Subtítulo</p>
    </div>
  </div>
</div>
```

### Variações de Cores

- `stat-card-blue` - Azul corporativo (padrão)
- `stat-card-green` - Verde (sucesso, ativo)
- `stat-card-purple` - Roxo (dados, análises)
- `stat-card-amber` - Âmbar (alertas, estatísticas)
- `stat-card-red` - Vermelho (erros, crítico)
- `stat-card-cyan` - Ciano (informações)
- `stat-card-emerald` - Esmeralda (crescimento)
- `stat-card-violet` - Violeta (premium)

### Grid Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Cards de estatísticas */}
</div>
```

## 🃏 Cards de Conteúdo

### Estrutura Básica

```jsx
<div className="content-card">
  {/* Header com gradiente */}
  <div className="content-card-header">
    <div className="content-card-header-gradient">
      <div className="content-card-header-particles">
        <div className="content-card-header-particle-1"></div>
        <div className="content-card-header-particle-2"></div>
        <div className="content-card-header-particle-3"></div>
        <div className="content-card-header-particle-4"></div>
      </div>
      
      <div className="content-card-header-content">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="content-card-icon-wrapper bg-blue-500">
              <Icon className="content-card-icon" />
            </div>
            <div>
              <h3 className="content-card-title">Título</h3>
              <p className="content-card-subtitle">Subtítulo</p>
            </div>
          </div>
          <span className="status-badge status-badge-active">Status</span>
        </div>
      </div>
    </div>
  </div>

  {/* Corpo do card */}
  <div className="content-card-body">
    {/* Tipo/Categoria */}
    <div className="mb-4">
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        Categoria
      </span>
    </div>

    {/* Descrição */}
    <div className="mb-4">
      <div className="description-box">
        <div className="description-quote-icon">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
        <p className="description-text">Descrição do conteúdo</p>
      </div>
    </div>

    {/* Estatísticas destacadas */}
    <div className="space-y-3 mb-4">
      <div className="stats-highlight stats-highlight-blue">
        <div className="stats-highlight-icon stats-highlight-icon-blue">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="stats-highlight-text stats-highlight-text-blue">Valor Principal</p>
          <p className="stats-highlight-subtext stats-highlight-subtext-blue">Descrição</p>
        </div>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="content-card-footer">
    <div className="flex items-center justify-between">
      <div className="footer-action-text footer-action-text-blue">
        <span>Ação principal</span>
        <div className="footer-action-indicator"></div>
      </div>
      
      <div className="flex items-center gap-1">
        <button className="action-button action-button-edit">
          <Edit className="w-4 h-4" />
        </button>
        <button className="action-button action-button-delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div>
```

### Grid Layout para Cards de Conteúdo

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
  {/* Cards de conteúdo */}
</div>
```

## 🎨 Classes CSS Padronizadas

### Cards de Estatísticas

| Classe | Descrição |
|--------|-----------|
| `stat-card` | Classe base para cards de estatísticas |
| `stat-card-{color}` | Variações de cor (blue, green, purple, amber, etc.) |
| `stat-card-shine` | Efeito de brilho animado |
| `stat-card-particles` | Container para partículas animadas |
| `stat-card-content` | Conteúdo principal do card |
| `stat-card-icon-wrapper` | Wrapper para ícones |
| `stat-card-value` | Valor numérico principal |
| `stat-card-title` | Título do card |
| `stat-card-subtitle` | Subtítulo/descrição |

### Cards de Conteúdo

| Classe | Descrição |
|--------|-----------|
| `content-card` | Classe base para cards de conteúdo |
| `content-card-header` | Header do card |
| `content-card-header-gradient` | Gradiente do header |
| `content-card-body` | Corpo do card |
| `content-card-footer` | Footer do card |
| `description-box` | Container para descrições |
| `stats-highlight` | Destaque para estatísticas |
| `status-badge` | Badge de status |

### Utilitários

| Classe | Descrição |
|--------|-----------|
| `action-button` | Botões de ação |
| `footer-action-text` | Texto de ação no footer |
| `animate-fade-in` | Animação de fade in |

## 💡 Exemplos de Implementação

### Card de Estatística Simples

```jsx
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-card-shine"></div>
    <div className="stat-card-particles">
      <div className="stat-card-particle-1"></div>
      <div className="stat-card-particle-2"></div>
      <div className="stat-card-particle-3"></div>
      <div className="stat-card-particle-4"></div>
    </div>
    <div className="stat-card-content">
      <div className="flex items-center justify-between mb-4">
        <div className="stat-card-icon-wrapper">
          <Icon className="stat-card-icon" />
        </div>
        <div className="text-right">
          <p className="stat-card-value">{value}</p>
          <div className="flex items-center justify-end gap-2 mt-2">
            <div className="stat-card-indicator"></div>
            <span className="stat-card-label">{title.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-subtitle">{subtitle}</p>
      </div>
    </div>
  </div>
);
```

### Card de Conteúdo com Ações

```jsx
const ContentCard = ({ item, onEdit, onDelete }) => (
  <div className="content-card">
    <div className="content-card-header">
      <div className="content-card-header-gradient">
        <div className="content-card-header-particles">
          <div className="content-card-header-particle-1"></div>
          <div className="content-card-header-particle-2"></div>
          <div className="content-card-header-particle-3"></div>
          <div className="content-card-header-particle-4"></div>
        </div>
        
        <div className="content-card-header-content">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="content-card-icon-wrapper bg-blue-500">
                <Icon className="content-card-icon" />
              </div>
              <div>
                <h3 className="content-card-title">{item.name}</h3>
                <p className="content-card-subtitle">{item.subtitle}</p>
              </div>
            </div>
            <span className={`status-badge ${item.active ? 'status-badge-active' : 'status-badge-inactive'}`}>
              {item.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="content-card-body">
      {/* Conteúdo específico */}
    </div>

    <div className="content-card-footer">
      <div className="flex items-center justify-between">
        <div className="footer-action-text footer-action-text-blue">
          <span>Gerenciar item</span>
          <div className="footer-action-indicator"></div>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="action-button action-button-edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(item)} className="action-button action-button-delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

## 📱 Responsividade

### Breakpoints

- **Mobile**: `< 640px` - 1 coluna
- **Tablet**: `640px - 1024px` - 2 colunas
- **Desktop**: `1024px - 1280px` - 3 colunas
- **Large Desktop**: `> 1280px` - 4 colunas

### Grid Responsivo

```jsx
// Para cards de estatísticas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Para cards de conteúdo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
```

### Ajustes Móveis

- Valores de estatísticas reduzidos (`text-3xl` em mobile vs `text-5xl` em desktop)
- Títulos menores (`text-lg` em mobile vs `text-xl` em desktop)
- Espaçamento reduzido
- Ícones ligeiramente menores

## ♿ Acessibilidade

### Contraste

- Todos os cards mantêm contraste mínimo de 4.5:1
- Texto branco sobre gradientes escuros
- Ícones com `drop-shadow` para melhor visibilidade

### Navegação

- Cards são focáveis com `tabindex="0"` quando interativos
- Indicadores visuais de foco
- Suporte a navegação por teclado

### Semântica

```jsx
// Usar elementos semânticos apropriados
<article className="content-card" role="article" aria-labelledby="card-title">
  <h3 id="card-title" className="content-card-title">Título</h3>
  {/* conteúdo */}
</article>
```

### ARIA Labels

```jsx
<button 
  className="action-button action-button-edit"
  aria-label={`Editar ${item.name}`}
  title="Editar item"
>
  <Edit className="w-4 h-4" />
</button>
```

## 🔄 Migração de Cards Existentes

### Checklist de Migração

- [ ] Substituir classes antigas por classes padronizadas
- [ ] Adicionar efeitos de partículas e brilho
- [ ] Implementar grid responsivo
- [ ] Adicionar animações de hover
- [ ] Verificar contraste e acessibilidade
- [ ] Testar em diferentes dispositivos

### Exemplo de Migração

**Antes:**
```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h3>{title}</h3>
  <p>{value}</p>
</div>
```

**Depois:**
```jsx
<div className="stat-card stat-card-blue">
  <div className="stat-card-shine"></div>
  <div className="stat-card-particles">
    <div className="stat-card-particle-1"></div>
    <div className="stat-card-particle-2"></div>
    <div className="stat-card-particle-3"></div>
    <div className="stat-card-particle-4"></div>
  </div>
  <div className="stat-card-content">
    {/* estrutura completa */}
  </div>
</div>
```

## 📝 Notas Importantes

1. **Consistência**: Todos os cards devem seguir exatamente estes padrões
2. **Performance**: Animações são otimizadas com `transform` e `opacity`
3. **Manutenibilidade**: Classes CSS centralizadas facilitam atualizações
4. **Flexibilidade**: Sistema de cores permite fácil customização
5. **Futuro**: Padrão preparado para Dark Mode e temas personalizados

## 🔗 Arquivos Relacionados

- `src/styles/cards-standard.css` - Estilos CSS padronizados
- `src/app/globals.css` - Importação dos estilos
- `src/app/admin/schools/page.tsx` - Exemplo de implementação
- `src/app/admin/institutions/page.tsx` - Referência de design
- `src/app/portal/collections/manage/page.tsx` - Cards de conteúdo

---

**Criado em:** Janeiro 2025  
**Versão:** 1.0  
**Autor:** Sistema Portal  
**Status:** Ativo 