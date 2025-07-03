# Remoção Completa do Nginx em Produção - Portal Sabercon

## 📋 Visão Geral

Este documento descreve o processo de **remoção completa do Nginx** em produção, configurando o Portal Sabercon para rodar em **modo direto** com PM2, eliminando a camada de proxy e melhorando a performance.

## 🎯 Objetivos

- ✅ **Remover completamente o Nginx** da produção
- ✅ **Configurar comunicação direta** frontend ↔ backend
- ✅ **Melhorar performance** eliminando proxy desnecessário
- ✅ **Simplificar arquitetura** reduzindo complexidade
- ✅ **Manter alta disponibilidade** com PM2 e systemd

## 🏗️ Arquitetura

### Antes (Com Nginx)
```
Cliente → Nginx (porta 80/443) → Frontend (porta 3000) → Backend (porta 3001)
```

### Depois (Modo Direto)
```
Cliente → Frontend (porta 3000) ↔ Backend (porta 3001)
```

## 📁 Scripts Disponíveis

### 1. `remove-nginx-production.sh`
**Script principal** para remoção completa do Nginx e configuração do modo direto.

**Funcionalidades:**
- Remove Nginx completamente (pacotes, configurações, logs)
- Cria backup completo antes da remoção
- Configura firewall para acesso direto
- Cria configuração PM2 otimizada
- Configura serviços systemd
- Cria scripts de gerenciamento (`portal-start`, `portal-stop`, `portal-status`)
- Testa conectividade e valida configuração

### 2. `rollback-nginx-production.sh`
**Script de rollback** para restaurar o Nginx caso necessário.

**Funcionalidades:**
- Lista backups disponíveis
- Restaura configurações do Nginx
- Reconfigura firewall para Nginx
- Atualiza configuração PM2 para modo proxy
- Valida e inicia serviços

## 🚀 Como Usar

### Preparação

1. **Acesse o servidor de produção** como root:
```bash
sudo su -
```

2. **Navegue até o diretório do projeto:**
```bash
cd /opt/portal-sabercon  # ou seu diretório
```

3. **Baixe os scripts** (se não estiverem no servidor):
```bash
# Copie os scripts para o servidor
```

4. **Torne os scripts executáveis:**
```bash
chmod +x remove-nginx-production.sh
chmod +x rollback-nginx-production.sh
```

### Execução da Remoção

1. **Execute o script de remoção:**
```bash
./remove-nginx-production.sh
```

2. **Confirme a operação** quando solicitado:
```
⚠️  ATENÇÃO: Isso removerá completamente o Nginx. Continuar? (y/N): y
```

3. **Aguarde a conclusão** (processo leva ~5-10 minutos)

4. **Verifique o resultado:**
```bash
portal-status
```

### Se Precisar Fazer Rollback

1. **Execute o script de rollback:**
```bash
./rollback-nginx-production.sh
```

2. **Escolha o backup** quando solicitado:
```
📋 Digite o nome do backup para restaurar: nginx-removal-20250630-123000
```

3. **Confirme a operação:**
```
⚠️  ATENÇÃO: Isso restaurará o Nginx e parará o modo direto. Continuar? (y/N): y
```

## ⚙️ Configurações Criadas

### Configuração PM2 (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_APP_URL: 'http://portal.sabercon.com.br:3000',
        NEXT_PUBLIC_API_URL: 'http://portal.sabercon.com.br:3001/api',
        INTERNAL_API_URL: 'http://localhost:3001/api'
      }
    },
    {
      name: 'backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        CORS_ORIGIN: 'http://portal.sabercon.com.br:3000'
      }
    }
  ]
};
```

### Configuração de Ambiente (`.env.production`)
```env
# Portal Sabercon - Produção Direta (Sem Nginx)
NODE_ENV=production

# URLs diretas
NEXT_PUBLIC_APP_URL=http://portal.sabercon.com.br:3000
NEXT_PUBLIC_API_URL=http://portal.sabercon.com.br:3001/api
INTERNAL_API_URL=http://localhost:3001/api

# Sem proxy
DISABLE_NEXTJS_PROXY=true
DIRECT_BACKEND_COMMUNICATION=true
NGINX_REQUIRED=false
```

### Serviço Systemd (`portal-sabercon.service`)
```ini
[Unit]
Description=Portal Sabercon (Direct Mode)
After=network.target

[Service]
Type=forking
User=ubuntu
WorkingDirectory=/opt/portal-sabercon
ExecStart=/usr/local/bin/portal-start
ExecStop=/usr/local/bin/portal-stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🔧 Comandos de Gerenciamento

