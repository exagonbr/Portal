# Sistema de Replicação MySQL → PostgreSQL

Este sistema permite replicar dados do banco MySQL principal (AWS RDS) para o banco PostgreSQL local de forma quase em tempo real.

## 🎯 Objetivo

Conectar e sincronizar dados do banco principal MySQL hospedado na AWS RDS com nossa estrutura PostgreSQL local, mantendo os dados atualizados com frequência de 2 minutos.

## ⚡ NOVIDADE: Geração Automática de Migrations e Seeds

O sistema agora gera automaticamente migrations e seeds baseados na estrutura das tabelas MySQL, permitindo **replicação instantânea** e setup automático do banco PostgreSQL.

### Funcionalidades Automáticas:
- **Análise da estrutura MySQL**: Detecta tabelas, colunas, tipos de dados e índices
- **Geração automática de migrations**: Cria migrations TypeScript/Knex baseadas na estrutura MySQL
- **Conversão de tipos**: Converte automaticamente tipos MySQL para PostgreSQL equivalentes
- **Geração de seeds**: Cria seeds com dados de exemplo do MySQL (limitado a 100 registros por tabela)
- **Execução automática**: Executa migrations e seeds automaticamente no comando `start`

## 📋 Configurações

### Banco MySQL Principal (AWS RDS)
- **Host:** `sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com`
- **Driver:** `com.mysql.cj.jdbc.Driver`
- **URL:** `jdbc:mysql://sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com/sabercon?useTimezone=true&serverTimezone=UTC`
- **Database:** `sabercon`
- **User:** `sabercon`
- **Password:** `gWg28m8^vffI9X#`

### Banco PostgreSQL Local
Configurado através das variáveis de ambiente:
- `DB_HOST` (padrão: localhost)
- `DB_PORT` (padrão: 5432)
- `DB_NAME` (padrão: portal_sabercon)
- `DB_USER` (padrão: postgres)
- `DB_PASSWORD` (padrão: root)
- `DB_SSL` (padrão: false)

