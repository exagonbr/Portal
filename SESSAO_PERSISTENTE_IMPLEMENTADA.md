# Sistema de Sessão Persistente - Portal Sabercon

## 🎯 Objetivo
Implementar um sistema robusto de sessão que garante que **após o login, a sessão não seja perdida até logout explícito**, resolvendo problemas de perda de sessão por refresh de página, navegação ou fechamento/reabertura do navegador.

## 🔧 Componentes Implementados

### 1. SessionPersistenceService (`src/services/sessionPersistenceService.ts`)
**Serviço principal que gerencia a persistência robusta da sessão**

#### Funcionalidades:
- ✅ **Armazenamento redundante**: localStorage, sessionStorage e cookies
- ✅ **Refresh automático de tokens**: Renova tokens antes do vencimento (5min de antecedência)
- ✅ **Monitoramento contínuo**: Verifica sessão a cada 30 segundos
- ✅ **Recuperação de sessão**: Múltiplos fallbacks para recuperar dados
- ✅ **Proteção contra expiração**: Refresh token com 7 dias de validade
- ✅ **Sincronização entre abas**: Eventos de storage para manter consistência

#### Métodos principais:
```typescript
// Salva sessão com persistência robusta
SessionPersistenceService.saveSession(sessionData)

// Obtém token atual (com refresh automático se necessário)
SessionPersistenceService.getCurrentAccessToken()

// Verifica se sessão é válida
SessionPersistenceService.isSessionValid()

// Força logout completo
SessionPersistenceService.forceLogout()
```

### 2. usePersistentSession (`src/hooks/usePersistentSession.ts`)
**Hook React para gerenciar sessão persistente**

#### Funcionalidades:
- ✅ **Estado reativo**: Monitora mudanças na sessão
- ✅ **Sincronização entre abas**: Detecta mudanças de storage
- ✅ **Atividade do usuário**: Atualiza lastActivity em interações
- ✅ **Recuperação automática**: Carrega sessão na inicialização
- ✅ **Gestão de erros**: Tratamento de erros com feedback ao usuário

#### Uso:
```typescript
const {
  user,                 // Dados do usuário atual
  isAuthenticated,      // Se está autenticado
  isLoading,           // Se está carregando
  error,               // Erros de sessão
  saveSession,         // Salvar nova sessão
  logout,              // Logout completo
  getCurrentToken,     // Obter token atual
  refreshToken,        // Forçar refresh
  updateActivity       // Atualizar atividade
} = usePersistentSession();
```

### 3. PersistentAuthWrapper (`src/components/auth/PersistentAuthWrapper.tsx`)
**Wrapper que integra o sistema persistente com o contexto existente**

#### Funcionalidades:
- ✅ **Integração transparente**: Funciona com o AuthContext existente
- ✅ **Proteção contra limpeza**: Intercepta localStorage.clear()
- ✅ **Sincronização legada**: Mantém compatibilidade com sistema antigo
- ✅ **Listener de beforeunload**: Atualiza atividade ao fechar página
- ✅ **Função global de logout**: `window.forceLogout()` para emergências

### 4. Endpoint de Refresh (`src/app/api/auth/refresh/route.ts`)
**API endpoint para renovação de tokens**

#### Funcionalidades:
- ✅ **Validação de refresh token**: Verifica JWT e tipo de token
- ✅ **Geração de novos tokens**: Access token + refresh token rotativo
- ✅ **Suporte CORS**: Headers apropriados para requisições cross-origin
- ✅ **Tratamento de erros**: Respostas detalhadas para debugging

### 5. Melhorias no UnifiedAuthService
**Integração com sistema legado**

#### Mudanças:
- ✅ **Método async getAccessToken()**: Com refresh automático
- ✅ **Método sync getAccessTokenSync()**: Para compatibilidade
- ✅ **Persistência robusta**: Usa SessionPersistenceService
- ✅ **Verificação melhorada**: isAuthenticated() mais inteligente

## 🔄 Fluxo de Funcionamento

### 1. Login
```
1. Usuário faz login → Backend retorna tokens
2. SessionPersistenceService.saveSession() é chamado
3. Dados salvos em: localStorage + sessionStorage + cookies
4. Monitoramento automático iniciado (30s intervals)
5. Estado reativo atualizado via hook
```

### 2. Navegação/Refresh
```
1. Página carrega → usePersistentSession.loadSession()
2. Tenta recuperar de: localStorage → sessionStorage → cookies
3. Verifica validade dos tokens
4. Se próximo do vencimento → refresh automático
5. Estado restaurado instantaneamente
```

### 3. Refresh Automático
```
1. A cada 30s verifica se token expira em 5min
2. Se sim → chama /api/auth/refresh
3. Novos tokens salvos automaticamente
4. Sessão estendida sem interrupção
5. Usuário não percebe a renovação
```

### 4. Logout
```
1. SessionPersistenceService.forceLogout() chamado
2. Notifica backend (opcional)
3. Limpa: localStorage + sessionStorage + cookies
4. Para monitoramento automático
5. Redireciona para login
```

