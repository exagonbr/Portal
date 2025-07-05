# Guia de Correção de Problemas de Autenticação

## Problema Identificado

O sistema está apresentando inconsistências na validação de tokens JWT, especificamente:
- Token presente no localStorage com chave `authToken` 
- Sistema tentando buscar token com chave `auth_token`
- Validação JWT falhando porque o token não tem formato correto

## Diagnóstico Rápido

### Sintomas
- Mensagem: "Token não parece ser um JWT válido (não tem 3 partes)"
- Token presente mas inválido no diagnóstico
- Sessão válida mas token inválido

### Causas Prováveis
1. **Inconsistência de chaves**: Token armazenado em `authToken` mas buscado em `auth_token`
2. **Token corrompido**: Token não tem formato JWT válido (3 partes separadas por ponto)
3. **Token expirado**: Token válido mas expirado

## Soluções

### Solução 1: Script Automático (Recomendado)

1. Abra o Console do Navegador (F12 → Console)
2. Execute o script de diagnóstico:

```javascript
// Copie e cole todo o conteúdo do arquivo scripts/debug-auth-console.js
// Ou execute diretamente:
```

3. O script irá:
   - Diagnosticar automaticamente o problema
   - Tentar reparar inconsistências
   - Testar a API após o reparo
   - Fornecer instruções específicas

### Solução 2: Correção Manual

#### Opção A: Sincronizar Tokens
```javascript
// 1. Verificar tokens existentes
console.log('authToken:', localStorage.getItem('authToken'));
console.log('auth_token:', localStorage.getItem('auth_token'));

// 2. Se houver token válido em authToken, sincronizar
const token = localStorage.getItem('authToken');
if (token && token.split('.').length === 3) {
  localStorage.setItem('auth_token', token);
  console.log('Token sincronizado!');
}

// 3. Recarregar a página
location.reload();
```

#### Opção B: Limpar e Refazer Login
```javascript
// 1. Limpar todos os dados de autenticação
localStorage.clear();
sessionStorage.clear();

// 2. Limpar cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// 3. Recarregar e fazer login novamente
location.reload();
```

### Solução 3: Usando Funções do Sistema

Se as funções de debug estão disponíveis:

```javascript
// Diagnóstico completo
debugAuth();

// Reparo automático
repairAuth();

// Ou limpar tudo
clearAllAuth();
```

## Prevenção

### Para Desenvolvedores

1. **Padronizar chaves de localStorage**:
   - Sempre usar `auth_token` como chave principal
   - Manter compatibilidade com `authToken` para transição

2. **Melhorar validação de token**:
   - Verificar formato JWT antes de usar
   - Validar expiração antes de considerar válido
   - Implementar fallback para diferentes chaves

3. **Sincronização automática**:
   - Implementar função que sincroniza tokens entre chaves
   - Executar na inicialização do app

### Código de Exemplo para Prevenção

```typescript
// Função para obter token de forma robusta
function getAuthToken(): string | null {
  const possibleKeys = ['auth_token', 'authToken', 'token'];
  
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token && token.split('.').length === 3) {
      // Sincronizar em todas as chaves para consistência
      possibleKeys.forEach(k => localStorage.setItem(k, token));
      return token;
    }
  }
  
  return null;
}
```

## Verificação Pós-Correção

Após aplicar qualquer solução:

1. **Verificar no Console**:
```javascript
// Verificar se token está presente e válido
const token = localStorage.getItem('auth_token');
console.log('Token presente:', !!token);
console.log('Token é JWT:', token?.split('.').length === 3);

// Testar API
fetch('/api/auth/validate', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

2. **Verificar na Interface**:
   - Dados do usuário carregando corretamente
   - Navegação funcionando sem redirecionamentos inesperados
   - APIs retornando dados em vez de erro 401

## Arquivos Modificados

- `src/utils/auth-debug.ts` - Melhorado diagnóstico e adicionadas funções de reparo
- `scripts/debug-auth-console.js` - Script para execução no console do navegador

## Próximos Passos

1. Implementar sincronização automática na inicialização do app
2. Padronizar todas as referências de token para usar `auth_token`
3. Adicionar testes automatizados para validação de token
4. Implementar renovação automática de token próximo à expiração 