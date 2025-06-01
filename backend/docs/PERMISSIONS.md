# Sistema de Permissões

Este documento descreve o sistema de roles (papéis) e permissions (permissões) utilizado na aplicação.

## Visão Geral

O sistema de permissões é baseado em dois componentes principais:

1. **Roles (Papéis)**: Representam os diferentes papéis que um usuário pode ter no sistema (ex: administrador, professor, aluno).
2. **Permissions (Permissões)**: Representam ações específicas que podem ser realizadas no sistema.

## Estrutura do Banco de Dados

### Tabela `roles`

Armazena os diferentes papéis disponíveis no sistema.

| Campo       | Tipo       | Descrição                                      |
|-------------|------------|------------------------------------------------|
| id          | uuid       | Identificador único da role                    |
| name        | enum       | Nome da role (ex: SYSTEM_ADMIN, TEACHER)       |
| description | text       | Descrição da role                              |
| permissions | jsonb      | Array de permissões associadas à role          |
| active      | boolean    | Indica se a role está ativa                    |
| created_at  | timestamp  | Data de criação                                |
| updated_at  | timestamp  | Data da última atualização                     |

### Tabela `permissions`

Armazena as permissões disponíveis no sistema.

| Campo       | Tipo       | Descrição                                      |
|-------------|------------|------------------------------------------------|
| id          | uuid       | Identificador único da permissão               |
| name        | string     | Nome da permissão (ex: users.manage)           |
| resource    | string     | Recurso ao qual a permissão se aplica          |
| action      | enum       | Ação permitida (create, read, update, delete)  |
| description | text       | Descrição da permissão                         |
| created_at  | timestamp  | Data de criação                                |
| updated_at  | timestamp  | Data da última atualização                     |

### Tabela `role_permissions`

Tabela de junção que associa roles às permissions.

| Campo          | Tipo       | Descrição                                      |
|----------------|------------|------------------------------------------------|
| role_id        | uuid       | Referência à role                              |
| permission_id  | uuid       | Referência à permissão                         |
| created_at     | timestamp  | Data de criação                                |
| updated_at     | timestamp  | Data da última atualização                     |

## Roles Disponíveis

1. **SYSTEM_ADMIN**: Administrador do sistema com acesso completo.
2. **INSTITUTION_MANAGER**: Gestor de instituição com acesso administrativo.
3. **ACADEMIC_COORDINATOR**: Coordenador acadêmico.
4. **TEACHER**: Professor com acesso a turmas e conteúdos.
5. **STUDENT**: Estudante com acesso a materiais e atividades.
6. **GUARDIAN**: Responsável com acesso a informações dos filhos.

## Formato de Permissões

As permissões seguem o formato `resource.action` ou `resource.action.scope`, onde:

- **resource**: O recurso sendo acessado (ex: users, courses, grades)
- **action**: A ação sendo executada (ex: manage, view, create, update)
- **scope**: Escopo opcional da ação (ex: own, all, institution)

Exemplos:
- `users.manage.global`: Gerenciar todos os usuários do sistema
- `grades.view.own`: Visualizar apenas as próprias notas
- `classes.manage`: Gerenciar turmas

## Verificação de Permissões

No backend, as permissões são verificadas de duas formas:

1. **Via Role**: Verificando se o usuário possui uma role específica.
2. **Via Permission**: Verificando se o usuário possui uma permissão específica.

### Exemplo de verificação de permissão

```typescript
// Verificar permissão individual
if (user.role?.permissions?.includes('grades.manage')) {
  // Usuário pode gerenciar notas
}

// Verificar via método auxiliar
if (role.hasPermission('grades.manage')) {
  // Role permite gerenciar notas
}
```

## Migrações

As tabelas e dados iniciais são criados através das seguintes migrações:

1. `20250301000001_create_roles_table.ts`: Cria a tabela `roles`
2. `20250301000002_create_permissions_table.ts`: Cria a tabela `permissions`
3. `20250301000003_create_role_permissions_table.ts`: Cria a tabela `role_permissions`

E o seed inicial:

- `001_default_roles_and_permissions.ts`: Popula as tabelas com roles e permissions padrão.

## Performance

Para otimizar a performance, o sistema armazena as permissões de duas formas:

1. Como um array JSONB na tabela `roles`, permitindo acesso rápido sem joins.
2. Como registros na tabela `role_permissions` para consultas relacionais. 