# 👥 Scripts de Criação de Usuários Padrão

Este diretório contém scripts para criar usuários padrão no sistema Portal Sabercon.

## 📋 Usuários Criados

Os scripts criam os seguintes usuários com suas respectivas credenciais:

| Email | Senha | Nome | Função |
|-------|-------|------|---------|
| `admin@sabercon.edu.br` | `password` | Administrador do Sistema | SYSTEM_ADMIN |
| `gestor@sabercon.edu.br` | `password` | Gestor Institucional | INSTITUTION_MANAGER |
| `coordenador@sabercon.edu.br` | `password` | Coordenador Acadêmico | COORDINATOR |
| `professor@sabercon.edu.br` | `password` | Professor do Sistema | TEACHER |
| `julia.c@ifsp.com` | `password` | Julia Costa Ferreira | STUDENT |
| `renato@gmail.com` | `password` | Renato Oliveira Silva | GUARDIAN |

## 🚀 Como Executar

### Opção 1: Script Bash (Recomendado)

Execute o script bash a partir do diretório raiz do projeto:

```bash
# Dar permissão de execução
chmod +x scripts/create-default-users.sh

# Executar
./scripts/create-default-users.sh
```

### Opção 2: Script TypeScript

```bash
cd backend
npx ts-node scripts/create-default-users.ts
```

### Opção 3: Script JavaScript

```bash
cd backend
node scripts/create-default-users.js
```

## 🔧 Pré-requisitos

- Node.js instalado
- Banco de dados PostgreSQL rodando
- Arquivo `.env` configurado com as credenciais do banco
- Dependências do projeto instaladas (`npm install`)

## 🏗️ O que os Scripts Fazem

1. **Conectam ao banco de dados** usando as configurações do knexfile
2. **Criam instituições padrão**:
   - Sabercon Educacional
   - Instituto Federal de São Paulo (IFSP)
3. **Criam roles padrão**:
   - SYSTEM_ADMIN
   - INSTITUTION_MANAGER
   - COORDINATOR
   - TEACHER
   - STUDENT
   - GUARDIAN
4. **Criam a tabela `user`** se ela não existir com estrutura completa:
   - Campos básicos (email, password, name, etc.)
   - Campos de roles (is_admin, is_teacher, etc.)
   - Campos de status (is_active, enabled, etc.)
   - Relacionamentos (role_id, institution_id)
   - Timestamps automáticos
5. **Detectam automaticamente** quais tabelas de usuários existem:
   - `users` (tabela principal)
   - `user` (tabela legada/criada automaticamente)
6. **Criam usuários** com senhas hasheadas usando bcrypt
7. **Associam usuários** às instituições e roles apropriadas

## 🗃️ Estrutura da Tabela `user` Criada

Se a tabela `user` não existir, o script criará com a seguinte estrutura:

```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campos básicos
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255),
  full_name VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  
  -- Campos de role (booleanos)
  is_admin BOOLEAN DEFAULT false,
  is_manager BOOLEAN DEFAULT false,
  is_coordinator BOOLEAN DEFAULT false,
  is_teacher BOOLEAN DEFAULT false,
  is_student BOOLEAN DEFAULT false,
  is_guardian BOOLEAN DEFAULT false,
  
  -- Campos de status
  is_active BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  account_expired BOOLEAN DEFAULT false,
  account_locked BOOLEAN DEFAULT false,
  password_expired BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  reset_password BOOLEAN DEFAULT false,
  
  -- Relacionamentos
  role_id UUID,
  institution_id UUID,
  
  -- Campos adicionais
  address VARCHAR(255),
  phone VARCHAR(255),
  usuario VARCHAR(255),
  endereco TEXT,
  telefone VARCHAR(255),
  unidade_ensino VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  date_created TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

## 🔍 Detecção Automática de Estrutura

Os scripts são inteligentes e se adaptam automaticamente à estrutura do banco:

- **Tabelas**: Detecta se existem `users`, `user`, `institution`, `roles`
- **Colunas**: Verifica quais colunas existem em cada tabela
- **Campos**: Mapeia automaticamente campos como:
  - `email` / `username`
  - `name` / `full_name`
  - `is_active` / `enabled`
  - `created_at` / `date_created`
  - `updated_at` / `last_updated`

## ⚠️ Comportamento Seguro

- **Não sobrescreve** usuários existentes
- **Verifica duplicatas** por email
- **Usa senhas hasheadas** com bcrypt (12 rounds)
- **Cria apenas** o que não existe
- **Relatórios detalhados** do que foi criado

## 🔐 Segurança

- Todas as senhas são hasheadas com bcrypt
- Senha padrão: `password` (deve ser alterada após primeiro login)
- Usuários criados com status ativo e sem bloqueios
- Campos de segurança configurados adequadamente

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
❌ Erro: Não foi possível conectar ao banco de dados
```
**Solução**: Verifique as configurações no arquivo `.env` e se o PostgreSQL está rodando.

### Tabelas Não Encontradas
```bash
❌ Nenhuma tabela de usuários encontrada!
```
**Solução**: Execute as migrations do projeto primeiro.

### Dependências Não Instaladas
```bash
❌ Erro ao instalar dependências
```
**Solução**: Execute `npm install` manualmente no diretório backend.

### Usuários Já Existem
```bash
⚠️ Usuário admin@sabercon.edu.br já existe na tabela users
```
**Comportamento**: Os scripts pulam usuários existentes automaticamente.

## 📝 Logs de Exemplo

```bash
🚀 CRIANDO USUÁRIOS PADRÃO DO SISTEMA

🔌 Conectando ao banco de dados...
✅ Conectado ao PostgreSQL!

🏢 Criando instituições padrão...
   ✅ Instituição Sabercon criada
   ✅ Instituição IFSP criada

🎭 Criando roles padrão...
   ✅ Role SYSTEM_ADMIN criada
   ✅ Role TEACHER criada
   ✅ Role STUDENT criada

🏗️ Criando tabela user...
   ✅ Tabela user criada com sucesso!

📋 Tabelas de usuários encontradas: users, user

👥 Criando usuários padrão...

🔄 Processando usuário: admin@sabercon.edu.br (Administrador do Sistema)
   ✅ Usuário admin@sabercon.edu.br criado na tabela users
   ✅ Usuário admin@sabercon.edu.br criado na tabela user

🎉 USUÁRIOS PADRÃO CRIADOS COM SUCESSO!
```

## 🔄 Executar Novamente

Os scripts podem ser executados múltiplas vezes sem problemas:
- Usuários existentes não são alterados
- Instituições e roles existentes são reutilizadas
- Apenas novos registros são criados

## 📞 Suporte

Se encontrar problemas, verifique:
1. Configurações do banco de dados no `.env`
2. Se o PostgreSQL está rodando
3. Se as migrations foram executadas
4. Se as dependências estão instaladas

Para mais detalhes, consulte os logs detalhados que os scripts fornecem. 