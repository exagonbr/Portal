# Variáveis de Ambiente - Portal Sabercon Backend

## Configuração do Ambiente

Para configurar o backend, crie um arquivo `.env` na raiz do diretório `backend/` com as seguintes variáveis:

```env
# ===================================
# APPLICATION SETTINGS
# ===================================
NODE_ENV=development
PORT=3001

# ===================================
# JWT SETTINGS
# ===================================
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production

# ===================================
# DATABASE SETTINGS (PostgreSQL)
# ===================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# ===================================
# REDIS SETTINGS
# ===================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false
REDIS_ENABLED=true

# ===================================
# REDIS QUEUE SETTINGS
# ===================================
QUEUE_REDIS_HOST=
QUEUE_REDIS_PORT=
QUEUE_REDIS_PASSWORD=
QUEUE_REDIS_DB=1

# ===================================
# CORS SETTINGS
# ===================================
CORS_ORIGIN=https://portal.sabercon.com.br
CORS_CREDENTIALS=true

# ===================================
# ADMIN USER SETTINGS
# ===================================
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=password123

# ===================================
# QUEUE CONCURRENCY SETTINGS
# ===================================
EMAIL_QUEUE_CONCURRENCY=3
NOTIFICATION_QUEUE_CONCURRENCY=5
FILE_PROCESSING_QUEUE_CONCURRENCY=2

# ===================================
# API VERSION
# ===================================
npm_package_version=1.0.0
```

## Descrição das Variáveis

### APPLICATION SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `NODE_ENV` | string | development | Ambiente da aplicação (development, production, test) |
| `PORT` | number | 3001 | Porta onde o servidor será executado |

### JWT SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `JWT_SECRET` | string | your-secret-key-for-development | Chave secreta para assinatura dos tokens JWT |

⚠️ **IMPORTANTE**: Em produção, use uma chave forte e única!

### DATABASE SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `DB_HOST` | string | localhost | Host do banco de dados PostgreSQL |
| `DB_PORT` | number | 5432 | Porta do banco de dados |
| `DB_NAME` | string | portal_sabercon | Nome do banco de dados |
| `DB_USER` | string | postgres | Usuário do banco de dados |
| `DB_PASSWORD` | string | root | Senha do banco de dados |
| `DB_SSL` | boolean | false | Habilitar SSL para conexão com o banco |

### REDIS SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `REDIS_HOST` | string | localhost | Host do servidor Redis |
| `REDIS_PORT` | number | 6379 | Porta do servidor Redis |
| `REDIS_PASSWORD` | string | (vazio) | Senha do Redis (opcional) |
| `REDIS_DB` | number | 0 | Banco de dados Redis (0-15) |
| `REDIS_TLS` | boolean | false | Usar TLS para conexão Redis |
| `REDIS_ENABLED` | boolean | true | Habilitar Redis |

### REDIS QUEUE SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `QUEUE_REDIS_HOST` | string | REDIS_HOST | Host Redis dedicado para filas |
| `QUEUE_REDIS_PORT` | number | REDIS_PORT | Porta Redis dedicada para filas |
| `QUEUE_REDIS_PASSWORD` | string | REDIS_PASSWORD | Senha Redis dedicada para filas |
| `QUEUE_REDIS_DB` | number | 1 | Banco Redis dedicado para filas |

### CORS SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `CORS_ORIGIN` | string | https://portal.sabercon.com.br | Origem permitida para CORS |
| `CORS_CREDENTIALS` | boolean | true | Permitir credenciais em requisições CORS |

### ADMIN USER SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `ADMIN_EMAIL` | string | admin@portal.com | Email do usuário administrador padrão |
| `ADMIN_PASSWORD` | string | password123 | Senha do usuário administrador padrão |

⚠️ **IMPORTANTE**: Altere estas credenciais em produção!

### QUEUE CONCURRENCY SETTINGS

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `EMAIL_QUEUE_CONCURRENCY` | number | 3 | Número de workers para fila de emails |
| `NOTIFICATION_QUEUE_CONCURRENCY` | number | 5 | Número de workers para fila de notificações |
| `FILE_PROCESSING_QUEUE_CONCURRENCY` | number | 2 | Número de workers para processamento de arquivos |

## Configuração por Ambiente

### Development
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key
DB_PASSWORD=root
REDIS_PASSWORD=
CORS_ORIGIN=https://portal.sabercon.com.br
```

### Production
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=super-secure-random-key-256-bits
DB_SSL=true
DB_PASSWORD=strong-database-password
REDIS_PASSWORD=strong-redis-password
REDIS_TLS=true
CORS_ORIGIN=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=very-strong-admin-password
```

## Validação das Variáveis

O sistema valida automaticamente as variáveis obrigatórias na inicialização:

- ✅ `JWT_SECRET` - Deve estar configurado em produção
- ✅ `REDIS_PASSWORD` - Recomendado em produção
- ✅ Conexão com banco de dados
- ✅ Conexão com Redis

## Scripts de Setup

Execute o script de configuração inicial:

```bash
npm run setup
```

Este script irá:
- Verificar todas as variáveis de ambiente
- Testar conexões com banco e Redis
- Criar dados iniciais (admin, roles)
- Exibir status da configuração 