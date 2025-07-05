# Migrações do Google OAuth

Este diretório contém as migrações necessárias para adicionar suporte ao Google OAuth no sistema.

## Arquivos Criados

### 1. `20250705000000_add_google_oauth_fields.ts`
- **Tipo**: Migração TypeORM (TypeScript)
- **Função**: Adiciona campos do Google OAuth usando TypeORM
- **Uso**: Automático com `npm run migration:run`

### 2. `20250705000000_add_google_oauth_fields.sql`
- **Tipo**: Script SQL direto
- **Função**: Adiciona campos do Google OAuth via SQL
- **Uso**: Manual ou via script personalizado

### 3. `20250705000000_rollback_google_oauth_fields.sql`
- **Tipo**: Script de rollback
- **Função**: Remove campos do Google OAuth
- **Uso**: Apenas se necessário reverter a migração

## Campos Adicionados

A migração adiciona os seguintes campos na tabela `user`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `google_id` | VARCHAR(255) UNIQUE | ID único do usuário no Google OAuth |
| `profile_image` | VARCHAR(500) | URL da imagem de perfil do usuário |
| `email_verified` | BOOLEAN DEFAULT FALSE | Indica se o email foi verificado |

## Índices Criados

- `idx_user_google_id`: Para consultas rápidas por Google ID
- `idx_user_email_verified`: Para consultas por status de verificação

## Como Executar

### Opção 1: TypeORM (Recomendado)
```bash
# Navegar para o diretório do backend
cd backend

# Executar todas as migrações pendentes
npm run migration:run

# Ou executar uma migração específica
npm run typeorm migration:run -- --name=AddGoogleOAuthFields20250705000000
```

### Opção 2: Script Personalizado
```bash
# Executar o script de migração
node scripts/run-google-oauth-migration.js
```

### Opção 3: SQL Direto
```bash
# Conectar ao banco e executar o SQL
psql -d portal_sabercon -f migrations/20250705000000_add_google_oauth_fields.sql

# Ou para MySQL
mysql -u username -p database_name < migrations/20250705000000_add_google_oauth_fields.sql
```

## Rollback (Reverter)

⚠️ **ATENÇÃO**: O rollback remove permanentemente os dados dos campos do Google OAuth.

```bash
# Executar rollback via SQL
psql -d portal_sabercon -f migrations/20250705000000_rollback_google_oauth_fields.sql

# Ou via TypeORM
npm run migration:revert
```

## Verificar Execução

Para verificar se a migração foi executada com sucesso:

```sql
-- Verificar se os campos foram adicionados
DESCRIBE user;

-- Ou para PostgreSQL
\d user;

-- Verificar índices
SHOW INDEX FROM user;

-- Verificar dados de exemplo
SELECT id, email, google_id, profile_image, email_verified 
FROM user 
WHERE google_id IS NOT NULL 
LIMIT 5;
```

## Troubleshooting

### Erro: "Column already exists"
```sql
-- Verificar se os campos já existem
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('google_id', 'profile_image', 'email_verified');
```

### Erro: "Table doesn't exist"
```bash
# Verificar se a tabela user existe
npm run migration:show

# Executar migrações anteriores primeiro
npm run migration:run
```

### Erro de Permissões
```bash
# Verificar permissões do usuário do banco
SHOW GRANTS; -- MySQL
\du -- PostgreSQL
```

## Dependências

Esta migração depende de:
- ✅ Tabela `user` existente
- ✅ Sistema de migrações configurado
- ✅ Conexão com banco de dados funcional

## Próximos Passos

Após executar a migração:

1. ✅ Configurar variáveis de ambiente do Google OAuth
2. ✅ Testar endpoint `/api/auth/signin/google`
3. ✅ Verificar criação de usuários via Google
4. ✅ Testar login e logout completo

## Suporte

Para dúvidas ou problemas:
- Consulte os logs da migração
- Verifique a documentação do TypeORM
- Consulte `docs/GOOGLE_OAUTH_SETUP.md` 