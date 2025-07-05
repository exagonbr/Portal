# 🎯 Sistema de Roles e Permissões - Portal Sabercon

## 📋 Visão Geral

Este documento descreve o sistema de roles e permissões atualizado do Portal Sabercon, com **SYSTEM_ADMIN** tendo acesso completo de administrador conforme especificado.

## 🏗️ Estrutura de Roles

### Roles Implementadas

| Role | Descrição | Dashboard | Acesso |
|------|-----------|-----------|---------|
| `SYSTEM_ADMIN` | **Administrador do Sistema** | `/dashboard/system-admin` | **ACESSO COMPLETO** |
| `INSTITUTION_MANAGER` | Gestor Institucional | `/dashboard/institution-manager` | Gestão institucional |
| `ACADEMIC_COORDINATOR` | Coordenador Acadêmico | `/dashboard/coordinator` | Coordenação pedagógica |
| `TEACHER` | Professor | `/dashboard/teacher` | Ensino e avaliação |
| `STUDENT` | Aluno | `/dashboard/student` | Aprendizagem |
| `GUARDIAN` | Responsável | `/dashboard/guardian` | Acompanhamento |

### 🔐 Permissões por Role

#### SYSTEM_ADMIN - Acesso Completo
```typescript
✅ TODAS as permissões do sistema
✅ Supervisionar qualquer funcionalidade
✅ Acessar todos os dashboards
✅ Gerenciar sistema, segurança e instituições
✅ Suporte técnico e debug
```

#### INSTITUTION_MANAGER - Gestão Institucional
```typescript
✅ Gerenciar escolas e usuários da instituição
✅ Coordenar turmas e horários
✅ Analytics institucionais
✅ Comunicação com estudantes e responsáveis
```

#### ACADEMIC_COORDINATOR - Coordenação Pedagógica
```typescript
✅ Gerenciar ciclos educacionais e currículo
✅ Monitorar professores
✅ Analytics acadêmicas
✅ Coordenar departamentos
```

#### TEACHER - Ensino
```typescript
✅ Gerenciar frequência e notas
✅ Criar planos de aula
✅ Upload de recursos educacionais
✅ Comunicar com alunos e responsáveis
```

#### STUDENT - Aprendizagem
```typescript
✅ Visualizar cronograma e notas próprias
✅ Acessar materiais educacionais
✅ Submeter atividades
✅ Comunicar com professores
```

#### GUARDIAN - Acompanhamento
```typescript
✅ Visualizar informações dos filhos
✅ Acompanhar notas e frequência
✅ Receber comunicados
✅ Comunicar com a escola
```

## 🚀 Executando os Seeds

### Comando Rápido
```bash
cd backend
npm run seed:roles
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run seed:roles` | Executa seeds atualizados |
| `npm run seed:fresh` | Reset completo + seeds |
| `npm run db:setup` | Migrate + seed inicial |
| `npm run roles:update` | Atualiza sistema de roles |

### Execução Manual
```bash
# 1. Navegue para o backend
cd backend

# 2. Execute migrations
npm run migrate

# 3. Execute seeds
npm run seed

# 4. Ou execute o script completo
ts-node scripts/run-seeds.ts
```

## 👥 Usuários de Teste Criados

### Credenciais Padrão
**Senha para todos:** `password123`

| Usuário | Email | Role | Instituição |
|---------|-------|------|-------------|
| 👑 **Admin Principal** | `admin@portal.com` | `SYSTEM_ADMIN` | Sabercon |
| 🏢 Marina Silva | `gestor@sabercon.edu.br` | `INSTITUTION_MANAGER` | Sabercon |
| 📚 Luciana Lima | `coordenador@sabercon.edu.br` | `ACADEMIC_COORDINATOR` | Sabercon |
| 👨‍🏫 Ricardo Santos | `professor@sabercon.edu.br` | `TEACHER` | Sabercon |
| 🎓 Julia Costa | `julia.costa@sabercon.edu.br` | `STUDENT` | Sabercon |
| 👨‍👩‍👧‍👦 Renato Oliveira | `responsavel@sabercon.edu.br` | `GUARDIAN` | Sabercon |
| 🏛️ Carlos Eduardo | `admin@ifsp.edu.br` | `SYSTEM_ADMIN` | IFSP |
| 👨‍🏫 Carlos Alberto | `prof.carlos@ifsp.edu.br` | `TEACHER` | IFSP |

