# Sistema de Activity Tracking e Auditoria

## Visão Geral

O sistema de Activity Tracking foi desenvolvido para registrar todas as ações dos usuários no portal, fornecendo uma trilha de auditoria completa para fins de segurança, conformidade e análise de uso.

## Características Principais

- ✅ **Registro automático** de todas as ações do usuário
- 📊 **Análise detalhada** de padrões de uso
- 🔍 **Busca avançada** com múltiplos filtros
- 🚨 **Detecção de atividades suspeitas**
- 📈 **Relatórios de conformidade**
- 💾 **Exportação de dados** para CSV
- 🔒 **Controle de acesso** baseado em roles

## Arquitetura

### Middleware de Tracking

O middleware `activityTrackingMiddleware` intercepta todas as requisições HTTP e registra:

```typescript
// backend/src/middleware/activityTracking.ts
app.use(activityTrackingMiddleware);
```

### Dados Coletados

Para cada ação, o sistema registra:

- **Identificação**: user_id, session_id
- **Ação**: tipo de atividade, método HTTP, entidade afetada
- **Contexto**: IP, navegador, SO, dispositivo, localização
- **Timing**: início, fim, duração
- **Resultado**: sucesso/erro, código de status
- **Detalhes**: parâmetros, headers relevantes

### Tipos de Atividade

```typescript
type ActivityType = 
  // Autenticação
  | 'login' | 'logout' | 'login_failed' | 'token_refresh'
  
  // Navegação
  | 'page_view' | 'navigation' | 'session_start' | 'session_end'
  
  // Dados
  | 'data_create' | 'data_update' | 'data_delete' | 'data_view'
  
  // Arquivos
  | 'file_upload' | 'file_download'
  
  // Sistema
  | 'error' | 'system_action'
  // ... e muitos outros
```

## Estrutura do Banco de Dados

### Tabela `user_activity`

```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  session_id VARCHAR,
  activity_type VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id VARCHAR,
  action VARCHAR NOT NULL,
  details JSON,
  ip_address VARCHAR,
  user_agent VARCHAR,
  browser VARCHAR,
  operating_system VARCHAR,
  device_info VARCHAR,
  location VARCHAR,
  duration_seconds INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela `activity_sessions`

```sql
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY,
  session_id VARCHAR UNIQUE NOT NULL,
  user_id VARCHAR NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  ip_address VARCHAR,
  user_agent VARCHAR,
  device_info JSON,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Consulta de Atividades

```http
GET /api/activity-tracking/activities
```

Parâmetros de query:
- `userId`: Filtrar por usuário
- `sessionId`: Filtrar por sessão
- `activityType`: Tipo de atividade
- `entityType`: Tipo de entidade
- `entityId`: ID da entidade
- `startDate`: Data inicial
- `endDate`: Data final
- `ipAddress`: Endereço IP
- `success`: true/false
- `limit`: Limite de resultados (padrão: 100)
- `offset`: Offset para paginação
- `orderBy`: Campo para ordenação
- `order`: asc/desc

### Estatísticas

```http
GET /api/activity-tracking/stats
```

Retorna estatísticas agregadas:
- Total de atividades
- Usuários únicos
- Sessões únicas
- Duração total e média
- Atividades por tipo
- Atividades por hora
- Top páginas visitadas
- Top usuários ativos
- Taxa de erro
- Breakdown por dispositivo/navegador/localização

### Sessões Ativas

```http
GET /api/activity-tracking/sessions/active
```

Lista todas as sessões atualmente ativas no sistema.

### Atividades Suspeitas

```http
GET /api/activity-tracking/suspicious
```

Retorna atividades que podem indicar problemas de segurança:
- Logins falhados
- Erros 401/403
- Requisições muito longas
- Respostas muito grandes

### Trilha de Auditoria

```http
GET /api/activity-tracking/entities/:entityType/:entityId/audit-trail
```

Obtém histórico completo de alterações em uma entidade específica.

### Exportação

```http
GET /api/activity-tracking/export
```

Exporta logs filtrados para CSV.

### Relatório de Conformidade

```http
GET /api/activity-tracking/compliance-report
```

Gera relatório detalhado para auditoria e conformidade.

## Permissões

O acesso aos logs de auditoria é restrito a usuários com roles específicas:

- `system_admin`: Acesso total
- `admin`: Acesso total
- `auditor`: Acesso de leitura
- `manager`: Acesso de leitura

Usuários comuns podem acessar apenas:
- Suas próprias sessões
- Seu próprio resumo de atividades

## Configuração

### Variáveis de Ambiente

```env
# Tempo de inatividade para timeout de sessão (minutos)
SESSION_TIMEOUT=30

# Dias para manter logs antes da limpeza automática
ACTIVITY_LOG_RETENTION_DAYS=90

# Habilitar tracking detalhado
ENABLE_DETAILED_TRACKING=true
```

### Limpeza Automática

O sistema executa limpeza automática de:
- Sessões inativas a cada 5 minutos
- Logs antigos conforme configurado

## Segurança e Privacidade

### Dados Sensíveis

O sistema NÃO registra:
- Senhas
- Tokens de autenticação
- Dados de cartão de crédito
- Informações pessoais sensíveis

### Sanitização

Antes de registrar, o middleware remove campos sensíveis:

```typescript
const sanitizedBody = { ...req.body };
delete sanitizedBody.password;
delete sanitizedBody.token;
delete sanitizedBody.secret;
```

### Conformidade LGPD

O sistema foi projetado considerando:
- Direito ao esquecimento (limpeza de logs)
- Minimização de dados
- Transparência no uso
- Segurança no armazenamento

## Monitoramento e Alertas

### Métricas Importantes

1. **Taxa de erro**: Porcentagem de requisições com erro
2. **Logins falhados**: Tentativas de acesso não autorizado
3. **Sessões simultâneas**: Usuários ativos no momento
4. **Tempo de resposta**: Performance das requisições

### Alertas Recomendados

- Múltiplos logins falhados do mesmo IP
- Taxa de erro acima de 5%
- Acesso a dados sensíveis fora do horário
- Downloads em massa de dados

## Exemplos de Uso

### Buscar atividades de um usuário

```javascript
const response = await fetch('/api/activity-tracking/activities?userId=123&limit=50');
const { data } = await response.json();
```

### Obter estatísticas do último mês

```javascript
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 1);

const response = await fetch(`/api/activity-tracking/stats?startDate=${startDate.toISOString()}`);
const { data: stats } = await response.json();
```

### Verificar atividades suspeitas

```javascript
const response = await fetch('/api/activity-tracking/suspicious');
const { data: suspiciousActivities } = await response.json();
```

## Manutenção

### Backup

Recomenda-se backup regular das tabelas:
- `user_activity`
- `activity_sessions`
- `activity_summaries`

### Performance

Para otimizar performance:
1. Criar índices apropriados
2. Particionar tabelas por data
3. Arquivar logs antigos
4. Usar cache para consultas frequentes

### Troubleshooting

**Problema**: Logs não estão sendo criados
- Verificar se o middleware está registrado
- Verificar conexão com banco de dados
- Verificar logs de erro do servidor

**Problema**: Performance degradada
- Verificar tamanho das tabelas
- Executar limpeza de logs antigos
- Otimizar queries com índices

## Roadmap

- [ ] Dashboard em tempo real
- [ ] Integração com ferramentas de SIEM
- [ ] Machine Learning para detecção de anomalias
- [ ] Webhooks para eventos importantes
- [ ] Arquivamento automático em S3 