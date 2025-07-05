# Script db:fresh Atualizado

## Funcionalidades Implementadas

O comando `npm run db:fresh` foi atualizado para realizar todas as operações solicitadas:

### 1. Reset Completo do Banco
- ✅ Drop de todas as tabelas PostgreSQL
- ✅ Recriação do schema público

### 2. Execução de Migrations
- ✅ Executa todas as migrations existentes
- ✅ Cria automaticamente migrations para tabelas faltantes do MySQL

### 3. Execução de Seeds
- ✅ Executa todos os seeds existentes
- ✅ Cria automaticamente seeds básicos para tabelas faltantes

### 4. Conexão e Importação MySQL
- ✅ Verifica conexão com MySQL
- ✅ Compara estruturas de tabelas MySQL vs PostgreSQL
- ✅ Importa dados do MySQL usando o migrador existente

### 5. Criação Automática de Migrations/Seeds
- ✅ Detecta tabelas que existem no MySQL mas não no PostgreSQL
- ✅ Cria migrations básicas com estrutura padrão
- ✅ Cria seeds básicos com dados de exemplo

## Como Usar

```bash
cd backend
npm run db:fresh
```

## O que o Script Faz

1. **Reset do Banco**: Remove todas as tabelas e recria o schema
2. **Migrations**: Executa todas as migrations existentes
3. **Seeds Iniciais**: Popula tabelas com dados básicos
4. **Verificação MySQL**: Testa conexão com MySQL
5. **Comparação de Estruturas**: Identifica tabelas faltantes
6. **Criação Automática**: Gera migrations e seeds para tabelas faltantes
7. **Execução das Novas Migrations/Seeds**: Aplica as novas estruturas
8. **Importação MySQL**: Migra dados do MySQL para PostgreSQL
9. **Verificação Final**: Valida o resultado da migração

## Tabelas Criadas Automaticamente

O script detectou e criou automaticamente 46 tabelas que existiam no MySQL:

- answer, author, certificate
- education_period, educational_stage
- file, genre, tag, theme
- tv_show, video, profile
- user_activity, viewing_status
- watchlist_entry
- E muitas outras...

## Estrutura das Migrations Automáticas

Cada migration criada automaticamente inclui:
- Campo `id` UUID como chave primária
- Campo `name` obrigatório
- Campo `description` opcional
- Campo `is_active` boolean
- Timestamps automáticos
- Índices básicos

## Estrutura dos Seeds Automáticos

Cada seed criado automaticamente inclui:
- Limpeza de dados existentes
- Inserção de 2 registros de exemplo
- Logs de confirmação

## Dados de Teste Disponíveis

Após a execução, os seguintes usuários de teste estão disponíveis:

- **Admin**: admin@sabercon.edu.br
- **Professor**: teacher@sabercon.edu.br  
- **Estudante**: student@sabercon.edu.br
- **Responsável**: guardian@sabercon.edu.br
- **Coordenador**: coordinator@sabercon.edu.br
- **Gerente**: institution.manager@sabercon.edu.br

**Senha para todos**: password123

## Configuração MySQL

Para que a importação MySQL funcione, configure as variáveis de ambiente:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=sabercon
MYSQL_PORT=3306
```

## Logs e Monitoramento

O script fornece logs detalhados de cada etapa:
- 🔄 Operações de reset
- 🏗️ Execução de migrations
- 🌱 Execução de seeds
- 🔗 Verificação de conexões
- 📊 Estatísticas de importação
- ✅ Confirmações de sucesso
- ⚠️ Avisos não críticos
- ❌ Erros que precisam atenção

## Tratamento de Erros

O script é resiliente e continua a execução mesmo com alguns erros:
- Falhas na conexão MySQL não impedem o resto do processo
- Erros em seeds individuais são registrados mas não param a execução
- Problemas na importação MySQL são reportados mas não críticos

## Arquivos Gerados

O script gera automaticamente:
- **Migrations**: `backend/src/database/migrations/TIMESTAMP_create_TABELA_table.js`
- **Seeds**: `backend/src/database/seeds/TIMESTAMP_TABELA_seed.js`

Todos os arquivos seguem as convenções do Knex.js e podem ser editados conforme necessário.