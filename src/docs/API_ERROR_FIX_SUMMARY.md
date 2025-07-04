# Resumo das Correções de Erros da API

## Problemas Identificados

1. **Erro de JSON Parse**: O endpoint `/api/users/stats` estava retornando HTML em vez de JSON, causando o erro:
   ```
   SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
   ```

2. **Erro de Autenticação JWT**: Múltiplas falhas na validação do JWT com diferentes secrets:
   ```
   ❌ [JWT-VALIDATOR] Nenhum secret funcionou para validar o JWT
   ```

3. **Conflito de Backend**: O sistema estava usando o backend local (`localhost:3001`) em vez do backend de produção configurado no `.env`.

4. **Timeout nas Requisições**: Requisições em produção estavam resultando em timeout (504 Gateway Timeout), especialmente na rota:
   ```
   GET https://portal.sabercon.com.br/api/institutions?active=true&limit=10&sortBy=name&sortOrder=asc
   ```

## Correções Implementadas

### 1. Handler de Resposta Seguro (`src/app/api/lib/response-handler.ts`)
- Verifica o `content-type` antes de tentar fazer parse JSON
- Retorna erro apropriado (502 Bad Gateway) quando o backend retorna HTML
- Logs detalhados para debug

### 2. Configuração Centralizada do Backend (`src/app/api/lib/backend-config.ts`)
- Centraliza a lógica de URLs do backend
- Permite forçar uso do backend de produção com `FORCE_PRODUCTION_BACKEND=true`
- Remove duplicações de `/api` nas URLs

### 3. Atualização do Endpoint (`src/app/api/users/stats/route.ts`)
- Usa o novo handler de resposta seguro
- Usa a configuração centralizada do backend
- Adiciona timeout de 30 segundos nas requisições
- Melhor tratamento de erros

### 4. Otimização do Pool de Conexões
- Aumentamos o número mínimo de conexões de 2 para 5
- Aumentamos o número máximo de conexões de 20 para 30
- Aumentamos o timeout de aquisição de conexão de 60s para 120s
- Adicionamos configurações adicionais para melhorar o gerenciamento de conexões

### 5. Otimização de Consultas SQL
- Adicionamos timeout explícito nas consultas para evitar bloqueios longos
- Otimizamos o método `findAllWithFilters` para usar consultas parametrizadas
- Melhoramos o método `count` para evitar contagens lentas em tabelas grandes
- Implementamos paralelização de operações usando `Promise.all`

### 6. Implementação de Cache com Redis
- Criamos um serviço de cache usando Redis para armazenar resultados de consultas frequentes
- Implementamos cache para consultas de instituições com TTL variável (5-15 minutos)
- Adicionamos suporte para fallback em caso de falha no cache

### 7. Adição de Índices no Banco de Dados
- Criamos um script SQL para adicionar índices nas colunas frequentemente usadas:
  - `name`
  - `code`
  - `type`
  - `status`
  - Índice GIN para busca de texto em `name` e `code`

### 8. Monitoramento de Desempenho
- Criamos um script para monitorar o desempenho das consultas
- Implementamos geração de relatórios com estatísticas e recomendações

## Arquivos Modificados
1. `backend/src/config/database.ts` - Otimização do pool de conexões
2. `backend/src/knexfile.ts` - Alinhamento das configurações do pool
3. `backend/src/repositories/InstitutionRepository.ts` - Otimização de consultas
4. `backend/src/repositories/BaseRepository.ts` - Melhoria no método count
5. `backend/src/services/InstitutionService.ts` - Implementação de cache e paralelização
6. `backend/src/services/CacheService.ts` - Novo serviço de cache com Redis

## Arquivos Criados
1. `backend/docs/PERFORMANCE_OPTIMIZATIONS.md` - Documentação das otimizações
2. `backend/database/migrations/add_institution_indexes.sql` - Script para adicionar índices
3. `backend/scripts/monitor-query-performance.js` - Script de monitoramento

## Como Aplicar as Correções

1. **Pare o servidor Next.js** (Ctrl+C no terminal)

2. **Verifique o arquivo `.env`** e certifique-se de que contém:
   ```env
   NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api
   BACKEND_URL=https://portal.sabercon.com.br/api
   INTERNAL_API_URL=https://portal.sabercon.com.br/api
   FORCE_PRODUCTION_BACKEND=true
   ```

3. **Limpe o cache do Next.js**:
   ```bash
   rm -rf .next
   ```

4. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

## Verificação

Após reiniciar, o sistema deve:
- Usar o backend de produção (`https://portal.sabercon.com.br/api`)
- Tratar corretamente respostas não-JSON
- Mostrar logs claros sobre qual backend está sendo usado

## Scripts de Diagnóstico

- `npx tsx src/scripts/diagnose-auth.ts` - Diagnostica problemas de autenticação
- `npx tsx src/scripts/check-env.ts` - Verifica carregamento de variáveis de ambiente
- `npx tsx src/scripts/test-api-fix.ts` - Testa as correções implementadas

## Observações

- O servidor local na porta 3001 continuará rodando, mas será ignorado quando `FORCE_PRODUCTION_BACKEND=true`
- Se precisar usar o backend local, remova ou defina `FORCE_PRODUCTION_BACKEND=false`
- Os erros de JWT podem persistir se os secrets não estiverem sincronizados entre frontend e backend

## Próximos Passos
1. Monitorar o efeito das otimizações implementadas
2. Aplicar o script de índices em produção após análise de impacto
3. Considerar a migração para paginação por cursor em endpoints críticos
4. Avaliar a necessidade de aumentar recursos do servidor em produção
5. Implementar monitoramento contínuo de desempenho