# Atualização de Permissões de Notificações

## 📋 Resumo da Implementação

Implementação do sistema de permissões para envio de notificações push e email, habilitando o envio para todos os níveis de usuário **exceto GUARDIAN e STUDENT**.

## 🎯 Objetivo Concluído

✅ **Todos os níveis menos GUARDIAN e STUDENT podem enviar notificações push e email**

## 🔧 Alterações Implementadas

### 1. Funções de Controle de Acesso (`src/utils/roleRedirect.ts`)

#### Novas Funções Adicionadas:
- **`canSendNotifications(role)`**: Verifica se uma role pode enviar notificações
- **`canAccessAdvancedNotifications(role)`**: Verifica acesso a funcionalidades avançadas
- **`getNotifiableRoles(userRole)`**: Retorna lista de roles que podem ser notificadas
- **`canNotifyRole(userRole, targetRole)`**: Verifica se pode notificar role específica
- **`testNotificationPermissions()`**: Função para testes e validação

#### Lógica de Permissões:
```typescript
// Roles RESTRITAS (não podem enviar)
const restrictedRoles = [
  'student', 'aluno', 'estudante',
  'guardian', 'responsável', 'pai', 'mãe'
];

// Todas as outras roles PODEM enviar notificações
```

### 2. Hierarquia de Envio de Notificações

#### ✅ Roles que PODEM enviar:
- **SYSTEM_ADMIN**: Pode notificar todos os níveis
- **INSTITUTION_MANAGER/Gestor**: Pode notificar coordenadores, professores, alunos e responsáveis
- **ACADEMIC_COORDINATOR/Coordenador**: Pode notificar professores, alunos e responsáveis
- **TEACHER/Professor**: Pode notificar alunos e responsáveis

#### ❌ Roles que NÃO podem enviar:
- **STUDENT/Aluno**: Apenas recebe notificações
- **GUARDIAN/Responsável**: Apenas recebe notificações

### 3. Frontend - Interface Adaptativa

#### Arquivo: `src/app/notifications/page.tsx`
```typescript
// Antes (verificação manual)
{(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'teacher' || ...) && (

// Depois (função inteligente)
{canAccessAdvancedNotifications(user?.role) && (
```

#### Arquivo: `src/app/notifications/send/page.tsx`
```typescript
// Controle de acesso unificado
useEffect(() => {
  if (!user || !canSendNotifications(user.role)) {
    router.push('/notifications')
    return
  }
}, [user, router])

// Seleção inteligente de destinatários
const notifiableRoles = getNotifiableRoles(user?.role);
```

### 4. Backend - Validação de Permissões

#### Arquivo: `backend/src/routes/notifications.ts`
```typescript
// Endpoint de envio - roles autorizadas expandidas
router.post('/send', validateJWT, requireRole([
  'admin', 'system_admin', 'administrador',
  'manager', 'institution_manager', 'gestor',
  'teacher', 'professor',
  'academic_coordinator', 'coordinator', 'coordenador'
]), async (req, res) => {

// Endpoints de teste e verificação de email
router.post('/email/test', validateJWT, requireRole([
  'admin', 'system_admin', 'administrador',
  'manager', 'institution_manager', 'gestor'
]), async (req, res) => {
```

### 5. Documentação Atualizada

#### Arquivo: `src/app/notifications/README.md`
- Hierarquia de permissões atualizada
- Seção de controle de acesso adicionada
- Funcionalidades técnicas documentadas

## 🧪 Validação e Testes

### Script de Teste Criado
```bash
node scripts/test-notification-permissions.js
```

### Resultados dos Testes:
✅ **SYSTEM_ADMIN**: Pode enviar para todos  
✅ **INSTITUTION_MANAGER**: Pode enviar para coordenadores, professores, alunos, responsáveis  
✅ **ACADEMIC_COORDINATOR**: Pode enviar para professores, alunos, responsáveis  
✅ **TEACHER**: Pode enviar para alunos, responsáveis  
❌ **STUDENT**: Não pode enviar (restrito)  
❌ **GUARDIAN**: Não pode enviar (restrito)

## 🚀 Funcionalidades Implementadas

### 1. **Controle de Acesso Inteligente**
- Verificação automática baseada na role do usuário
- Interface que se adapta dinamicamente às permissões
- Validação tanto no frontend quanto no backend

### 2. **Seleção Hierárquica de Destinatários**
- Sistema admin pode notificar todos
- Gestores podem notificar subordinados
- Coordenadores podem notificar professores e alunos
- Professores podem notificar alunos e responsáveis

### 3. **Suporte Multilíngue**
- Reconhece roles em português e inglês
- Mapeia automaticamente variações de nomes
- Interface em português brasileiro

### 4. **Segurança Robusta**
- Validação dupla (frontend + backend)
- Logs detalhados para auditoria
- Fallbacks seguros em caso de erro

## 📈 Benefícios da Implementação

1. **🔒 Segurança**: Sistema robusto de permissões
2. **🎯 Flexibilidade**: Hierarquia clara mas flexível
3. **🌐 Escalabilidade**: Fácil adição de novas roles
4. **🔧 Manutenibilidade**: Código organizado e documentado
5. **✅ Confiabilidade**: Testes automatizados validando funcionamento

## 🎉 Status Final

**✅ IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO**

Todos os níveis de usuário, exceto GUARDIAN e STUDENT, agora podem enviar notificações push e email através do sistema, com controle de acesso apropriado e hierarquia de permissões bem definida. 