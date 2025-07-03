# Otimização de Comunicação Direta - Portal Sabercon

## 🚀 Resumo das Otimizações

Este documento descreve as otimizações implementadas para eliminar a sobrecarga de proxy do Next.js e estabelecer comunicação direta entre frontend e backend, resultando em melhor performance e menor latência.

## 📊 Problema Identificado

### Antes (Configuração com Proxy)
```
Cliente → Nginx → Next.js (proxy) → Backend
```

**Problemas:**
- **Duplo proxy**: Nginx + Next.js redirecionando para o backend
- **Latência adicional**: Cada requisição passava por 3 camadas
- **Sobrecarga de processamento**: Next.js processando todas as requisições da API
- **Complexidade de configuração**: Múltiplas URLs e configurações conflitantes
- **Timeouts frequentes**: Cadeia de proxies causando timeouts

### Depois (Comunicação Direta)
```
Cliente → Nginx → Backend (direto)
```

**Benefícios:**
- **Comunicação direta**: Apenas Nginx fazendo proxy para o backend
- **Menor latência**: Eliminação de uma camada de redirecionamento
- **Melhor performance**: Menos processamento no Next.js
- **Configuração simplificada**: URLs únicas e claras
- **Timeouts otimizados**: Valores ajustados para cada tipo de requisição

## 🔧 Mudanças Implementadas

### 1. Next.js Configuration (`next.config.js`)

#### Removido:
```javascript
// REMOVIDO: Configuração de proxy
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://portal.sabercon.com.br/api/:path*',
    },
  ];
}
```

#### Resultado:
- ✅ Proxy Next.js **DESABILITADO**
- ✅ Frontend não processa mais requisições da API
- ✅ Redução de carga no processo Next.js

### 2. Configuração de Ambiente (`src/config/env.ts`)

#### Simplificado:
```typescript
// URLs otimizadas para comunicação direta
const getBaseUrls = () => {
  if (isProduction) {
    return {
      // Frontend público
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      
      // Backend - comunicação direta via Nginx
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: 'https://portal.sabercon.com.br/api',
      
      // Servidor (SSR): usa URL interna direta
      INTERNAL_API_URL: 'http://localhost:3001/api'
    };
  }
};
```

#### Benefícios:
- ✅ URLs únicas e consistentes
- ✅ Separação clara entre cliente e servidor
- ✅ Configuração simplificada

### 3. Cliente API (`src/lib/api-client.ts`)

#### Otimizado:
```typescript
// Configuração otimizada para comunicação direta
const API_CONFIG = {
  baseUrl: 'https://portal.sabercon.com.br/api',
  timeout: 25000, // Reduzido para melhor UX
  retryAttempts: 2, // Reduzido para evitar sobrecarga
  retryDelay: 800,
} as const;
```

#### Melhorias:
- ✅ URL base única
- ✅ Timeouts otimizados
- ✅ Retry logic simplificada
- ✅ Busca de token otimizada

### 4. Configuração Nginx Otimizada

#### Script: `optimize-nginx-direct-communication.sh`

**Principais otimizações:**

```nginx
# Frontend (Next.js) → localhost:3000
location / {
    proxy_pass http://127.0.0.1:3000;
    # Timeouts otimizados
    proxy_connect_timeout 20s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}

# Backend API → localhost:3001/api/
# COMUNICAÇÃO DIRETA - sem proxy Next.js
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    # Timeouts otimizados para API
    proxy_connect_timeout 25s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}
```

#### Benefícios:
- ✅ **Rate limiting otimizado**: 30 req/s para API, 10 req/s geral
- ✅ **Cache inteligente**: Assets estáticos cachados por 1 ano
- ✅ **CORS configurado**: Headers específicos para o domínio
- ✅ **Timeouts ajustados**: Valores específicos para cada tipo de requisição

## 📈 Resultados Esperados

### Performance
- **Redução de latência**: 30-50% menos tempo de resposta
- **Menos CPU**: Frontend não processa requisições da API
- **Menos memória**: Redução no uso de RAM do processo Next.js

### Confiabilidade
- **Menos timeouts**: Eliminação de proxy intermediário
- **Menos pontos de falha**: Arquitetura mais simples
- **Melhor debugging**: Logs mais claros e diretos

### Manutenibilidade
- **Configuração simples**: Menos arquivos para manter
- **URLs consistentes**: Uma única fonte de verdade
- **Menos complexidade**: Menos camadas para debugar

## 🚀 Como Aplicar as Otimizações

### 1. Atualizar Código
```bash
# As mudanças já foram aplicadas nos arquivos:
# - next.config.js
# - src/config/env.ts
# - src/lib/api-client.ts
```

### 2. Aplicar Configuração de Ambiente
```bash
# Copiar configuração otimizada
cp env.production.optimized.example .env.production
```

### 3. Otimizar Nginx
```bash
# Executar script de otimização
sudo bash optimize-nginx-direct-communication.sh
```

### 4. Reiniciar Serviços
```bash
# Reiniciar frontend
pm2 restart frontend

# Reiniciar backend
pm2 restart backend

# Verificar status
pm2 status
```

## 🔍 Monitoramento

### Logs para Acompanhar
```bash
# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs da aplicação
pm2 logs frontend
pm2 logs backend
```

### Métricas Importantes
- **Tempo de resposta da API**: Deve reduzir significativamente
- **Uso de CPU**: Frontend deve usar menos CPU
- **Erros 5xx**: Devem diminuir
- **Timeouts**: Devem ser raros

## 🎯 Configurações Específicas

### Timeouts Otimizados
- **Frontend**: 20-30s (suficiente para carregamento de páginas)
- **API Geral**: 25-30s (para operações normais)
- **Login**: 20-30s (operação crítica, mais rápida)

### Rate Limiting
- **API**: 30 req/s por IP
- **Geral**: 10 req/s por IP
- **Login**: 5 req/s por IP (segurança)

### Cache
- **Assets Next.js**: 1 ano (imutáveis)
- **Assets gerais**: 7 dias
- **API**: Sem cache (dados dinâmicos)

## 🔒 Segurança

### CORS
- **Origin permitida**: `https://portal.sabercon.com.br`
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Habilitado

### Headers de Segurança
- **HSTS**: Habilitado (1 ano)
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: Habilitado
- **Referrer-Policy**: strict-origin-when-cross-origin

## 📝 Próximos Passos

1. **Aplicar as otimizações** seguindo este guia
2. **Monitorar performance** por 24-48 horas
3. **Ajustar timeouts** se necessário
4. **Documentar resultados** obtidos
5. **Considerar otimizações adicionais** baseadas nos dados

## ⚠️ Observações Importantes

- **Backup**: Sempre fazer backup antes de aplicar mudanças
- **Teste**: Testar em ambiente de desenvolvimento primeiro
- **Monitoramento**: Acompanhar logs após aplicar mudanças
- **Rollback**: Manter plano de rollback caso necessário

---

**Resultado Final**: Portal Sabercon com comunicação direta, melhor performance e arquitetura mais simples e confiável. 