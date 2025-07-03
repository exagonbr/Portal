# Solução para Loop de Autenticação

## Problema Identificado

O sistema estava entrando em loop infinito ao tentar acessar `/auth/login?returnTo=%2Fdashboard%2Fsystem-admin`. O problema ocorria devido a múltiplos redirecionamentos entre a página de login e o dashboard.

## Causas Raiz

1. **Redirecionamento circular**: O sistema redirecionava de login para dashboard e de volta para login
2. **Falta de validação do returnTo**: URLs malformadas ou inválidas causavam loops
3. **Múltiplos pontos de redirecionamento**: AuthContext, LoginPage e api-client todos fazendo redirecionamentos
4. **Falta de controle de estado**: Não havia verificação se um redirecionamento já estava em andamento

## Soluções Implementadas

### 1. AuthContext.tsx - Melhorias no Login

**Arquivo**: `src/contexts/AuthContext.tsx`

- ✅ **Validação de returnTo**: Verificação se o returnTo é uma rota válida do sistema
- ✅ **Limpeza de parâmetros**: Remove returnTo, error e auth_error da URL após processamento
- ✅ **Controle de redirecionamento**: Função `safeRedirect` melhorada com detecção de loops
- ✅ **Rotas de emergência**: Sistema inteligente para quebrar loops quando detectados

```typescript
// Validar se o returnTo é uma rota válida do sistema
const validReturnToPaths = [
  '/dashboard/system-admin',
  '/dashboard/institution-manager',
  '/dashboard/coordinator',
  '/dashboard/teacher',
  '/dashboard/student',
  '/dashboard/guardian',
  '/dashboard',
  '/admin',
  '/portal'
];
```

### 2. api-client.ts - Prevenção de Loops

**Arquivo**: `src/lib/api-client.ts`

- ✅ **Flag de redirecionamento**: Verifica se já há um redirecionamento em andamento
- ✅ **Lógica melhorada de returnTo**: Não preserva returnTo em casos de erro ou loops
- ✅ **Timeout de segurança**: Remove flags após 5 segundos

```typescript
// Verificar se já estamos em um processo de redirecionamento
const redirectKey = 'api_auth_redirect_in_progress';
const isRedirectInProgress = sessionStorage.getItem(redirectKey);

if (isRedirectInProgress) {
  console.warn('🔄 Redirecionamento de autenticação já em andamento, evitando loop');
  return;
}
```

### 3. LoginPage.tsx - Detecção de Loops

**Arquivo**: `src/components/auth/LoginPage.tsx`

- ✅ **Detecção de loop**: Verifica se houve redirecionamento recente (< 2 segundos)
- ✅ **Processamento de returnTo**: Valida e processa returnTo antes de redirecionar
- ✅ **Redirecionamento confiável**: Usa `window.location.href` para redirecionamentos críticos

```typescript
// Verificar se há loop de redirecionamento
const redirectLoopKey = 'login_redirect_loop_check';
const lastRedirectTime = sessionStorage.getItem(redirectLoopKey);
const now = Date.now();

if (lastRedirectTime && (now - parseInt(lastRedirectTime)) < 2000) {
  console.warn('🔄 Loop de redirecionamento detectado no login, aguardando...');
  return;
}
```

## Melhorias na Função safeRedirect

### Controle de Loop por Rota

- Cada rota tem seu próprio contador de redirecionamento
- Máximo de 2 redirecionamentos por rota
- Timeout de 60 segundos para limpeza automática

### Rotas de Emergência Inteligentes

```typescript
if (path.includes('/system-admin')) {
  // Se está tentando acessar system-admin, verificar se é realmente admin
  if (user?.role === 'SYSTEM_ADMIN') {
    console.log('🔧 Usuário é SYSTEM_ADMIN, forçando redirecionamento direto');
    window.location.href = '/dashboard/system-admin';
    return;
  } else {
    emergencyRoute = '/dashboard';
  }
}
```

### Redirecionamentos Críticos

Para rotas importantes como `/dashboard/system-admin` e `/auth/login`, o sistema usa `window.location.href` em vez de `router.push` para garantir redirecionamento confiável.

## Como Testar a Solução

1. **Teste de acesso direto**:
   ```
   http://localhost:3000/dashboard/system-admin
   ```

2. **Teste com returnTo**:
   ```
   http://localhost:3000/auth/login?returnTo=%2Fdashboard%2Fsystem-admin
   ```

3. **Teste de loop forçado**:
   - Acesse múltiplas vezes seguidas
   - Verifique se o sistema usa rota de emergência

## Logs de Depuração

O sistema agora fornece logs detalhados:

- 🎯 `ReturnTo encontrado`: Quando detecta parâmetro returnTo
- ✅ `ReturnTo validado`: Quando returnTo é válido
- ⚠️ `ReturnTo inválido ignorado`: Quando returnTo é inválido
- 🔄 `Loop detectado`: Quando detecta redirecionamento circular
- 🚨 `Rota de emergência`: Quando usa fallback para quebrar loops
- 🔧 `Redirecionamento crítico`: Para rotas importantes

## Verificação de Funcionamento

Para verificar se a solução está funcionando:

1. Abra o Console do navegador (F12)
2. Acesse `/auth/login?returnTo=%2Fdashboard%2Fsystem-admin`
3. Faça login com usuário SYSTEM_ADMIN
4. Verifique os logs no console
5. Confirme redirecionamento para `/dashboard/system-admin`

## Prevenção Futura

- **Validação rigorosa**: Todas as rotas de returnTo são validadas
- **Controle de estado**: Flags impedem múltiplos redirecionamentos simultâneos
- **Timeouts**: Limpeza automática de flags de controle
- **Logs detalhados**: Facilita depuração de problemas futuros
- **Rotas de emergência**: Sistema nunca fica "preso" em loops infinitos

Esta solução garante que o sistema de autenticação seja robusto e nunca entre em loops infinitos, mantendo uma experiência de usuário fluida. 