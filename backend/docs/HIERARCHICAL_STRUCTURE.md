# Estrutura Hierárquica do Sistema Educacional

## Visão Geral

O sistema foi refatorado para seguir a seguinte hierarquia:

```
Instituição
    └── Escolas
        └── Turmas
            └── Ciclos de Ensino
                └── Professores, Alunos, Gestores
```

## Novas Entidades Criadas

### 1. Schools (Escolas)
- **Tabela**: `schools`
- **Relacionamento**: Pertence a uma Instituição
- **Campos principais**:
  - `name`: Nome da escola
  - `code`: Código único da escola
  - `institution_id`: ID da instituição
  - `address`, `city`, `state`, `zip_code`: Endereço
  - `phone`, `email`: Contato
  - `is_active`: Status ativo/inativo

### 2. Classes (Turmas)
- **Tabela**: `classes`
- **Relacionamento**: Pertence a uma Escola
- **Campos principais**:
  - `name`: Nome da turma
  - `code`: Código da turma
  - `school_id`: ID da escola
  - `year`: Ano letivo
  - `shift`: Turno (MORNING, AFTERNOON, EVENING, FULL_TIME)
  - `max_students`: Limite de alunos
  - `is_active`: Status ativo/inativo

### 3. Education Cycles (Ciclos de Ensino)
- **Tabela**: `education_cycles`
- **Relacionamento**: Associado a Turmas através de `class_education_cycles`
- **Campos principais**:
  - `name`: Nome do ciclo
  - `level`: Nível de ensino (EDUCACAO_INFANTIL, ENSINO_FUNDAMENTAL_I, etc.)
  - `description`: Descrição
  - `duration_years`: Duração em anos
  - `min_age`, `max_age`: Faixa etária

### 4. User Classes (Matrículas)
- **Tabela**: `user_classes`
- **Relacionamento**: Associa Usuários a Turmas
- **Campos principais**:
  - `user_id`: ID do usuário
  - `class_id`: ID da turma
  - `role`: Papel na turma (STUDENT, TEACHER, COORDINATOR)
  - `enrollment_date`: Data de matrícula
  - `exit_date`: Data de saída
  - `is_active`: Status ativo/inativo

### 5. School Managers (Gestores Escolares)
- **Tabela**: `school_managers`
- **Relacionamento**: Associa Usuários a Escolas como gestores
- **Campos principais**:
  - `user_id`: ID do usuário
  - `school_id`: ID da escola
  - `position`: Cargo (PRINCIPAL, VICE_PRINCIPAL, COORDINATOR, SUPERVISOR)
  - `start_date`: Data de início
  - `end_date`: Data de término
  - `is_active`: Status ativo/inativo

## Arquivos Criados

### Migrações
- `backend/migrations/20240128000000_add_schools_and_classes.ts`

### Modelos
- `backend/src/models/School.ts`
- `backend/src/models/Class.ts`
- `backend/src/models/EducationCycle.ts`
- `backend/src/models/UserClass.ts`
- `backend/src/models/SchoolManager.ts`

### DTOs
- `backend/src/dto/SchoolDto.ts`
- `backend/src/dto/ClassDto.ts`
- `backend/src/dto/EducationCycleDto.ts`
- `backend/src/dto/UserClassDto.ts`
- `backend/src/dto/SchoolManagerDto.ts`

### Repositórios
- `backend/src/repositories/SchoolRepository.ts`
- `backend/src/repositories/ClassRepository.ts`
- `backend/src/repositories/EducationCycleRepository.ts`
- `backend/src/repositories/UserClassRepository.ts`
- `backend/src/repositories/SchoolManagerRepository.ts`

### Serviços
- `backend/src/services/SchoolService.ts`
- `backend/src/services/ClassService.ts`
- `backend/src/services/EducationCycleService.ts`
- `backend/src/services/UserClassService.ts`
- `backend/src/services/SchoolManagerService.ts`

### Utilitários
- `backend/src/utils/AppError.ts` - Classe para tratamento de erros

## Alterações em Entidades Existentes

### Users
- Adicionado campo `school_id` para permitir associação direta com escolas (útil para gestores)

### Courses
- Adicionado campo `school_id` para associar cursos a escolas específicas

## Funcionalidades Implementadas

### Gestão de Escolas
- CRUD completo de escolas
- Listagem com paginação e filtros
- Estatísticas de escola (total de alunos, professores, turmas, gestores)
- Ativação/desativação de escolas

### Gestão de Turmas
- CRUD completo de turmas
- Validação de código único por escola/ano
- Controle de limite de alunos
- Associação com ciclos de ensino
- Estatísticas de turma

### Gestão de Ciclos de Ensino
- CRUD completo de ciclos
- Associação com turmas
- Validação de faixa etária
- Listagem de turmas por ciclo

### Gestão de Matrículas
- Matrícula de usuários em turmas
- Controle de papéis (aluno, professor, coordenador)
- Histórico de matrículas
- Ativação/desativação de matrículas
- Validação de limite de alunos

### Gestão de Gestores Escolares
- Atribuição de cargos de gestão
- Controle de cargos únicos (ex: apenas um diretor)
- Histórico de gestão
- Equipe de gestão por escola

## Próximos Passos

1. **Criar Controllers/Routes**: Implementar as rotas da API para expor as funcionalidades
2. **Atualizar Frontend**: Criar interfaces para gerenciar a nova estrutura
3. **Executar Migrações**: Rodar as migrações no banco de dados
4. **Testes**: Implementar testes unitários e de integração
5. **Documentação da API**: Documentar os endpoints criados

## Considerações de Segurança

- Validação de permissões por papel do usuário
- Verificação de pertencimento institucional
- Controle de acesso hierárquico (instituição → escola → turma)
- Auditoria de alterações críticas