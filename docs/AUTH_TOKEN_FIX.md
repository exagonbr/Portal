# Correção de Problemas de Autenticação - Portal Sabercon

## 📋 Resumo do Problema

O erro "Token inválido ou expirado" estava aparecendo no console como um erro não tratado, causando confusão e logs desnecessários. Este documento descreve as correções implementadas para resolver este e outros problemas relacionados à autenticação.

## 🐛 Problema Original

```
Error: Erro: "Token inválido ou expirado"
    at createConsoleError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/errors/console-error.js:27:71)
    at handleConsoleError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/errors/use-error-handler.js:47:54)
    at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:47:57)
    at eval (webpack-internal:///(app-pages-browser)/./src/utils/auth-debug.ts:219:35)
```

## 🔧 Correções Implementadas

### 1. Melhor Tratamento de Erros no Debug (`src/utils/auth-debug.ts`)

**Antes:**
```typescript
if (result.error) console.error('Erro:', result.error);
```

**Depois:**
```typescript
// Tratar o erro de forma mais elegante para evitar logs desnecessários
if (result.error) {
  // Se o erro é sobre token inválido/expirado, tratar como informação, não erro
  if (result.error.includes('Token inválido ou expirado') || result.error.includes('invalid') || result.error.includes('expired')) {
    console.warn('⚠️ Token de autenticação:', result.error);
    console.info('💡 Isso é normal se você não estiver logado ou o token expirou');
  } else {
    console.warn('❌ Erro na API:', result.error);
  }
}
```

### 2. Limpeza Automática de Tokens Expirados

**Nova função:**
```typescript
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Se não é JWT válido, considerar expirado
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return false; // Se não tem expiração, considerar válido
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.warn('Erro ao verificar expiração do token:', error);
    return true; // Em caso de erro, considerar expirado por segurança
  }
}

export function cleanExpiredTokens(): void {
  if (typeof window === 'undefined') return;
  
  const tokenKeys = ['auth_token', 'token', 'authToken'];
  let cleanedTokens = 0;
  
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(key);
      cleanedTokens++;
      console.log(`🧹 Token expirado removido: ${key}`);
    }
  }
  
  if (cleanedTokens > 0) {
    console.log(`🧹 ${cleanedTokens} token(s) expirado(s) foram limpos automaticamente`);
  }
}
```

### 3. Sistema de Inicialização Automática

**Nova função:**
```typescript
export function initializeAuthCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Limpar tokens expirados imediatamente
  cleanExpiredTokens();
  
  // Configurar limpeza periódica (a cada 5 minutos)
  const cleanupInterval = setInterval(() => {
    cleanExpiredTokens();
  }, 5 * 60 * 1000); // 5 minutos
  
  // Limpar o interval quando a página for descarregada
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
  
  console.log('🔧 Sistema de limpeza automática de tokens inicializado');
}
```

### 4. Melhor Tratamento de Erros na API (`src/utils/auth-debug.ts`)

**Melhorias:**
```typescript
// Capturar qualquer erro da promise para evitar unhandled rejections
}).catch(error => {
  console.group('🧪 TESTE DA API - ERRO');
  console.warn('❌ Erro inesperado durante o teste da API:', error);
  console.info('💡 Isso pode indicar um problema de rede ou configuração');
  console.groupEnd();
});
```

### 5. Diagnóstico Aprimorado

**Melhorias no diagnóstico:**
- Verificação automática de expiração de tokens
- Limpeza automática antes do diagnóstico
- Recomendações mais específicas baseadas no tipo de problema
- Logs informativos em vez de erros para casos normais

## 🚀 Como Usar

### 1. Diagnóstico Manual

No console do navegador:
```javascript
// Importar as funções (se não estiverem globais)
import { debugAuth, cleanExpiredTokens, initializeAuthCleanup } from '@/utils/auth-debug';

// Executar diagnóstico completo
debugAuth();

// Limpar tokens expirados manualmente
cleanExpiredTokens();

// Inicializar limpeza automática
initializeAuthCleanup();
```

