# Análise Completa: Migração MySQL → PostgreSQL

## 📋 Visão Geral da Migração

Esta documentação apresenta uma análise abrangente de todas as tabelas e mapeamentos que serão migrados do MySQL para PostgreSQL no sistema Portal.

## 🗺️ Mapeamento de Tabelas Identificadas

### Tabelas do Sistema de Usuários
```
usuarios/users          → users
instituicoes            → institutions  
roles                   → roles
permissions             → permissions
user_roles              → user_roles
user_permissions        → user_permissions
sessions                → sessions
push_subscriptions      → push_subscriptions
```

### Tabelas do Sistema Educacional
```
cursos                  → courses
turmas/classes          → classes
modulos                 → modules
aulas/lessons           → lessons
atividades              → assignments
assignment_submissions  → assignment_submissions
```

### Tabelas de Conteúdo
```
livros/books            → books
files                   → files
collections             → collections
content_collections     → content_collections
video_collections       → video_collections
videos                  → videos
```

### Tabelas de Avaliação
```
quizzes                 → quizzes
quiz_questions          → quiz_questions
quiz_answers            → quiz_answers
quiz_submissions        → quiz_submissions
quiz_results            → quiz_results
answer/answers          → answers
questions               → questions
```

### Tabelas de Comunicação
```
chats                   → chats
chat_messages           → chat_messages
forums                  → forums
forum_topics            → forum_topics
forum_posts             → forum_posts
announcements           → announcements
notifications           → notifications
```

### Tabelas de Análise e Logs
```
analytics_sessions      → analytics_sessions
attendance_records      → attendance_records
audit_logs              → audit_logs
aws_connection_logs     → aws_connection_logs
performance_metrics     → performance_metrics
```

### Tabelas de Configuração
```
aws_settings            → aws_settings
system_settings         → system_settings
```

## 🔧 Mapeamento de Tipos de Dados

### Tipos Numéricos
| MySQL | PostgreSQL | Observações |
|-------|------------|-------------|
| `TINYINT(1)` | `BOOLEAN` | ✅ Conversão automática 0/1 → false/true |
| `TINYINT` | `SMALLINT` | ✅ Inteiros pequenos (-128 a 127) |
| `SMALLINT` | `SMALLINT` | ✅ Compatível direto |
| `MEDIUMINT` | `INTEGER` | ✅ Inteiros médios |
| `INT` | `INTEGER` | ✅ Compatível direto |
| `BIGINT` | `BIGINT` | ✅ Compatível direto |
| `DECIMAL(p,s)` | `NUMERIC(p,s)` | ✅ Precisão mantida |
| `FLOAT` | `REAL` | ✅ Ponto flutuante simples |
| `DOUBLE` | `DOUBLE PRECISION` | ✅ Ponto flutuante duplo |

### Tipos de String
| MySQL | PostgreSQL | Observações |
|-------|------------|-------------|
| `CHAR(n)` | `CHARACTER(n)` | ✅ Tamanho fixo |
| `VARCHAR(n)` | `CHARACTER VARYING(n)` | ✅ Tamanho variável |
| `TINYTEXT` | `TEXT` | ✅ Texto pequeno |
| `TEXT` | `TEXT` | ✅ Compatível direto |
| `MEDIUMTEXT` | `TEXT` | ✅ Texto médio |
| `LONGTEXT` | `TEXT` | ✅ Texto longo |

### Tipos de Data/Hora
| MySQL | PostgreSQL | Observações |
|-------|------------|-------------|
| `DATE` | `DATE` | ✅ Compatível direto |
| `TIME` | `TIME WITHOUT TIME ZONE` | ✅ Hora sem timezone |
| `DATETIME` | `TIMESTAMP WITHOUT TIME ZONE` | ✅ Data/hora |
| `TIMESTAMP` | `TIMESTAMP WITHOUT TIME ZONE` | ✅ Timestamp |
| `YEAR` | `SMALLINT` | ✅ Ano como inteiro |

