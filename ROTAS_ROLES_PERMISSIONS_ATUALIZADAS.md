# ROTAS, ROLES E PERMISSIONS ATUALIZADAS

## Resumo das Alterações

Todas as rotas da API foram atualizadas para usar as roles e permissions corretas conforme o sistema padrão definido no enum `UserRole`.

## Roles Padronizadas

As seguintes roles foram padronizadas em todo o sistema:

- `SYSTEM_ADMIN` - Administrador do Sistema
- `INSTITUTION_MANAGER` - Gestor Institucional
- `ACADEMIC_COORDINATOR` - Coordenador Acadêmico
- `TEACHER` - Professor
- `STUDENT` - Aluno
- `GUARDIAN` - Responsável

## Permissões por Role

### SYSTEM_ADMIN (Administrador do Sistema)
**Acesso Total ao Sistema**

**Rotas Exclusivas:**
- `/api/admin/*` - Todas as rotas administrativas
- `/api/aws/*` - Configurações AWS
- `/api/backups/*` - Gerenciamento de backups
- `/api/permissions` - Gestão completa de permissões
- `/api/roles` - Gestão completa de roles
- `/api/queue/*` - Gerenciamento de filas

**Acesso Compartilhado:**
- `/api/users/*` - Gestão de usuários (com INSTITUTION_MANAGER)
- `/api/dashboard/admin` - Dashboard administrativo

### INSTITUTION_MANAGER (Gestor Institucional)
**Gestão de Instituição**

**Rotas Principais:**
- `/api/users/*` - Gestão de usuários da instituição
- `/api/courses/*` - Gestão de cursos
- `/api/books/*` - Gestão de livros
- `/api/videos/*` - Gestão de vídeos
- `/api/modules/*` - Gestão de módulos
- `/api/content-collections/*` - Gestão de coleções
- `/api/notifications/send` - Envio de notificações
- `/api/notifications/email/*` - Configurações de email
- `/api/dashboard/institution-manager` - Dashboard institucional

**Acesso de Leitura:**
- `/api/permissions` - Visualizar permissões
- `/api/roles` - Visualizar roles

### ACADEMIC_COORDINATOR (Coordenador Acadêmico)
**Coordenação Acadêmica**

**Rotas Principais:**
- `/api/courses/*` - Gestão de cursos
- `/api/lessons/*` - Gestão de aulas
- `/api/quizzes/*` - Gestão de questionários
- `/api/videos/*` - Gestão de vídeos
- `/api/modules/*` - Gestão de módulos
- `/api/content-collections/*` - Gestão de coleções
- `/api/forum/threads/*/pin` - Fixar tópicos no fórum
- `/api/forum/threads/*/lock` - Bloquear tópicos no fórum
- `/api/chats/*` - Gestão de chats
- `/api/notifications/send` - Envio de notificações
- `/api/dashboard/coordinator` - Dashboard do coordenador

**Restrições:**
- Não pode deletar alguns recursos (apenas admins e managers)

### TEACHER (Professor)
**Ensino e Gestão de Turmas**

**Rotas Principais:**
- `/api/courses/*` - Criar e editar cursos
- `/api/lessons/*` - Gestão de aulas
- `/api/quizzes/*` - Criar e editar questionários
- `/api/videos/*` - Upload e gestão de vídeos
- `/api/modules/*` - Criar e editar módulos
- `/api/content-collections/*` - Criar e editar coleções
- `/api/books/*` - Criar e editar livros
- `/api/forum/threads/*/pin` - Fixar tópicos
- `/api/forum/threads/*/lock` - Bloquear tópicos
- `/api/chats/*` - Gestão de chats
- `/api/notifications/send` - Envio de notificações
- `/api/dashboard/teacher` - Dashboard do professor

**Restrições:**
- Não pode deletar recursos críticos
- Limitado à sua instituição

### STUDENT (Aluno)
**Acesso ao Conteúdo Educacional**

