# 🚨 Sistema Redis de Cache e Limpeza de Emergência

## 📋 Visão Geral

Este documento descreve o sistema completo de cache Redis e limpeza de emergência implementado no Portal Educacional. O sistema foi projetado para:

- **Cache de Sessões**: Gerenciamento eficiente de sessões de usuário
- **Cache de Tokens**: Armazenamento seguro de tokens de autenticação
- **Cache Estático**: Armazenamento de conteúdos estáticos para melhor performance
- **Detecção de Loops**: Identificação automática de condições problemáticas
- **Limpeza de Emergência**: Limpeza completa do sistema em caso de problemas

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **RedisManager** (`backend/src/config/redis.ts`)
   - Gerenciamento de conexões Redis
   - Limpeza automática de emergência
   - Detecção de loops
   - Monitoramento de saúde

2. **EmergencyCleanupService** (`src/services/emergencyCleanupService.ts`)
   - Limpeza de localStorage, sessionStorage, cookies
   - Limpeza de IndexedDB e cache do navegador
   - Notificação ao servidor
   - Redirecionamento automático

3. **RedisStaticCacheService** (`src/services/redisStaticCacheService.ts`)
   - Cache especializado para conteúdos estáticos
   - Compressão de dados
   - Estatísticas de hit/miss
   - Pré-aquecimento de cache

4. **useEmergencyCleanup** (`src/hooks/useEmergencyCleanup.ts`)
   - Hook React para integração com componentes
   - Detecção automática de loops
   - Limpeza automática quando necessário

5. **EmergencyCleanupButton** (`src/components/debug/EmergencyCleanupButton.tsx`)
   - Interface visual para limpeza manual
   - Confirmação de segurança
   - Exibição de resultados

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Redis Principal
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha
REDIS_DB=0
REDIS_TLS=false

# Redis para Cache Estático
REDIS_STATIC_CACHE_DB=2

# Redis para Filas
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1
```

### Instalação de Dependências

```bash
npm install redis ioredis
```

## 🚀 Uso do Sistema

### 1. Cache de Sessões

```typescript
import { SessionService } from '@/backend/src/services/SessionService';

// Criar sessão
const { sessionId, refreshToken } = await SessionService.createSession(
  user, 
  clientInfo, 
  remember
);

// Validar sessão
const sessionData = await SessionService.validateSession(sessionId);

// Destruir sessão
await SessionService.destroySession(sessionId);
```

### 2. Cache Estático

```typescript
import { staticCache } from '@/services/redisStaticCacheService';

// Armazenar conteúdo
await staticCache.set('minha-chave', dados, 3600); // 1 hora

// Recuperar conteúdo
const dados = await staticCache.get('minha-chave');

// Cache com fallback
const resultado = await staticCache.withFallback(
  'api-dados',
  async () => await buscarDadosAPI(),
  1800 // 30 minutos
);
```

### 3. Limpeza de Emergência (React)

```typescript
import { useEmergencyCleanup } from '@/hooks/useEmergencyCleanup';

function MeuComponente() {
  const { 
    executeCleanup, 
    isCleaningUp, 
    checkForLoops 
  } = useEmergencyCleanup({
    autoDetect: true,
    autoCleanup: true,
    onCleanupComplete: (result) => {
      console.log('Limpeza concluída:', result);
    }
  });

  const handleEmergencyCleanup = async () => {
    await executeCleanup();
  };

  return (
    <button onClick={handleEmergencyCleanup} disabled={isCleaningUp}>
      {isCleaningUp ? 'Limpando...' : 'Limpeza de Emergência'}
    </button>
  );
}
```

### 4. Componente de Botão de Emergência

```typescript
import EmergencyCleanupButton from '@/components/debug/EmergencyCleanupButton';

function PaginaAdmin() {
  return (
    <div>
      <h1>Administração</h1>
      <EmergencyCleanupButton 
        variant="danger"
        size="md"
        showStats={true}
      />
    </div>
  );
}
```

## 🔄 Detecção de Loops

O sistema detecta automaticamente condições de loop baseado em:

- **Número excessivo de sessões**: Mais de 10.000 sessões ativas
- **Tokens em excesso**: Mais de 5.000 tokens refresh
- **Atividade suspeita**: Mais de 1.000 operações recentes
- **localStorage grande**: Mais de 1MB de dados
- **Muitos cookies**: Mais de 50 cookies
- **Erros repetitivos**: Mais de 100 erros no console
- **Redirecionamentos**: Mais de 10 redirecionamentos

### Configuração de Detecção

```typescript
const { checkForLoops } = useEmergencyCleanup({
  autoDetect: true,      // Detectar automaticamente
  autoCleanup: true,     // Limpar automaticamente se detectado
  onLoopDetected: () => {
    console.log('Loop detectado!');
    // Ações personalizadas
  }
});
```

## 🧹 Processo de Limpeza

### Limpeza Automática

Quando um loop é detectado, o sistema executa automaticamente:

1. **Servidor (Redis)**:
   - Remove todas as sessões ativas
   - Limpa tokens de refresh e blacklist
   - Limpa cache geral e estático
   - Reseta contadores e estatísticas

2. **Cliente (Navegador)**:
   - Limpa localStorage e sessionStorage
   - Remove todos os cookies
   - Limpa IndexedDB
   - Limpa cache do navegador (se possível)
   - Redireciona para login

### Limpeza Manual

```typescript
import { emergencyCleanup } from '@/services/emergencyCleanupService';

