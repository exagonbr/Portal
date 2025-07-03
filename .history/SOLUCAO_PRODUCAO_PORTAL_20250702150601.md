# Portal Sabercon - Solução de Produção

## 📋 Resumo da Solução

Esta solução configura o Portal Sabercon para produção com:
- **Frontend**: `https://portal.sabercon.com.br` (Next.js na porta 3000)
- **Backend API**: `https://portal.sabercon.com.br/api` (Node.js/Express na porta 3001)

## 🏗️ Arquitetura

```
Internet → Nginx (443/80) → Frontend (3000) + Backend API (3001)
                         ↓
                    PostgreSQL + Redis
```

### Roteamento:
- `https://portal.sabercon.com.br/*` → Frontend Next.js
- `https://portal.sabercon.com.br/api/*` → Backend API
- `https://portal.sabercon.com.br/_health` → Health check do Nginx
- `https://portal.sabercon.com.br/api/health` → Health check do Backend

## 📁 Arquivos Criados/Modificados

### 1. Configurações de Produção
- `nginx-production-config.conf` - Configuração completa do Nginx
- `env.production.portal` - Variáveis de ambiente do frontend
- `backend/env.production.portal` - Variáveis de ambiente do backend
- `deploy-portal-production.sh` - Script de deploy automatizado

### 2. Configurações Atualizadas
- `next.config.ts` - Desabilitado proxy interno em produção
- `ecosystem.config.js` - Configurações do PM2 atualizadas
- `backend/src/routes/health.ts` - Endpoint de health check
- `backend/src/config/routes.ts` - Rotas de health adicionadas

## 🚀 Como Fazer o Deploy

### Pré-requisitos
- Servidor Ubuntu/Debian com acesso root
- Domínio `portal.sabercon.com.br` apontando para o servidor
- Código do projeto em `/var/www/portal`

### Deploy Automático

#### Opção 1: Setup + Deploy (Recomendado para servidores novos)

1. **Execute o setup inicial:**
```bash
# Faça upload apenas do script de setup
sudo bash setup-portal-server.sh
```

2. **Execute o deploy:**
```bash
cd /var/www/portal
sudo bash deploy-portal-production.sh
```

#### Opção 2: Deploy direto (se o projeto já está no servidor)

```bash
# No diretório do projeto
sudo bash deploy-portal-production.sh
```

O script automaticamente detecta o diretório do projeto e oferece opções se não encontrar.

O script irá automaticamente:
- ✅ Instalar dependências do sistema (curl, wget, git, etc.)
- ✅ Instalar Node.js 18.x
- ✅ Instalar PM2
- ✅ Instalar PostgreSQL
- ✅ Instalar Redis
- ✅ Instalar Nginx
- ✅ Instalar Certbot
- ✅ Configurar variáveis de ambiente
- ✅ Fazer build das aplicações
- ✅ Configurar Nginx
- ✅ Configurar PM2
- ✅ Configurar firewall
- ✅ Opção de configurar SSL automaticamente

### Deploy Manual (Passo a Passo)

Se preferir fazer manualmente:

1. **Instalar dependências:**
```bash
sudo apt update
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release ufw git build-essential

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Certbot
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
```

2. **Configurar banco de dados:**
```bash
sudo -u postgres createuser --interactive portal_user
sudo -u postgres createdb portal_sabercon
sudo -u postgres psql -c "ALTER USER portal_user PASSWORD 'sua_senha_aqui';"
```

3. **Configurar projeto:**
```bash
cd /var/www/portal
cp env.production.portal .env.production
cp backend/env.production.portal backend/.env.production

# Editar os arquivos .env com suas configurações
sudo nano .env.production
sudo nano backend/.env.production
```

4. **Build e deploy:**
```bash
npm ci --only=production
cd backend && npm ci --only=production && cd ..

npm run build
cd backend && npm run build && cd ..

cd backend && npm run migrate && cd ..
```

