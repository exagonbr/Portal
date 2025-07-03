# Redis e Filas de Mensageria - Portal Sabercon

Este guia documenta a implementação de Redis para cache e sistema de filas de mensageria para operações assíncronas no Portal Sabercon.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Cache Redis](#sistema-de-cache-redis)
3. [Sistema de Filas](#sistema-de-filas)
4. [Integração com Serviços](#integração-com-serviços)
5. [Configuração](#configuração)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

### Arquitetura Implementada

```
Frontend (React)
    ↓
Cache Service (Memory + Redis)
    ↓
Queue Service (Background Jobs)
    ↓
API Backend (Node.js)
    ↓
Redis Server
```

### Benefícios

- **Performance**: Cache em múltiplas camadas (memória + Redis)
- **Escalabilidade**: Processamento assíncrono de operações pesadas
- **Confiabilidade**: Retry automático e tratamento de falhas
- **Observabilidade**: Logging e métricas detalhadas

## 🗄️ Sistema de Cache Redis

### Implementação Híbrida

O sistema utiliza uma abordagem híbrida com dois níveis de cache:

1. **Cache em Memória** (L1): Acesso ultra-rápido
2. **Cache Redis** (L2): Persistente e compartilhado

```typescript
// Exemplo de uso
import { cacheService, withCache, CacheKeys, CacheTTL } from '../services';

// Cache automático com fallback
const users = await withCache(
  CacheKeys.USER_LIST('filters'),
  () => fetchUsersFromAPI(),
  CacheTTL.MEDIUM
);
```

### Estratégias de Cache

#### Cache-Aside Pattern
```typescript
// Busca no cache primeiro, depois na API
const user = await cacheService.getOrSet(
  CacheKeys.USER_BY_ID(userId),
  () => userService.getUserById(userId),
  CacheTTL.MEDIUM
);
```

#### Write-Through Pattern
```typescript
// Atualiza cache automaticamente após modificação
await userService.updateUser(userId, data);
await invalidateUserCache(userId); // Limpa cache relacionado
```

### Chaves de Cache Organizadas

```typescript
export const CacheKeys = {
  // Usuários
  USER_BY_ID: (id: string) => `user:${id}`,
  USER_LIST: (filters: string) => `users:list:${filters}`,
  USER_COURSES: (id: string) => `user:courses:${id}`,
  USER_STATS: 'users:stats',

  // Roles
  ROLE_BY_ID: (id: string) => `role:${id}`,
  ACTIVE_ROLES: 'roles:active',
  ROLE_STATS: 'roles:stats',

  // Instituições
  INSTITUTION_BY_ID: (id: string) => `institution:${id}`,
  ACTIVE_INSTITUTIONS: 'institutions:active',

  // Cursos
  COURSE_BY_ID: (id: string) => `course:${id}`,
  COURSES_BY_INSTITUTION: (instId: string) => `courses:institution:${instId}`
};
```

### TTL (Time To Live) Configurado

```typescript
export const CacheTTL = {
  SHORT: 60,        // 1 minuto - dados dinâmicos
  MEDIUM: 300,      // 5 minutos - dados normais
  LONG: 1800,       // 30 minutos - dados estáticos
  VERY_LONG: 3600,  // 1 hora - configurações
  STATS: 900        // 15 minutos - estatísticas
};
```

### Invalidação Inteligente

```typescript
// Invalida cache específico após operações
await userService.updateUser(userId, data);
// ↓ Automaticamente invalida:
// - user:123
// - user:profile:123
// - users:list:* (todos os filtros)
// - users:stats
```

## 🔄 Sistema de Filas

### Tipos de Jobs Suportados

```typescript
export const JobTypes = {
  // Processamento de dados
  USER_IMPORT: 'user:import',
  USER_EXPORT: 'user:export',
  USER_BULK_UPDATE: 'user:bulk_update',

  // Comunicação
  EMAIL_SEND: 'email:send',
  EMAIL_BULK_SEND: 'email:bulk_send',
  NOTIFICATION_PUSH: 'notification:push',

  // Relatórios
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',

  // Manutenção
  BACKUP_CREATE: 'backup:create',
  SYNC_CACHE_REFRESH: 'sync:cache_refresh',
  FILE_CLEANUP: 'file:cleanup'
};
```

### Adicionando Jobs à Fila

```typescript
// Importação de usuários (operação pesada)
const jobId = await addUserImportJob(file, {
  priority: 5,        // Alta prioridade
  maxAttempts: 1,     // Não retry (arquivo pode ser corrompido)
  timeout: 300000     // 5 minutos
});

// Envio de email (operação crítica)
const jobId = await addEmailJob(
  ['user@example.com'],
  'Bem-vindo!',
  'Conteúdo do email',
  'welcome-template',
  {
    priority: 7,      // Prioridade muito alta
    maxAttempts: 3,   // Retry até 3 vezes
    timeout: 60000    // 1 minuto
  }
);
```

### Processamento Automático

```typescript
// O sistema processa jobs automaticamente
queueService.registerHandler(JobTypes.USER_IMPORT, async (data, job) => {
  console.log(`Processando importação: ${job.id}`);
  
  try {
    // Processa arquivo de importação
    const result = await processImportFile(data.file);
    
    // Invalida cache relacionado
    await invalidateUserCache();
    
    console.log(`Importação concluída: ${result.imported} usuários`);
  } catch (error) {
    console.log('Erro na importação:', error);
    throw error; // Job será marcado como falhado
  }
});
```

### Estados dos Jobs

```typescript
type JobStatus = 
  | 'pending'     // Aguardando processamento
  | 'processing'  // Sendo processado
  | 'completed'   // Concluído com sucesso
  | 'failed'      // Falhou (após esgotar tentativas)
  | 'delayed';    // Atrasado (retry programado)
```

### Monitoramento de Filas

```typescript
// Estatísticas em tempo real
const stats = await queueService.getStats();
console.log({
  pending: stats.pending,      // Jobs aguardando
  processing: stats.processing, // Jobs em execução
  completed: stats.completed,   // Jobs concluídos
  failed: stats.failed,        // Jobs falhados
  total: stats.total           // Total de jobs
});

// Lista jobs por status
const failedJobs = await queueService.getJobs('failed', 10);
const pendingJobs = await queueService.getJobs('pending', 20);
```

## 🔧 Integração com Serviços

### UserService com Cache e Filas

```typescript
class UserService {
  // Busca com cache automático
  async getUsers(filters?: UserFilterDto): Promise<ListResponse<UserResponseDto>> {
    const cacheKey = CacheKeys.USER_LIST(JSON.stringify(filters || {}));
    
    return await withCache(cacheKey, async () => {
      // Busca na API apenas se não estiver em cache
      const response = await apiClient.get(this.baseEndpoint, filters);
      return response.data;
    }, CacheTTL.MEDIUM);
  }

  // Criação com invalidação de cache
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    const response = await apiClient.post(this.baseEndpoint, userData);
    
    // Invalida cache relacionado
    await invalidateUserCache();
    
    return response.data;
  }

  // Importação assíncrona via fila
  async importUsers(file: File): Promise<{ jobId: string }> {
    const jobId = await addUserImportJob(file, {
      priority: 5,
      maxAttempts: 1,
      timeout: 300000
    });

    return { jobId };
  }

  // Exportação assíncrona via fila
  async exportUsers(filters?: UserFilterDto): Promise<{ jobId: string }> {
    const jobId = await addUserExportJob(filters, 'csv', {
      priority: 3,
      maxAttempts: 2,
      timeout: 180000
    });

    return { jobId };
  }
}
```

### Invalidação Automática

```typescript
// Após qualquer operação de escrita, o cache é invalidado automaticamente
await userService.createUser(userData);    // ✓ Invalida cache de usuários
await userService.updateUser(id, data);    // ✓ Invalida cache específico
await userService.deleteUser(id);          // ✓ Invalida cache específico
await roleService.createRole(roleData);    // ✓ Invalida cache de roles
```

## ⚙️ Configuração

### Configuração de Desenvolvimento

```typescript
// Configuração automática para desenvolvimento
configureServices({
  cache: {
    enabled: true,
    defaultTTL: 300,      // 5 minutos
    prefix: 'dev_portal:'
  },
  queue: {
    enabled: true,
    pollInterval: 5000    // Verifica filas a cada 5s
  }
});
```

### Configuração de Produção

```typescript
// Configuração otimizada para produção
configureServices({
  cache: {
    enabled: true,
    defaultTTL: 600,      // 10 minutos
    prefix: 'portal:'
  },
  queue: {
    enabled: true,
    pollInterval: 10000   // Verifica filas a cada 10s
  }
});
```

### Variáveis de Ambiente

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Cache Configuration
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=300
CACHE_PREFIX=portal_sabercon:

# Queue Configuration
QUEUE_ENABLED=true
QUEUE_POLL_INTERVAL=5000
QUEUE_MAX_CONCURRENT_JOBS=3
```

## 📊 Monitoramento

### Métricas de Cache

```typescript
// Estatísticas do cache
const cacheStats = cacheService.getStats();
console.log({
  memoryEntries: cacheStats.memoryEntries,  // Entradas em memória
  memorySize: cacheStats.memorySize,        // Tamanho em bytes
  enabled: cacheStats.enabled,              // Se está habilitado
  defaultTTL: cacheStats.defaultTTL         // TTL padrão
});
```

### Métricas de Filas

```typescript
// Estatísticas das filas
const queueStats = await queueService.getStats();
console.log({
  pending: queueStats.pending,      // Jobs pendentes
  processing: queueStats.processing, // Jobs em execução
  completed: queueStats.completed,   // Jobs concluídos
  failed: queueStats.failed,        // Jobs falhados
  total: queueStats.total           // Total
});
```

### Health Check Completo

```typescript
const health = await checkServicesHealth();
console.log({
  api: health.api,        // API respondendo
  auth: health.auth,      // Autenticação funcionando
  cache: health.cache,    // Cache operacional
  queue: health.queue,    // Filas operacionais
  timestamp: health.timestamp
});
```

### Alertas Automáticos

```typescript
// Monitoramento automático com alertas
setupQueueMonitoring(); // Monitora a cada 5 minutos

// Alertas configurados:
// - Mais de 10 jobs falhados
// - Mais de 50 jobs pendentes
// - Tempo de processamento muito alto
```

## 🛠️ Utilitários de Desenvolvimento

### Console DevUtils

No ambiente de desenvolvimento, utilitários são expostos no console:

```javascript
// Disponível em window.portalDevUtils
portalDevUtils.clearCache();        // Limpa todo o cache
portalDevUtils.getCacheStats();     // Estatísticas do cache
portalDevUtils.getQueueStats();     // Estatísticas das filas
portalDevUtils.pauseQueue();        // Pausa processamento
portalDevUtils.resumeQueue();       // Resume processamento
portalDevUtils.warmupCache();       // Pré-aquece cache
portalDevUtils.checkHealth();       // Verifica saúde dos serviços
```

### Debugging

```typescript
// Logs detalhados em desenvolvimento
console.debug('[Cache] Hit:', cacheKey);
console.debug('[Cache] Miss:', cacheKey);
console.debug('[Queue] Job added:', jobId);
console.debug('[Queue] Job completed:', jobId);
console.debug('[Queue] Job failed:', jobId, error);
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Cache não está funcionando
```typescript
// Verificar se está habilitado
const stats = cacheService.getStats();
console.log('Cache enabled:', stats.enabled);

// Verificar conectividade com Redis
const health = await checkServicesHealth();
console.log('Cache health:', health.cache);
```

#### Jobs não estão sendo processados
```typescript
// Verificar se processamento está ativo
const isProcessing = queueService.isProcessing;
console.log('Queue processing:', isProcessing);

// Verificar jobs pendentes
const stats = await queueService.getStats();
console.log('Pending jobs:', stats.pending);

// Reprocessar job falhado
await queueService.retryJob(jobId);
```

#### Performance degradada
```typescript
// Verificar tamanho do cache
const stats = cacheService.getStats();
if (stats.memoryEntries > 1000) {
  console.warn('Cache muito grande, considere limpeza');
  await cacheService.clear();
}

// Verificar jobs acumulados
const queueStats = await queueService.getStats();
if (queueStats.pending > 100) {
  console.warn('Muitos jobs pendentes');
}
```

### Comandos de Manutenção

```typescript
// Limpeza completa
await clearAllData();

// Limpeza seletiva
await cacheService.invalidatePattern('users:*');
await queueService.cleanJobs('completed', new Date(Date.now() - 24*60*60*1000));

// Reinicialização
await initializeServices();
```

### Logs de Erro

```typescript
// Logs estruturados para debugging
console.log('[Cache] Redis connection failed:', error);
console.log('[Queue] Job processing failed:', { jobId, error, attempts });
console.log('[API] Request failed with cache miss:', { url, error });
```

## 📈 Otimizações

### Cache Warming

```typescript
// Pré-aquecimento automático na inicialização
await warmupCache(); // Carrega dados frequentemente acessados

// Pré-aquecimento manual
await cacheService.warmup([
  {
    key: CacheKeys.ACTIVE_ROLES,
    fetcher: () => roleService.getActiveRoles(),
    ttl: CacheTTL.LONG
  }
]);
```

### Batch Processing

```typescript
// Processamento em lote para eficiência
const batchJobs = users.map(user => ({
  type: JobTypes.EMAIL_SEND,
  data: { to: user.email, template: 'welcome' }
}));

await queueService.addBatch(batchJobs);
```

### Cache Partitioning

```typescript
// Particionamento por contexto
const userCacheKey = `${CacheKeys.USER_BY_ID(userId)}:${userRole}`;
const institutionCacheKey = `${CacheKeys.INSTITUTION_BY_ID(instId)}:${region}`;
```

## 🔮 Roadmap

### Próximas Implementações

1. **Cache Distribuído**: Sincronização entre múltiplas instâncias
2. **Queue Priorities**: Filas com prioridades diferentes
3. **Metrics Dashboard**: Interface visual para monitoramento
4. **Auto-scaling**: Ajuste automático baseado na carga
5. **Cache Compression**: Compressão de dados grandes
6. **Dead Letter Queue**: Fila para jobs que falharam definitivamente

---

**Versão**: 2.0.0  
**Última atualização**: Janeiro 2025  
**Autor**: Kilo Code FullStack