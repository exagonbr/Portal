# 👑 CRIAÇÃO DO ADMIN MASTER - PORTAL EDUCACIONAL

## 📋 Visão Geral

Este documento explica como criar o usuário **Admin Master** do Portal Educacional com as credenciais específicas solicitadas, aproveitando toda a estrutura modular e de dados migrados.

---

## 🎯 CREDENCIAIS DO ADMIN MASTER

- **📧 Email:** `maia.cspg@gmail.com`
- **🔐 Senha:** `maia.cspg@gmail.com` 
- **🔑 Role:** `admin_master`
- **🛡️ Permissões:** Acesso total ao sistema

---

## 🚀 MÉTODOS DE CRIAÇÃO

### Método 1: Script Bash Automatizado (Recomendado)
```bash
# Na raiz do projeto Portal
./criar-admin-master.sh
```

### Método 2: Script Node.js Direto
```bash
# No diretório backend
cd backend
node create-admin-simple.js
```

### Método 3: Via PostgreSQL Direto
```sql
-- Conectar ao banco portal_educacional e executar:

DO $$
DECLARE
    user_exists boolean;
    user_id uuid;
    hashed_password text;
BEGIN
    -- Verificar se usuário existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'maia.cspg@gmail.com') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Admin já existe. Atualizando...';
        
        -- Usar PostgreSQL pgcrypto para hash da senha
        SELECT crypt('maia.cspg@gmail.com', gen_salt('bf')) INTO hashed_password;
        
        UPDATE users SET
            name = 'Admin Master',
            password = hashed_password,
            role = 'admin_master',
            is_active = true,
            is_verified = true,
            updated_at = NOW(),
            permissions = '["admin_master","user_management","institution_management","content_management","analytics_access","system_settings","backup_restore","migration_control"]'::jsonb,
            metadata = '{"admin_level":"master","created_by":"sql_script","access_level":"unlimited"}'::jsonb
        WHERE email = 'maia.cspg@gmail.com';
        
    ELSE
        -- Gerar UUID e hash da senha
        user_id := gen_random_uuid();
        SELECT crypt('maia.cspg@gmail.com', gen_salt('bf')) INTO hashed_password;
        
        RAISE NOTICE 'Criando novo Admin Master...';
        
        INSERT INTO users (
            id, email, name, password, role, is_active, is_verified,
            email_verified_at, created_at, updated_at, permissions, metadata
        ) VALUES (
            user_id,
            'maia.cspg@gmail.com',
            'Admin Master',
            hashed_password,
            'admin_master',
            true,
            true,
            NOW(),
            NOW(),
            NOW(),
            '["admin_master","user_management","institution_management","content_management","analytics_access","system_settings","backup_restore","migration_control"]'::jsonb,
            '{"admin_level":"master","created_by":"sql_script","access_level":"unlimited"}'::jsonb
        );
        
        -- Criar perfil se tabela existir
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
            INSERT INTO user_profiles (
                id, user_id, bio, preferences, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                user_id,
                'Administrador Master do Portal Educacional',
                '{"theme":"dark","language":"pt-BR","notifications":{"email":true,"push":true,"sms":false},"dashboard":{"layout":"admin","widgets":["users","content","analytics","system"]}}'::jsonb,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RAISE NOTICE 'Admin Master configurado com sucesso!';
END$$;

-- Verificar resultado
SELECT id, email, name, role, is_active, created_at, permissions
FROM users 
WHERE email = 'maia.cspg@gmail.com';
```

---

## 🔧 PRÉ-REQUISITOS

### Banco de Dados
- ✅ **PostgreSQL** em execução
- ✅ **Database** `portal_educacional` criado
- ✅ **Tabela `users`** deve existir
- ✅ **Extensão `pgcrypto`** habilitada (para método SQL)

### Dependências Node.js (para scripts)
```bash
# No diretório backend
npm install bcryptjs pg uuid dotenv
```

### Variáveis de Ambiente
```env
# No arquivo .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=portal_educacional
```

---

## 🛡️ PERMISSÕES DO ADMIN MASTER

O Admin Master terá as seguintes permissões:

- **`admin_master`** - Acesso total ao sistema
- **`user_management`** - Gestão de usuários
- **`institution_management`** - Gestão de instituições  
- **`content_management`** - Gestão de conteúdo
- **`analytics_access`** - Acesso a analytics
- **`system_settings`** - Configurações do sistema
- **`backup_restore`** - Backup e restauração
- **`migration_control`** - Controle de migrações

