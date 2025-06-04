# 🚀 Sistema Database:Fresh - Portal Sabercon

## Visão Geral

O comando `npm run database:fresh` é um sistema unificado que permite recriar completamente o banco de dados PostgreSQL com:

1. ✅ **Migrations consolidadas** - Todas as migrations unificadas em uma única
2. ✅ **Permissões atualizadas** - Sistema de roles e permissions mais robusto  
3. ✅ **Migração MySQL → PostgreSQL** - Importação automática de dados legados
4. ✅ **Seeds modernos** - Dados iniciais atualizados

## 📋 Pré-requisitos

### PostgreSQL
- PostgreSQL 13+ instalado e rodando
- Database `portal_sabercon` criado
- Usuário com permissões de criação de tabelas

### MySQL (Opcional - apenas se quiser importar dados legados)
- MySQL 5.7+ ou 8.0+
- Database legado acessível
- Estrutura de tabelas compatível

### Dependências Node.js
```bash
cd backend
npm install
```

## ⚙️ Configuração

### 1. Arquivo de Ambiente

Crie o arquivo `backend/.env` baseado nas configurações abaixo:

```env
# PostgreSQL (Banco atual)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# MySQL (Banco legado - apenas se quiser importar)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=portal_sabercon_legacy
MYSQL_SSL=false

# Configuração do Database Fresh
MYSQL_IMPORT_ENABLED=false  # Mude para 'true' para importar do MySQL

# Ambiente
NODE_ENV=development
```

### 2. Estrutura MySQL Esperada (Se usar importação)

O sistema espera as seguintes tabelas no MySQL:

- `instituicoes` → será migrada para `institutions`
- `usuarios` → será migrada para `users`
- `escolas` → será migrada para `schools` 
- `cursos` → será migrada para `courses`

**Colunas esperadas:**

```sql
-- instituicoes
CREATE TABLE instituicoes (
  id INT PRIMARY KEY,
  nome VARCHAR(255),
  codigo VARCHAR(100),
  descricao TEXT,
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  cep VARCHAR(20),
  telefone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- usuarios  
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  nome VARCHAR(255),
  cpf VARCHAR(20),
  telefone VARCHAR(50),
  data_nascimento DATE,
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  cep VARCHAR(20),
  unidade_ensino VARCHAR(255),
  tipo_usuario VARCHAR(50),
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🎯 Execução

### Execução Básica (sem importação MySQL)

```bash
# Do diretório raiz do projeto
npm run database:fresh

# Ou do diretório backend
cd backend
npm run database:fresh
```

### Execução com Importação MySQL

1. Configure as variáveis MySQL no `.env`
2. Habilite a importação:
   ```env
   MYSQL_IMPORT_ENABLED=true
   ```
3. Execute:
   ```bash
   npm run database:fresh
   ```

## 🔄 Processo Detalhado

O comando executa as seguintes fases:

### 1️⃣ **Preparação do Ambiente**
- Verifica conexão PostgreSQL
- Valida configurações

### 2️⃣ **Rollback Completo**
- Remove todas as migrations existentes
- Limpa estrutura atual

### 3️⃣ **Migration Consolidada**
- Executa migration unificada `20250201000001_consolidated_legacy_schema.ts`
- Cria todas as 26 tabelas do sistema
- Adiciona índices de performance
- Cria views e funções utilitárias

### 4️⃣ **Seeds de Dados**
- Insere roles e permissões atualizadas
- Cria usuários de exemplo
- Adiciona dados básicos

### 5️⃣ **Importação MySQL** (se habilitada)
- Conecta ao MySQL legado
- Migra instituições, usuários, escolas e cursos
- Mapeia tipos de usuário para roles modernos
- Mantém compatibilidade com dados legados

### 6️⃣ **Atualização de Permissões**
- Sincroniza roles com permissões mais recentes
- Corrige usuários sem roles
- Atualiza contadores

### 7️⃣ **Verificação Final**
- Valida integridade dos dados
- Exibe estatísticas finais

## 👥 Usuários Criados

O sistema cria os seguintes usuários de teste:

| Email | Role | Senha | Descrição |
|-------|------|-------|-----------|
| `admin@portal.com` | SYSTEM_ADMIN | `admin123` | Administrador completo |
| `gestor@sabercon.edu.br` | INSTITUTION_MANAGER | `admin123` | Gestor institucional |
| `coordenador@sabercon.edu.br` | ACADEMIC_COORDINATOR | `admin123` | Coordenador acadêmico |
| `professor@sabercon.edu.br` | TEACHER | `admin123` | Professor |
| `julia.costa@sabercon.edu.br` | STUDENT | `admin123` | Aluna |
| `responsavel@sabercon.edu.br` | GUARDIAN | `admin123` | Responsável |

## 🗂️ Sistema de Permissões

### Roles Disponíveis:

1. **SYSTEM_ADMIN** - Acesso completo ao sistema
2. **INSTITUTION_MANAGER** - Gestão de escola/instituição
3. **ACADEMIC_COORDINATOR** - Coordenação acadêmica
4. **TEACHER** - Professor com acesso a turmas
5. **STUDENT** - Aluno com acesso ao aprendizado
6. **GUARDIAN** - Responsável com acesso aos filhos

### Permissões por Categoria:

- **System Management**: Gestão completa do sistema
- **Institution Management**: Gestão de escolas e usuários
- **Academic Management**: Coordenação acadêmica
- **Teaching**: Ensino e avaliação
- **Student Access**: Acesso do estudante
- **Guardian Access**: Acesso do responsável

## 🛠️ Solução de Problemas

### Erro de Conexão PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se database existe
psql -U postgres -c "\l"
```

### Erro de Conexão MySQL
```bash
# Testar conexão
mysql -h localhost -u root -p

# Verificar se database existe
mysql -u root -p -e "SHOW DATABASES;"
```

### Erro de Permissões
```bash
# Dar permissões ao usuário PostgreSQL
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE portal_sabercon TO postgres;
```

### Resetar Completamente
```bash
# Parar aplicação
# Dropar database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS portal_sabercon;"
sudo -u postgres psql -c "CREATE DATABASE portal_sabercon;"

# Executar fresh novamente
npm run database:fresh
```

## 📁 Estrutura de Arquivos

```
backend/
├── migrations/
│   └── 20250201000001_consolidated_legacy_schema.ts  # Migration unificada
├── seeds/
│   └── 001_complete_initial_data.ts                 # Seeds atualizados
├── scripts/
│   ├── database-fresh.ts                           # Script principal
│   ├── mysql-to-postgres-migrator.ts              # Migrador MySQL
│   └── update-user-permissions.ts                 # Atualizador de permissões
└── knexfile.ts                                     # Configuração Knex
```

## 🚨 Avisos Importantes

⚠️ **ATENÇÃO**: Este comando remove TODOS os dados existentes no PostgreSQL

⚠️ **BACKUP**: Sempre faça backup antes de executar em produção

⚠️ **TESTE**: Teste em ambiente de desenvolvimento primeiro

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs detalhados durante a execução
2. Confirme todas as configurações no `.env`
3. Teste conexões individualmente
4. Verifique permissões do usuário do banco

## 🎉 Resultado Final

Após execução bem-sucedida, você terá:

- ✅ PostgreSQL com schema completo e atualizado
- ✅ Sistema de roles e permissões moderno
- ✅ Dados básicos para iniciar desenvolvimento
- ✅ Dados legados importados (se configurado)
- ✅ Performance otimizada com índices
- ✅ Views e funções utilitárias 