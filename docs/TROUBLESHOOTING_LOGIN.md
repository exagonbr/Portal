# Troubleshooting - Erro de Login "Erro interno do servidor"

## Diagnóstico Rápido

1. **Acesse a página de debug** (apenas em desenvolvimento):
   ```
   https://portal.sabercon.com.br/debug-login
   ```

2. **Verifique o console do navegador** (F12) para mensagens de erro detalhadas.

3. **Execute o diagnóstico no console**:
   ```javascript
   // No console do navegador
   await window.debugLogin('admin@sabercon.edu.br', 'password123')
   ```

## Possíveis Causas e Soluções

### 1. Variáveis de Ambiente Não Configuradas

**Problema**: O sistema não consegue encontrar o backend porque as URLs não estão configuradas.

**Solução**:
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
# Para desenvolvimento local
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080/api
JWT_SECRET=ExagonTech

# Para produção
# NEXT_PUBLIC_BACKEND_URL=https://portal.sabercon.com.br/api
```

3. Reinicie o servidor Next.js

### 2. Backend Não Está Rodando

**Problema**: O backend Express não está rodando na porta esperada.

**Solução**:
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

4. Verifique se está rodando em `http://localhost:8080`

### 3. Problema de CORS

**Problema**: O backend está rejeitando requisições do frontend por CORS.

**Solução**:
1. Verifique a configuração CORS no backend (`backend/src/app.ts`)
2. Certifique-se de que `https://portal.sabercon.com.br` está na lista de origens permitidas

### 4. Erro de Conexão com Banco de Dados

**Problema**: O backend não consegue conectar ao banco de dados.

**Solução**:
1. Verifique se o PostgreSQL está rodando
2. Verifique as credenciais no arquivo `.env` do backend
3. Execute as migrations:
   ```bash
   cd backend
   npm run migrate
   ```

### 5. Usando Credenciais de Fallback

Se o backend estiver indisponível, o sistema tentará usar credenciais de fallback:

- **Admin**: admin@sabercon.edu.br / password123
- **Gestor**: gestor@sabercon.edu.br / password123
- **Professor**: professor@sabercon.edu.br / password123
- **Estudante**: estudante@sabercon.edu.br / password123

## Logs Importantes

Ao tentar fazer login, verifique os seguintes logs no console:

1. **🔐 LOGIN REQUEST START**: Início da requisição
2. **🌐 BACKEND REQUEST**: Tentativa de conexão com o backend
3. **🌐 BACKEND RESPONSE**: Resposta do backend
4. **✅ LOGIN SUCCESS** ou **🚫 LOGIN FAILED**: Resultado final

## Scripts de Debug

### Verificar Variáveis de Ambiente
```javascript
window.checkEnv()
```

### Testar Conexão com Backend
```javascript
fetch('/api/health-check').then(r => r.json()).then(console.log)
```

### Debug Completo de Login
```javascript
const { debugLogin } = await import('/utils/debug-login');
await debugLogin('admin@sabercon.edu.br', 'password123');
```

## Contato para Suporte

Se o problema persistir após seguir estas instruções:

1. Verifique os logs do servidor Next.js
2. Verifique os logs do backend Express
3. Capture o erro completo do console e compartilhe com a equipe de desenvolvimento