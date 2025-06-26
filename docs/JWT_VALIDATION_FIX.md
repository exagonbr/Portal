# Correção de Validação JWT e Base64

## Problema Identificado

O sistema estava apresentando erros recorrentes de validação JWT e base64:

```
Both JWT and base64 validation failed: {
  jwtError: 'jwt malformed',
  base64Error: `Unexpected token '�', "��e" is not valid JSON`
}
```

### Causa Raiz

O erro ocorria porque:

1. **Tokens corrompidos** estavam sendo enviados para as APIs
2. **Caracteres binários inválidos** (como `�`) estavam sendo processados como base64
3. **Falta de validação prévia** antes de tentar decodificar tokens
4. **Logs excessivos** de erros para tokens obviamente inválidos

## Soluções Implementadas

### 1. Validação Prévia de Tokens

Criamos funções de validação que verificam:

- **Comprimento mínimo** do token (>= 10 caracteres)
- **Caracteres inválidos** (`�`, `\0`, `\x00`)
- **Formato base64 válido** antes da decodificação
- **JSON válido** após decodificação base64

### 2. Utilitário Centralizado

Arquivo: `backend/src/utils/tokenValidation.ts`

```typescript
// Funções principais:
- isValidBase64(str: string): boolean
- isValidJSON(str: string): boolean  
- validateTokenFormat(token: string): ValidationResult
- safeDecodeBase64Token(token: string): DecodeResult
- logTokenValidationError(jwtError, base64Error, token): void
```

### 3. Middlewares Melhorados

#### Frontend (Next.js)
- `src/lib/auth-utils.ts` - Melhorado
- `src/app/api/lib/auth-utils.ts` - Melhorado

#### Backend (Express)
- `backend/src/middleware/auth.ts` - Melhorado
- `backend/src/middleware/sessionMiddleware.ts` - Melhorado
- `backend/src/middleware/auth.middleware.ts` - Melhorado
- `backend/src/middleware/auth-improved.ts` - Novo middleware robusto

### 4. Melhorias no Tratamento de Erros

#### Antes:
```typescript
console.error('Both JWT and base64 validation failed:', { 
  jwtError: jwtError.message, 
  base64Error: base64Error.message 
});
```

#### Depois:
```typescript
console.warn('Token validation failed:', { 
  jwtError: jwtErrorMsg, 
  base64Error: base64ErrorMsg,
  tokenPreview: token.substring(0, 20) + '...'
});
```

### 5. Validação em Camadas

1. **Validação de Formato**: Verifica se o token tem formato básico válido
2. **Validação JWT**: Tenta verificar como JWT real
3. **Validação Base64**: Se JWT falhar, tenta como token base64 fallback
4. **Validação de Estrutura**: Verifica se o token decodificado tem campos obrigatórios

## Benefícios

### ✅ Redução de Logs de Erro
- Tokens obviamente inválidos são rejeitados rapidamente
- Logs mais informativos com preview do token
- Nível de log alterado de `error` para `warn`

### ✅ Melhor Performance
- Validação prévia evita processamento desnecessário
- Falha rápida para tokens malformados

### ✅ Segurança Aprimorada
- Prevenção de ataques com tokens maliciosos
- Validação robusta de entrada

### ✅ Manutenibilidade
- Código centralizado e reutilizável
- Documentação clara dos tipos de erro

## Como Usar

### Middleware Melhorado (Recomendado)

```typescript
import { authMiddlewareImproved } from '../middleware/auth-improved';

// Use em rotas que precisam de autenticação
app.use('/api/protected', authMiddlewareImproved);
```

### Middleware Opcional

```typescript
import { optionalAuthMiddlewareImproved } from '../middleware/auth-improved';

// Use em rotas que podem ser públicas ou autenticadas
app.use('/api/public', optionalAuthMiddlewareImproved);
```

## Testes Recomendados

1. **Token vazio**: `""` → Deve retornar erro específico
2. **Token muito curto**: `"abc"` → Deve retornar erro específico  
3. **Token com caracteres inválidos**: `"abc�def"` → Deve retornar erro específico
4. **Base64 inválido**: `"invalid-base64!"` → Deve retornar erro específico
5. **JSON inválido**: `"YWJjZGVm"` (base64 de "abcdef") → Deve retornar erro específico
6. **JWT válido**: Token JWT real → Deve funcionar normalmente
7. **Token fallback válido**: Base64 de JSON válido → Deve funcionar normalmente

## Monitoramento

Os logs agora incluem:
- Tipo específico do erro
- Preview seguro do token (primeiros 20 caracteres)
- Nível de log apropriado (`warn` vs `error`)

Isso facilita o debug e monitoramento em produção. 