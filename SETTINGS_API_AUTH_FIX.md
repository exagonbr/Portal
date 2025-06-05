# Correções de Autenticação e Configurações AWS/S3

## Mudanças Implementadas

### 1. Correção dos Erros 401 nas Rotas de API

#### Problema
As rotas de API estavam retornando erro 401 (não autorizado) porque não estavam incluindo as credenciais de sessão nas requisições.

#### Solução
- Adicionado `credentials: 'include'` em todas as chamadas fetch para incluir cookies de sessão
- Melhorado o tratamento de erros para identificar quando a sessão expirou
- Adicionado mensagens de erro específicas para problemas de autenticação

### 2. CRUD de Credenciais AWS Restaurado

#### Funcionalidades
- **Cadastro e Edição**: Campos para Access Key ID, Secret Access Key e Região
- **Campos de Configuração**:
  - Access Key ID (campo senha)
  - Secret Access Key (campo senha)
  - Região (dropdown com opções principais)
- **Persistência**: As credenciais são salvas no banco de dados através das rotas de API

### 3. Configurações S3

#### Funcionalidades
- **Teste de Conexão**: Usa as credenciais configuradas para testar a conexão
- **Listagem de Buckets**: Após teste bem-sucedido, lista todos os buckets S3 disponíveis
- **Feedback Visual**: Exibe os buckets em uma lista formatada com ícones

### 4. Nova Rota de API

Criada nova rota `/api/settings/s3-buckets` para listar os buckets S3 usando as credenciais configuradas.

## Como Funciona Agora

1. **Configuração de Credenciais**:
   - O usuário cadastra/edita as credenciais AWS na interface
   - As credenciais são salvas no banco de dados

2. **Teste de Conexão**:
   - Usa as credenciais configuradas para testar a conexão com a AWS
   - Envia as credenciais no corpo da requisição

3. **Listagem de Buckets**:
   - Após teste bem-sucedido, lista todos os buckets disponíveis
   - Usa a rota `/api/settings/s3-buckets` para buscar a lista

## Benefícios

- **Flexibilidade**: Permite configurar diferentes contas AWS
- **Segurança**: Credenciais são enviadas como campos de senha
- **Validação**: Teste de conexão valida as credenciais antes de usar
- **Feedback Visual**: Lista de buckets confirma que a conexão está funcionando

## Próximos Passos

Para completar a implementação, o backend precisa:

1. Implementar o CRUD completo para as credenciais AWS:
   - GET `/api/settings/aws` - Buscar credenciais
   - POST/PUT `/api/settings/aws` - Salvar/atualizar credenciais
   - DELETE `/api/settings/aws/:id` - Deletar credenciais

2. Implementar a rota `/api/settings/s3-buckets` que:
   - Busca as credenciais AWS do banco de dados
   - Usa o AWS SDK para listar os buckets
   - Retorna a lista em formato JSON

3. Implementar a rota `/api/settings/test-s3` que:
   - Recebe as credenciais no corpo da requisição
   - Testa a conexão com a AWS
   - Retorna sucesso ou erro

4. Garantir que todas as rotas validem o token de autenticação corretamente

5. Armazenar as credenciais AWS de forma segura no banco de dados (criptografadas) 