**Rotas Principais:**
- `/api/quizzes/*/attempts` - Realizar questionários
- `/api/quizzes/*/attempts/*/submit` - Submeter respostas
- `/api/dashboard/student` - Dashboard do aluno

**Acesso de Leitura:**
- Visualizar cursos, aulas, vídeos, livros (sem gestão)
- Participar de fóruns e chats

### GUARDIAN (Responsável)
**Acompanhamento dos Dependentes**

**Rotas Principais:**
- `/api/dashboard/guardian` - Dashboard do responsável

**Acesso de Leitura:**
- Informações dos dependentes
- Notas e frequência dos dependentes

## Arquivos Atualizados

### Backend - Rotas (backend/src/routes/)
- ✅ `adminRoutes.ts` - Atualizadas para SYSTEM_ADMIN
- ✅ `auth.ts` - Mantidas as validações existentes
- ✅ `awsAdminRoutes.ts` - Atualizadas para SYSTEM_ADMIN
- ✅ `awsRoutes.ts` - Atualizadas para SYSTEM_ADMIN
- ✅ `backupRoutes.ts` - Atualizadas para SYSTEM_ADMIN
- ✅ `books.ts` - Atualizadas com hierarquia de roles
- ✅ `chats.ts` - Atualizadas com roles educacionais
- ✅ `content-collections.ts` - Atualizadas com hierarquia
- ✅ `courses.ts` - Atualizadas com roles educacionais
- ✅ `dashboard.ts` - Atualizadas para roles específicas
- ✅ `forum.ts` - Atualizadas para moderação
- ✅ `lessons.ts` - Atualizadas com roles educacionais
- ✅ `modules.ts` - Atualizadas com hierarquia
- ✅ `notifications.ts` - Atualizadas e simplificadas
- ✅ `permissions.ts` - Atualizadas para admin/manager
- ✅ `quizzes.ts` - Atualizadas com separação student/teacher
- ✅ `roles.ts` - Atualizadas para admin/manager
- ✅ `sessions.ts` - Atualizadas para SYSTEM_ADMIN
- ✅ `users.ts` - Atualizadas com hierarquia admin/manager
- ✅ `videos.ts` - Atualizadas com hierarquia

### Frontend - Middleware (src/)
- ✅ `middleware.ts` - Já está configurado para as roles corretas
- ✅ `types/roles.ts` - Já contém as definições corretas
- ✅ `utils/roleRedirect.ts` - Já está mapeado corretamente

## Princípios Aplicados

### Hierarquia de Permissões
1. **SYSTEM_ADMIN** - Acesso total
2. **INSTITUTION_MANAGER** - Gestão institucional
3. **ACADEMIC_COORDINATOR** - Coordenação acadêmica
4. **TEACHER** - Ensino e gestão de turmas
5. **STUDENT** - Consumo de conteúdo
6. **GUARDIAN** - Acompanhamento

### Regras de Negócio
- **Criação**: Roles educacionais podem criar conteúdo
- **Edição**: Criadores + superiores hierárquicos podem editar
- **Exclusão**: Apenas admins e managers para recursos críticos
- **Visualização**: Todos podem visualizar conforme contexto

### Segurança
- Todas as rotas protegidas com `validateJWT`
- Verificação de roles com `requireRole`
- Validação de instituição onde necessário
- Logs de auditoria para ações administrativas

## Benefícios

1. **Consistência**: Todas as rotas usam as mesmas nomenclaturas
2. **Segurança**: Permissões bem definidas e hierárquicas
3. **Manutenibilidade**: Código padronizado e fácil de entender
4. **Escalabilidade**: Sistema flexível para novos recursos
5. **Auditoria**: Controle completo de acesso por role

## Próximos Passos

1. Testar todas as rotas com diferentes roles
2. Verificar se o frontend respeita as novas permissões
3. Documentar casos de uso específicos
4. Implementar testes automatizados de autorização
5. Monitorar logs de acesso negado

---

*Documento gerado em: $(date)*
*Autor: Assistente de Desenvolvimento* 