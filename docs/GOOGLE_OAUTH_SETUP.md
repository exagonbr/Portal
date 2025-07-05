# Configuração do Google OAuth

## Endpoint Criado

O endpoint `/api/auth/signin/google` foi criado e está funcional. Ele redireciona para o NextAuth que gerencia a autenticação com Google.

## Variáveis de Ambiente Necessárias

Para que o login com Google funcione, você precisa adicionar as seguintes variáveis ao seu arquivo `.env.local` (desenvolvimento) ou `.env.production` (produção):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Como Obter as Credenciais do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Selecione "Web application"
6. Configure as URIs autorizadas:
   - **Authorized JavaScript origins**: `https://portal.sabercon.com.br`
   - **Authorized redirect URIs**: `https://portal.sabercon.com.br/api/auth/callback/google`

## Configuração Atual

O sistema já está configurado com:
- ✅ GoogleProvider no NextAuth
- ✅ Endpoint `/api/auth/signin/google` criado
- ✅ Configuração de callback e sessão
- ✅ Integração com o sistema de roles e permissões

## Testando o Login

Após configurar as variáveis de ambiente, você pode testar o login acessando:
- `https://portal.sabercon.com.br/api/auth/signin/google`
- Ou usando o botão de login no frontend

## Fluxo de Autenticação

1. Usuário clica no botão "Login with Google"
2. Redirecionamento para `/api/auth/signin/google`
3. NextAuth redireciona para o Google OAuth
4. Usuário autoriza no Google
5. Google redireciona de volta para `/api/auth/callback/google`
6. NextAuth processa o callback e cria a sessão
7. Usuário é redirecionado para o dashboard

## Callback do Google

O NextAuth já está configurado para lidar com o callback do Google automaticamente através do endpoint `/api/auth/[...nextauth]/route.ts`. 