5. **Configurar Nginx:**
```bash
sudo cp nginx-production-config.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

6. **Iniciar aplicações:**
```bash
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

7. **Configurar SSL:**
```bash
sudo certbot --nginx -d portal.sabercon.com.br -d www.portal.sabercon.com.br
```

## ⚙️ Configuração das Variáveis de Ambiente

### Frontend (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://portal.sabercon.com.br
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api
NEXTAUTH_URL=https://portal.sabercon.com.br
NEXTAUTH_SECRET=seu-secret-aqui
# ... outras configurações
```

### Backend (backend/.env.production)
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://portal.sabercon.com.br
API_BASE_URL=https://portal.sabercon.com.br/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=portal_user
DB_PASSWORD=sua-senha-do-banco
# ... outras configurações
```

## 🔧 Comandos Úteis

### PM2
```bash
pm2 status                # Ver status das aplicações
pm2 logs                  # Ver logs
pm2 restart all           # Reiniciar todas as aplicações
pm2 reload all            # Reload sem downtime
pm2 monit                 # Monitor em tempo real
```

### Nginx
```bash
sudo nginx -t             # Testar configuração
sudo systemctl reload nginx   # Recarregar configuração
sudo systemctl restart nginx  # Reiniciar Nginx
tail -f /var/log/nginx/error.log  # Ver logs de erro
```

### SSL
```bash
sudo certbot renew       # Renovar certificados
sudo certbot certificates # Listar certificados
```

### Logs do Sistema
```bash
journalctl -u nginx -f   # Logs do Nginx
journalctl -u postgresql -f  # Logs do PostgreSQL
journalctl -u redis-server -f  # Logs do Redis
```

## 🧪 Testes

### Verificar se está funcionando:
```bash
# Frontend
curl -I https://portal.sabercon.com.br

# Backend API
curl https://portal.sabercon.com.br/api/health

# Health checks
curl https://portal.sabercon.com.br/_health
curl https://portal.sabercon.com.br/api/ping
```

### Verificar portas:
```bash
sudo netstat -tuln | grep :3000  # Frontend
sudo netstat -tuln | grep :3001  # Backend
sudo netstat -tuln | grep :443   # HTTPS
sudo netstat -tuln | grep :80    # HTTP
```

## 🔒 Segurança

### Firewall configurado:
- Porta 80 (HTTP) - Redirecionamento para HTTPS
- Porta 443 (HTTPS) - Tráfego principal
- Porta 22 (SSH) - Acesso administrativo

### Headers de segurança:
- HSTS
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### Rate Limiting:
- API: 30 req/s
- Frontend: 20 req/s
- Login: 5 req/min

## 🚨 Troubleshooting

### Frontend não carrega:
```bash
pm2 logs PortalServerFrontend
sudo systemctl status nginx
```

### Backend API não responde:
```bash
pm2 logs PortalServerBackend
curl http://localhost:3001/api/health
```

### Erro de banco de dados:
```bash
sudo -u postgres psql -c "\l"  # Listar bancos
sudo systemctl status postgresql
```

### Erro de Redis:
```bash
redis-cli ping
sudo systemctl status redis-server
```

### Erro de SSL:
```bash
sudo certbot certificates
sudo nginx -t
```

## 📊 Monitoramento

### Verificar status geral:
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
```

### Verificar recursos:
```bash
htop                     # CPU e memória
df -h                    # Espaço em disco
free -h                  # Memória
```

### Logs em tempo real:
```bash
pm2 logs --lines 100     # Logs das aplicações
tail -f /var/log/nginx/access.log  # Logs de acesso
```

## 🔄 Atualizações

Para atualizar o sistema:
```bash
cd /var/www/portal
sudo git pull origin new_release
sudo bash deploy-portal-production.sh
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `pm2 logs`
2. Verifique o status dos serviços
3. Teste as URLs de health check
4. Verifique a configuração do Nginx: `sudo nginx -t`

---

**✨ Portal Sabercon rodando em produção com sucesso!** 