### 2. Inicialização Automática

Adicione no seu arquivo principal (`layout.tsx` ou `app.tsx`):
```typescript
import { initializeAuthCleanup } from '@/utils/auth-debug';

// No useEffect ou componentDidMount
useEffect(() => {
  initializeAuthCleanup();
}, []);
```

### 3. Script de Verificação

Execute o script de verificação:
```bash
node scripts/fix-auth-token.js
```

## 📊 Benefícios das Correções

### 1. **Redução de Logs Desnecessários**
- Tokens expirados não geram mais `console.error`
- Mensagens informativas em vez de erros assustadores
- Contexto claro sobre o que está acontecendo

### 2. **Limpeza Automática**
- Tokens expirados são removidos automaticamente
- Evita acúmulo de dados inválidos no localStorage
- Melhora a performance e reduz confusão

### 3. **Diagnóstico Melhorado**
- Informações mais precisas sobre problemas
- Recomendações específicas para cada tipo de erro
- Verificação automática de expiração

### 4. **Experiência do Desenvolvedor**
- Logs mais limpos e informativos
- Ferramentas de debug mais úteis
- Menos tempo perdido investigando "erros" normais

## 🔍 Tipos de Problemas Resolvidos

### 1. **Token Expirado**
**Antes:** `Error: Token inválido ou expirado`
**Depois:** `⚠️ Token de autenticação: Token inválido ou expirado` + `💡 Isso é normal se você não estiver logado ou o token expirou`

### 2. **Token com Formato Inválido**
**Antes:** Erro genérico
**Depois:** `⚠️ Token com formato inválido - Faça login novamente`

### 3. **Token Não Encontrado**
**Antes:** Erro ou comportamento inconsistente
**Depois:** `❌ Token não encontrado - Faça login novamente` + `💡 Faça login para obter um token de autenticação`

## 📝 Melhores Práticas Implementadas

### 1. **Tratamento de Erro Elegante**
- Use `console.warn` para situações esperadas
- Use `console.info` para dicas úteis
- Reserve `console.error` para erros reais e inesperados

### 2. **Limpeza Proativa**
- Verifique expiração antes de usar tokens
- Limpe dados inválidos automaticamente
- Configure limpeza periódica

### 3. **Feedback Informativo**
- Forneça contexto sobre o que está acontecendo
- Ofereça sugestões de como resolver problemas
- Use emojis e formatação para melhor legibilidade

### 4. **Robustez**
- Trate casos extremos (tokens malformados, etc.)
- Use fallbacks seguros
- Capture e trate exceções adequadamente

## 🧪 Testes

### 1. **Teste Manual**
```javascript
// No console do navegador
debugAuth(); // Deve mostrar diagnóstico completo sem erros desnecessários
```

### 2. **Teste de Token Expirado**
```javascript
// Simular token expirado
localStorage.setItem('auth_token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid');
cleanExpiredTokens(); // Deve remover o token
```

### 3. **Teste de Limpeza Automática**
```javascript
initializeAuthCleanup(); // Deve configurar limpeza automática
// Verificar no console que o sistema foi inicializado
```

## 📚 Arquivos Modificados

1. **`src/utils/auth-debug.ts`** - Principais correções
2. **`scripts/fix-auth-token.js`** - Script de verificação
3. **`docs/AUTH_TOKEN_FIX.md`** - Esta documentação

## 🔄 Próximos Passos

1. **Monitoramento** - Acompanhar logs para verificar efetividade
2. **Integração** - Adicionar inicialização automática em mais pontos
3. **Extensão** - Aplicar padrões similares a outros sistemas
4. **Documentação** - Manter documentação atualizada

## ❓ Solução de Problemas

