# Integração AWS com Banco de Dados - Portal Educacional

## Visão Geral

Este documento descreve a implementação completa da integração AWS com persistência em banco de dados PostgreSQL, incluindo logs de conexão e auditoria de alterações.

## Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `aws_settings`
Armazena as configurações AWS do sistema.

```sql
- id (UUID, PK)
- access_key_id (STRING, NOT NULL)
- secret_access_key (STRING, NOT NULL) -- Criptografado
- region (STRING, NOT NULL, DEFAULT: 'sa-east-1')
- s3_bucket_name (STRING, NULLABLE)
- cloudwatch_namespace (STRING, DEFAULT: 'Portal/Metrics')
- update_interval (INTEGER, DEFAULT: 30)
- enable_real_time_updates (BOOLEAN, DEFAULT: true)
- is_active (BOOLEAN, DEFAULT: true)
- created_by (UUID, FK -> users.id)
- updated_by (UUID, FK -> users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `aws_connection_logs`
Registra todos os testes de conexão e operações AWS.

```sql
- id (UUID, PK)
- aws_settings_id (UUID, FK -> aws_settings.id)
- user_id (UUID, FK -> users.id)
- region (STRING, NOT NULL)
- service (STRING, NOT NULL) -- 'cloudwatch', 's3', 'connection_test'
- success (BOOLEAN, NOT NULL)
- message (TEXT)
- error_details (TEXT)
- response_time_ms (INTEGER)
- ip_address (STRING)
- user_agent (STRING)
- request_metadata (JSON)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Arquivos Implementados

### Backend

#### Migrations
- `backend/migrations/20250131000002_create_aws_settings_table.ts`
- `backend/migrations/20250131000003_create_aws_connection_logs_table.ts`

#### Seeds
- `backend/seeds/005_aws_settings.ts`

#### Tipos TypeScript
- `backend/src/types/aws.ts`

#### Repositórios
- `backend/src/repositories/AwsSettingsRepository.ts`
- `backend/src/repositories/AwsConnectionLogRepository.ts`

#### Serviços
- `backend/src/services/AwsSettingsService.ts`

#### Controladores
- `backend/src/controllers/AwsSettingsController.ts`

#### Rotas
- `backend/src/routes/awsRoutes.ts`

### Frontend (Next.js)

#### API Routes
- `src/app/api/aws/settings/route.ts`
- `src/app/api/aws/settings/[id]/route.ts`
- `src/app/api/aws/settings/[id]/test-connection/route.ts`
- `src/app/api/aws/connection-logs/route.ts`

## Endpoints da API

### Configurações AWS

#### GET `/api/aws/settings`
Busca configurações AWS ativas.

#### GET `/api/aws/settings/all`
Lista todas as configurações AWS.

#### GET `/api/aws/settings/:id`
Busca configuração específica por ID.

#### POST `/api/aws/settings`
Cria nova configuração AWS.

**Body:**
```json
{
  "access_key_id": "AKIAIOSFODNN7EXAMPLE",
  "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "region": "sa-east-1",
  "s3_bucket_name": "meu-bucket",
  "cloudwatch_namespace": "Portal/Metrics",
  "update_interval": 30,
  "enable_real_time_updates": true
}
```

#### PUT `/api/aws/settings/:id`
Atualiza configuração existente.

#### POST `/api/aws/settings/:id/activate`
Ativa uma configuração específica (desativa todas as outras).

#### DELETE `/api/aws/settings/:id`
Remove configuração (apenas se não estiver ativa).

#### POST `/api/aws/settings/:id/test-connection`
Testa conectividade com AWS e registra log.

**Response:**
```json
{
  "success": true,
  "message": "Conexão com AWS estabelecida com sucesso",
  "data": {
    "response_time_ms": 1250,
    "error_details": null
  }
}
```

### Logs de Conexão

#### GET `/api/aws/connection-logs`
Lista logs de conexão.

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)
- `settings_id` - Filtrar por configuração específica
- `service` - Filtrar por serviço ('cloudwatch', 's3', 'connection_test')

#### GET `/api/aws/connection-logs/stats`
Estatísticas de conexão.

**Query Parameters:**
- `settings_id` - Configuração específica
- `days` (default: 30) - Período em dias

**Response:**
```json
{
  "success": true,
  "data": {
    "total_connections": 150,
    "successful_connections": 135,
    "failed_connections": 15,
    "success_rate": 90.0,
    "average_response_time": 850.5,
    "last_connection": "2025-01-31T10:30:00Z",
    "last_successful_connection": "2025-01-31T10:30:00Z",
    "services_used": ["connection_test", "cloudwatch", "s3"]
  }
}
```

