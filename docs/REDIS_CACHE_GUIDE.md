# 🚀 Guia do Sistema de Cache Redis - Portal Sabercon

Este guia documenta o sistema completo de cache Redis implementado no Portal Sabercon, incluindo cache dinâmico, estático, warmup automático e query caching.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Tipos de Cache](#tipos-de-cache)
4. [Como Usar](#como-usar)
5. [Middleware de Cache](#middleware-de-cache)
6. [Query Caching](#query-caching)
7. [Cache Warmup](#cache-warmup)
8. [Invalidação de Cache](#invalidação-de-cache)
9. [Monitoramento](#monitoramento)
10. [Exemplos Práticos](#exemplos-práticos)

## 🎯 Visão Geral

O sistema de cache Redis do Portal Sabercon é uma solução completa que oferece:

- **Cache Dinâmico**: Para dados que mudam frequentemente (TTL curto)
- **Cache Estático**: Para dados que raramente mudam (TTL longo)
- **Query Caching**: Cache automático de queries de banco de dados
- **Cache Warmup**: Pré-aquecimento automático dos dados mais importantes
- **Invalidação Inteligente**: Invalidação por tags e dependências
- **Middleware Automático**: Cache transparente em rotas HTTP

### Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Middleware    │───▶│   CacheService  │
│   (React)       │    │   de Cache      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │ QueryCacheService│◀────────────┘
                       │                 │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Server  │
                       │                 │
                       └─────────────────┘
```

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0
REDIS_TLS=false
REDIS_ENABLED=true

# Cache Configuration
CACHE_PREFIX=portal_cache:
CACHE_DEFAULT_TTL=300
CACHE_WARMUP_ON_START=true
CACHE_AUTO_INVALIDATE=true
```

### Inicialização

O sistema é inicializado automaticamente no startup do servidor:

```typescript
import { CacheWarmupService } from './services/CacheWarmupService';
import { cacheService } from './services/CacheService';

// Inicializar warmup service
await CacheWarmupService.initialize();

// Executar warmup inicial
if (process.env.CACHE_WARMUP_ON_START === 'true') {
  await CacheWarmupService.warmupCache();
}

// Agendar warmup automático
CacheWarmupService.scheduleWarmup();
```

## 🗂️ Tipos de Cache

### 1. Cache Dinâmico
Para dados que mudam frequentemente (5 minutos TTL):

```typescript
import { cacheService } from '../services/CacheService';

// Armazenar dados dinâmicos
await cacheService.dynamicCache('user_stats', userStats, {
  tags: ['users', 'stats']
});
```

### 2. Cache Estático
Para dados que raramente mudam (24 horas TTL):

```typescript
// Armazenar dados estáticos
await cacheService.staticCache('system_config', config, {
  tags: ['config', 'static']
});
```

### 3. Cache com TTL Customizado
Para controle fino do tempo de vida:

```typescript
import { CacheTTL } from '../services/CacheService';

await cacheService.set('custom_data', data, {
  ttl: CacheTTL.LONG, // 1 hora
  tags: ['custom'],
  compress: true // Compressão para dados grandes
});
```

## 🚀 Como Usar

### Cache Básico

```typescript
import { cacheService, CacheKeys, CacheTTL } from '../services/CacheService';

// Obter ou definir cache
const userData = await cacheService.getOrSet(
  CacheKeys.USER_BY_ID(userId),
  async () => {
    // Esta função só executa se não houver cache
    return await fetchUserFromDatabase(userId);
  },
  {
    ttl: CacheTTL.MEDIUM,
    tags: ['users', `user:${userId}`]
  }
);
```

### Cache com Fallback

```typescript
// Usar função utilitária
import { withCache } from '../services/CacheService';

const courses = await withCache(
  'popular_courses',
  () => fetchPopularCourses(),
  {
    ttl: CacheTTL.LONG,
    tags: ['courses', 'popular']
  }
);
```

## 🔗 Middleware de Cache

### Cache Automático em Rotas

```typescript
import { CacheMiddleware } from '../middleware/cacheMiddleware';

// Cache automático para GET requests
router.get('/users', 
  CacheMiddleware.userCache(CacheTTL.MEDIUM),
  async (req, res) => {
    // Sua lógica aqui
  }
);

// Cache para dados estáticos
router.get('/config',
  CacheMiddleware.staticCache(CacheTTL.STATIC),
  async (req, res) => {
    // Dados de configuração
  }
);
```

### Invalidação Automática

```typescript
import { autoInvalidateCache } from '../middleware/cacheMiddleware';

// Invalidar cache automaticamente após modificações
router.post('/users',
  autoInvalidateCache(['users', 'stats']),
  async (req, res) => {
    // Criar usuário
    // Cache será invalidado automaticamente
  }
);
```

### Cache Baseado em Role

```typescript
import { roleBasedCache } from '../middleware/cacheMiddleware';

// Cache diferente para cada role
router.get('/dashboard',
  roleBasedCache(['admin', 'teacher'], CacheTTL.SHORT),
  async (req, res) => {
    // Dashboard específico por role
  }
);
```

## 🗃️ Query Caching

### Cache Automático de Queries

```typescript
import { QueryCacheService } from '../services/QueryCacheService';

// Cache para queries de usuários
const users = await QueryCacheService.cacheUserQuery(
  async () => {
    return db('users')
      .select('*')
      .where('active', true)
      .limit(100);
  },
  { active: true }, // Filtros para chave única
  CacheTTL.MEDIUM
);

// Cache para queries de cursos
const courses = await QueryCacheService.cacheCourseQuery(
  () => fetchCoursesFromDB(filters),
  filters,
  CacheTTL.LONG
);
```

### Cache de Estatísticas

```typescript
// Cache com chave baseada em tempo
const stats = await QueryCacheService.cacheStatsQuery(
  async () => {
    return {
      totalUsers: await db('users').count(),
      totalCourses: await db('courses').count()
    };
  },
  'daily', // Período
  CacheTTL.SHORT
);
```

### Cache de Dashboard

```typescript
// Cache personalizado por usuário
const dashboardData = await QueryCacheService.cacheDashboardQuery(
  () => fetchDashboardData(userId),
  userId,
  CacheTTL.SHORT
);
```

## 🔥 Cache Warmup

### Warmup Automático

O sistema executa warmup automático:

- **Startup**: Warmup completo na inicialização
- **Agendado**: Warmup a cada 6 horas
- **Incremental**: Warmup de dados expirando a cada 30 minutos
- **Alta Prioridade**: Warmup de dados críticos a cada hora

### Registrar Tarefas de Warmup

```typescript
import { CacheWarmupService } from '../services/CacheWarmupService';

// Registrar tarefa customizada
CacheWarmupService.registerTask({
  key: 'my_custom_warmup',
  priority: 'high',
  ttl: CacheTTL.LONG,
  tags: ['custom'],
  task: async () => {
    const data = await fetchImportantData();
    await cacheService.set('important_data', data);
  },
  dependencies: ['system_config'] // Executar após outras tarefas
});
```

### Warmup Manual

```typescript
// Warmup completo
await CacheWarmupService.warmupCache();

// Warmup por prioridade
await CacheWarmupService.warmupCache({ 
  priority: 'high',
  maxConcurrent: 3 
});

// Warmup incremental
await CacheWarmupService.incrementalWarmup();
```

## 🗑️ Invalidação de Cache

### Invalidação por Tags

```typescript
// Invalidar todos os itens com uma tag
await cacheService.invalidateByTag('users');

// Invalidar por múltiplas tags
await Promise.all([
  cacheService.invalidateByTag('users'),
  cacheService.invalidateByTag('stats')
]);
```

### Invalidação por Entidade

```typescript
// Invalidar cache relacionado a usuários
await QueryCacheService.invalidateByEntity('user');

// Invalidar cache de cursos
await QueryCacheService.invalidateByEntity('course');
```

### Invalidação por Tabela

```typescript
// Invalidar quando tabela específica muda
await QueryCacheService.invalidateByTable('users');
await QueryCacheService.invalidateByTables(['users', 'user_roles']);
```

### Invalidação Manual

```typescript
// Remover item específico
await cacheService.delete(CacheKeys.USER_BY_ID(userId));

// Remover por padrão
await cacheService.deleteByPattern('user:*');

// Limpar todo o cache
await cacheService.clear();
```

## 📊 Monitoramento

### Estatísticas do Cache

```typescript
// Estatísticas gerais
const stats = cacheService.getStats();
console.log({
  hits: stats.hits,
  misses: stats.misses,
  hitRatio: stats.hits / (stats.hits + stats.misses),
  memoryUsage: stats.memoryUsage
});

// Estatísticas de queries
const queryStats = QueryCacheService.getStats();
console.log({
  totalQueries: queryStats.totalQueries,
  cacheHitRatio: queryStats.cacheHitRatio,
  avgExecutionTime: queryStats.avgExecutionTime
});
```

### Health Check

```typescript
// Verificar saúde do cache
const health = await cacheService.healthCheck();
console.log(health.status); // 'healthy', 'degraded', 'unhealthy'

// Verificar saúde do warmup
const warmupHealth = await CacheWarmupService.healthCheck();
console.log(warmupHealth.details);
```

### Análise de Padrões

```typescript
// Analisar padrões de uso
const analysis = QueryCacheService.analyzeUsagePatterns();
console.log({
  hitRatio: analysis.hitRatio,
  recommendations: analysis.recommendations
});
```

## 💡 Exemplos Práticos

### 1. Cache de Lista de Usuários

```typescript
// Em um controller
router.get('/users', 
  CacheMiddleware.userCache(),
  async (req, res) => {
    const { page, limit, search } = req.query;
    
    const users = await QueryCacheService.cacheUserQuery(
      async () => {
        let query = db('users').select('*');
        
        if (search) {
          query = query.where('name', 'ilike', `%${search}%`);
        }
        
        return query
          .limit(limit)
          .offset((page - 1) * limit);
      },
      { page, limit, search }, // Filtros para chave única
      CacheTTL.MEDIUM
    );
    
    res.json({ success: true, data: users });
  }
);
```

### 2. Cache de Dashboard com Invalidação

```typescript
// Cache de dashboard
router.get('/dashboard',
  async (req, res) => {
    const userId = req.user.id;
    
    const dashboardData = await cacheService.getOrSet(
      `dashboard:${userId}`,
      async () => {
        const [courses, progress, announcements] = await Promise.all([
          fetchUserCourses(userId),
          fetchUserProgress(userId),
          fetchAnnouncements()
        ]);
        
        return { courses, progress, announcements };
      },
      {
        ttl: CacheTTL.SHORT,
        tags: ['dashboard', `user:${userId}`, 'courses', 'announcements']
      }
    );
    
    res.json({ success: true, data: dashboardData });
  }
);

// Invalidar dashboard quando curso é atualizado
router.put('/courses/:id',
  autoInvalidateCache(['courses', 'dashboard']),
  async (req, res) => {
    // Atualizar curso
    // Cache será invalidado automaticamente
  }
);
```

### 3. Cache de Configuração do Sistema

```typescript
// Cache de configuração (dados estáticos)
const getSystemConfig = async () => {
  return cacheService.getOrSet(
    CacheKeys.STATIC_CONFIG,
    async () => {
      return {
        app_name: 'Portal Sabercon',
        features: await db('features').where('enabled', true),
        limits: await db('system_limits').first(),
        theme: await db('theme_config').first()
      };
    },
    {
      ttl: CacheTTL.STATIC, // 7 dias
      tags: ['config', 'static']
    }
  );
};
```

### 4. Cache com Compressão

```typescript
// Para dados grandes, usar compressão
const largeDataset = await cacheService.set(
  'large_report_data',
  reportData,
  {
    ttl: CacheTTL.LONG,
    tags: ['reports'],
    compress: true // Ativar compressão
  }
);
```

### 5. Warmup Customizado

```typescript
// Registrar warmup para dados específicos da aplicação
CacheWarmupService.registerTask({
  key: 'popular_content',
  priority: 'medium',
  ttl: CacheTTL.LONG,
  tags: ['content', 'popular'],
  task: async () => {
    // Pré-carregar conteúdo popular
    const popularBooks = await db('books')
      .orderBy('download_count', 'desc')
      .limit(50);
    
    const popularCourses = await db('courses')
      .orderBy('enrollment_count', 'desc')
      .limit(50);
    
    await Promise.all([
      cacheService.staticCache('popular_books', popularBooks),
      cacheService.staticCache('popular_courses', popularCourses)
    ]);
  }
});
```

## 🔧 Configurações Avançadas

### TTL Dinâmico

```typescript
// TTL baseado no tipo de dados
const getTTL = (dataType: string) => {
  switch (dataType) {
    case 'user_session': return CacheTTL.VERY_SHORT;
    case 'user_profile': return CacheTTL.MEDIUM;
    case 'course_content': return CacheTTL.LONG;
    case 'system_config': return CacheTTL.STATIC;
    default: return CacheTTL.SHORT;
  }
};
```

### Cache Condicional

```typescript
// Cache apenas para usuários específicos
const conditionalUserCache = (roles: string[]) => {
  return conditionalCache(
    (req) => {
      const userRole = req.user?.role;
      return roles.includes(userRole);
    },
    { ttl: CacheTTL.MEDIUM }
  );
};

router.get('/admin-data',
  conditionalUserCache(['admin', 'manager']),
  async (req, res) => {
    // Dados administrativos com cache
  }
);
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Cache não funciona**
   - Verificar se Redis está rodando
   - Verificar variável `REDIS_ENABLED=true`
   - Verificar logs de conexão

2. **Hit ratio baixo**
   - Analisar padrões de acesso
   - Ajustar TTL
   - Verificar invalidação excessiva

3. **Memória alta no Redis**
   - Implementar limpeza automática
   - Reduzir TTL de dados grandes
   - Usar compressão

### Logs de Debug

```typescript
// Ativar logs detalhados
process.env.LOG_LEVEL = 'debug';

// Verificar estatísticas
console.log('Cache Stats:', cacheService.getStats());
console.log('Query Stats:', QueryCacheService.getStats());
console.log('Warmup Stats:', CacheWarmupService.getStats());
```

## 🎯 Melhores Práticas

1. **Use tags apropriadas** para facilitar invalidação
2. **Escolha TTL adequado** para cada tipo de dado
3. **Monitore hit ratio** regularmente
4. **Use compressão** para dados grandes
5. **Implemente warmup** para dados críticos
6. **Invalide cache** após modificações
7. **Use middleware** para cache automático
8. **Monitore performance** do Redis

## 📈 Performance

Com o sistema de cache implementado, você pode esperar:

- **Redução de 70-90%** no tempo de resposta para dados cacheados
- **Diminuição significativa** na carga do banco de dados
- **Melhor experiência** do usuário com carregamento mais rápido
- **Escalabilidade** melhorada para alto volume de requests

---

Este sistema de cache Redis fornece uma base sólida para melhorar significativamente a performance do Portal Sabercon, com funcionalidades avançadas e fácil de usar! 🚀 