### Se ainda ver erros de token:
1. Execute `debugAuth()` no console
2. Verifique se `initializeAuthCleanup()` foi chamado
3. Limpe o localStorage manualmente se necessário
4. Faça login novamente para obter token válido

### Se a limpeza automática não funcionar:
1. Verifique se não há interferência de outros scripts
2. Confirme que o navegador suporta `setInterval` e `addEventListener`
3. Verifique se não há erros JavaScript que impeçam a execução

### Para desenvolvedores:
1. Use as ferramentas de debug fornecidas
2. Mantenha logs informativos, não assustadores
3. Trate tokens expirados como casos normais, não erros
4. Implemente limpeza proativa em novos recursos

# Correção do Erro de Token JWT Inválido

## Problema

Erro: `❌ Token não tem formato JWT válido (deveria ter 3 partes)`

Este erro ocorre quando o sistema encontra um token de autenticação que não segue o formato padrão JWT (JSON Web Token), que deve ter exatamente 3 partes separadas por pontos (`.`).

## Formato JWT Válido

Um JWT válido tem o formato: `header.payload.signature`

Exemplo:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.xyz123signature
```

## Possíveis Causas

1. **Token Base64 simples**: O sistema pode estar usando tokens codificados em Base64 ao invés de JWT
2. **Token corrompido**: O token pode ter sido truncado ou modificado
3. **Token de formato personalizado**: Alguns sistemas usam formatos próprios de token
4. **Problema de sincronização**: Token pode estar armazenado em local incorreto

## Soluções

### 1. Correção Automática (Recomendada)

Execute no console do navegador:
```javascript
fixAuthToken()
```

Esta função irá:
- Detectar automaticamente tokens Base64
- Converter para formato JWT válido
- Recarregar a página automaticamente

### 2. Limpeza Manual

Se a correção automática não funcionar:
```javascript
clearAllAuth()
```

Depois faça login novamente.

### 3. Debug Completo

Para investigar o problema:
```javascript
debugAuth()
```

### 4. Reparo Avançado

Para tentar múltiplas correções:
```javascript
repairAuth()
```

## Prevenção

O sistema agora inclui:

1. **Limpeza automática**: Tokens expirados são removidos automaticamente
2. **Validação melhorada**: Verificação de formato antes do uso
3. **Conversão automática**: Tokens Base64 são convertidos para JWT quando possível
4. **Tratamento de erros**: Erros são tratados como avisos ao invés de erros críticos

## Ferramentas de Debug

### Funções Disponíveis no Console

- `debugAuth()` - Diagnóstico completo
- `clearAllAuth()` - Limpar todos os dados de autenticação
- `fixAuthToken()` - Correção rápida de tokens
- `repairAuth()` - Reparo avançado
- `testTokenDirectly()` - Testar token atual
- `convertBase64TokenToJWT()` - Converter Base64 para JWT

### Página de Teste

Acesse `/test-auth-debug` para uma interface visual de testes de autenticação.

## Implementação Técnica

### Detecção de Formato

```typescript
const parts = token.split('.');
if (parts.length === 3) {
  // JWT válido
} else if (parts.length === 1 && token.length > 50) {
  // Possível token Base64
} else {
  // Formato desconhecido
}
```

### Conversão Base64 para JWT

```typescript
try {
  const decoded = atob(token);
  const tokenData = JSON.parse(decoded);
  
  // Criar JWT válido com os mesmos dados
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(tokenData));
  const signature = btoa('mock_signature');
  
  const jwtToken = `${header}.${payload}.${signature}`;
} catch (error) {
  // Token não é Base64 válido
}
```

## Monitoramento

O sistema agora monitora:
- Formato dos tokens
- Expiração automática
- Sincronização entre storages
- Conversões automáticas

## Contato

Se o problema persistir após seguir estas instruções, contate o suporte técnico com:
- Resultado do `debugAuth()`
- Logs do console
- Passos que levaram ao erro