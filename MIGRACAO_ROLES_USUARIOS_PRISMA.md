# Migração de Roles e Usuários - Prisma

Este documento descreve a implementação das migrações para as tabelas de perfis (roles) e usuários (users) no sistema Portal utilizando o Prisma.

## Estrutura Implementada

### Tabela `roles`

Esta tabela armazena os diferentes perfis de usuário disponíveis no sistema:

- `id` - Identificador único do perfil
- `name` - Nome do perfil (valor único)
- `description` - Descrição do perfil
- `created_at` - Data de criação do registro
- `updated_at` - Data da última atualização do registro

### Tabela `users`

Esta tabela armazena os usuários do sistema:

- `id` - Identificador único do usuário
- `email` - Email do usuário (valor único)
- `name` - Nome do usuário
- `password` - Senha do usuário
- `role_id` - Identificador do perfil do usuário (chave estrangeira para a tabela roles)
- `active` - Status do usuário (ativo/inativo)
- `created_at` - Data de criação do registro
- `updated_at` - Data da última atualização do registro

## Perfis Criados

Os seguintes perfis foram criados na migração inicial:

1. **SYSTEM_ADMIN** - Administrador do Sistema
2. **INSTITUTION_MANAGER** - Gestor da Instituição
3. **TEACHER** - Professor
4. **STUDENT** - Estudante
5. **ACADEMIC_COORDINATOR** - Coordenador Acadêmico
6. **GUARDIAN** - Responsável

## Usuários Iniciais

Os seguintes usuários foram criados na migração inicial:

| Email | Perfil | Senha |
|-------|--------|-------|
| admin@sabercon.edu.br | SYSTEM_ADMIN | password123 |
| gestor@sabercon.edu.br | INSTITUTION_MANAGER | password123 |
| professor@sabercon.edu.br | TEACHER | password123 |
| julia.c@ifsp.com | STUDENT | password123 |
| coordenador@sabercon.edu.com | ACADEMIC_COORDINATOR | password123 |
| renato@gmail.com | GUARDIAN | password123 |

## Arquivos Criados

- `prisma/schema.prisma` - Atualizado com os modelos de Role e User
- `prisma/migrations/20240802000000_roles_and_users/migration.sql` - SQL para criar as tabelas e inserir os dados iniciais
- `prisma/migrations/20240802000000_roles_and_users/README.md` - Documentação da migração
- `prisma/migrations/migration_lock.toml` - Arquivo de controle do Prisma
- `scripts/apply-migrations.sh` - Script para aplicar as migrações

## Como Aplicar a Migração

1. Certifique-se de que o arquivo `.env` existe na raiz do projeto com a variável `DATABASE_URL` configurada corretamente para apontar para o banco de dados PostgreSQL.

2. Execute o script de migração:

```bash
./scripts/apply-migrations.sh
```

3. O script irá aplicar as migrações e gerar o cliente Prisma atualizado.

## Observações Importantes

- As senhas estão armazenadas em texto puro nesta migração inicial para fins de desenvolvimento. Em um ambiente de produção, estas senhas devem ser substituídas por versões devidamente criptografadas.
- Recomenda-se a utilização de algoritmos seguros como bcrypt, argon2 ou scrypt para o armazenamento de senhas.
- Em uma implementação futura, um serviço de autenticação deve ser implementado para gerenciar o login e a autorização dos usuários. 