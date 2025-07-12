# 🚀 Migração Completa MySQL → PostgreSQL

Este documento descreve o processo completo de migração do banco de dados MySQL para PostgreSQL, incluindo estrutura, dados e configurações.

## 📋 Visão Geral

A migração foi projetada para ser **completa e segura**, seguindo estas etapas:

1. **🧹 Limpeza Completa**: Remove todas as tabelas existentes (DROP CASCADE)
2. **🏗️ Criação da Estrutura**: Cria schema PostgreSQL completo e otimizado
3. **🌱 Dados Básicos**: Insere roles, instituições e configurações essenciais
4. **📥 Migração de Dados**: Interface web para importar dados do MySQL

## ⚠️ ATENÇÃO IMPORTANTE

> **Esta migração irá APAGAR todos os dados existentes no PostgreSQL!**
> 
> Certifique-se de fazer backup antes de executar.

## 🎯 O que será criado

### 📊 Estrutura Principal

- **27 tabelas** com relacionamentos completos
- **Índices otimizados** para performance
- **Constraints e validações** adequadas
- **UUIDs** como chaves primárias
- **Timestamps automáticos** (created_at, updated_at)

### 🎭 Sistema de Permissões

- **4 roles predefinidos**: SYSTEM_ADMIN, INSTITUTION_MANAGER, TEACHER, STUDENT
- **30+ permissões granulares** por recurso e ação
- **Mapeamento automático** de roles MySQL → PostgreSQL

### 🏢 Estrutura Organizacional

- **Instituição padrão** para dados migrados
- **Escola padrão** para organização
- **Ciclos educacionais** completos (Infantil → Superior)
- **Coleção padrão** para conteúdo

## 🚀 Como Executar

### Opção 1: Script Automático (Recomendado)

#### Windows:
```bash
./run-complete-migration.bat
```

#### Linux/Mac:
```bash
chmod +x run-complete-migration.sh
./run-complete-migration.sh
```

### Opção 2: Manual

```bash
# 1. Entrar no diretório backend
cd backend

# 2. Instalar dependências
npm install

# 3. Executar migração
npm run migrate:latest

# 4. Executar seed
npm run seed:run
```

## 📊 Tabelas Criadas

### 🔐 Autenticação e Permissões
- `roles` - Papéis do sistema
- `permissions` - Permissões granulares
- `role_permissions` - Relacionamento role-permissão

### 🏢 Estrutura Organizacional
- `institutions` - Instituições
- `schools` - Escolas
- `education_cycles` - Ciclos educacionais
- `classes` - Turmas
- `user_classes` - Usuários em turmas

### 👥 Usuários
- `users` - Usuários do sistema (com campos OAuth)

### 📚 Conteúdo Educacional
- `collections` - Coleções de conteúdo
- `courses` - Cursos
- `modules` - Módulos do curso
- `content` - Conteúdo (vídeos, documentos, etc.)
- `books` - Livros e materiais
- `files` - Arquivos do sistema

### 🎯 Avaliações
- `quizzes` - Questionários/Provas
- `questions` - Perguntas
- `answers` - Respostas
- `quiz_submissions` - Submissões de quiz

### 📈 Progresso e Tracking
- `student_progress` - Progresso dos estudantes
- `activity_sessions` - Sessões de atividade
- `activity_logs` - Logs de atividades

### 💬 Comunicação
- `forum_threads` - Tópicos do fórum
- `forum_replies` - Respostas do fórum
- `notifications` - Notificações

### ⚙️ Configurações
- `system_settings` - Configurações do sistema
- `email_templates` - Templates de email

## 🔗 IDs Importantes

Após a migração, estes IDs estarão disponíveis:

```typescript
// Roles
SYSTEM_ADMIN: '35f57500-9a89-4318-bc9f-9acad28c2fb6'
INSTITUTION_MANAGER: '45f57500-9a89-4318-bc9f-9acad28c2fb7'
TEACHER: '55f57500-9a89-4318-bc9f-9acad28c2fb8'
STUDENT: '65f57500-9a89-4318-bc9f-9acad28c2fb9'

// Estrutura padrão
DEFAULT_INSTITUTION: '75f57500-9a89-4318-bc9f-9acad28c2fba'
DEFAULT_SCHOOL: '85f57500-9a89-4318-bc9f-9acad28c2fbb'
```

