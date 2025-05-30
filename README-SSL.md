# 🔒 Configuração SSL Let's Encrypt - Portal Sabercon

Este guia configura HTTPS gratuito com Let's Encrypt para o Portal Sabercon rodando em AWS:
- 📱 **Frontend**: 54.232.72.62:3000 (Next.js)
- 🔧 **Backend**: 54.232.72.62:3001 (API/Admin)

## 📋 Pré-requisitos

✅ **Servidor Linux** (Ubuntu/Debian)  
✅ **Acesso root** ao servidor  
✅ **Frontend rodando** na porta 3000  
✅ **Backend rodando** na porta 3001  
✅ **Portas 80 e 443** disponíveis  

## 🚀 Opção 1: Script Rápido (Recomendado)

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
# 1. Criar script completo
nano setup-ssl.sh

# 2. Colar o conteúdo do arquivo setup-ssl.sh

# 3. Alterar email se necessário
# EMAIL="admin@sabercon.com.br"

# 4. Executar
chmod +x setup-ssl.sh
sudo bash setup-ssl.sh
```

## 📝 Passos Manuais (se preferir)

### 1. Instalar dependências
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx net-tools
```

### 2. Configurar Nginx como proxy para ambos serviços
```bash
sudo nano /etc/nginx/sites-available/default
```

Cole esta configuração:
```nginx
server {
    listen 80;
    server_name 54.232.72.62;
    
    # Frontend (raiz)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Content-Type application/json;
    }
    
    # Backend direto
    location /backend {
        rewrite ^/backend/(.*) /$1 break;
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Configurar firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw --force enable
```

### 4. Iniciar Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Obter certificado SSL
```bash
sudo certbot --nginx -d 54.232.72.62 --email admin@sabercon.com.br --agree-tos --non-interactive
```

### 6. Configurar renovação automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 🔍 Verificação

Após a configuração:

```bash
# Verificar status geral Portal Sabercon
sudo /usr/local/bin/check-sabercon-status.sh

# Verificar certificados SSL
sudo certbot certificates

# Verificar Nginx
sudo systemctl status nginx

# Testar renovação
sudo certbot renew --dry-run

# Verificar se aplicações estão rodando
netstat -tlnp | grep -E "(3000|3001)"

# Testar URLs
curl -I https://54.232.72.62
curl -I https://54.232.72.62/api
curl -I https://54.232.72.62/backend
```

## 🌐 URLs Disponíveis

Após executar o script:

### ✅ **Frontend (PWA)**
- 🌐 **HTTP**: http://54.232.72.62 → redireciona para HTTPS
- 🔒 **HTTPS**: https://54.232.72.62
- 📱 **PWA**: Botão "Instalar App" funciona completamente

### ✅ **Backend**
- 🔧 **API**: https://54.232.72.62/api
- 🛠️ **Admin**: https://54.232.72.62/backend
- 🔄 **Auto-renovação**: Certificado renova automaticamente

## 🚨 Solução de Problemas

### Aplicações não encontradas
```bash
# Verificar se estão rodando
pm2 list
netstat -tlnp | grep -E "(3000|3001)"

# Iniciar se necessário
cd /caminho/para/frontend
pm2 start npm --name "Frontend" -- run dev

cd /caminho/para/backend  
pm2 start npm --name "Backend" -- run dev
```

### Erro "Address already in use"
```bash
# Verificar o que usa as portas
sudo netstat -tlnp | grep -E "(80|443)"
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
4. Certifique-se que o frontend está rodando na porta 3000

## 📞 Comandos Úteis

```bash
# Status geral Portal Sabercon
sudo /usr/local/bin/check-sabercon-status.sh

# Gerenciar Nginx
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# Logs importantes
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# SSL/Certificados
sudo certbot certificates
sudo certbot renew --force-renewal
sudo certbot renew --dry-run

# Gerenciar aplicações
pm2 list
pm2 restart all
pm2 logs
```

## 🎯 Estrutura Final

```
https://54.232.72.62/
├── /                    → Frontend Next.js (porta 3000)
├── /api/*               → Backend API (porta 3001)
├── /backend/*           → Backend Admin (porta 3001)
└── /static/*            → Arquivos estáticos (cache 1 ano)
```

## 📱 Teste da PWA

1. **Acesse**: https://54.232.72.62
2. **Verifique**: Botão "Instalar App" aparece
3. **Instale**: Chrome > Menu > "Instalar app"
4. **Teste**: Funcionalidade offline
5. **Confirme**: Service Worker ativo

## 🔄 Deploy e Manutenção

Para usar com seu script de deploy:

```bash
# Seu deploy.sh já está configurado para:
# - Frontend na raiz (porta 3000)
# - Backend na pasta backend/ (porta 3001)

# Após deploy, as URLs funcionarão:
./deploy.sh
# Frontend: https://54.232.72.62/
# Backend:  https://54.232.72.62/api
```

---

💡 **Dica**: Mantenha ambas aplicações sempre rodando para o SSL funcionar corretamente. Use `pm2` para gerenciar os processos automaticamente. 