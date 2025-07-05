# Correção do Erro 504 Gateway Timeout - Next.js Stack Frames

## Problema Identificado

O erro `POST https://portal.sabercon.com.br/__nextjs_original-stack-frames 504 (Gateway Timeout)` ocorre porque o Nginx está configurado com timeouts que são muito curtos para processar as requisições de stack trace do Next.js.

## Análise do Problema

1. **Endpoint Afetado**: `/__nextjs_original-stack-frames` - usado pelo Next.js para exibir stack traces detalhados de erros
2. **Configuração Atual do Nginx**:
   - Frontend timeout: 60s (proxy_read_timeout)
   - Pode ser insuficiente para processar stack traces complexos

## Solução Proposta

### 1. Atualizar Configuração do Nginx

Adicionar uma localização específica para os endpoints do Next.js com timeouts maiores:

```nginx
# Adicionar no arquivo /etc/nginx/sites-available/default dentro do bloco server HTTPS

# Next.js development endpoints (stack traces, HMR, etc)
location ~ ^/(_next/webpack-hmr|__nextjs_original-stack-frame) {
    proxy_pass http://frontend_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts aumentados para stack traces
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Desabilitar buffering para respostas em tempo real
    proxy_buffering off;
    proxy_cache off;
    
    # Aumentar tamanho dos buffers
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
}
```

### 2. Script de Aplicação da Correção

Criar o arquivo `fix-nextjs-timeouts.sh`:

```bash
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Aplicando correção de timeout para Next.js stack frames...${NC}"

# Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup-$(date +%Y%m%d-%H%M%S)

# Adicionar a configuração específica para Next.js
sudo sed -i '/location \/ {/i\
    # Next.js development endpoints (stack traces, HMR, etc)\
    location ~ ^\/(_next\/webpack-hmr|__nextjs_original-stack-frame) {\
        proxy_pass http://frontend_backend;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        \
        # Timeouts aumentados para stack traces\
        proxy_connect_timeout 300s;\
        proxy_send_timeout 300s;\
        proxy_read_timeout 300s;\
        \
        # Desabilitar buffering para respostas em tempo real\
        proxy_buffering off;\
        proxy_cache off;\
        \
        # Aumentar tamanho dos buffers\
        proxy_buffer_size 128k;\
        proxy_buffers 4 256k;\
        proxy_busy_buffers_size 256k;\
    }\
    ' /etc/nginx/sites-available/default

# Testar configuração
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    
    # Recarregar Nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Correção aplicada com sucesso!${NC}"
```

### 3. Configuração Adicional no Next.js

Adicionar no `next.config.js`:

```javascript
// Adicionar dentro do objeto nextConfig
experimental: {
  // ... outras configurações
  // Aumentar timeout para processamento de erros
  serverComponentsExternalPackages: ['epubjs'],
  // Configuração para melhorar o handling de erros
  workerThreads: false,
  cpus: 1,
},

// Adicionar configuração de webpack para melhorar o processamento
webpack: (config, { isServer, webpack }) => {
  // ... configurações existentes
  
  if (!isServer) {
    // Configurar timeout para webpack
    config.devServer = {
      ...config.devServer,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    };
  }
  
  return config;
},
```

### 4. Alternativa: Desabilitar Stack Traces em Produção

Se o site estiver em produção, é recomendado desabilitar os stack traces detalhados:

```javascript
// Em next.config.js
const nextConfig = {
  // ... outras configurações
  
  // Desabilitar source maps em produção
  productionBrowserSourceMaps: false,
  
  // Configurar para produção
  reactStrictMode: true,
  swcMinify: true,
  
  // Remover informações de debug em produção
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
};
```

## Comandos de Execução

1. **Aplicar a correção de timeout**:
   ```bash
   chmod +x fix-nextjs-timeouts.sh
   sudo ./fix-nextjs-timeouts.sh
   ```

2. **Verificar logs do Nginx**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Monitorar requisições**:
   ```bash
   sudo tail -f /var/log/nginx/access.log | grep __nextjs
   ```

## Verificação

Após aplicar as correções:

1. Testar se o erro 504 ainda ocorre
2. Verificar se os stack traces são exibidos corretamente
3. Monitorar o desempenho geral do site

## Considerações Adicionais

1. **Ambiente de Produção**: Em produção, é melhor desabilitar completamente os stack traces detalhados por questões de segurança e performance
2. **Monitoramento**: Implementar monitoramento adequado para capturar erros sem expor stack traces aos usuários
3. **Logs**: Configurar logs estruturados para debugging sem depender de stack traces no browser

## Solução de Longo Prazo

1. Implementar error boundaries no React
2. Configurar logging centralizado (ex: Sentry, LogRocket)
3. Usar variáveis de ambiente para controlar o nível de debug
4. Implementar páginas de erro customizadas