### Tipos Especiais
| MySQL | PostgreSQL | Observações |
|-------|------------|-------------|
| `JSON` | `JSONB` | ✅ JSON otimizado (mais eficiente) |
| `ENUM('a','b')` | `TEXT + CHECK CONSTRAINT` | ⚠️ Requer constraint adicional |
| `SET('a','b')` | `TEXT + CHECK CONSTRAINT` | ⚠️ Requer constraint adicional |
| `BLOB` | `BYTEA` | ✅ Dados binários |
| `LONGBLOB` | `BYTEA` | ✅ Dados binários grandes |

## 🔍 Problemas Identificados e Soluções

### 1. Campos Boolean (tinyint(1))
**Problema**: MySQL usa `TINYINT(1)` para boolean
**Solução**: Conversão automática para `BOOLEAN` no PostgreSQL

```sql
-- MySQL
is_active TINYINT(1) DEFAULT 0

-- PostgreSQL
is_active BOOLEAN DEFAULT false
```

### 2. Campos ENUM
**Problema**: PostgreSQL não tem ENUM da mesma forma
**Solução**: Usar TEXT com CHECK CONSTRAINT

```sql
-- MySQL
status ENUM('active', 'inactive', 'pending')

-- PostgreSQL
status TEXT CHECK (status IN ('active', 'inactive', 'pending'))
```

### 3. Campos JSON
**Problema**: PostgreSQL tem JSON e JSONB
**Solução**: Usar JSONB (mais eficiente)

```sql
-- MySQL
metadata JSON

-- PostgreSQL  
metadata JSONB
```

### 4. Auto Increment
**Problema**: Sintaxe diferente
**Solução**: Usar SERIAL ou IDENTITY

```sql
-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY

-- PostgreSQL
id SERIAL PRIMARY KEY
```

### 5. Datas Inválidas MySQL
**Problema**: MySQL permite '0000-00-00'
**Solução**: Conversão para NULL

```sql
-- Dados problemáticos
created_at = '0000-00-00 00:00:00'

-- Conversão
created_at = NULL
```

## 📊 Estimativas por Categoria

### Tabelas de Alto Volume (>10k registros)
- `users` - Usuários do sistema
- `analytics_sessions` - Sessões de analytics
- `chat_messages` - Mensagens de chat
- `audit_logs` - Logs de auditoria
- `files` - Arquivos do sistema

### Tabelas de Médio Volume (1k-10k registros)
- `assignments` - Atividades
- `quiz_submissions` - Submissões de quiz
- `notifications` - Notificações
- `forum_posts` - Posts do fórum

### Tabelas de Baixo Volume (<1k registros)
- `institutions` - Instituições
- `courses` - Cursos
- `books` - Livros
- `aws_settings` - Configurações AWS

## 🛠️ Estratégias de Migração Recomendadas

### 1. Para Tabelas Críticas (users, institutions)
- ✅ Usar **DROP CASCADE** para garantir consistência
- ✅ Validar dados após migração
- ✅ Fazer backup antes da migração

### 2. Para Tabelas de Alto Volume (analytics, logs)
- ✅ Migração em lotes de 1000 registros
- ✅ Monitorar performance
- ✅ Usar modo incremental se possível

### 3. Para Tabelas com ENUMs (status, types)
- ✅ Criar constraints CHECK após migração
- ✅ Validar valores permitidos
- ✅ Documentar mudanças

## 🎯 Casos Específicos por Tabela

### Tabela: `users/usuarios`
```sql
-- Campos problemáticos esperados:
is_active TINYINT(1)        → BOOLEAN
profile_data JSON           → JSONB  
created_at DATETIME         → TIMESTAMP WITHOUT TIME ZONE
```

### Tabela: `answers/answer`
```sql
-- Campos problemáticos esperados:
is_correct TINYINT(1)       → BOOLEAN
answer_content LONGTEXT     → TEXT
metadata JSON               → JSONB
created_at DATETIME         → TIMESTAMP WITHOUT TIME ZONE
```