### Login de Teste
```bash
# SYSTEM_ADMIN Principal
Email: admin@portal.com
Senha: password123
Dashboard: /dashboard/system-admin
```

## 📊 Dados Criados

### Instituições
- **Sabercon Educação** - Instituição principal
- **Instituto Federal de São Paulo (IFSP)** - Instituição de exemplo

### Escolas
- **Escola Central Sabercon** - São Paulo/SP
- **Campus São Paulo - IFSP** - São Paulo/SP

### Ciclos Educacionais
- Ensino Fundamental I (1º ao 5º ano)
- Ensino Fundamental II (6º ao 9º ano)
- Ensino Médio (1º ao 3º ano)
- Técnico em Informática (IFSP)

### Turmas
- 5º Ano A (com aluna Julia matriculada)
- 8º Ano B
- TI 1º Período (IFSP)

## 🔧 Estrutura do Banco

### Tabelas Principais
```sql
institutions    -- Instituições de ensino
roles          -- Roles do sistema
permissions    -- Permissões granulares
role_permissions -- Associação roles-permissions
users          -- Usuários do sistema
schools        -- Escolas/campi
education_cycles -- Ciclos educacionais
classes        -- Turmas
user_classes   -- Matrículas de alunos
```

### Permissões Implementadas
```sql
-- System Management
system.manage
institutions.manage
users.manage.global
analytics.view.system
security.manage

-- Institution Management
schools.manage
users.manage.institution
classes.manage
schedules.manage
analytics.view.institution

-- Academic Management
cycles.manage
curriculum.manage
teachers.monitor
analytics.view.academic
departments.coordinate

-- Teaching
attendance.manage
grades.manage
lessons.manage
resources.upload
students.communicate
guardians.communicate

-- Student Access
schedule.view.own
grades.view.own
materials.access
assignments.submit
progress.track.own
teachers.message

-- Guardian Access
children.view.info
children.view.grades
children.view.attendance
announcements.receive
school.communicate

-- Common
portal.access
forum.access
chat.access
profile.manage
```

## 🛠️ Desenvolvimento

### Adicionando Nova Role
1. Atualizar enum `UserRole` em `src/entities/Role.ts`
2. Definir permissões no seed `seeds/001_complete_initial_data.ts`
3. Atualizar mapeamentos no frontend
4. Executar `npm run roles:update`

### Adicionando Nova Permissão
1. Adicionar permissão no array de permissions do seed
2. Associar às roles apropriadas
3. Implementar verificação no frontend
4. Executar `npm run seed:fresh`

## ✅ Validação do Sistema

### Teste de Login SYSTEM_ADMIN
```bash
# 1. Fazer login
POST /api/auth/login
{
  "email": "admin@portal.com",
  "password": "password123"
}

# 2. Verificar resposta
{
  "success": true,
  "user": {
    "role": "SYSTEM_ADMIN",
    "permissions": [...] // Todas as permissões
  },
  "token": "jwt_token"
}

# 3. Acessar dashboard
GET /dashboard/system-admin
# Deve ter acesso completo
```

### Verificação de Permissões
```bash
# Verificar role
SELECT r.name, r.description FROM roles r 
JOIN users u ON u.role_id = r.id 
WHERE u.email = 'admin@portal.com';

# Verificar permissões
SELECT p.name FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
JOIN roles r ON r.id = rp.role_id
JOIN users u ON u.role_id = r.id
WHERE u.email = 'admin@portal.com';
```

## 🔄 Troubleshooting

### Problemas Comuns

**Erro: "Role não encontrada"**
```bash
npm run roles:update
```

**Erro: "Permissões faltando"**
```bash
npm run seed:fresh
```

**Banco não encontrado**
```bash
# Verificar .env
DATABASE_URL=postgresql://user:password@localhost:5432/portal_sabercon
```

### Reset Completo
```bash
# 1. Reset do banco
npm run db:reset

# 2. Ou executar script completo
npm run seed:fresh
```

## 📞 Suporte

Para dúvidas sobre o sistema de roles:
1. Verificar logs do seed: `npm run seed:roles`
2. Validar estrutura do banco
3. Testar login com usuários de exemplo
4. Verificar redirecionamentos no frontend

---

**✅ Sistema de Roles atualizado e funcional!**
**👑 SYSTEM_ADMIN com acesso completo de administrador conforme especificado** 