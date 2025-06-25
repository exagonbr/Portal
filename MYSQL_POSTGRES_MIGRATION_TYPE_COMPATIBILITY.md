# Migração MySQL → PostgreSQL: Melhorias de Compatibilidade de Tipos

## 📋 Problema Identificado

O usuário relatou que nem todos os dados estão sendo importados, especificamente mencionando a tabela "answer". Isso indica problemas de **compatibilidade de tipos** entre MySQL e PostgreSQL.

## 🔧 Melhorias Implementadas

### 1. **Função Aprimorada de Mapeamento de Tipos**

Criada a função `mapMySQLToPostgreSQLType()` que oferece mapeamento preciso:

```typescript
function mapMySQLToPostgreSQLType(mysqlColumn: any): { type: string; length?: number }
```

#### Mapeamentos Implementados:

| Tipo MySQL | Tipo PostgreSQL | Observações |
|------------|----------------|-------------|
| `tinyint(1)` | `boolean` | MySQL boolean → PostgreSQL boolean |
| `tinyint` | `smallint` | Inteiros pequenos |
| `int/mediumint` | `integer` | Inteiros padrão |
| `bigint` | `bigint` | Inteiros grandes |
| `varchar(n)` | `character varying(n)` | Strings com tamanho |
| `text/longtext` | `text` | Texto longo |
| `decimal(p,s)` | `numeric(p,s)` | Decimais com precisão |
| `float` | `real` | Ponto flutuante |
| `double` | `double precision` | Dupla precisão |
| `datetime` | `timestamp without time zone` | Data/hora |
| `date` | `date` | Apenas data |
| `json` | `jsonb` | JSON otimizado |
| `enum` | `text` + constraint | Enum com validação |
| `blob` | `bytea` | Dados binários |
| `bit(1)` | `boolean` | MySQL boolean → PostgreSQL boolean |

### 2. **Função de Limpeza de Dados**

Implementada `cleanDataForPostgreSQL()` que resolve problemas comuns:

#### Problemas Tratados:
- ✅ **Caracteres NULL (`\0`)**: Removidos automaticamente
- ✅ **Datas MySQL inválidas**: `0000-00-00` → `NULL`
- ✅ **JSON malformado**: Validação e escape automático
- ✅ **Texto muito longo**: Truncamento com aviso
- ✅ **Números inválidos**: `NaN`/`Infinity` → `NULL`
- ✅ **Normalização de colunas**: Nomes compatíveis com PostgreSQL

### 3. **Função de Conversão de Valores**

Criada `convertMySQLValueToPostgreSQL()` para conversões específicas:

```typescript
// Exemplos de conversão:
tinyint(1): 0/1 → false/true
datetime: "2023-12-25 10:30:00" → Date object
json: '{"key":"value"}' → JSON object
decimal: "123.45" → 123.45
```

### 4. **Criação Inteligente de Tabelas**

A função `createPostgreSQLTable()` foi completamente reescrita:

#### Recursos Avançados:
- 🏗️ **Auto-increment inteligente**: `increments()` ou `bigIncrements()`
- 🔑 **Chave primária automática**: Adiciona `id` se não existir
- 📅 **Timestamps automáticos**: `created_at` e `updated_at`
- 🎯 **Constraints ENUM/SET**: Validação automática
- 📏 **Precisão numérica**: Mantém `decimal(10,2)` exato
- 🛡️ **Tratamento de defaults**: `CURRENT_TIMESTAMP` → `now()`

### 5. **Logs Detalhados para Debug**

Implementados logs específicos para identificar problemas:

```
🏗️  Criando tabela PostgreSQL: answers
📋 Estrutura MySQL obtida: 8 colunas
✅ Tabela 'answers' criada com sucesso
🧹 Dados limpos: 1500 registros processados
📦 Lote 1: 1000 registros inseridos
⚠️  Registro problemático detectado: coluna 'content' contém \0
❌ Erro ao inserir registro individual: invalid input syntax for type boolean
```

## 🎯 Soluções Específicas para Tabela "Answer"

### Problemas Comuns e Soluções:

