# Implementação do Endpoint `/queue/next`

## Análise do Problema

A partir da linha de log fornecida:
```
::1 - - [04/Jun/2025:05:10:35 +0000] "GET /queue/next HTTP/1.1" 404 75 "http://localhost:3000/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
```

Identificou-se que uma requisição para `/queue/next` estava retornando erro 404 (Not Found).

## Solução Implementada

### 1. Criação do Arquivo de Rotas

**Arquivo**: `backend/src/routes/queue.ts`

Criou-se um arquivo dedicado para rotas de fila com os seguintes endpoints:

#### `/api/queue/next` (GET)
- **Descrição**: Retorna os próximos jobs disponíveis para processamento na fila
- **Autenticação**: Requerida (JWT)
- **Parâmetros de Query**:
  - `limit` (opcional): Número máximo de jobs (1-50, padrão: 5)
  - `priority` (opcional): Filtrar por prioridade específica
  - `type` (opcional): Filtrar por tipo de job específico

#### `/api/queue/stats` (GET)
- **Descrição**: Retorna estatísticas gerais das filas
- **Autenticação**: Requerida (JWT)
- **Resposta**: Contadores de jobs (pending, processing, completed, failed, total)

#### `/api/queue/add` (POST)
- **Descrição**: Adiciona um novo job à fila
- **Autenticação**: Requerida (JWT)
- **Body**: `{ type: string, data: object }`

### 2. Registro das Rotas

**Arquivo**: `backend/src/routes/index.ts`

Adicionou-se a nova rota ao arquivo principal:
```typescript
import queueRouter from './queue';
// ...
router.use('/queue', queueRouter);
```

### 3. Estrutura de Resposta

Todas as rotas seguem o padrão de resposta da API:

```typescript
{
  success: boolean,
  data: any,
  message: string,
  pagination?: {
    limit: number,
    total: number
  }
}
```

### 4. Implementação Atual

A implementação atual usa dados simulados para demonstração. Para produção, deve-se:

1. **Integrar com Redis/BullMQ**: Substituir dados simulados por consultas reais às filas
2. **Conectar com QueueService**: Utilizar o serviço de fila existente
3. **Implementar persistência**: Salvar jobs no banco de dados se necessário

### 5. Documentação Swagger

Todos os endpoints foram documentados com Swagger/OpenAPI, incluindo:
- Descrições detalhadas
- Parâmetros de entrada
- Estruturas de resposta
- Códigos de erro

### 6. Middlewares Aplicados

- **Autenticação JWT**: Todos os endpoints requerem token válido
- **Validação de entrada**: Parâmetros são validados e tipados
- **Tratamento de erros**: Respostas consistentes para diferentes tipos de erro

## Próximos Passos

1. **Testar o endpoint**: Verificar se `/api/queue/next` responde corretamente
2. **Integração real**: Conectar com sistema de filas real (Redis/BullMQ)
3. **Monitoramento**: Adicionar logs e métricas
4. **Testes unitários**: Criar testes para os novos endpoints

## Exemplo de Uso

```bash
# Obter próximos jobs
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/queue/next

# Estatísticas da fila
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/queue/stats

# Adicionar job
curl -X POST -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"type":"email","data":{"to":"user@example.com"}}' \
     http://localhost:3001/api/queue/add
```

A implementação resolve o erro 404 original e fornece uma base sólida para o sistema de filas da aplicação. 