### Tabela: `quiz_questions`
```sql
-- Campos problemáticos esperados:
question_type ENUM(...)     → TEXT + CHECK CONSTRAINT
difficulty ENUM(...)        → TEXT + CHECK CONSTRAINT
is_active TINYINT(1)        → BOOLEAN
```

### Tabela: `files`
```sql
-- Campos problemáticos esperados:
file_data LONGBLOB          → BYTEA
metadata JSON               → JSONB
is_public TINYINT(1)        → BOOLEAN
```

## 🔧 Melhorias Implementadas na API

### 1. Mapeamento Inteligente de Tipos
```typescript
function mapMySQLToPostgreSQLType(mysqlColumn): {
  // Detecta automaticamente:
  // - tinyint(1) → boolean
  // - JSON → JSONB
  // - ENUM → TEXT + constraint
  // - Datas inválidas → NULL
}
```

### 2. Limpeza Automática de Dados
```typescript
function cleanDataForPostgreSQL(data): {
  // Remove automaticamente:
  // - Caracteres NULL (\0)
  // - Datas inválidas MySQL
  // - JSON malformado
  // - Números inválidos
}
```

### 3. Criação Inteligente de Tabelas
```typescript
function createPostgreSQLTable(): {
  // Adiciona automaticamente:
  // - Chave primária se não existir
  // - Timestamps created_at/updated_at
  // - Constraints para ENUMs
  // - Índices comuns
}
```

## 📋 Checklist de Migração

### Antes da Migração
- [ ] Fazer backup completo do PostgreSQL
- [ ] Verificar espaço em disco disponível
- [ ] Confirmar credenciais de acesso
- [ ] Testar conectividade com ambos os bancos

### Durante a Migração
- [ ] Monitorar logs em tempo real
- [ ] Verificar uso de CPU/memória
- [ ] Acompanhar progresso por tabela
- [ ] Anotar erros ou avisos

### Após a Migração
- [ ] Validar contagem de registros
- [ ] Testar queries principais
- [ ] Verificar constraints e índices
- [ ] Executar testes de integridade

## 🚨 Tabelas que Requerem Atenção Especial

### 1. Tabelas com ENUMs
- `quiz_questions` (question_type, difficulty)
- `assignments` (status, type)
- `users` (role, status)
- `notifications` (type, status)

### 2. Tabelas com Dados Binários
- `files` (file_data)
- `books` (content_data)
- `user_avatars` (image_data)

### 3. Tabelas com JSON Complexo
- `quiz_submissions` (answers_data)
- `analytics_sessions` (session_data)
- `aws_settings` (configuration)

## 💡 Recomendações Finais

### Para Primeira Migração
1. **Usar DROP CASCADE** em todas as tabelas
2. **Monitorar logs** atentamente
3. **Validar dados críticos** após migração
4. **Fazer testes** em ambiente de desenvolvimento primeiro

### Para Migrações Incrementais
1. **Preservar dados existentes**
2. **Verificar duplicatas** por chave primária
3. **Usar migração em lotes** para tabelas grandes
4. **Documentar mudanças** realizadas

### Para Troubleshooting
1. **Logs detalhados** estão disponíveis na interface
2. **Script de análise** pode ser executado separadamente
3. **Fallback individual** para registros problemáticos
4. **Suporte a rollback** em caso de problemas críticos

## 🎉 Benefícios da Migração

- **🔧 Compatibilidade Total**: Todos os tipos MySQL mapeados corretamente
- **🛡️ Integridade de Dados**: Validação e limpeza automática
- **⚡ Performance**: Uso de tipos otimizados (JSONB, índices)
- **📊 Monitoramento**: Logs detalhados e progresso em tempo real
- **🔄 Flexibilidade**: Múltiplos modos de migração
- **🎯 Precisão**: Preservação de precisão numérica e estrutural

Com estas melhorias, a migração de **todas as tabelas** do MySQL para PostgreSQL deve ser realizada com sucesso, mantendo a integridade dos dados e garantindo compatibilidade total entre os sistemas. 