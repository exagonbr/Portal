# 🔒 Configuração SSL Let's Encrypt para 54.232.72.62:3000

Este guia configura HTTPS gratuito com Let's Encrypt para seu servidor AWS rodando Next.js na porta 3000.

## 📋 Pré-requisitos

✅ **Servidor Linux** (Ubuntu/Debian)  
✅ **Acesso root** ao servidor  
✅ **Aplicação rodando** na porta 3000  
✅ **Portas 80 e 443** disponíveis  

## 🚀 Opção 1: Script Rápido (Recomendado)

```bash
# 1. Baixar e executar script rápido
wget https://raw.githubusercontent.com/seu-repo/quick-ssl-setup.sh
sudo bash quick-ssl-setup.sh
```

**OU copie o conteúdo de `quick-ssl-setup.sh` e execute:**

```bash
# 1. Conectar ao servidor
ssh root@54.232.72.62

# 2. Criar o script
nano quick-ssl-setup.sh

# 3. Colar o conteúdo do arquivo quick-ssl-setup.sh

# 4. Tornar executável e rodar
chmod +x quick-ssl-setup.sh
sudo bash quick-ssl-setup.sh
```

## 🔧 Opção 2: Script Completo

Para configuração mais robusta com todas as otimizações:

```bash
# 1. Baixar script completo
wget https://raw.githubusercontent.com/seu-repo/setup-ssl.sh

# 2. Editar email no script
nano setup-ssl.sh
# Altere: EMAIL="admin@example.com" para seu email

# 3. Executar
sudo bash setup-ssl.sh
```

## 📝 Passos Manuais (se preferir)

### 1. Instalar dependências
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configurar Nginx como proxy
```bash
sudo nano /etc/nginx/sites-available/default
```

Cole esta configuração:
```nginx
server {
    listen 80;
    server_name 54.232.72.62;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Iniciar Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Obter certificado SSL
```bash
sudo certbot --nginx -d 54.232.72.62 --email seu-email@exemplo.com --agree-tos --non-interactive
```

### 5. Configurar renovação automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 🔍 Verificação

Após a configuração:

```bash
# Verificar status SSL
sudo certbot certificates

# Verificar Nginx
sudo systemctl status nginx

# Testar renovação
sudo certbot renew --dry-run

# Verificar site
curl -I https://54.232.72.62
```

## 🌐 Resultado

Após executar o script:

- ✅ **HTTP**: http://54.232.72.62 (redireciona para HTTPS)
- ✅ **HTTPS**: https://54.232.72.62 (funcionando)
- ✅ **PWA**: Botão "Instalar App" funciona completamente
- ✅ **Auto-renovação**: Certificado renova automaticamente

## 🚨 Solução de Problemas

### Erro "Address already in use"
```bash
# Verificar o que usa a porta 80
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2  # se Apache estiver rodando
```

### Certificado não obtido
```bash
# Verificar firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# Verificar se nginx responde
curl -I http://54.232.72.62
```

### PWA ainda não funciona
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique se acessa via HTTPS
3. Abra DevTools > Application > Service Workers

## 📞 Comandos Úteis

```bash
# Status geral
sudo /usr/local/bin/check-ssl-status.sh

# Recarregar Nginx
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Forçar renovação
sudo certbot renew --force-renewal
```

## 🎯 Próximos Passos

Depois que o SSL estiver funcionando:

1. **Teste a PWA**: https://54.232.72.62
2. **Instale no celular**: Chrome > Menu > "Instalar app"
3. **Configure domínio**: Considere usar um domínio próprio
4. **Monitore**: Configure alertas de expiração

---

💡 **Dica**: O certificado Let's Encrypt expira em 90 dias, mas renova automaticamente. Monitore os logs ocasionalmente para garantir que a renovação funciona. 