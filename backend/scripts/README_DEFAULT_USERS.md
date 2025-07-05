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
3. **Criam tabelas necessárias** se não existirem:
   - `roles` (funções/papéis)
   - `permissions` (permissões)
   - `role_permissions` (associação roles-permissões)
   - `user` (usuários)
4. **Criam 24 permissões padrão** organizadas por categoria:
   - **Sistema**: system.manage, system.view
   - **Instituições**: institution.manage, institution.view
   - **Usuários**: users.manage, users.view, users.create, users.edit, users.delete
   - **Escolas**: schools.manage, schools.view
   - **Turmas**: classes.manage, classes.view, classes.teach
   - **Currículo**: curriculum.manage, curriculum.view
   - **Notas**: grades.manage, grades.view
   - **Frequência**: attendance.manage, attendance.view
   - **Relatórios**: reports.view, reports.generate
   - **Materiais**: materials.manage, materials.view
   - **Comunicação**: communication.send, communication.view
5. **Criam 6 roles padrão**:
   - **SYSTEM_ADMIN**: Administrador do Sistema (**TODAS as permissões**)
   - **INSTITUTION_MANAGER**: Gestor Institucional
   - **COORDINATOR**: Coordenador Acadêmico
   - **TEACHER**: Professor
   - **STUDENT**: Estudante
   - **GUARDIAN**: Responsável
6. **Associam permissões específicas** a cada role automaticamente
7. **Detectam automaticamente** quais tabelas de usuários existem:
   - `users` (tabela principal)
   - `user` (tabela criada automaticamente)
8. **Criam usuários** com senhas hasheadas usando bcrypt
9. **Associam usuários** às instituições e roles apropriadas

## 🗃️ Estrutura da Tabela `user` Criada

Se a tabela `user` não existir, o script criará com a seguinte estrutura completa, incluindo suporte para OAuth do Google:

```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campos básicos
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255),
  full_name VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  
  -- Campos OAuth Google
  google_id VARCHAR(255) UNIQUE,
  google_email VARCHAR(255),
  google_name VARCHAR(255),
  google_picture VARCHAR(500),
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMP,
  is_google_verified BOOLEAN DEFAULT false,
  google_linked_at TIMESTAMP,
  
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

## 🔐 Campos OAuth do Google

A tabela `user` inclui campos completos para integração com OAuth do Google:

### Campos de Identificação
- **`google_id`**: ID único do usuário no Google (VARCHAR 255, UNIQUE)
- **`google_email`**: Email do Google associado à conta
- **`google_name`**: Nome completo do usuário no Google

### Campos de Perfil
- **`google_picture`**: URL da foto de perfil do Google (VARCHAR 500)

### Campos de Autenticação
- **`google_access_token`**: Token de acesso OAuth (TEXT)
- **`google_refresh_token`**: Token de renovação OAuth (TEXT)
- **`google_token_expires_at`**: Data de expiração do token

### Campos de Controle
- **`is_google_verified`**: Indica se a conta Google foi verificada (BOOLEAN, default false)
- **`google_linked_at`**: Data/hora quando a conta Google foi vinculada

### Índices para Performance
- Índice em `google_id` para busca rápida
- Índice em `google_email` para consultas por email
- Índice em `is_google_verified` para filtros de verificação

## 🔐 Permissões por Role

### SYSTEM_ADMIN (Administrador do Sistema)
- **TODAS as 24 permissões** disponíveis no sistema
- Acesso completo a todas as funcionalidades

### INSTITUTION_MANAGER (Gestor Institucional)
- `institution.view` - Visualizar instituições
- `users.manage`, `users.view`, `users.create`, `users.edit` - Gerenciar usuários
- `schools.manage`, `schools.view` - Gerenciar escolas
- `classes.manage`, `classes.view` - Gerenciar turmas
- `curriculum.manage`, `curriculum.view` - Gerenciar currículo
- `grades.view` - Visualizar notas
- `attendance.view` - Visualizar frequência
- `reports.view`, `reports.generate` - Relatórios
- `materials.manage`, `materials.view` - Gerenciar materiais
- `communication.send`, `communication.view` - Comunicação

### COORDINATOR (Coordenador Acadêmico)
- `classes.manage`, `classes.view` - Gerenciar turmas
- `curriculum.manage`, `curriculum.view` - Gerenciar currículo
- `grades.view` - Visualizar notas
- `attendance.view` - Visualizar frequência
- `reports.view` - Visualizar relatórios
- `materials.view` - Visualizar materiais
- `communication.send`, `communication.view` - Comunicação

### TEACHER (Professor)
- `classes.view`, `classes.teach` - Visualizar e lecionar turmas
- `curriculum.view` - Visualizar currículo
- `grades.manage`, `grades.view` - Gerenciar e visualizar notas
- `attendance.manage`, `attendance.view` - Gerenciar frequência
- `materials.manage`, `materials.view` - Gerenciar materiais
- `communication.send`, `communication.view` - Comunicação

### STUDENT (Estudante)
- `classes.view` - Visualizar turmas
- `curriculum.view` - Visualizar currículo
- `grades.view` - Visualizar próprias notas
- `attendance.view` - Visualizar própria frequência
- `materials.view` - Visualizar materiais
- `communication.view` - Visualizar comunicações

### GUARDIAN (Responsável)
- `grades.view` - Visualizar notas dos dependentes
- `attendance.view` - Visualizar frequência dos dependentes
- `communication.view` - Visualizar comunicações

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
- **Campos OAuth Google** inicializados como `null` (prontos para vinculação posterior)

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

🏗️ Verificando e criando tabelas necessárias...
   📋 Criando tabela roles...
   ✅ Tabela roles criada!
   🔐 Criando tabela permissions...
   ✅ Tabela permissions criada!
   🔗 Criando tabela role_permissions...
   ✅ Tabela role_permissions criada!
   👤 Criando tabela user...
   ✅ Tabela user criada!

🔐 Criando permissões padrão...
   ✅ Permissão system.manage criada
   ✅ Permissão users.manage criada
   ✅ Permissão classes.teach criada
   ... (24 permissões criadas)

🎭 Criando roles padrão...
   ✅ Role SYSTEM_ADMIN criada
   ✅ Role INSTITUTION_MANAGER criada
   ✅ Role TEACHER criada
   ✅ Role STUDENT criada
   ✅ Role GUARDIAN criada

🔗 Associando permissões às roles...
   ✅ Permissões associadas à role SYSTEM_ADMIN
   ✅ Permissões associadas à role INSTITUTION_MANAGER
   ✅ Permissões associadas à role TEACHER
   ✅ Permissões associadas à role STUDENT
   ✅ Permissões associadas à role GUARDIAN

📋 Tabelas de usuários encontradas: users, user

👥 Criando usuários padrão...

🔄 Processando usuário: admin@sabercon.edu.br (Administrador do Sistema)
   ✅ Usuário admin@sabercon.edu.br criado na tabela users
   ✅ Usuário admin@sabercon.edu.br criado na tabela user

🎉 USUÁRIOS PADRÃO CRIADOS COM SUCESSO!

📋 Resumo:
   • 6 usuários processados
   • 2 tabela(s) de usuários atualizadas
   • 2 instituições criadas/verificadas
   • 6 roles criadas/verificadas
   • 24 permissões criadas
   • Todas as associações role-permissão configuradas
```

## 🔄 Executar Novamente

Os scripts podem ser executados múltiplas vezes sem problemas:
- Usuários existentes não são alterados
- Instituições e roles existentes são reutilizadas
- Apenas novos registros são criados

## 🔗 Script de Exemplo OAuth Google

Incluído também um script de demonstração para trabalhar com OAuth do Google:

```bash
# Executar demonstração OAuth
cd backend
npx ts-node scripts/link-google-oauth-example.ts
```

### Funções Disponíveis:
- `linkGoogleOAuthToUser()` - Vincular conta Google a usuário existente
- `unlinkGoogleOAuthFromUser()` - Desvincular conta Google
- `listUsersWithGoogleOAuth()` - Listar usuários com Google vinculado

### Exemplo de Uso:
```typescript
import { linkGoogleOAuthToUser } from './link-google-oauth-example';

const googleData = {
  google_id: "123456789012345678901",
  google_email: "admin@sabercon.edu.br", 
  google_name: "Administrador do Sistema",
  google_picture: "https://lh3.googleusercontent.com/a/example",
  google_access_token: "ya29.a0AfH6SMC...",
  google_refresh_token: "1//04...",
  google_token_expires_at: new Date(Date.now() + 3600000)
};

await linkGoogleOAuthToUser(db, "admin@sabercon.edu.br", googleData);
```

## 📞 Suporte

Se encontrar problemas, verifique:
1. Configurações do banco de dados no `.env`
2. Se o PostgreSQL está rodando
3. Se as migrations foram executadas
4. Se as dependências estão instaladas

Para mais detalhes, consulte os logs detalhados que os scripts fornecem. 