# 🛡️ Dashboard do Administrador do Sistema - Portal Sabercon

## 📋 Visão Geral

O Dashboard do Administrador do Sistema foi completamente refatorado para integrar com as APIs reais do backend e fornecer informações relevantes e funcionais para o **SYSTEM_ADMIN**.

## 🚀 Funcionalidades Implementadas

### 📊 Métricas em Tempo Real

- **Uptime do Sistema**: Tempo de atividade do servidor
- **Uso de Memória Heap**: Monitoramento de memória em tempo real
- **Usuários Ativos**: Contagem de usuários online
- **Status AWS**: Taxa de sucesso das conexões AWS

### 👥 Estatísticas de Usuários

- **Total de Usuários**: Contagem geral de usuários cadastrados
- **Usuários Ativos**: Usuários que fizeram login recentemente
- **Novos Usuários**: Registros do mês atual
- **Distribuição por Função**: Gráfico de pizza com usuários por role
- **Distribuição por Instituição**: Breakdown por instituição

### 🏢 Gestão de Instituições

- **Lista de Instituições**: Top 5 instituições mais ativas
- **Status de Atividade**: Indicador visual de instituições ativas/inativas
- **Contadores**: Escolas e usuários por instituição
- **Navegação Rápida**: Links diretos para gestão

### 🔐 Controle de Roles e Permissões

- **Estatísticas de Roles**: Total, sistema, customizadas, ativas
- **Gestão Centralizada**: Acesso direto ao gerenciamento de roles
- **Monitoramento**: Acompanhamento de roles ativas vs inativas

### ☁️ Integração AWS

- **Status de Conexão**: Taxa de sucesso das conexões
- **Métricas de Performance**: Tempo médio de resposta
- **Serviços Utilizados**: Contagem de serviços AWS em uso
- **Logs de Conexão**: Histórico de conexões

### 📱 Análise de Sessões

- **Sessões Ativas**: Contagem em tempo real
- **Distribuição por Dispositivo**: Gráfico de barras (desktop, mobile, tablet)
- **Duração Média**: Tempo médio de sessão dos usuários
- **Monitoramento**: Acompanhamento de atividade

## 🔧 APIs Integradas

### Dashboard Principal
```typescript
GET /api/dashboard/system
```
Retorna dados completos do dashboard incluindo usuários, sessões e sistema.

### Métricas em Tempo Real
```typescript
GET /api/dashboard/metrics/realtime
```
Atualiza métricas de usuários ativos, sessões e memória a cada 30 segundos.

### Instituições
```typescript
GET /api/institutions?limit=10&active=true
```
Lista as principais instituições ativas do sistema.

### Estatísticas de Roles
```typescript
GET /api/roles/stats
```
Fornece estatísticas detalhadas sobre roles do sistema.

### Status AWS
```typescript
GET /api/aws/connection-logs/stats
```
Métricas de conexão e performance dos serviços AWS.

### Saúde do Sistema
```typescript
GET /api/dashboard/health
```
Status de saúde dos componentes (API, Redis, Database).

## 🎯 Ações Rápidas

### Navegação Direta
- **Gerenciar Instituições**: `/admin/institutions`
- **Gerenciar Usuários**: `/admin/users`
- **Políticas de Segurança**: `/admin/security`
- **Configurações**: `/admin/settings`

### Acesso Rápido
- **Analytics do Sistema**: `/admin/analytics`
- **Logs do Sistema**: `/admin/logs`
- **Sessões Ativas**: `/admin/sessions`
- **Portal de Relatórios**: `/portal/reports`
- **Monitoramento**: `/admin/monitoring`

## 📈 Gráficos e Visualizações

### Gráfico de Pizza - Usuários por Função
Mostra a distribuição de usuários entre as diferentes roles:
- SYSTEM_ADMIN
- INSTITUTION_MANAGER
- ACADEMIC_COORDINATOR
- TEACHER
- STUDENT
- GUARDIAN

### Gráfico de Barras - Sessões por Dispositivo
Visualiza como os usuários acessam a plataforma:
- Desktop
- Mobile
- Tablet

## 🔄 Atualização Automática

- **Intervalo**: 30 segundos
- **Métricas Atualizadas**: Usuários ativos, sessões, memória
- **Indicador Visual**: Ponto verde pulsante para dados em tempo real
- **Botão Manual**: Atualização sob demanda

## 🚨 Sistema de Alertas

### Tipos de Alertas
- **Crítico**: Falhas graves do sistema
- **Aviso**: Situações que requerem atenção
- **Informativo**: Notificações gerais

### Alertas Implementados
- Alto uso de memória (>80%)
- Backup automático concluído
- Falhas de autenticação detectadas

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Chart.js** para visualizações
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Hot Toast** para notificações
- **Next.js** para roteamento

## 📱 Responsividade

O dashboard é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- **Desktop**: Layout completo com 3 colunas
- **Tablet**: Layout adaptado com 2 colunas
- **Mobile**: Layout em coluna única com navegação otimizada

## 🔒 Segurança e Permissões

- **Autenticação Obrigatória**: Apenas usuários autenticados
- **Role SYSTEM_ADMIN**: Acesso exclusivo ao dashboard
- **Tokens JWT**: Autenticação segura nas APIs
- **Fallback Gracioso**: Dados simulados quando APIs não disponíveis

## 🎨 Interface do Usuário

### Design System
- **Cores Primárias**: Azul (#3B82F6)
- **Cores de Acento**: Verde, Roxo, Amarelo, Vermelho
- **Tipografia**: Inter font family
- **Espaçamento**: Sistema baseado em 4px

### Componentes Reutilizáveis
- **MetricCard**: Cards de métricas principais
- **StatCard**: Cards de estatísticas menores
- **Gráficos**: Componentes Chart.js customizados

## 🚀 Performance

### Otimizações Implementadas
- **Lazy Loading**: Carregamento sob demanda
- **Memoização**: React.memo para componentes
- **Debounce**: Evita chamadas excessivas à API
- **Cache**: Dados em cache quando possível

### Métricas de Performance
- **Tempo de Carregamento**: < 2 segundos
- **Atualização em Tempo Real**: 30 segundos
- **Responsividade**: < 100ms para interações

## 📋 Próximos Passos

### Funcionalidades Planejadas
- [ ] Dashboard customizável por usuário
- [ ] Alertas em tempo real via WebSocket
- [ ] Exportação de relatórios em PDF
- [ ] Filtros avançados por período
- [ ] Comparação histórica de métricas
- [ ] Integração com mais serviços AWS
- [ ] Notificações push para administradores

### Melhorias Técnicas
- [ ] Testes unitários e de integração
- [ ] Documentação de APIs
- [ ] Monitoramento de erros
- [ ] Logs estruturados
- [ ] Cache Redis para métricas
- [ ] Compressão de dados

## 🤝 Contribuição

Para contribuir com melhorias no dashboard:

1. Verifique as permissões de SYSTEM_ADMIN
2. Teste com dados reais do backend
3. Mantenha a responsividade
4. Documente novas funcionalidades
5. Siga os padrões de código estabelecidos

---

**Desenvolvido para o Portal Sabercon** 🎓
*Dashboard do Administrador do Sistema v2.1.4* 