Após a remoção do Nginx, você terá acesso aos seguintes comandos:

### Scripts de Gerenciamento
```bash
portal-start    # Iniciar aplicações
portal-stop     # Parar aplicações
portal-status   # Ver status completo
```

### Comandos PM2
```bash
pm2 status      # Status das aplicações
pm2 logs        # Ver logs em tempo real
pm2 logs frontend  # Logs só do frontend
pm2 logs backend   # Logs só do backend
pm2 monit       # Monitor em tempo real
pm2 restart all # Reiniciar aplicações
```

### Comandos Systemd
```bash
systemctl status portal-sabercon    # Status do serviço
systemctl start portal-sabercon     # Iniciar serviço
systemctl stop portal-sabercon      # Parar serviço
systemctl restart portal-sabercon   # Reiniciar serviço
```

## 🌐 URLs de Acesso

### Modo Direto (Sem Nginx)
- **Frontend:** `http://portal.sabercon.com.br:3000`
- **Backend API:** `http://portal.sabercon.com.br:3001/api`

### Configuração DNS/Load Balancer

**IMPORTANTE:** Após a remoção do Nginx, você precisa configurar seu DNS ou Load Balancer para apontar para as portas corretas:

```
portal.sabercon.com.br:3000  → Frontend
portal.sabercon.com.br:3001  → Backend API
```

## 🔥 Configuração de Firewall

### Regras Aplicadas
```bash
# Portas abertas
3000/tcp  # Frontend Next.js
3001/tcp  # Backend API
22/tcp    # SSH

# Portas removidas
80/tcp    # HTTP (Nginx)
443/tcp   # HTTPS (Nginx)
```

### Verificar Firewall
```bash
ufw status
```

## 📊 Monitoramento

### Logs do Sistema
```bash
# Logs das aplicações
tail -f /opt/portal-sabercon/logs/frontend-combined.log
tail -f /opt/portal-sabercon/logs/backend-combined.log

# Logs do sistema
journalctl -u portal-sabercon -f
```

### Verificação de Saúde
```bash
# Testar frontend
curl -I http://localhost:3000

# Testar backend
curl -I http://localhost:3001/api/_health

# Status completo
portal-status
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Aplicações não iniciam
```bash
# Verificar logs
pm2 logs

# Verificar configuração
pm2 show frontend
pm2 show backend

# Reiniciar
pm2 restart all
```

#### 2. Portas bloqueadas
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Verificar firewall
ufw status
```

#### 3. Problemas de conectividade
```bash
# Testar conectividade local
curl http://localhost:3000
curl http://localhost:3001/api/_health

# Verificar DNS
nslookup portal.sabercon.com.br
```

#### 4. Problemas de CORS
```bash
# Verificar configuração CORS no backend
grep -r "CORS_ORIGIN" /opt/portal-sabercon/backend/

# Verificar logs do backend
pm2 logs backend
```

### Comandos de Diagnóstico

```bash
# Status completo do sistema
portal-status

# Verificar processos
ps aux | grep node

# Verificar conexões de rede
ss -tulpn | grep :300

# Verificar logs do sistema
journalctl -u portal-sabercon --since "1 hour ago"
```

## 📈 Benefícios Esperados

### Performance
- **30-50% redução na latência** de requisições
- **Menor uso de CPU** no servidor
- **Menos timeouts** e erros de conexão
- **Resposta mais rápida** da API

### Simplicidade
- **Arquitetura mais simples** sem proxy
- **Menos pontos de falha**
- **Configuração mais direta**
- **Debugging mais fácil**

### Manutenção
- **Menos serviços para gerenciar**
- **Logs mais diretos**
- **Configuração centralizada no PM2**
- **Menos dependências externas**

## ⚠️ Considerações Importantes

### Segurança
- **Sem HTTPS automático:** Configure SSL/TLS no Load Balancer
- **Firewall:** Apenas portas necessárias abertas
- **CORS:** Configurado adequadamente

### Backup
- **Backup automático:** Criado antes da remoção
- **Rollback disponível:** Script de restauração incluído
- **Configurações salvas:** Todas as configurações antigas preservadas

### DNS/Load Balancer
- **Atualização necessária:** Configure para as novas portas
- **Certificados SSL:** Mova para o Load Balancer
- **Health checks:** Configure para as novas URLs

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:** `pm2 logs` e `portal-status`
2. **Consulte troubleshooting** neste documento
3. **Use o rollback** se necessário: `./rollback-nginx-production.sh`
4. **Contate o suporte** com logs específicos

---

**Portal Sabercon - Produção Otimizada Sem Nginx** 🚀 