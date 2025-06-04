# Central de Notificações

## Visão Geral

A Central de Notificações é um sistema completo que permite aos usuários visualizar, gerenciar, configurar e enviar notificações no portal educacional, com controle de permissões baseado em roles.

## Sistema de Permissões

### 📋 Hierarquia de Envio (Atualizada)
**Roles que PODEM enviar notificações:**
- **System Admin**: Pode enviar para todos os níveis
- **Institution Manager/Gestor**: Pode enviar para coordenadores, professores, alunos e responsáveis
- **Academic Coordinator/Coordenador**: Pode enviar para professores, alunos e responsáveis
- **Teacher/Professor**: Pode enviar para alunos e responsáveis

**Roles que NÃO podem enviar notificações:**
- **Student/Aluno**: Apenas recebe notificações
- **Guardian/Responsável**: Apenas recebe notificações

### 🔐 Controle de Acesso
- Verificação automática de permissões baseada na role do usuário
- Interface adapta-se dinamicamente às permissões do usuário
- Botões de envio e histórico aparecem apenas para roles autorizadas
- Backend valida permissões em todas as rotas de notificação

## Funcionalidades Implementadas

### 📋 Visualização de Notificações
- Lista completa de todas as notificações do usuário
- Indicadores visuais para notificações lidas/não lidas
- Categorização por tipo (Acadêmico, Sistema, Social, Administrativo)
- Ícones diferenciados por tipo de notificação (info, warning, success, error)

### 🔍 Filtros e Busca
- **Busca por texto**: Pesquisa no título e conteúdo das notificações
- **Filtro por categoria**: Acadêmico, Sistema, Social, Administrativo
- **Filtro por tipo**: Informação, Aviso, Sucesso, Erro
- **Filtro por status**: Todas, Lidas, Não lidas
- **Limpar filtros**: Reset rápido de todos os filtros

### ⚡ Ações em Massa
- Seleção múltipla de notificações
- Marcar selecionadas como lidas
- Excluir notificações selecionadas
- Marcar todas como lidas
- Seleção/desseleção de todas as notificações visíveis

### 📄 Paginação
- Navegação por páginas (10 itens por página)
- Indicadores de página atual e total
- Botões de navegação (Anterior/Próxima)
- Contador de resultados

### 📤 Envio de Notificações (Apenas roles autorizadas)
- **Formulário completo** para criação de notificações
- **Seleção inteligente de destinatários** baseada na role do remetente
- **Suporte a notificações push e email**
- **Agendamento** de notificações para envio futuro
- **Configuração de prioridade** (Alta, Média, Baixa)
- **Validação de permissões** em tempo real

### 🔧 Funcionalidades Técnicas
- **Verificação automática de permissões** usando `canSendNotifications()`
- **Mapeamento inteligente de roles** para destinatários permitidos
- **Validação no frontend e backend** para segurança
- **Interface responsiva** que se adapta às permissões do usuário

### 📊 Histórico de Notificações Enviadas
- **Lista de notificações enviadas** pelo usuário atual
- **Status de entrega** (Enviada, Agendada, Rascunho, Falhou)
- **Métricas de leitura** (lidas vs não lidas)
- **Filtros por status** para organização
- **Ações contextuais** (editar rascunhos, reagendar)

### ⚙️ Configurações
- Modal de configurações de notificação
- Configuração de métodos de entrega (Email, Push, SMS)
- Configuração de categorias de interesse
- Salvamento de preferências

### 🎨 Interface e UX
- Design responsivo e moderno
- Estados de loading e erro
- Feedback visual para ações do usuário
- Navegação intuitiva com breadcrumb
- Integração com o layout do dashboard
- **Controle de acesso visual** baseado em permissões

## Estrutura de Arquivos

```
src/app/notifications/
├── page.tsx              # Página principal da Central de Notificações
├── layout.tsx            # Layout específico da página
├── send/
│   └── page.tsx          # Página de envio de notificações
├── sent/
│   └── page.tsx          # Página de histórico de notificações enviadas
└── README.md             # Esta documentação

src/components/notifications/
└── NotificationSettings.tsx  # Componente de configurações

src/hooks/
└── useNotifications.ts   # Hook personalizado para gerenciar notificações
```

## Tipos de Dados

### Notification
```typescript
interface Notification {
  id: number
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  time: string
  date: string
  read: boolean
  category: 'academic' | 'system' | 'social' | 'administrative'
}
```

### NotificationFilters
```typescript
interface NotificationFilters {
  category: string
  type: string
  status: string
  dateRange: string
}
```

## Hook useNotifications

O hook personalizado `useNotifications` fornece:

- **Estado**: notifications, loading, error, unreadCount, totalCount
- **Ações**: markAsRead, markAllAsRead, markMultipleAsRead, deleteNotifications
- **Utilitários**: getFilteredNotifications, addNotification

## Navegação

### Rotas Disponíveis
- **`/notifications`** - Central de Notificações (todos os usuários autenticados)
- **`/notifications/send`** - Envio de Notificações (Admin/Manager/Teacher apenas)
- **`/notifications/sent`** - Histórico de Enviadas (Admin/Manager/Teacher apenas)

### Pontos de Acesso
- **Header do Dashboard**: Botão "Visualizar todas as notificações" no dropdown
- **Página Principal**: Botões "Enviar Notificação" e "Enviadas" (conforme permissão)
- **Navegação Direta**: URLs podem ser acessadas diretamente

### Proteção e Permissões
- **Layout**: Utiliza o `AuthenticatedDashboardLayout`
- **Autenticação**: Todas as rotas requerem login
- **Autorização**: Páginas de envio verificam role do usuário
- **Redirecionamento**: Students são redirecionados se tentarem acessar páginas restritas

## Funcionalidades Futuras

### 🔄 Melhorias Planejadas
- [ ] Notificações em tempo real via WebSocket
- [ ] Integração com API backend
- [ ] Notificações push do navegador
- [ ] Arquivamento de notificações
- [ ] Filtros por data/período
- [ ] Exportação de notificações
- [ ] Notificações por email
- [ ] Templates personalizáveis

### 🎯 Integrações
- [ ] Sistema de gamificação
- [ ] Calendário acadêmico
- [ ] Sistema de mensagens
- [ ] Relatórios e analytics

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Material Symbols** - Ícones
- **React Hooks** - Gerenciamento de estado

## Considerações de Performance

- **Paginação**: Evita carregamento excessivo de dados
- **Filtros locais**: Processamento eficiente no frontend
- **Lazy loading**: Componentes carregados sob demanda
- **Memoização**: Otimização de re-renderizações

## Acessibilidade

- Navegação por teclado
- Indicadores visuais claros
- Contraste adequado de cores
- Labels descritivos para screen readers
- Estados de foco bem definidos

## Responsividade

- Layout adaptável para desktop, tablet e mobile
- Sidebar colapsável em telas menores
- Botões e elementos touch-friendly
- Tipografia escalável