# Portal Sabercon - Configuração Produção AWS

## 🚀 Guia Completo de Deploy em Produção

Este guia detalha como configurar o Portal Sabercon para rodar em produção na AWS com o domínio `https://portal.sabercon.com.br`.

### 📋 Pré-requisitos

- Servidor AWS (EC2) com Ubuntu 20.04+ ou similar
- Domínio `portal.sabercon.com.br` configurado no DNS
- Node.js 18+ instalado
- PM2 instalado globalmente (`npm install -g pm2`)
- PostgreSQL configurado
- Redis configurado (opcional)
- Acesso root/sudo ao servidor

### 🏗️ Arquitetura de Produção

```
Internet → Nginx (443/80) → Frontend (3000) + Backend (3001)
                         ↓
                    PostgreSQL + Redis
```

- **Frontend**: Next.js rodando na porta 3000
- **Backend**: Express.js rodando na porta 3001  
- **Nginx**: Proxy reverso com SSL/TLS
- **Domínio**: `https://portal.sabercon.com.br`

### 🔧 Configuração Passo a Passo

#### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git build-essential

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Verificar instalações
node --version
npm --version
pm2 --version
```

#### 2. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone <seu-repositorio> /var/www/portal
cd /var/www/portal

# Dar permissões
sudo chown -R $USER:$USER /var/www/portal
chmod +x *.sh
```

#### 3. Deploy da Aplicação

```bash
# Executar deploy em produção
bash deploy-production.sh
```

Este script irá:
- ✅ Atualizar código do repositório
- ✅ Configurar variáveis de ambiente
- ✅ Instalar dependências
- ✅ Fazer build das aplicações
- ✅ Executar migrações do banco
- ✅ Iniciar serviços com PM2

#### 4. Configurar SSL e Nginx

```bash
# Configurar Nginx + SSL Let's Encrypt
sudo bash setup-production-aws.sh
```

Este script irá:
- ✅ Instalar e configurar Nginx
- ✅ Configurar proxy reverso
- ✅ Obter certificado SSL Let's Encrypt
- ✅ Configurar renovação automática
- ✅ Aplicar otimizações de segurança

### 🌐 URLs Disponíveis

Após a configuração completa:

- **Frontend**: `https://portal.sabercon.com.br/`
- **Backend API**: `https://portal.sabercon.com.br/api/`
- **Backend Direto**: `https://portal.sabercon.com.br/backend/`
- **Health Check**: `https://portal.sabercon.com.br/_health`

### 📊 Monitoramento

#### Comandos PM2

```bash
# Ver status dos serviços
pm2 list

# Ver logs em tempo real
pm2 logs

# Ver logs específicos
pm2 logs PortalServerFrontend
pm2 logs PortalServerBackend

# Reiniciar serviços
pm2 restart PortalServerFrontend
pm2 restart PortalServerBackend

# Parar serviços
pm2 stop all

# Salvar configuração PM2
pm2 save

# Configurar inicialização automática
pm2 startup
```

#### Script de Monitoramento

```bash
# Executar script de monitoramento completo
/root/monitor-portal.sh
```

#### Logs do Sistema

```bash
# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs da aplicação
tail -f logs/frontend-combined.log
tail -f logs/backend-combined.log
```

### 🔒 Configurações de Segurança

#### Firewall (UFW)

```bash
# Ver status do firewall
sudo ufw status

# Regras configuradas automaticamente:
# - SSH (22)
# - HTTP (80) 
# - HTTPS (443)
# - Aplicações apenas localhost/rede interna
```

#### SSL/TLS

```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados manualmente
sudo certbot renew

# Testar renovação
sudo certbot renew --dry-run
```

### 🗄️ Banco de Dados

#### PostgreSQL

```bash
# Conectar ao banco
sudo -u postgres psql

# Verificar conexões
\l
\c portal_sabercon
\dt
```

#### Migrações

```bash
# Executar migrações
cd backend
npm run migrate

# Rollback (se necessário)
npm run migrate:rollback
```

### ⚙️ Variáveis de Ambiente