## 📥 Migração de Dados MySQL

Após executar a migração estrutural, use a interface web:

### 1. Acessar Interface
```
http://localhost:3000/admin/migration/mysql-postgres
```

### 2. Configurar Conexão MySQL
- Host, porta, usuário, senha
- Nome do banco de dados

### 3. Selecionar Tabelas
- Visualizar tabelas disponíveis
- Selecionar quais migrar
- Ver estatísticas e mapeamentos

### 4. Executar Migração
- Monitorar logs em tempo real
- Acompanhar progresso
- Verificar relatório final

## 🔧 Mapeamento Automático

### Tabelas
```
usuarios → users
instituicoes → institutions
escolas → schools
cursos → courses
arquivos → files
colecoes → collections
```

### Tipos de Dados
```
int → integer
bigint → bigint
varchar(n) → varchar(n)
text/longtext → text
datetime → timestamp
tinyint(1) → boolean
decimal(p,s) → decimal(p,s)
json → jsonb
enum → text + check constraint
```

### Roles
```
admin → SYSTEM_ADMIN
manager → INSTITUTION_MANAGER
professor → TEACHER
aluno → STUDENT
```

## ✅ Validação Pós-Migração

### 1. Verificar Estrutura
```sql
-- Contar tabelas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar roles
SELECT name, code FROM roles ORDER BY name;

-- Verificar usuários
SELECT COUNT(*) FROM users;
```

### 2. Verificar Dados
```sql
-- Estatísticas gerais
SELECT 
  'users' as table_name, COUNT(*) as total FROM users
UNION ALL
SELECT 
  'courses' as table_name, COUNT(*) as total FROM courses
UNION ALL
SELECT 
  'files' as table_name, COUNT(*) as total FROM files;
```

### 3. Testar Funcionalidades
- [ ] Login com usuário migrado
- [ ] Acesso a cursos
- [ ] Upload de arquivos
- [ ] Criação de conteúdo
- [ ] Sistema de permissões

## 🛠️ Solução de Problemas

### Erro de Conexão PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar configurações no .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=sua_senha
```

### Erro de Permissão
```sql
-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE portal_sabercon TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Rollback da Migração
```bash
# Reverter última migração
npm run migrate:rollback

# Ou limpar tudo e começar novamente
npm run migrate:rollback --all
npm run migrate:latest
npm run seed:run
```

## 📈 Performance e Otimizações

### Índices Criados
- **Chaves estrangeiras**: Índices automáticos
- **Campos de busca**: email, código, nome
- **Campos de filtro**: is_active, status, type
- **Campos de ordenação**: created_at, updated_at

### Configurações Otimizadas
- **Pool de conexões**: 2-10 conexões
- **Tipos adequados**: UUID, JSONB, TEXT
- **Constraints**: CHECK, UNIQUE, NOT NULL
- **Defaults inteligentes**: NOW(), gen_random_uuid()

## 📞 Suporte

### Logs de Debug
```bash
# Ver logs da migração
tail -f backend/logs/migration.log

# Ver logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

### Comandos Úteis
```bash
# Verificar status das migrações
npm run migrate:status

# Criar nova migração
npm run migrate:make nome_da_migracao

# Verificar configuração do Knex
npm run knex migrate:currentVersion
```

## 🎉 Resultado Final

Após a migração completa, você terá:

- ✅ **Sistema 100% funcional** com PostgreSQL
- ✅ **Dados preservados** do MySQL original
- ✅ **Estrutura otimizada** para performance
- ✅ **Relacionamentos íntegros** entre tabelas
- ✅ **Permissões configuradas** adequadamente
- ✅ **Auditoria completa** de dados migrados

**🎯 O sistema estará pronto para produção!**
