# Migração de Roles de Usuários

Este documento descreve o processo de migração das colunas booleanas de usuários para a coluna `role` no sistema.

## Descrição da Migração

A migração consiste em converter as seguintes colunas booleanas na tabela `users`:

- `is_admin` → `SYSTEM_ADMIN`
- `is_manager` → `INSTITUTION_MANAGER`
- `is_coordinator` → `ACADEMIC_COORDINATOR`
- `is_teacher` → `TEACHER`
- `is_guardian` → `GUARDIAN`

Se nenhuma das colunas acima estiver definida como `true`, o usuário receberá o papel padrão `STUDENT`.

## Ordem de Prioridade

Em caso de um usuário ter múltiplas colunas com valor `true`, a seguinte ordem de prioridade será aplicada:

1. `is_admin` (maior prioridade)
2. `is_manager`
3. `is_coordinator`
4. `is_teacher`
5. `is_guardian`
6. Nenhuma coluna = `STUDENT` (menor prioridade)

## Como Executar a Migração

Existem duas formas de executar esta migração:

### 1. Usando o Script Automatizado

Execute o seguinte comando no terminal:

```bash
node scripts/migrate-user-roles.js
```

ou

```bash
./scripts/migrate-user-roles.js
```

Este script:

- Verifica se o arquivo de migração existe
- Verifica se o arquivo de configuração do Knex existe
- Executa a migração específica para converter as colunas booleanas para a coluna `role`
- Fornece feedback detalhado em caso de erros

### 2. Usando o Knex Diretamente

Se preferir executar a migração manualmente com o Knex, siga estes passos:

```bash
cd backend
npx knex migrate:up 20250602000001_migrate_user_boolean_to_role.ts
```

## Verificação

Após executar a migração, você pode verificar se ela foi concluída com sucesso executando uma consulta SQL:

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'SYSTEM_ADMIN' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'INSTITUTION_MANAGER' THEN 1 END) as managers,
  COUNT(CASE WHEN role = 'ACADEMIC_COORDINATOR' THEN 1 END) as coordinators,
  COUNT(CASE WHEN role = 'TEACHER' THEN 1 END) as teachers,
  COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as students,
  COUNT(CASE WHEN role = 'GUARDIAN' THEN 1 END) as guardians
FROM users;
```

## Reversão da Migração

Caso seja necessário reverter a migração, execute:

```bash
cd backend
npx knex migrate:down 20250602000001_migrate_user_boolean_to_role.ts
```

A reversão não remove a coluna `role`, apenas redefine todos os valores para `STUDENT`.

## Campos Adicionais

Note que esta migração:

1. Mantém as colunas booleanas originais para compatibilidade com código legado
2. Adiciona um índice na coluna `role` para melhorar o desempenho das consultas
3. Lida com cenários onde nem todas as colunas booleanas existem na tabela
4. Verifica dinamicamente quais colunas existem antes de tentar acessá-las

## Solução de Problemas

### Erro com TypeScript

Se encontrar erros relacionados ao TypeScript durante a execução da migração, como:

```
TypeScript enum is not supported in strip-only mode
```

Isso acontece porque alguns ambientes têm limitações no processamento de enums TypeScript. O arquivo de migração foi atualizado para usar constantes regulares em vez de enums para evitar esse problema.

### Erro de Módulo Não Encontrado

Se encontrar erros como:

```
Cannot find module '../../src/types/roles'
```

Isso indica que o arquivo está tentando importar definições de tipos de um caminho que não existe ou não está acessível. A solução foi definir as constantes diretamente no arquivo de migração para evitar dependências externas.

### Erro de Coluna Não Encontrada

Se encontrar erros como:

```
select "id", "is_teacher", "is_manager", "is_admin", "is_coordinator", "is_guardian" from "users" - coluna "is_coordinator" não existe
```

Isso indica que uma ou mais colunas mencionadas na migração não existem no banco de dados. A migração foi atualizada para verificar dinamicamente quais colunas existem antes de tentar acessá-las, evitando esse tipo de erro.

### Índice Já Existe

Se o PostgreSQL indicar que o índice já existe, isso é tratado automaticamente no script de migração. O script verifica a existência do índice antes de tentar criá-lo.

## Suporte

Em caso de problemas com a migração, verifique os seguintes pontos:

1. Certifique-se de que a conexão com o banco de dados está configurada corretamente no arquivo `backend/knexfile.js`
2. Verifique se todas as dependências estão instaladas executando `npm install` no diretório `backend`
3. Consulte os logs para obter informações detalhadas sobre possíveis erros
4. Se estiver usando o script automatizado, ele fornecerá sugestões específicas para resolução de problemas comuns

## Histórico de Alterações

- **2025-06-02**: Versão inicial da migração
- **2025-06-03**: Atualização para usar constantes em vez de enum TypeScript para maior compatibilidade
- **2025-06-04**: Adicionado tratamento dinâmico de colunas para evitar erros com colunas inexistentes 