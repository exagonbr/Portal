# Migração MySQL → PostgreSQL

Este guia descreve como migrar completamente um banco de dados MySQL para PostgreSQL, preservando estruturas, dados e relacionamentos, usando apenas Node.js (sem necessidade de clientes MySQL/PostgreSQL).

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Processo de Migração](#processo-de-migração)
3. [Estrutura de Migração](#estrutura-de-migração)
4. [Mapeamento de Tipos](#mapeamento-de-tipos)
5. [Customização](#customização)
6. [Solução de Problemas](#solução-de-problemas)
7. [Pós-migração](#pós-migração)

## Pré-requisitos

Antes de iniciar a migração, certifique-se de ter:

- Node.js (v14+) e npm instalados
- Acesso aos bancos de dados MySQL e PostgreSQL
- Permissões de administrador em ambos os bancos

**Nota:** Não é necessário ter os clientes MySQL ou PostgreSQL instalados, pois toda a comunicação é feita através dos drivers Node.js.

## Processo de Migração

### 1. Configuração Inicial

Clone o repositório e instale as dependências:

```bash
git clone <repositório>
cd Portal/backend
npm install
```

### 2. Verificar Configurações

Você pode configurar a migração de duas maneiras:

- **Arquivo .env**: Crie ou edite o arquivo `.env` na raiz do projeto
- **Prompt interativo**: O script irá solicitar as informações necessárias durante a execução

Exemplo de configuração no arquivo `.env`:

```
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=sabercon

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=portal_sabercon
DB_SSL=false
```

### 3. Executar a Migração

Execute o script de migração:

```bash
cd backend
chmod +x scripts/run-mysql-to-postgres-migration.sh
./scripts/run-mysql-to-postgres-migration.sh
```

O script irá:

1. Verificar as dependências necessárias (Node.js e npm)
2. Instalar pacotes Node.js necessários (mysql2, knex, pg) se não estiverem presentes
3. Solicitar confirmação antes de prosseguir
4. Criar um arquivo de configuração temporário (se necessário)
5. Executar a migração completa
6. Criar um backup JSON do banco MySQL
7. Relatar o resultado da migração

## Estrutura de Migração

A migração segue estas etapas:

1. **Preparação**: Verifica dependências e configurações
2. **Conexão**: Estabelece conexões com MySQL e PostgreSQL via drivers Node.js
3. **Análise**: Identifica tabelas e estruturas no MySQL
4. **Transformação**: Converte esquemas MySQL para equivalentes PostgreSQL
5. **Migração de Tabelas**: 
   - Cria tabelas no PostgreSQL
   - Adiciona índices e restrições
   - Migra dados com transformações necessárias
6. **Pós-processamento**: 
   - Cria funções e triggers específicos do PostgreSQL
   - Otimiza o banco com índices
   - Cria backup JSON do MySQL original

## Mapeamento de Tipos

O script utiliza o seguinte mapeamento de tipos MySQL → PostgreSQL:

| MySQL               | PostgreSQL              |
|---------------------|-------------------------|
| int                 | integer                 |
| tinyint(1)          | boolean                 |
| varchar             | varchar                 |
| text, longtext      | text                    |
| datetime, timestamp | timestamp with time zone|
| date                | date                    |
| decimal             | decimal                 |
| double              | double precision        |
| float               | real                    |
| json                | jsonb                   |
| enum                | text + check constraint |
| blob                | bytea                   |

## Customização

Você pode personalizar a migração editando os seguintes arquivos:

- `scripts/migrate-mysql-to-postgres-full.ts`: Script principal de migração
- `scripts/run-mysql-to-postgres-migration.sh`: Script shell para execução

### Personalização de Mapeamento de Tabelas

Para personalizar o mapeamento de nomes de tabelas, edite a função `normalizeTableName` no arquivo `migrate-mysql-to-postgres-full.ts`:

```typescript
function normalizeTableName(name) {
  const mapping = {
    'tabela_mysql': 'tabela_postgres',
    // Adicione mais mapeamentos conforme necessário
  };
  
  return mapping[name.toLowerCase()] || name.toLowerCase();
}
```

### Personalização de Mapeamento de Colunas

Para personalizar o mapeamento de nomes de colunas, edite a função `normalizeColumnName`:

```typescript
function normalizeColumnName(name) {
  const mapping = {
    'coluna_mysql': 'coluna_postgres',
    // Adicione mais mapeamentos conforme necessário
  };
  
  return mapping[name.toLowerCase()] || name.toLowerCase();
}
```

## Solução de Problemas

### Erros Comuns

#### Erro de Conexão MySQL

```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user...
```

**Solução**: Verifique as credenciais MySQL no arquivo `.env` ou forneça credenciais corretas quando solicitado.

#### Erro de Conexão PostgreSQL

```
Error: ECONNREFUSED
```

**Solução**: Verifique se o servidor PostgreSQL está em execução e acessível com as configurações fornecidas.

#### Erro de Migração de Dados

```
Error: duplicate key value violates unique constraint...
```

**Solução**: Dados duplicados foram encontrados. O script tentará ignorar duplicatas, mas você pode precisar limpar os dados no PostgreSQL antes de tentar novamente.

#### Erro de Pacotes Node.js

```
Error: Cannot find module 'mysql2'
```

**Solução**: O script tentará instalar os pacotes necessários automaticamente, mas se falhar, você pode instalá-los manualmente:

```bash
npm install mysql2 knex pg
```

## Pós-migração

Após a migração bem-sucedida:

1. **Verificação**: Execute consultas em ambos os bancos para comparar os dados
2. **Ajustes**: Faça ajustes finos nas tabelas PostgreSQL, se necessário
3. **Índices**: Verifique se todos os índices foram criados corretamente
4. **Aplicação**: Teste sua aplicação com o novo banco PostgreSQL

### Comandos Úteis para Verificação

Consultar o backup JSON gerado:

```javascript
const fs = require('fs');
const backupData = JSON.parse(fs.readFileSync('./database/dumps/mysql_backup_XXXX-XX-XX.json'));
console.log(Object.keys(backupData)); // Lista as tabelas
console.log(backupData['nome_tabela'].length); // Mostra número de registros
```

---

Se precisar de assistência adicional, entre em contato com a equipe de desenvolvimento. 