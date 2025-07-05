# Configuração do Banco de Dados

## Comandos Disponíveis

### Reset Completo do Banco (Recomendado)
```bash
npm run db:fresh
```
Este comando:
- Remove todas as tabelas existentes
- Executa todas as migrações
- Aplica os seeds de dados iniciais

### Comandos Individuais

#### Migrações
```bash
# Executar todas as migrações
npm run migrate:latest

# Reverter última migração
npm run migrate:rollback

# Reverter todas as migrações
npx knex migrate:rollback --all
```

#### Seeds
```bash
# Executar seed específico
npx knex seed:run --specific=001_test_seed.js

# Executar todos os seeds
npm run seed
```

## Dados de Acesso Padrão

Após executar `npm run db:fresh`, os seguintes usuários estarão disponíveis:

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| admin@sabercon.edu.br | password123 | SYSTEM_ADMIN | Administrador do Sistema |
| gestor@sabercon.edu.br | password123 | INSTITUTION_MANAGER | Gestor Institucional |
| coordenador@sabercon.edu.com | password123 | ACADEMIC_COORDINATOR | Coordenador Acadêmico |
| professor@sabercon.edu.br | password123 | TEACHER | Professor |
| julia.c@ifsp.com | password123 | STUDENT | Estudante |

## Estrutura do Banco

### Tabelas Principais
- `institution` - Instituições de ensino
- `roles` - Papéis/funções no sistema
- `user` - Usuários do sistema
- `unit` - Unidades das instituições
- `education_cycles` - Ciclos educacionais
- `classes` - Turmas
- `user_classes` - Associação usuário-turma
- `permissions` - Permissões do sistema
- `role_permissions` - Associação role-permissão

## Troubleshooting

### Erro: "relação X não existe"
Se você encontrar erros sobre tabelas que não existem, execute:
```bash
npm run db:fresh
```

### Erro de conexão com PostgreSQL
Verifique se:
1. PostgreSQL está instalado e rodando
2. As credenciais no arquivo `.env` estão corretas:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=portal_sabercon
   DB_USER=postgres
   DB_PASSWORD=root
   ```

### Scripts Alternativos

Para Windows:
```bash
cd backend
scripts\reset-db.bat
```

Para Linux/Mac:
```bash
cd backend
chmod +x scripts/reset-db.sh
./scripts/reset-db.sh
```

## Desenvolvimento

### Criar nova migração
```bash
npm run migrate:make nome_da_migracao
```

### Criar novo seed
```bash
npm run seed:make nome_do_seed
```

## Observações Importantes

1. **Sempre faça backup** antes de executar comandos que alteram o banco
2. O comando `db:fresh` **apaga todos os dados** existentes
3. Use ambientes separados para desenvolvimento, teste e produção
4. Nunca execute `db:fresh` em produção sem autorização