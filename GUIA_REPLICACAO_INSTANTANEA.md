# 🚀 Guia Rápido: Replicação Instantânea MySQL → PostgreSQL

## ⚡ Novidade Implementada

O comando `npm run replicate:start` agora cria automaticamente **migrations e seeds** baseados na estrutura do banco MySQL, permitindo replicação instantânea!

## 🎯 O que mudou?

### Antes:
- Era necessário criar manualmente migrations e seeds
- Setup demorado e propenso a erros
- Estrutura PostgreSQL precisava ser criada manualmente

### Agora:
- **Geração automática** de migrations baseadas no MySQL
- **Criação automática** de seeds com dados de exemplo
- **Execução automática** de migrations e seeds
- **Setup instantâneo** com um único comando

## 🚀 Como usar

### 1. Setup Completo (Recomendado)
```bash
npm run replicate:start
```
Este comando faz TUDO automaticamente:
- Analisa estrutura das tabelas MySQL
- Gera migrations TypeScript
- Gera seeds com dados de exemplo  
- Executa migrations (cria tabelas PostgreSQL)
- Executa seeds (popula dados iniciais)
- Inicia replicação contínua a cada 2 minutos

### 2. Apenas Gerar Arquivos (para análise)
```bash
npm run replicate:generate
```
Gera apenas migrations e seeds sem executar.

### 3. Testar Conectividade
```bash
npm run replicate:test
```

### 4. Sincronização Manual (sem setup)
```bash
npm run replicate:sync
```

### 5. Ver Status
```bash
npm run replicate:status
```

## 🔄 Conversão Automática de Tipos

O sistema converte automaticamente:

| MySQL | PostgreSQL |
|-------|------------|
| `INT` | `INTEGER` |
| `VARCHAR(n)` | `VARCHAR(n)` |
| `TEXT` | `TEXT` |
| `DATETIME` | `TIMESTAMP` |
| `JSON` | `JSONB` |
| `BLOB` | `BYTEA` |

## 📁 Arquivos Gerados

### Migrations (em `backend/migrations/`)
```typescript
// Exemplo: 20241220120000_create_users_from_mysql.ts
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.varchar('name').notNullable();
    table.varchar('email').notNullable();
    table.timestamps(true, true);
  });
}
```

### Seeds (em `backend/seeds/`)
```typescript
// Exemplo: 20241220120000_users_data_from_mysql.ts
export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('users').insert([
    { id: 1, name: 'João', email: 'joao@email.com' },
    // ... até 100 registros de exemplo
  ]);
}
```

## ⚙️ Configuração

Certifique-se que o arquivo `.env` no backend tenha:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_SSL=false
```

## 🗄️ Tabelas Suportadas

O sistema processa automaticamente todas as tabelas mapeadas:
- `users` → `users`
- `courses` → `courses` 
- `lessons` → `lessons`
- `enrollments` → `enrollments`
- `progress` → `progress`
- `categories` → `categories`
- `videos` → `videos`
- `files` → `files`
- `quizzes` → `quizzes`
- `quiz_questions` → `quiz_questions`
- `quiz_answers` → `quiz_answers`
- `user_quiz_attempts` → `user_quiz_attempts`

## 📊 Logs de Exemplo

```bash
🏗️  Gerando migrations e seeds automaticamente...
🔄 Processando estrutura: users -> users
✅ Migration criada: 20241220120000_create_users_from_mysql.ts
✅ Seed criado: 20241220120000_users_data_from_mysql.ts
🚀 Executando migrations e seeds...
📋 Executando migrations...
✅ Migrations executadas
🌱 Executando seeds...
✅ Seeds executados
🎯 Iniciando replicação contínua...
✅ 150 registros processados para users
✅ 25 registros processados para courses
✅ Replicação concluída com sucesso!
⏰ Próxima replicação em 2 minutos...
```

## 🚨 Resolução de Problemas

### Erro de Conexão MySQL
```bash
npm run replicate:test
```

### Erro de Permissions
```bash
chmod +x backend/scripts/mysql-replication.ts
```

### Erro de Migrations
```bash
cd backend && npm run migrate
```

### Limpar e Recomeçar
```bash
cd backend
npm run migrate:rollback --all
npm run replicate:start
```

## 🎯 Resultado Final

Após executar `npm run replicate:start`, você terá:

✅ **Banco PostgreSQL** com estrutura idêntica ao MySQL  
✅ **Dados iniciais** populados automaticamente  
✅ **Replicação contínua** a cada 2 minutos  
✅ **Logs detalhados** de todo o processo  
✅ **Conversão automática** de tipos de dados  

## 📞 Suporte

Para mais detalhes, consulte: `backend/README-REPLICACAO.md`

---

**🎉 Agora você tem replicação instantânea com um único comando!** 