#### 1. **Tipo Boolean (tinyint(1))**
```sql
-- MySQL
is_correct TINYINT(1) NOT NULL DEFAULT 0

-- PostgreSQL (corrigido)
is_correct BOOLEAN NOT NULL DEFAULT false
```

#### 2. **Campos JSON**
```sql
-- MySQL
metadata JSON

-- PostgreSQL (melhorado)
metadata JSONB  -- Mais eficiente que JSON
```

#### 3. **Campos de Texto Longos**
```sql
-- MySQL
answer_content LONGTEXT

-- PostgreSQL
answer_content TEXT  -- Sem limite de tamanho
```

#### 4. **Datas com Valores Inválidos**
```sql
-- Problema MySQL
created_at = '0000-00-00 00:00:00'

-- Solução PostgreSQL
created_at = NULL (ou CURRENT_TIMESTAMP)
```

#### 5. **Campos ENUM**
```sql
-- MySQL
status ENUM('active', 'inactive', 'pending')

-- PostgreSQL (com constraint)
status TEXT CHECK (status IN ('active', 'inactive', 'pending'))
```

## 🔍 Script de Diagnóstico

Criado script `test-answer-migration.js` que analisa:

- ✅ Estrutura da tabela MySQL
- ✅ Tipos de dados problemáticos
- ✅ Dados de exemplo com problemas
- ✅ Comparação com PostgreSQL
- ✅ Sugestões de correção

### Como Usar:
```bash
cd backend
node -r dotenv/config scripts/test-answer-migration.js
```

## 🚀 Instruções para Resolver o Problema

### 1. **Executar Migração com DROP CASCADE**
- Use a opção "🔥 Recriar Tabelas (DROP CASCADE)"
- Isso garantirá estrutura 100% compatível

### 2. **Verificar Logs Durante Migração**
- Monitore logs em tempo real
- Identifique registros problemáticos
- Note conversões automáticas

### 3. **Validar Dados Após Migração**
```sql
-- Verificar contagem
SELECT COUNT(*) FROM answers;

-- Verificar tipos boolean
SELECT is_correct, COUNT(*) FROM answers GROUP BY is_correct;

-- Verificar campos JSON
SELECT metadata FROM answers WHERE metadata IS NOT NULL LIMIT 5;
```

## 📊 Exemplo de Migração da Tabela Answer

### Estrutura MySQL Original:
```sql
CREATE TABLE answer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  answer_text LONGTEXT,
  is_correct TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);
```

### Estrutura PostgreSQL Gerada:
```sql
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  answer_text TEXT,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

### Conversões Automáticas:
- `answer` → `answers` (pluralização)
- `INT AUTO_INCREMENT` → `SERIAL`
- `LONGTEXT` → `TEXT`
- `TINYINT(1)` → `BOOLEAN`
- `DATETIME` → `TIMESTAMP WITHOUT TIME ZONE`
- `JSON` → `JSONB`
- `CURRENT_TIMESTAMP` → `NOW()`

## 🛡️ Prevenção de Problemas

### Validações Implementadas:
1. **Verificação de tipos antes da criação**
2. **Limpeza de dados antes da inserção**
3. **Fallback para inserção individual em caso de erro**
4. **Logs detalhados para debug**
5. **Tratamento de caracteres especiais**

### Recomendações:
1. **Sempre usar DROP CASCADE** para tabelas problemáticas
2. **Verificar logs** durante a migração
3. **Validar dados** após migração
4. **Fazer backup** antes da migração
5. **Testar** em ambiente de desenvolvimento primeiro

## 🎉 Benefícios das Melhorias

- 🔧 **Compatibilidade Total**: Mapeamento preciso de todos os tipos
- 🧹 **Dados Limpos**: Remoção automática de dados problemáticos  
- 📊 **Logs Detalhados**: Identificação fácil de problemas
- 🛡️ **Robustez**: Tratamento de casos extremos
- ⚡ **Performance**: Uso de tipos otimizados (JSONB, etc.)
- 🎯 **Precisão**: Preservação de precisão numérica
- 🔄 **Automação**: Criação inteligente de estruturas

Com essas melhorias, a migração da tabela "answer" (e todas as outras) deve funcionar perfeitamente, com compatibilidade total entre MySQL e PostgreSQL. 