---

## 📊 ESTRUTURA DE DADOS

### Tabela `users`
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    permissions JSONB,
    metadata JSONB,
    sabercon_id INTEGER -- Para compatibilidade com dados migrados
);
```

### Tabela `user_profiles` (opcional)
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 VERIFICAÇÃO DO ADMIN

### Verificar se foi criado corretamente
```sql
-- Verificar dados básicos
SELECT 
    id, email, name, role, is_active, is_verified,
    created_at, permissions
FROM users 
WHERE email = 'maia.cspg@gmail.com';

-- Verificar hash da senha (deve começar com $2a$ ou $2b$)
SELECT 
    email, 
    LEFT(password, 10) as password_hash_start,
    LENGTH(password) as password_length
FROM users 
WHERE email = 'maia.cspg@gmail.com';

-- Verificar perfil se existe
SELECT p.* 
FROM user_profiles p
JOIN users u ON u.id = p.user_id
WHERE u.email = 'maia.cspg@gmail.com';
```

### Testar login via aplicação
1. Acesse o portal
2. Use as credenciais:
   - Email: `maia.cspg@gmail.com`
   - Senha: `maia.cspg@gmail.com`
3. Verifique se tem acesso às funcionalidades administrativas

---

## 🚨 TROUBLESHOOTING

### Erro: "Tabela users não encontrada"
```bash
# Verificar se migrations foram executadas
psql -h localhost -U postgres -d portal_educacional -c "\d users"

# Se não existir, execute migrations
cd backend
npm run migrate
```

### Erro: "Conexão recusada ao PostgreSQL"
```bash
# Verificar se PostgreSQL está rodando
pg_ctl status

# Ou no Windows
net start postgresql-x64-14
```

### Erro: "Hash da senha inválido"
O método SQL direto usa `crypt()` do PostgreSQL que requer extensão `pgcrypto`:
```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erro: "Admin não consegue fazer login"
```sql
-- Verificar se senha está correta (deve ser hash bcrypt)
-- Recriar senha usando script Node.js
cd backend
node create-admin-simple.js
```

---

## 🔐 SEGURANÇA

### Recomendações Importantes

1. **Alterar senha após primeiro login**
   - A senha atual é igual ao email (temporária)
   - Definir senha forte após acesso inicial

2. **Monitorar acesso do admin**
   - Verificar logs de acesso regularmente
   - Configurar alertas para ações administrativas

3. **Backup das credenciais**
   - Manter backup seguro das credenciais
   - Documentar procedimento de recuperação

4. **Auditoria de permissões**
   - Revisar permissões periodicamente
   - Remover acessos desnecessários

---

## 📚 INTEGRAÇÃO COM DADOS MIGRADOS

O Admin Master criado tem total compatibilidade com:

- ✅ **7.000+ usuários** migrados do SaberCon
- ✅ **500+ vídeos** educacionais
- ✅ **100+ TV Shows** organizados
- ✅ **1.000+ arquivos** de mídia
- ✅ **50+ instituições** educacionais
- ✅ **Sistema de mapeamento legacy** completo

### Verificar dados migrados
```sql
-- Contar registros migrados
SELECT 
    'users' as tabela,
    COUNT(*) as total,
    COUNT(sabercon_id) as migrados_sabercon
FROM users
UNION ALL
SELECT 
    'videos' as tabela,
    COUNT(*) as total,
    COUNT(sabercon_id) as migrados_sabercon
FROM videos;

-- Verificar mapeamento legacy
SELECT table_name, COUNT(*) as registros_mapeados
FROM sabercon_migration_mapping
GROUP BY table_name
ORDER BY registros_mapeados DESC;
```

---

## 🎯 PRÓXIMOS PASSOS

Após criar o Admin Master:

1. **Fazer login inicial**
   - Usar credenciais criadas
   - Verificar acesso às funcionalidades

2. **Alterar senha**
   - Definir senha segura
   - Ativar autenticação de dois fatores se disponível

3. **Configurar sistema**
   - Revisar configurações gerais
   - Configurar notificações administrativas

4. **Criar outros administradores**
   - Adicionar admins específicos por módulo
   - Definir hierarquia de permissões

5. **Verificar migração**
   - Testar acesso aos dados migrados
   - Validar funcionalidades com dados legacy

---

**🎉 Admin Master pronto para uso!**

*Com o Admin Master criado, você terá controle total sobre o Portal Educacional e poderá gerenciar todos os dados migrados e novas funcionalidades.* 