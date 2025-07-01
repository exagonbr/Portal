# Página de Gerenciamento de Usuários

## 🚀 Configuração Rápida

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite o arquivo com a URL do seu backend
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api
```

### 2. Verificar Backend

Certifique-se de que o backend está rodando:

```bash
# Na pasta do backend
npm run dev
# ou
yarn dev
```

### 3. Testar Conexão

Acesse a página de teste: `/admin/users/test`

## 📊 Diagnóstico de Problemas de Conexão

### 1. Verificar se o Backend está Rodando

O frontend espera que o backend esteja disponível em:
- **Desenvolvimento**: `https://portal.sabercon.com.br/api`
- **Produção**: URL configurada em `NEXT_PUBLIC_API_URL`

### 2. Logs de Debug

A página inclui logs detalhados no console do navegador (F12):
- 🔌 **Verificação de conexão** - Status da conexão com o backend
- 🔍 **Parâmetros de busca** - Dados enviados para a API
- ✅ **Respostas bem-sucedidas** - Dados recebidos da API
- ❌ **Erros detalhados** - Mensagens de erro específicas
- 📊 **Estatísticas** - Resumo dos dados processados

### 3. Indicadores Visuais

A página mostra o status da conexão no topo:
- **🟡 Conectando...** - Verificando conexão com o backend
- **🟢 Online** - Backend conectado e funcionando
- **🔴 Offline** - Erro de conexão com o backend

### 4. Estrutura Esperada da API

#### Request
```
GET /api/user?page=1&limit=10&sortBy=name&sortOrder=asc
```

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome do Usuário",
        "email": "usuario@email.com",
        "role_id": "uuid",
        "role_name": "Administrador",
        "institution_id": "uuid",
        "institution_name": "Instituição XYZ",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "endereco": "Rua Exemplo, 123",
        "telefone": "(11) 99999-9999"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 5. Solução de Problemas Comuns

#### ❌ "Não foi possível conectar ao servidor"
1. **Verifique se o backend está rodando**
   ```bash
   # No terminal do backend
   npm run dev
   ```

2. **Confirme a porta do backend**
   - Padrão: 3001
   - Verifique no console do backend

3. **Configure o .env.local**
   ```
   NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api
   ```

4. **Verifique CORS no backend**
   - O backend deve permitir requisições do frontend

#### ❌ "A resposta da API não contém dados válidos"
1. **Teste o endpoint diretamente**
   ```bash
   curl https://portal.sabercon.com.br/api/user
   ```

2. **Verifique a estrutura da resposta**
   - Deve conter `items` (array)
   - Deve conter `pagination` (objeto)

3. **Verifique autenticação**
   - Token JWT válido
   - Permissões adequadas

#### ❌ "Dados não aparecem no grid"
1. **Abra o Console do Navegador (F12)**
2. **Procure por logs com emojis**
3. **Verifique a aba Network**
   - Status da requisição
   - Resposta da API
4. **Verifique filtros ativos**
   - Limpe todos os filtros
   - Tente buscar sem filtros

### 6. Ferramentas de Debug

#### Página de Teste de Conexão
Acesse `/admin/users/test` para:
- Testar conexão com o backend
- Ver detalhes da resposta
- Identificar problemas de configuração

#### Console do Navegador
Todos os logs importantes são prefixados com emojis:
- 🔌 Conexão
- 🔍 Busca
- ✅ Sucesso
- ❌ Erro
- 📊 Estatísticas
- ⚠️ Avisos

### 7. Modo de Desenvolvimento

Se o backend não estiver disponível:
1. O sistema detecta o erro
2. Mostra indicador "Offline"
3. Após alguns segundos, tenta usar dados simulados
4. Permite desenvolvimento do frontend sem backend

### 8. Checklist de Verificação

- [ ] Backend está rodando
- [ ] `.env.local` configurado
- [ ] URL da API correta
- [ ] CORS habilitado no backend
- [ ] Token de autenticação válido
- [ ] Estrutura da resposta correta
- [ ] Console sem erros críticos