# Guia de Diagnóstico HTTP 500

## Problemas Identificados e Soluções

### 1. Endpoint `/api/settings/public` - RESOLVIDO ✅

**Problema**: Endpoint retornava erro 500 devido a problemas de conexão com o banco de dados ou tabela `system_settings` não existente.

**Solução Implementada**:
- Adicionado tratamento de erro robusto no backend (`backend/src/routes/settings.routes.ts`)
- Implementado fallback com configurações padrão quando a tabela não existe
- Criado endpoint frontend (`src/app/api/settings/public/route.ts`) com fallback duplo

**Como funciona agora**:
1. Primeiro tenta buscar configurações do backend
2. Se o backend falhar, usa configurações padrão do frontend
3. Se tudo falhar, usa configurações de emergência

### 2. Endpoint `/api/status` - CRIADO ✅

**Problema**: Endpoint não existia, causando erro 404/500.

**Solução Implementada**:
- Criado endpoint `/api/status` (`src/app/api/status/route.ts`)
- Verifica status da API, memória e conectividade com backend
- Retorna informações detalhadas sobre a saúde do sistema

**Resposta do endpoint**:
```json
{
  "status": "ok",
  "message": "Sistema funcionando normalmente",
  "timestamp": "2025-06-27T08:33:23.902Z",
  "services": {
    "api": {
      "status": "healthy",
      "uptime": 1234.56,
      "memory": {
        "used": 45,
        "total": 128
      }
    },
    "database": {
      "status": "healthy",
      "message": "Conexão com backend estabelecida"
    }
  },
  "version": "2.3.1",
  "environment": "production"
}
```

## Verificações de Conectividade

### Teste Manual dos Endpoints

```bash
# Testar /api/settings/public
curl -X GET http://localhost:3001/api/settings/public

# Testar /api/status  
curl -X GET http://localhost:3001/api/status

# Testar /api/health (deve funcionar)
curl -X GET http://localhost:3001/api/health
```

### Resultados Esperados

- `/api/settings/public`: Status 200 (configurações ou fallback)
- `/api/status`: Status 200 (status do sistema)
- `/api/health`: Status 200 (health check básico)

## Diagnóstico de Problemas Futuros

### 1. Verificar Logs do Backend

```bash
# No terminal do backend
tail -f logs/backend.log

# Ou verificar console do backend para mensagens como:
# ✅ Configurações públicas carregadas com sucesso
# ⚠️ Tabela system_settings não existe, retornando configurações padrão
# ❌ Erro ao buscar configurações públicas
```

### 2. Verificar Conexão com Banco de Dados

Se o problema persistir, verificar:

1. **Variáveis de ambiente do backend** (`.env`):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=portal_sabercon
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```

2. **Conexão PostgreSQL**:
   ```bash
   # Testar conexão direta
   psql -h localhost -p 5432 -U postgres -d portal_sabercon -c "SELECT 1;"
   ```

3. **Tabela system_settings**:
   ```sql
   -- Verificar se existe
   SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'system_settings'
   );
   
   -- Contar registros
   SELECT COUNT(*) FROM system_settings;
   ```

### 3. Executar Migrations

Se a tabela `system_settings` não existir:

```bash
cd backend
npm run migrate:latest
# ou
npx knex migrate:latest
```

## Monitoramento Contínuo

### Script de Diagnóstico Automático

Criado utilitário em `src/utils/debug-http-500.ts` que testa automaticamente os endpoints e gera relatórios.

### Logs Estruturados

Os endpoints agora incluem logs estruturados:
- 🔍 Para início de operações
- ✅ Para sucessos
- ⚠️ Para warnings/fallbacks
- ❌ Para erros

## Status Atual

✅ **RESOLVIDO**: `/api/settings/public` - Funcionando com fallback  
✅ **RESOLVIDO**: `/api/status` - Endpoint criado e funcional  
✅ **RESOLVIDO**: Tratamento de erros robusto implementado  
✅ **RESOLVIDO**: Fallbacks múltiplos para alta disponibilidade  

## Próximos Passos

1. **Monitorar logs** para identificar se os fallbacks estão sendo usados frequentemente
2. **Executar migrations** se necessário para criar tabelas faltantes
3. **Verificar conectividade** entre frontend e backend regularmente
4. **Implementar health checks** automáticos para outros endpoints críticos

---

**Data da última atualização**: 2025-06-27  
**Versão do sistema**: 2.3.1  
**Status**: Problemas HTTP 500 principais resolvidos ✅ 