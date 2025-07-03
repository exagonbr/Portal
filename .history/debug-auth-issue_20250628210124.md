# Diagnóstico do Erro 401 na API /units

## Problema Identificado
O erro `401 Unauthorized` na rota `/api/units?limit=100` ocorre porque:

1. **Autenticação NextAuth Falhou**: A função `getServerSession(authOptions)` retorna `null`
2. **Configuração Limitada**: Apenas Google OAuth está configurado
3. **Sessão Inválida**: O usuário não possui sessão válida do NextAuth

## Análise do Código

### Rota API (/api/units/route.ts)
```typescript
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Configuração Auth (/lib/auth.ts)
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  // ... resto da configuração
}
```

## Soluções Propostas

### 1. Verificar Variáveis de Ambiente
Confirmar se estão definidas:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 2. Adicionar Provider de Credenciais
Para permitir login com email/senha além do Google OAuth.

### 3. Implementar Debug de Sessão
Adicionar logs para diagnosticar problemas de sessão.

### 4. Verificar Cookies de Sessão
O NextAuth usa cookies para manter a sessão. Verificar se estão sendo definidos corretamente.

## Próximos Passos
1. Verificar configuração do ambiente
2. Testar autenticação Google
3. Implementar fallback para autenticação local
4. Adicionar logs de debug