// Executar limpeza completa
const result = await emergencyCleanup();
console.log('Resultado:', result);
```

## 📊 Monitoramento

### API de Status

```bash
# Verificar status do sistema
GET /api/auth/emergency-cleanup

# Executar limpeza no servidor
POST /api/auth/emergency-cleanup
{
  "action": "server_cleanup",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Estatísticas de Cache

```typescript
import { staticCache } from '@/services/redisStaticCacheService';

const stats = await staticCache.getStats();
console.log('Estatísticas:', {
  hitRate: stats.hitRate,
  missRate: stats.missRate,
  totalKeys: stats.totalKeys
});
```

## 🔧 Comandos Redis Úteis

```bash
# Verificar conexão
redis-cli ping

# Ver todas as sessões
redis-cli KEYS "session:*"

# Contar sessões ativas
redis-cli EVAL "return #redis.call('keys', 'session:*')" 0

# Ver usuários ativos
redis-cli SMEMBERS active_users

# Limpar cache específico
redis-cli DEL "static:minha-chave"

# Limpar tudo (CUIDADO!)
redis-cli FLUSHDB
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Redis não conecta**
   ```bash
   # Verificar se Redis está rodando
   redis-cli ping
   
   # Verificar logs
   tail -f /var/log/redis/redis-server.log
   ```

2. **Sessões não persistem**
   - Verificar TTL configurado
   - Confirmar que Redis não está sendo reiniciado
   - Verificar logs de erro

3. **Cache não funciona**
   - Verificar conexão com Redis
   - Verificar se a chave está correta
   - Verificar TTL

4. **Loop não detectado**
   - Verificar se autoDetect está habilitado
   - Verificar thresholds de detecção
   - Verificar logs do console

### Logs Importantes

```javascript
// Ativar logs detalhados
console.log('✅ Redis conectado com sucesso');
console.log('🔄 LOOP DETECTADO! Iniciando limpeza automática...');
console.log('🚨 INICIANDO LIMPEZA GERAL DE EMERGÊNCIA...');
console.log('✅ LIMPEZA GERAL CONCLUÍDA');
```

## 🔒 Segurança

### Considerações de Segurança

1. **Autenticação Redis**: Use senha forte em produção
2. **TLS**: Habilite TLS para conexões Redis em produção
3. **Firewall**: Restrinja acesso ao Redis apenas para servidores autorizados
4. **Logs**: Monitore logs para atividades suspeitas
5. **Backup**: Faça backup regular dos dados Redis importantes

### Configuração de Produção

```env
# Produção
REDIS_HOST=redis-cluster.exemplo.com
REDIS_PORT=6380
REDIS_PASSWORD=senha_super_segura
REDIS_TLS=true
NODE_ENV=production
```

## 📈 Performance

### Otimizações Implementadas

1. **Contadores Redis**: Uso de contadores O(1) em vez de KEYS O(N)
2. **Cache com TTL**: Expiração automática de dados
3. **Compressão**: Compressão de dados grandes
4. **Pré-aquecimento**: Cache pré-aquecido para dados importantes
5. **Fallback**: Graceful degradation quando Redis não está disponível

### Métricas de Performance

- **Hit Rate**: Taxa de acerto do cache
- **Miss Rate**: Taxa de erro do cache
- **Memory Usage**: Uso de memória Redis
- **Response Time**: Tempo de resposta das operações

## 🔮 Próximos Passos

1. **Clustering Redis**: Implementar cluster para alta disponibilidade
2. **Métricas Avançadas**: Dashboard em tempo real
3. **Alertas**: Notificações automáticas para problemas
4. **Backup Automático**: Backup incremental do Redis
5. **Rate Limiting**: Controle de taxa usando Redis

## 📚 Referências

- [Redis Documentation](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)

## ✅ Checklist de Implementação

- [x] Configuração Redis multi-instância
- [x] Serviço de sessões com TTL
- [x] Cache estático com compressão
- [x] Detecção automática de loops
- [x] Limpeza de emergência (cliente)
- [x] Limpeza de emergência (servidor)
- [x] Hook React para integração
- [x] Componente de botão de emergência
- [x] API de monitoramento
- [x] Documentação completa
- [x] Tratamento de erros
- [x] Logs estruturados

## 🎯 Como Usar

1. **Desenvolvimento**: O sistema funciona automaticamente em background
2. **Produção**: Configure as variáveis de ambiente Redis
3. **Monitoramento**: Use a API `/api/auth/emergency-cleanup` para status
4. **Emergência**: Use o botão de limpeza ou execute `emergencyCleanup()`
5. **Debug**: Use o hook `useEmergencyCleanup` para integração customizada

---

**🚨 IMPORTANTE**: Este sistema foi projetado para situações de emergência. Use com cuidado, pois a limpeza remove todos os dados de sessão e cache do usuário. 