#### Principais Configurações

Edite os arquivos `.env` conforme necessário:

```bash
# Arquivo principal (.env)
NODE_ENV=production
NEXTAUTH_URL=https://portal.sabercon.com.br
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api

# Arquivo backend (backend/.env)
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=portal_sabercon
```

#### Variáveis Sensíveis

Configure estas variáveis com valores reais:

```bash
# Database
DB_PASSWORD=sua_senha_segura_aqui

# JWT
JWT_SECRET=sua_chave_jwt_segura_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_segura_aqui

# Email (se usado)
SMTP_HOST=seu_smtp_host
SMTP_USER=seu_usuario_email
SMTP_PASS=sua_senha_email

# AWS S3 (se usado)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
```

### 🔄 Atualizações

#### Deploy de Nova Versão

```bash
# Método 1: Script automático
bash deploy-production.sh

# Método 2: Manual
git pull origin master
npm ci --only=production
npm run build
cd backend
npm ci --only=production
npm run build
cd ..
pm2 restart all
```

#### Rollback

```bash
# Voltar para commit anterior
git reset --hard HEAD~1
bash deploy-production.sh
```

### 🚨 Troubleshooting

#### Problemas Comuns

**1. Aplicação não inicia**
```bash
# Verificar logs
pm2 logs
# Verificar portas
netstat -tlnp | grep -E "(3000|3001)"
# Verificar variáveis de ambiente
cat .env
```

**2. SSL não funciona**
```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
# Verificar certificados
sudo certbot certificates
# Verificar DNS
dig portal.sabercon.com.br
```

**3. Banco de dados não conecta**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
# Testar conexão
psql -h localhost -U portal_user -d portal_sabercon
```

**4. Alto uso de memória**
```bash
# Verificar uso
free -h
pm2 monit
# Reiniciar se necessário
pm2 restart all
```

#### Logs de Debug

```bash
# Habilitar logs detalhados
export DEBUG=*
pm2 restart all

# Ver logs específicos
pm2 logs --lines 100
```

### 📈 Performance

#### Otimizações Aplicadas

- ✅ Gzip compression no Nginx
- ✅ Cache de assets estáticos
- ✅ Rate limiting
- ✅ Connection pooling
- ✅ Otimizações de rede do sistema
- ✅ PM2 com restart automático

#### Monitoramento de Performance

```bash
# CPU e memória
htop

# Conexões de rede
netstat -an | grep :443 | wc -l

# Status do Nginx
curl http://localhost/nginx_status
```

### 🔐 Backup

#### Banco de Dados

```bash
# Backup manual
pg_dump -h localhost -U portal_user portal_sabercon > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U portal_user portal_sabercon < backup_20240101.sql
```

#### Arquivos da Aplicação

```bash
# Backup completo
tar -czf portal_backup_$(date +%Y%m%d).tar.gz /var/www/portal
```

### 📞 Suporte

#### Contatos

- **Email**: admin@sabercon.com.br
- **Documentação**: Este arquivo
- **Logs**: `/var/log/nginx/` e `logs/`

#### Comandos de Emergência

```bash
# Parar tudo
pm2 stop all
sudo systemctl stop nginx

# Reiniciar tudo
sudo systemctl start nginx
pm2 start ecosystem.config.js --env production

# Status geral
/root/monitor-portal.sh
```

---

## ✅ Checklist de Produção

- [ ] Servidor AWS configurado
- [ ] DNS apontando para o servidor
- [ ] Node.js e PM2 instalados
- [ ] PostgreSQL configurado
- [ ] Código clonado e permissões configuradas
- [ ] `deploy-production.sh` executado com sucesso
- [ ] `setup-production-aws.sh` executado com sucesso
- [ ] SSL funcionando (https://portal.sabercon.com.br)
- [ ] Frontend acessível
- [ ] Backend API respondendo
- [ ] Banco de dados conectado
- [ ] PM2 configurado para inicialização automática
- [ ] Monitoramento funcionando
- [ ] Backup configurado

---

**Portal Sabercon v3.0 - Produção AWS** 🚀 