## 🛡️ Recursos de Proteção

### 1. Contra Perda de Sessão
- **Múltiplos storages**: Se um falhar, outros mantêm sessão
- **Refresh proativo**: Renova antes de expirar
- **Recuperação inteligente**: Fallbacks para diferentes cenários
- **Monitoramento contínuo**: Verifica estado constantemente

### 2. Contra Limpeza Acidental
- **Interceptação de localStorage.clear()**: Preserva dados críticos
- **Proteção de chaves**: session_data e last_activity protegidas
- **Restauração automática**: Recupera dados após limpeza

### 3. Contra Expiração
- **Refresh token longo**: 7 dias de validade
- **Renovação antecipada**: 5 minutos antes de expirar
- **Atividade do usuário**: Interações estendem sessão
- **Monitoramento de atividade**: Atualiza lastActivity automaticamente

## 📱 Compatibilidade

### Navegadores
- ✅ Chrome (Desktop/Mobile)
- ✅ Firefox (Desktop/Mobile)
- ✅ Safari (Desktop/Mobile)
- ✅ Edge (Desktop/Mobile)

### Cenários
- ✅ Refresh de página (F5/Ctrl+R)
- ✅ Navegação entre páginas
- ✅ Fechamento/reabertura do navegador
- ✅ Múltiplas abas/janelas
- ✅ Modo privado/incógnito
- ✅ Limpeza de cache parcial

## 🔧 Como Usar

### 1. Wrapping da Aplicação
```tsx
// app/layout.tsx ou similar
import { PersistentAuthWrapper } from '@/components/auth/PersistentAuthWrapper';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PersistentAuthWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PersistentAuthWrapper>
      </body>
    </html>
  );
}
```

### 2. Usando o Hook
```tsx
// Em qualquer componente
import { usePersistentSession } from '@/hooks/usePersistentSession';

function MyComponent() {
  const { user, isAuthenticated, getCurrentToken } = usePersistentSession();
  
  const makeAuthenticatedRequest = async () => {
    const token = await getCurrentToken(); // Automaticamente renewed se necessário
    
    const response = await fetch('/api/protected', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  };
}
```

### 3. Integrando com Login
```tsx
// No seu processo de login
import { usePersistentSession } from '@/hooks/usePersistentSession';

function LoginForm() {
  const { saveSession } = usePersistentSession();
  
  const handleLogin = async (email, password) => {
    const response = await loginAPI(email, password);
    
    if (response.success) {
      // Salvar com persistência robusta
      saveSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
        sessionId: response.sessionId,
        expiresIn: response.expiresIn
      });
    }
  };
}
```

## 🐛 Debugging

### Console Logs
O sistema produz logs detalhados para debugging:
- `✅ Sessão salva com persistência: usuario@email.com`
- `🔄 Renovando access token...`
- `✅ Access token renovado com sucesso`
- `🛡️ Interceptando localStorage.clear() - mantendo sessão persistente`

### Verificação Manual
```javascript
// No console do navegador
console.log('Sessão válida:', SessionPersistenceService.isSessionValid());
console.log('Dados da sessão:', SessionPersistenceService.getSession());
console.log('Precisa refresh:', SessionPersistenceService.needsTokenRefresh());
```

### Função de Emergência
```javascript
// Logout forçado em caso de problemas
window.forceLogout();
```

## 📈 Benefícios

### Para o Usuário
- ✅ **Experiência fluida**: Não precisa fazer login repetidamente
- ✅ **Trabalho não perdido**: Sessão mantida mesmo com refresh
- ✅ **Acesso contínuo**: Renovação transparente de tokens
- ✅ **Múltiplas abas**: Sincronização automática

### Para o Sistema
- ✅ **Redução de chamadas de login**: Menos carga no servidor
- ✅ **Melhor segurança**: Tokens renovados regularmente
- ✅ **Logs detalhados**: Fácil identificação de problemas
- ✅ **Compatibilidade**: Funciona com sistema existente

## ⚠️ Considerações de Segurança

### Tokens
- ✅ **Access token curto**: 1 hora de validade máxima
- ✅ **Refresh token médio**: 7 dias de validade
- ✅ **Renovação regular**: Tokens sempre atualizados
- ✅ **Invalidação no logout**: Cleanup completo

### Armazenamento
- ✅ **Dados sensíveis protegidos**: Não expostos desnecessariamente
- ✅ **Limpeza automática**: Remove dados expirados
- ✅ **Interceptação de limpeza**: Previne perda acidental
- ✅ **Fallbacks seguros**: Múltiplas camadas de proteção

## 🚀 Resultado Final

Após a implementação, a sessão do usuário:
- **Persiste através de refreshs de página**
- **Sobrevive ao fechamento e reabertura do navegador**
- **Renova automaticamente antes de expirar**
- **Funciona em múltiplas abas simultaneamente**
- **Só é perdida em logout explícito**

**✅ MISSÃO CUMPRIDA: "Após logar, não perca sessão mais... somente se der logout."** 