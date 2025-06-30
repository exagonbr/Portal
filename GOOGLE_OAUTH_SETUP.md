# 🔐 Configuração Google OAuth - Portal Sabercon

## 📋 Configuração Necessária no Google Cloud Console

Para que o login com Google funcione em produção, você precisa configurar as URLs autorizadas no Google Cloud Console.

### 🌐 **1. Acessar Google Cloud Console**
1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto ou crie um novo
3. Vá para **APIs & Services** → **Credentials**

### 🔑 **2. Configurar OAuth 2.0 Client**
1. Clique no seu **OAuth 2.0 Client ID** existente
2. Ou crie um novo se não existir

### ✅ **3. Adicionar URLs Autorizadas**

#### **Authorized JavaScript origins:**
```
https://portal.sabercon.com.br
http://localhost:3000
```

#### **Authorized redirect URIs:**
```
https://portal.sabercon.com.br/api/auth/google/callback
http://localhost:3001/auth/google/callback
```

### 🔧 **4. Credenciais Atuais**
- **Client ID**: `1049786491633-bfgulpbk43kkpgjaub36rhmv4v9l0m0u.apps.googleusercontent.com`
- **Client Secret**: `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`

### 🧪 **5. Testar a Configuração**

#### **Em Desenvolvimento:**
1. Acesse: http://localhost:3000/auth/login
2. Clique em "Entrar com o Google"
3. Deve redirecionar para: `http://localhost:3001/auth/google`

#### **Em Produção:**
1. Acesse: https://portal.sabercon.com.br/auth/login
2. Clique em "Entrar com o Google"
3. Deve redirecionar para: `https://portal.sabercon.com.br/api/auth/google`

### 🔄 **6. Fluxo Completo**
```
1. Usuário clica "Entrar com o Google"
   ↓
2. Redireciona para Google OAuth
   ↓
3. Usuário autoriza no Google
   ↓
4. Google redireciona para: /api/auth/google/callback
   ↓
5. Backend processa e gera JWT
   ↓
6. Redireciona para: /auth/callback?token=JWT
   ↓
7. Frontend processa token e autentica usuário
```

### ⚠️ **7. Troubleshooting**

#### **Erro: "redirect_uri_mismatch"**
- Verifique se as URLs no Google Console estão exatamente iguais
- Certifique-se de incluir `https://` ou `http://`
- Não esqueça da porta em desenvolvimento (`:3001`)

#### **Erro: "unauthorized_client"**
- Verifique se o Client ID e Secret estão corretos
- Confirme se o projeto está ativo no Google Console

#### **Erro: "access_denied"**
- Usuário cancelou a autorização
- Tente novamente

### 📝 **8. Logs para Debug**
Os logs aparecerão no console do backend:
```
🔐 Google OAuth: Redirecionando usuário após autenticação
👤 Usuário: usuario@email.com
🌐 Frontend URL: https://portal.sabercon.com.br
```

### ✅ **9. Checklist de Configuração**
- [ ] URLs adicionadas no Google Console
- [ ] Variáveis de ambiente configuradas
- [ ] Backend reiniciado após mudanças
- [ ] Frontend buildado com novas variáveis
- [ ] Teste em desenvolvimento funcionando
- [ ] Teste em produção funcionando

---

**🎯 Status**: Implementação completa - Pronto para uso!
**📅 Data**: Janeiro 2025
**🔧 Versão**: 1.0
