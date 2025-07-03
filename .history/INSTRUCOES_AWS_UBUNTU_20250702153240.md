# 🚀 Deploy do Portal Sabercon na AWS (Ubuntu)

## 📋 Pré-requisitos
- Instância EC2 com Ubuntu (recomendado: t3.medium ou superior)
- Domínio apontando para o IP da instância
- Portas 80 e 443 liberadas no Security Group
- Git configurado com SSH (para acesso ao repositório)

## 🔧 Passo a Passo

### 1. Corrigir problema de GRUB/dpkg (se necessário)

Se encontrar o erro:
```
Unknown device "/dev/disk/by-id/*": No such file or directory
dpkg: error processing package grub-efi-amd64-signed (--configure)
```

Execute:
```bash
# Baixe o script de correção
wget https://raw.githubusercontent.com/seu-usuario/portal/new_release/fix-aws-ubuntu-dpkg.sh

# Execute o script
sudo bash fix-aws-ubuntu-dpkg.sh
```

### 2. Deploy Completo

```bash
# Clone o repositório (se ainda não tiver)
sudo mkdir -p /var/www/portal
sudo git clone git@github.com:seu-usuario/portal.git /var/www/portal
cd /var/www/portal

# Execute o script de deploy
sudo bash deploy-aws-portal.sh
```

## 🛠️ Comandos Úteis

### Gerenciamento de Aplicações (PM2)
```bash
# Ver status das aplicações
sudo pm2 status

# Ver logs
sudo pm2 logs

# Reiniciar aplicações
sudo pm2 restart all

# Parar aplicações
sudo pm2 stop all

# Iniciar aplicações
sudo pm2 start ecosystem.config.js
```

### Nginx
```bash
# Verificar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Certificado SSL
```bash
# Renovar certificado manualmente
sudo certbot renew

# Forçar renovação
sudo certbot --force-renewal
```

### Banco de Dados (PostgreSQL)
```bash
# Acessar banco de dados
sudo -u postgres psql portal_sabercon

# Backup do banco de dados
sudo -u postgres pg_dump portal_sabercon > backup_$(date +%Y%m%d).sql

# Restaurar backup
sudo -u postgres psql portal_sabercon < backup_file.sql
```

## ⚠️ Solução de Problemas

### 1. Erro de GRUB/dpkg
```bash
sudo bash fix-aws-ubuntu-dpkg.sh
```

### 2. Problemas de Certificado SSL
```bash
# Reinstalar certificado
sudo certbot --nginx -d portal.sabercon.com.br
```

### 3. Problemas no Nginx
```bash
# Verificar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx
```

### 4. Problemas no Node.js/PM2
```bash
# Reinstalar PM2
sudo npm install -g pm2

# Limpar e reiniciar
sudo pm2 delete all
sudo pm2 start ecosystem.config.js
```

### 5. Problemas de Espaço em Disco
```bash
# Verificar espaço
df -h

# Limpar pacotes não utilizados
sudo apt-get autoremove -y
sudo apt-get clean

# Limpar logs antigos
sudo find /var/log -type f -name "*.gz" -delete
```

## 📊 Monitoramento

### Verificar Recursos
```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Uso de rede
netstat -tulpn
```

### Logs da Aplicação
```bash
# Frontend
sudo pm2 logs portal-frontend

# Backend
sudo pm2 logs portal-backend
```

## 🔄 Atualização do Sistema

Para atualizar apenas o código da aplicação:
```bash
cd /var/www/portal
sudo git fetch --all
sudo git reset --hard origin/new_release
sudo npm ci
cd backend && sudo npm ci && cd ..
sudo npm run build
cd backend && sudo npm run build && cd ..
sudo pm2 restart all
```

## 📝 Notas Importantes

1. **Backup Automático**: Configure backups automáticos do banco de dados
2. **Monitoramento**: Considere adicionar monitoramento com CloudWatch
3. **Escalonamento**: Para mais tráfego, considere aumentar o tamanho da instância
4. **Segurança**: Mantenha o sistema atualizado com `sudo apt update && sudo apt upgrade`

---

**Desenvolvido para Portal Sabercon** 🎓 