## 🚀 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente** (arquivo `.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_SSL=false
```

## 📝 Comandos Disponíveis

### 1. Testar Conectividade
```bash
npm run replicate:test
```
Testa a conexão com ambos os bancos de dados (MySQL e PostgreSQL).

### 2. Gerar Migrations e Seeds ⚡ NOVO
```bash
npm run replicate:generate
```
Gera automaticamente migrations e seeds baseados na estrutura do MySQL, sem executar a replicação.

### 3. Sincronização Manual
```bash
npm run replicate:sync
```
Executa uma sincronização manual única de todas as tabelas mapeadas.

### 4. Iniciar Serviço Completo ⚡ ATUALIZADO
```bash
npm run replicate:start
```
**Novo comportamento:** Gera migrations/seeds automaticamente, executa-os e inicia o serviço de replicação contínua.

**Fluxo completo:**
1. Analisa estrutura das tabelas MySQL
2. Gera migrations TypeScript baseadas na estrutura
3. Gera seeds com dados de exemplo
4. Executa migrations para criar tabelas PostgreSQL
5. Executa seeds para popular com dados iniciais
6. Inicia replicação contínua a cada 2 minutos

### 5. Verificar Status
```bash
npm run replicate:status
```
Mostra o status da última replicação executada.

### 6. Ajuda
```bash
npm run replicate
```
Mostra todos os comandos disponíveis com exemplos.

## 🗄️ Tabelas Mapeadas

O sistema replica as seguintes tabelas do MySQL para o PostgreSQL:

| MySQL | PostgreSQL | Descrição |
|-------|------------|-----------|
| `users` | `users` | Usuários do sistema |
| `courses` | `courses` | Cursos disponíveis |
| `lessons` | `lessons` | Aulas dos cursos |
| `enrollments` | `enrollments` | Matrículas dos usuários |
| `progress` | `progress` | Progresso dos usuários |
| `categories` | `categories` | Categorias de cursos |
| `videos` | `videos` | Vídeos das aulas |
| `files` | `files` | Arquivos do sistema |
| `quizzes` | `quizzes` | Questionários |
| `quiz_questions` | `quiz_questions` | Perguntas dos questionários |
| `quiz_answers` | `quiz_answers` | Respostas dos questionários |
| `user_quiz_attempts` | `user_quiz_attempts` | Tentativas dos usuários |

## 🔄 Conversão Automática de Tipos

O sistema converte automaticamente tipos MySQL para PostgreSQL:

| MySQL | PostgreSQL |
|-------|------------|
| `INT` | `INTEGER` |
| `BIGINT` | `BIGINT` |
| `VARCHAR(n)` | `VARCHAR(n)` |
| `TEXT` | `TEXT` |
| `DATETIME` | `TIMESTAMP` |
| `DECIMAL(p,s)` | `DECIMAL(p,s)` |
| `BOOLEAN` | `BOOLEAN` |
| `JSON` | `JSONB` |
| `BLOB` | `BYTEA` |
| `ENUM` | `VARCHAR` |

## ⚙️ Como Funciona

### 1. Detecção de Mudanças
- O sistema verifica campos `updated_at` e `created_at` para detectar registros novos ou modificados
- Processa apenas dados alterados desde a última sincronização (sincronização incremental)
- Se não houver campos de timestamp, faz sincronização completa

### 2. Processamento em Lotes
- Processa até 1000 registros por vez para otimizar performance
- Evita sobrecarga de memória em tabelas grandes

### 3. UPSERT (Insert/Update)
- Usa `INSERT ... ON CONFLICT DO UPDATE` para inserir novos registros ou atualizar existentes
- Baseado no campo `id` como chave primária

### 4. Conversão de Tipos
- Converte automaticamente tipos de dados do MySQL para PostgreSQL
- Trata campos BLOB/BINARY, datas e booleanos adequadamente

### 5. Geração Automática ⚡ NOVO
- **Análise de Schema**: Examina estrutura das tabelas MySQL (colunas, tipos, índices)
- **Geração de Migrations**: Cria arquivos TypeScript com definições das tabelas
- **Geração de Seeds**: Cria arquivos com dados de exemplo para popular as tabelas
- **Execução Automática**: Executa migrations e seeds automaticamente

## 📊 Monitoramento

### Logs do Sistema
O sistema fornece logs detalhados durante a execução:

```
🏗️  Gerando migrations e seeds automaticamente...
🔄 Processando estrutura: users -> users
✅ Migration criada: 20241220120000_create_users_from_mysql.ts
✅ Seed criado: 20241220120000_users_data_from_mysql.ts
🚀 Executando migrations e seeds...
📋 Executando migrations...
✅ Migrations executadas
🌱 Executando seeds...
✅ Seeds executados
✅ Conectado ao MySQL (AWS RDS) com sucesso
✅ Conectado ao PostgreSQL local com sucesso
📋 Encontradas 12 tabelas no MySQL
🔄 Processando tabela: users -> users
✅ 150 registros processados para users
🔄 Processando tabela: courses -> courses
✅ 25 registros processados para courses
✅ Replicação concluída com sucesso!
📊 Status: 175 registros processados
⚠️  Erros: 0
```

### Status da Replicação
```json
{
  "lastSyncTime": "2024-01-20T10:30:00.000Z",
  "totalRecordsProcessed": 1250,
  "errorsCount": 0,
  "tablesProcessed": ["users", "courses", "lessons", "enrollments"]
}
```

## 🔧 Configuração Avançada

### Personalizar Mapeamento de Tabelas
Edite o arquivo `scripts/mysql-replication.ts` na seção `tableMappings`:

```typescript
private tableMappings = {
  'mysql_table_name': 'postgresql_table_name',
  'users': 'users',
  'nova_tabela': 'nova_tabela_pg'
};
```

### Personalizar Mapeamento de Colunas
Edite a seção `columnMappings` para mapear colunas com nomes diferentes:

```typescript
private columnMappings = {
  'mysql_column': 'postgresql_column',
  'created_at': 'created_at',
  'modified_date': 'updated_at'
};
```

### Personalizar Conversão de Tipos
Edite o método `convertMySQLTypeToPostgreSQL` para adicionar novos mapeamentos:

```typescript
const typeMap: { [key: string]: string } = {
  'int': 'INTEGER',
  'varchar': 'VARCHAR',
  'novo_tipo_mysql': 'NOVO_TIPO_POSTGRESQL'
};
```

### Alterar Frequência de Sincronização
Modifique o cron pattern no método `startReplicationService()`:

```typescript
// A cada 2 minutos (padrão)
cron.schedule('*/2 * * * *', async () => {

// A cada 1 minuto
cron.schedule('*/1 * * * *', async () => {

// A cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
```

## 🚨 Troubleshooting

### Erro de Conexão MySQL
```
❌ Erro ao conectar ao MySQL: Error: getaddrinfo ENOTFOUND
```
**Solução:** Verificar conectividade de rede e credenciais AWS.

### Erro de Conexão PostgreSQL
```
❌ Erro ao conectar ao PostgreSQL: password authentication failed
```
**Solução:** Verificar variáveis de ambiente `.env` e credenciais do PostgreSQL.

### Erro na Geração de Migrations ⚡ NOVO
```
❌ Erro ao gerar migrations e seeds: permission denied
```
**Solução:** Verificar permissões de escrita no diretório do projeto.

### Erro de Execução de Migrations
```
❌ Erro ao executar migrations/seeds: Command failed
```
**Solução:** Verificar se Knex está configurado corretamente e se o banco PostgreSQL está rodando.

### Tabela não existe no PostgreSQL
```
⚠️  Tabela users não existe no PostgreSQL, pulando...
```
**Solução:** O novo sistema gera e executa migrations automaticamente. Se ainda ocorrer, execute manualmente:
```bash
npm run migrate
```

### Erro de UPSERT
```
❌ Erro ao inserir dados na tabela users: duplicate key value violates unique constraint
```
**Solução:** Verificar se a tabela PostgreSQL tem as constraints adequadas.

## 📈 Performance

### Otimizações Implementadas
- **Processamento em lotes:** Máximo 1000 registros por consulta
- **Sincronização incremental:** Apenas dados modificados
- **Conexões reutilizáveis:** Pool de conexões otimizado
- **Índices de timestamp:** Para consultas eficientes por data
- **Geração otimizada:** Cria apenas migrations para tabelas mapeadas ⚡ NOVO
- **Seeds limitados:** Máximo 100 registros por seed para reduzir tamanho ⚡ NOVO

### Métricas Esperadas
- **Latência:** ~2-5 minutos para dados aparecerem no PostgreSQL
- **Throughput:** ~500-1000 registros/minuto
- **Uso de CPU:** Baixo (~5-10% durante sincronização)
- **Uso de Memória:** ~50-100MB por processo
- **Setup inicial:** ~30-60 segundos para gerar migrations/seeds ⚡ NOVO

## 🔐 Segurança

### Credenciais
- Credenciais MySQL hardcoded para conexão AWS (temporário para desenvolvimento)
- Credenciais PostgreSQL via variáveis de ambiente
- Conexões SSL habilitadas para AWS RDS

### Recomendações
1. Mover credenciais MySQL para variáveis de ambiente
2. Usar AWS IAM roles quando possível
3. Implementar rotação de senhas
4. Monitorar logs de acesso

## 📞 Suporte

Para questões ou problemas com o sistema de replicação:

1. Verificar logs do sistema
2. Executar `npm run replicate:test` para diagnosticar conectividade
3. Usar `npm run replicate:generate` para testar geração de migrations ⚡ NOVO
4. Consultar este README para troubleshooting
5. Verificar status das conexões de rede

## 🔄 Fluxo de Execução Completo ⚡ ATUALIZADO

```
1. Conecta ao MySQL (AWS RDS)
2. Analisa estrutura das tabelas MySQL
3. Gera migrations TypeScript baseadas na estrutura
4. Gera seeds com dados de exemplo
5. Conecta ao PostgreSQL (local)
6. Executa migrations para criar tabelas
7. Executa seeds para popular dados iniciais
8. Lista tabelas do MySQL
9. Para cada tabela mapeada:
   a. Verifica se existe no PostgreSQL
   b. Busca dados novos/modificados do MySQL
   c. Converte tipos de dados
   d. Executa UPSERT no PostgreSQL
10. Atualiza timestamp da última sincronização
11. Fecha conexões
12. Agenda próxima execução (se modo contínuo)
```

## 🎯 Casos de Uso

### Setup Inicial Completo
```bash
# Configura tudo automaticamente (migrations, seeds e replicação)
npm run replicate:start
```

### Apenas Gerar Estrutura
```bash
# Gera apenas migrations e seeds para análise
npm run replicate:generate
```

### Sincronização Manual
```bash
# Sincroniza dados sem gerar estrutura
npm run replicate:sync
```

### Diagnóstico
```bash
# Testa conectividade
npm run replicate:test

# Verifica status
npm run replicate:status
``` 