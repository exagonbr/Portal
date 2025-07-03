# Solução dos Erros da Tabela Roles

## Problema Identificado

O sistema estava apresentando os seguintes erros relacionados à tabela `roles`:

```
coluna "status" não existe
coluna "type" não existe  
coluna u.role_id não existe
```

## Diagnóstico

A estrutura da tabela `roles` no banco de dados não correspondia ao que o código estava esperando:

### Estrutura Antiga (Incorreta)
```sql
- id (bigint)
- version (bigint)  
- authority (varchar)
- display_name (varchar)
```

### Estrutura Esperada pelo Código
```sql
- id (uuid)
- name (varchar)
- description (text)
- type (enum: 'system', 'custom')
- user_count (integer)
- status (enum: 'active', 'inactive') 
- active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Solução Implementada

### 1. Criação da Migração
Arquivo: `backend/migrations/20250630000000_fix_roles_table_structure.ts`

### 2. Processo de Migração
1. **Backup dos dados existentes** - Salvou os 6 roles existentes
2. **Remoção da tabela antiga** - Dropou a tabela com estrutura incorreta
3. **Criação da nova estrutura** - Tabela com todas as colunas necessárias
4. **Migração dos dados** - Converteu os dados antigos para o novo formato
5. **Criação de roles padrão** - Adicionou roles essenciais do sistema
6. **Adição da coluna role_id na tabela users** - Para relacionamento
7. **Criação das tabelas de permissões** - `permissions` e `role_permissions`

### 3. Roles Criados
```
- ADMIN (Administrador do Sistema)
- TEACHER (Professor)  
- STUDENT (Estudante)
- GUARDIAN (Responsável)
- COORDINATOR (Coordenador)
```

Além dos roles migrados da estrutura antiga:
```
- ROLE_ADMIN
- ROLE_CONTENT_MANAGER  
- ROLE_IS_STUDENT
- ROLE_IS_TEACHER
- ROLE_REPORT_MANAGER
- ROLE_TRUSTED_USER
```

## Resultado

### Estrutura Final da Tabela Roles
```sql
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL UNIQUE,
    description text,
    type text NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'custom')),
    user_count integer DEFAULT 0,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Relacionamentos Criados
- `users.role_id` → `roles.id` (Foreign Key)
- `role_permissions.role_id` → `roles.id` (Foreign Key)
- `role_permissions.permission_id` → `permissions.id` (Foreign Key)

## Comandos Executados

```bash
# Execução da migração
cd backend && npm run migrate:latest
```

## Verificação

Após a migração, todos os erros relacionados às colunas inexistentes foram resolvidos:
- ✅ Coluna `status` existe e funciona
- ✅ Coluna `type` existe e funciona  
- ✅ Coluna `role_id` existe na tabela users
- ✅ RoleService funciona corretamente
- ✅ APIs de roles respondem sem erros

## Impacto

- **Sistema de roles** totalmente funcional
- **Relacionamentos** entre usuários e roles estabelecidos
- **Permissões** estruturadas e prontas para uso
- **Compatibilidade** com todo o código existente do RoleService

A migração foi executada com sucesso, preservando todos os dados existentes e corrigindo completamente a estrutura do banco de dados. 