# Configuração do Redis - Portal Educacional

Este documento explica como configurar e resolver problemas relacionados ao Redis no Portal Educacional.

## 🔍 Diagnóstico Rápido

Para verificar o status do Redis, execute:

```bash
npm run check:redis
```

Este comando irá:
- Verificar as configurações atuais
- Testar todas as conexões Redis
- Fornecer instruções específicas se houver problemas

## 🚀 Instalação Rápida com Docker (Recomendado)

### Windows
```bash
npm run redis:start:windows
```

### Linux/macOS
```bash
npm run redis:start
```

### Parar Redis
```bash
npm run redis:stop
```

## 📦 Instalação Manual

### Windows

#### Opção 1: Redis para Windows (Descontinuado mas funcional)
1. Baixe: https://github.com/microsoftarchive/redis/releases
2. Instale e execute `redis-server.exe`

#### Opção 2: WSL2 + Ubuntu
```bash
# No WSL2
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### Opção 3: Docker Desktop
```bash
docker run -d -p 6379:6379 redis:alpine
```

### macOS
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie ou edite o arquivo `.env` no diretório `backend/`:

```env
# Configurações básicas do Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Redis para filas (opcional)
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# Redis para cache estático
REDIS_STATIC_CACHE_DB=2

# Password (se necessário)
# REDIS_PASSWORD=sua_senha

# TLS para produção (se necessário)
# REDIS_TLS=true
```

### Configurações Avançadas

O sistema usa três instâncias Redis separadas:

1. **Principal** (DB 0): Sessões de usuário, cache geral
2. **Filas** (DB 1): Processamento de tarefas em background
3. **Cache Estático** (DB 2): Cache de conteúdo que muda raramente

## 🔧 Resolução de Problemas

### Erro: "Stream isn't writeable and enableOfflineQueue options is false"

**Causa**: Redis não está rodando ou não consegue conectar.

**Soluções**:
1. Verifique se o Redis está rodando: `redis-cli ping`
2. Inicie o Redis com Docker: `npm run redis:start`
3. Verifique as configurações no `.env`

### Erro: "Connection refused"

**Causa**: Redis não está rodando na porta especificada.

**Soluções**:
1. Verifique se o Redis está rodando: `netstat -an | grep 6379`
2. Inicie o Redis: `redis-server` ou use Docker
3. Verifique a porta no `.env`

### Erro: "Authentication failed"

**Causa**: Password incorreto ou não configurado.

**Soluções**:
1. Verifique a variável `REDIS_PASSWORD` no `.env`
2. Configure o Redis sem password para desenvolvimento
3. Use `redis-cli` para testar: `redis-cli -a sua_senha ping`

### Redis conecta mas falha em operações

**Causa**: Problemas de rede ou configuração.

**Soluções**:
1. Execute o diagnóstico: `npm run check:redis`
2. Verifique logs do Redis: `docker logs redis-portal`
3. Teste manualmente: `redis-cli set test "hello" && redis-cli get test`

## 🧪 Testes

### Teste Manual
```bash
# Conectar ao Redis
redis-cli

# Testar comandos básicos
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> set test "hello"
OK
127.0.0.1:6379> get test
"hello"
```

### Teste Automatizado
```bash
npm run check:redis
```

## 🔒 Segurança

### Produção
- Configure password forte: `REDIS_PASSWORD=senha_muito_forte`
- Use TLS: `REDIS_TLS=true`
- Configure firewall para bloquear porta 6379 externamente
- Use Redis em rede privada

### Desenvolvimento
- Sem password é aceitável
- Use Docker para isolamento
- Não exponha a porta externamente

## 📊 Monitoramento

### Comandos Úteis
```bash
# Status do Redis
redis-cli info

# Memória usada
redis-cli info memory

# Conexões ativas
redis-cli info clients

# Comandos por segundo
redis-cli info stats
```

### Logs
```bash
# Docker
docker logs redis-portal

# Sistema
sudo journalctl -u redis-server
```

## 🆘 Suporte

Se os problemas persistirem:

1. Execute `npm run check:redis` e compartilhe a saída
2. Verifique logs do servidor: `npm run dev`
3. Teste conexão manual: `redis-cli ping`
4. Verifique se outras aplicações estão usando a porta 6379

## 📚 Recursos Adicionais

- [Documentação oficial do Redis](https://redis.io/documentation)
- [Redis para Windows](https://github.com/microsoftarchive/redis)
- [Docker Hub - Redis](https://hub.docker.com/_/redis)
- [ioredis - Cliente Node.js](https://github.com/luin/ioredis) 