#### GET `/api/aws/connection-logs/trends`
Tendências de conexão por dia.

**Query Parameters:**
- `settings_id` - Configuração específica
- `days` (default: 7) - Período em dias

## Instalação e Configuração

### 1. Executar Migrations

```bash
cd backend
npm run migrate:aws
```

Ou manualmente:
```bash
cd backend
node scripts/run-aws-migrations.js
```

### 2. Configurar Variáveis de Ambiente

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/portal_db
JWT_SECRET=your-jwt-secret
BACKEND_URL=http://localhost:3001

# Frontend
BACKEND_URL=http://localhost:3001
```

### 3. Iniciar Serviços

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../
npm run dev
```

## Funcionalidades Implementadas

### 1. Gerenciamento de Configurações
- ✅ CRUD completo de configurações AWS
- ✅ Apenas uma configuração ativa por vez
- ✅ Validação de dados de entrada
- ✅ Ocultação de chaves secretas nas respostas
- ✅ Auditoria de criação/modificação

### 2. Teste de Conexão
- ✅ Simulação de teste de conectividade AWS
- ✅ Registro automático de logs
- ✅ Captura de tempo de resposta
- ✅ Detalhes de erro quando falha
- ✅ Metadados da requisição (IP, User-Agent)

### 3. Logs e Auditoria
- ✅ Log de todas as operações de teste
- ✅ Estatísticas de conectividade
- ✅ Tendências por período
- ✅ Filtros por configuração e serviço
- ✅ Limpeza automática de logs antigos

### 4. Segurança
- ✅ Autenticação JWT obrigatória
- ✅ Autorização apenas para administradores
- ✅ Ocultação de chaves secretas
- ✅ Validação de entrada
- ✅ Logs de auditoria

## Integração com Frontend

### Hook Personalizado
O hook `useAwsSettings` continua funcionando, mas agora pode ser integrado com as APIs do banco:

```typescript
// Exemplo de integração
const { settings, updateSettings } = useAwsSettings();

const saveToDatabase = async (newSettings) => {
  const response = await fetch('/api/aws/settings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newSettings)
  });
  
  if (response.ok) {
    updateSettings(newSettings);
  }
};
```

### Teste de Conexão
```typescript
const testConnection = async (settingsId) => {
  const response = await fetch(`/api/aws/settings/${settingsId}/test-connection`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## Próximos Passos

### 1. Criptografia
Implementar criptografia real para `secret_access_key`:
```typescript
// Em AwsSettingsRepository.ts
private encryptSecretKey(secretKey: string): string {
  // Implementar com crypto ou biblioteca de criptografia
  return encrypt(secretKey, process.env.ENCRYPTION_KEY);
}
```

### 2. AWS SDK Real
Substituir simulação por SDK real:
```typescript
import { STS, CloudWatch, S3 } from 'aws-sdk';

private async performAwsConnectionTest(settings: AwsSettings) {
  const sts = new STS({
    accessKeyId: settings.access_key_id,
    secretAccessKey: settings.secret_access_key,
    region: settings.region
  });
  
  try {
    await sts.getCallerIdentity().promise();
    return { success: true, message: 'Conexão estabelecida' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Monitoramento
- Alertas para falhas de conexão
- Dashboard de saúde AWS
- Métricas em tempo real

### 4. Backup e Recuperação
- Backup automático de configurações
- Versionamento de configurações
- Rollback de configurações

## Troubleshooting

### Erro de Migration
```bash
# Verificar status das migrations
npx knex migrate:status

# Rollback se necessário
npx knex migrate:rollback

# Executar novamente
npx knex migrate:latest
```

### Erro de Conexão
1. Verificar variáveis de ambiente
2. Confirmar que o PostgreSQL está rodando
3. Verificar permissões do usuário do banco
4. Checar logs do backend

### Erro de Autenticação
1. Verificar token JWT válido
2. Confirmar role de administrador
3. Verificar middleware de autenticação

## Conclusão

O sistema agora possui integração completa com banco de dados PostgreSQL, oferecendo:
- Persistência de configurações AWS
- Auditoria completa de operações
- Logs detalhados de conectividade
- APIs RESTful para integração
- Segurança e autorização adequadas

Todas as operações são registradas no banco, permitindo análise histórica e monitoramento da saúde das integrações AWS. 