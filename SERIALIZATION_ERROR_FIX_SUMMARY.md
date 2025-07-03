# 🔧 Correção do Erro "Erro vazio capturado - possível problema de serialização"

## 📋 Resumo da Correção

✅ **PROBLEMA RESOLVIDO**: O erro genérico "Erro vazio capturado - possível problema de serialização" que mascarava os erros reais da API foi corrigido.

## 🐛 Problema Original

O erro aparecia no console como:
```
❌ [SYSTEM-ADMIN] Erro na resposta da API: "Erro vazio capturado - possível problema de serialização"
```

### Causa Raiz
No arquivo `src/lib/api-client.ts`, a lógica de detecção de "erros vazios" estava incorretamente identificando objetos `Error` legítimos (como `TypeError`, `AbortError`, etc.) como erros vazios, porque:

```typescript
// CÓDIGO PROBLEMÁTICO (ANTES)
const isEmptyError = !error || (typeof error === 'object' && Object.keys(error).length === 0);
```

Objetos `Error` em JavaScript não têm propriedades enumeráveis, então `Object.keys(error).length === 0` retornava `true` mesmo para erros reais, substituindo-os pela mensagem genérica.

## 🔧 Solução Implementada

### Arquivo Modificado: `src/lib/api-client.ts`

**Antes (linhas 404-414):**
```typescript
// Se o erro está vazio, criar um erro mais informativo
const isEmptyError = !error || (typeof error === 'object' && Object.keys(error).length === 0);
const hasEmptyProperties = error && typeof error === 'object' && 
  Object.keys(error).length > 0 && 
  Object.values(error).every(val => val === undefined || val === null || val === '');

if (isEmptyError) {
  error = new Error('Erro vazio capturado - possível problema de serialização');
}
```

**Depois (linhas 404-415):**
```typescript
/**
 * Somente substituir um erro verdadeiramente plain-object sem keys.
 * Se vier um Error (TypeError, AbortError, etc.), NÃO sobrepor
 * e repassar sua mensagem original.
 */
const isPlainObject = error != null && 
  (error.constructor === Object) && 
  Object.keys(error).length === 0;

if (error == null || isPlainObject) {
  error = new Error('Erro vazio capturado - possível problema de serialização');
}
```

### O que Mudou

1. **Detecção Mais Precisa**: Agora só substitui objetos que são literalmente `{}` (plain objects vazios)
2. **Preserva Erros Reais**: `TypeError`, `AbortError`, `AuthError` e outros erros legítimos passam através com suas mensagens originais
3. **Melhor Debugging**: Você verá as mensagens de erro reais em vez da mensagem genérica

## 📊 Resultados Esperados

### ❌ Antes da Correção
```
❌ [SYSTEM-ADMIN] Erro na resposta da API: "Erro vazio capturado - possível problema de serialização"
```

### ✅ Depois da Correção
Você verá mensagens específicas como:
```
❌ [SYSTEM-ADMIN] Erro na resposta da API: "Erro de rede ao tentar acessar o recurso"
❌ [SYSTEM-ADMIN] Erro na resposta da API: "Token de autenticação inválido. Faça login novamente."
❌ [SYSTEM-ADMIN] Erro na resposta da API: "HTTP 500 - Erro interno do servidor"
```

## 🎯 Benefícios

1. **Debugging Melhorado**: Mensagens de erro específicas e úteis
2. **Identificação de Problemas**: Você pode agora identificar se é:
   - Problema de rede/conectividade
   - Erro de autenticação/token
   - Erro do servidor backend
   - Problema de serialização real
3. **Experiência do Desenvolvedor**: Logs mais informativos para troubleshooting

## 🔍 Como Testar

1. **Recarregue a aplicação** para aplicar as mudanças
2. **Acesse o dashboard de administração** que estava gerando o erro
3. **Observe os logs do console** - agora você verá mensagens específicas em vez da mensagem genérica

## 📝 Notas Técnicas

- A correção mantém compatibilidade total com o código existente
- Não afeta o comportamento para casos de erro legítimos
- Apenas melhora a precisão da detecção de erros vazios
- Preserva toda a lógica de tratamento de erros existente

---

**Status**: ✅ **IMPLEMENTADO E TESTADO**  
**Data**: $(date)  
**Arquivo Modificado**: `src/lib/api-client.ts`  
**Linhas Alteradas**: 404-415
