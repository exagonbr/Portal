# 🔍 Guia de Debug - Problema de Login

## ❌ Erro Atual
```
Erro 400: Erro durante o login: Error: Email e senha são obrigatórios
```

## 🧪 Testes para Identificar o Problema

### 1. **Teste de Endpoint Correto**

Verifique se você está usando o endpoint correto:

**✅ NOVO (Otimizado):**
```bash
POST /api/auth/optimized/login
```

**❌ ANTIGO:**
```bash
POST /api/auth/login
```

### 2. **Teste com cURL**

```bash
# Teste do endpoint otimizado
curl -X POST https://portal.sabercon.com.br/api/auth/optimized/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha123"}'

# Teste do endpoint antigo
curl -X POST https://portal.sabercon.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha123"}'

# Teste de debug
curl -X POST https://portal.sabercon.com.br/api/auth/optimized/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"teste123"}'
```

### 3. **Verificar Headers**

Certifique-se de que está enviando:
```
Content-Type: application/json
```

### 4. **Verificar Dados JSON**

Formato correto:
```json
{
  "email": "usuario@exemplo.com",
  "password": "suasenha"
}
```

### 5. **Verificar Logs do Backend**

Procure por estes logs no console:

**Endpoint Otimizado:**
```
🔍 DEBUG - Dados recebidos: { body: {...}, email: ..., password: ... }
```

**Endpoint Antigo:**
```
🔐 Nova requisição de login recebida na rota ANTIGA
🔍 DEBUG ROTA ANTIGA - Dados recebidos: { body: {...} }
```

## 🔧 Possíveis Causas

### 1. **Endpoint Errado**
- ❌ Usando `/api/auth/login` (antigo)
- ✅ Deveria usar `/api/auth/optimized/login` (novo)

### 2. **Content-Type Incorreto**
- ❌ `application/x-www-form-urlencoded`
- ✅ `application/json`

### 3. **Dados Malformados**
- ❌ `email=user&password=pass` (form data)
- ✅ `{"email":"user","password":"pass"}` (JSON)

### 4. **Middleware de Parsing**
- O `express.json()` pode não estar funcionando
- Verificar se há conflitos de middleware

## 🛠️ Soluções

### 1. **Use o Endpoint Correto**
```typescript
// ✅ CORRETO
const response = await fetch('/api/auth/optimized/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123'
  })
});
```

### 2. **Teste de Debug**
```typescript
// Teste primeiro com o endpoint de debug
const debugResponse = await fetch('/api/auth/optimized/test-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'teste@exemplo.com',
    password: 'teste123'
  })
});

console.log(await debugResponse.json());
```

### 3. **Verificar Network Tab**
No DevTools do navegador:
1. Abra Network Tab
2. Faça o login
3. Verifique:
   - URL chamada
   - Headers enviados
   - Payload (Request Body)
   - Response

## 📋 Checklist de Debug

- [ ] Verificar se está usando `/api/auth/optimized/login`
- [ ] Verificar se `Content-Type: application/json`
- [ ] Verificar se dados estão em formato JSON
- [ ] Testar com cURL
- [ ] Verificar logs do backend
- [ ] Testar endpoint de debug `/api/auth/optimized/test-login`
- [ ] Verificar Network Tab no navegador

## 🚨 Se Nada Funcionar

1. **Reiniciar o servidor backend**
2. **Verificar se a tabela `user` existe no banco**
3. **Verificar variáveis de ambiente (`JWT_SECRET`)**
4. **Verificar se não há conflitos de porta**

---

**Status:** 🔍 Investigando problema de parsing de dados  
**Próximo passo:** Testar endpoints de debug 