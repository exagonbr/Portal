# Correção do Problema de Duplicação de Path da API

## Problema
Requisições para `/api/auth/login` estão sendo convertidas para `/api/api/auth/login` devido à configuração incorreta do nginx.

## Solução

### 1. Configuração Nginx Correta

Se você estiver usando nginx como proxy reverso, corrija a configuração:

```nginx
# ❌ CONFIGURAÇÃO INCORRETA (causa duplicação)
location /api/ {
    proxy_pass http://localhost:3001/api/;
}

# ✅ CONFIGURAÇÃO CORRETA
location /api/ {
    proxy_pass http://localhost:3001/;
}

# OU, se preferir ser mais específico:
location /api/ {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://localhost:3001/api/;
}
```

### 2. Para Desenvolvimento Local

Se não estiver usando nginx, o problema pode estar na configuração das variáveis de ambiente:

```bash
# ❌ INCORRETO
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# ✅ CORRETO  
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Verificação das Configurações

Execute este comando para verificar se o nginx está rodando:

```bash
# Verificar se nginx está ativo
sudo systemctl status nginx

# Se estiver ativo, verificar configuração
sudo nginx -t

# Recarregar configuração se necessário
sudo systemctl reload nginx
```

### 4. Teste da API

Teste diretamente o endpoint do backend:

```bash
# Teste direto no backend (deve funcionar)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"admin123"}'

# Teste através do frontend Next.js (deve funcionar)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"admin123"}'
```

### 5. Logs para Diagnóstico

Verifique os logs para identificar onde está acontecendo a duplicação:

```bash
# Logs do nginx (se estiver usando)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do backend
# (verificar no terminal onde o backend está rodando)

# Logs do frontend Next.js
# (verificar no terminal onde o frontend está rodando)
``` 