# Otimizações de Performance - Portal Sabercon Backend

## Problema Identificado
Requisições em produção estão resultando em timeout (504 Gateway Timeout), especialmente na rota:
```
GET https://portal.sabercon.com.br/api/institutions?active=true&limit=10&sortBy=name&sortOrder=asc
```

## Otimizações Implementadas

### 1. Configuração do Pool de Conexões
Aumentamos os limites do pool de conexões para suportar mais requisições simultâneas:

```js
pool: {
  min: 5,                          // Aumentado de 2 para 5
  max: 30,                         // Aumentado de 20 para 30
  idleTimeoutMillis: 60000,        // Aumentado para 60 segundos
  acquireTimeoutMillis: 120000,    // Aumentado para 120 segundos
  createTimeoutMillis: 30000,      // Adicionado
  destroyTimeoutMillis: 5000,      // Mantido
  reapIntervalMillis: 1000,        // Mantido
  createRetryIntervalMillis: 200,  // Adicionado
}
```

### 2. Otimização de Consultas SQL
- Adicionado timeout explícito nas consultas para evitar bloqueios longos
- Otimizado método `findAllWithFilters` para usar consultas parametrizadas
- Melhorado o método `count` para evitar contagens lentas em tabelas grandes

### 3. Paralelização de Operações
- Executando consultas de contagem e busca em paralelo usando `Promise.all`
- Otimizado o mapeamento de DTOs

## Recomendações Adicionais

### 1. Implementar Cache Redis
Implementar cache Redis para armazenar resultados de consultas frequentes:

```js
// Exemplo de implementação com Redis
const redis = require('redis');
const { promisify } = require('util');
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

// No método findInstitutionsWithFilters
const cacheKey = `institutions:${search}:${type}:${is_active}:${page}:${limit}:${sortBy}:${sortOrder}`;
const cachedResult = await getAsync(cacheKey);
if (cachedResult) {
  return JSON.parse(cachedResult);
}

// Após obter o resultado
await setAsync(cacheKey, JSON.stringify(result), 'EX', 300); // Cache por 5 minutos
```

### 2. Adicionar Índices no Banco de Dados
Adicionar índices nas colunas frequentemente usadas em consultas:

```sql
-- Adicionar índice na coluna name
CREATE INDEX idx_institutions_name ON institutions(name);

-- Adicionar índice na coluna code
CREATE INDEX idx_institutions_code ON institutions(code);

-- Adicionar índice na coluna type
CREATE INDEX idx_institutions_type ON institutions(type);

-- Adicionar índice na coluna status
CREATE INDEX idx_institutions_status ON institutions(status);
```

### 3. Monitoramento e Diagnóstico
- Implementar logging detalhado de tempo de execução das consultas
- Configurar alertas para consultas lentas
- Usar ferramentas como New Relic ou DataDog para monitorar performance

### 4. Estratégia de Paginação Otimizada
Implementar paginação baseada em cursor em vez de offset para melhor performance em tabelas grandes:

```js
// Exemplo de paginação por cursor
async findAllWithCursor(lastId, limit) {
  return this.db(this.tableName)
    .where('id', '>', lastId)
    .orderBy('id')
    .limit(limit);
}
```

## Próximos Passos
1. Monitorar o efeito das otimizações implementadas
2. Implementar cache Redis para consultas frequentes
3. Adicionar índices no banco de dados
4. Considerar a migração para paginação por cursor em endpoints críticos
5. Avaliar a necessidade de aumentar recursos do servidor em produção 