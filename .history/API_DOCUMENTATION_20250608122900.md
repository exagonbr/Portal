# Portal Educacional - Documentação da API

## Visão Geral

Este documento descreve todas as APIs disponíveis no Portal Educacional. O sistema utiliza autenticação baseada em JWT através do NextAuth.js.

## Autenticação

Todas as rotas (exceto as públicas) requerem autenticação. O token JWT deve ser enviado no header:

```
Authorization: Bearer <token>
```

### Rotas Públicas
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/forgot-password` - Recuperação de senha

## Rate Limiting

As APIs possuem rate limiting configurado:
- APIs públicas: 10 requisições/minuto
- APIs autenticadas: 30 requisições/minuto
- Upload: 5 requisições/hora
- Relatórios: 10 requisições/5 minutos

## Roles e Permissões

O sistema possui 6 níveis de acesso:
1. **SYSTEM_ADMIN** - Acesso total
2. **INSTITUTION_ADMIN** - Gerencia instituição
3. **SCHOOL_MANAGER** - Gerencia escola
4. **TEACHER** - Professor
5. **STUDENT** - Aluno
6. **GUARDIAN** - Responsável

## Endpoints

### 1. Usuários (`/api/users`)

#### Listar Usuários
```http
GET /api/users?page=1&limit=10&search=&role=&institution_id=&school_id=&is_active=
```

#### Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "STUDENT|TEACHER|...",
  "institution_id": "uuid",
  "school_id": "uuid"
}
```

#### Buscar Usuário
```http
GET /api/users/{id}
```

#### Atualizar Usuário
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "is_active": boolean
}
```

#### Deletar Usuário
```http
DELETE /api/users/{id}
```

### 2. Instituições (`/api/institutions`)

#### Listar Instituições
```http
GET /api/institutions?page=1&limit=10&search=&is_active=
```

#### Criar Instituição
```http
POST /api/institutions
Content-Type: application/json

{
  "name": "string",
  "slug": "string",
  "description": "string",
  "email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  }
}
```

### 3. Escolas (`/api/schools`)

#### Listar Escolas
```http
GET /api/schools?page=1&limit=10&institution_id=&search=
```

#### Criar Escola
```http
POST /api/schools
Content-Type: application/json

{
  "institution_id": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string",
  "email": "string",
  "phone": "string"
}
```

### 4. Cursos (`/api/courses`)

#### Listar Cursos
```http
GET /api/courses?page=1&limit=10&search=&status=&institution_id=
```

#### Criar Curso
```http
POST /api/courses
Content-Type: application/json

{
  "institution_id": "uuid",
  "title": "string",
  "slug": "string",
  "description": "string",
  "thumbnail": "string",
  "price": 99.90,
  "duration_hours": 40,
  "level": "BEGINNER|INTERMEDIATE|ADVANCED",
  "prerequisites": ["string"],
  "objectives": ["string"],
  "tags": ["string"]
}
```

### 5. Turmas (`/api/classes`)

#### Listar Turmas
```http
GET /api/classes?page=1&limit=10&school_id=&course_id=&is_active=
```

#### Criar Turma
```http
POST /api/classes
Content-Type: application/json

{
  "school_id": "uuid",
  "course_id": "uuid",
  "name": "string",
  "code": "string",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "max_students": 30,
  "schedule": {
    "monday": ["08:00-10:00"],
    "wednesday": ["08:00-10:00"]
  }
}
```

### 6. Unidades/Módulos (`/api/units`)

#### Listar Unidades
```http
GET /api/units?course_id=&is_active=
```

#### Criar Unidade
```http
POST /api/units
Content-Type: application/json

{
  "course_id": "uuid",
  "title": "string",
  "description": "string",
  "order": 1
}
```

### 7. Aulas (`/api/lessons`)

#### Listar Aulas
```http
GET /api/lessons?unit_id=&type=&is_published=
```

#### Criar Aula
```http
POST /api/lessons
Content-Type: application/json

{
  "unit_id": "uuid",
  "title": "string",
  "description": "string",
  "order": 1,
  "type": "LIVE|RECORDED|HYBRID|SELF_PACED",
  "duration_minutes": 60,
  "scheduled_date": "2024-01-01T10:00:00Z",
  "meeting_url": "string",
  "content": {
    "objectives": ["string"],
    "materials": [{
      "type": "VIDEO|PDF|SLIDE",
      "title": "string",
      "url": "string"
    }]
  }
}
```

### 8. Tarefas (`/api/assignments`)

#### Listar Tarefas
```http
GET /api/assignments?lesson_id=&class_id=&type=&status=
```

#### Criar Tarefa
```http
POST /api/assignments
Content-Type: application/json

{
  "lesson_id": "uuid",
  "class_id": "uuid",
  "title": "string",
  "description": "string",
  "type": "HOMEWORK|PROJECT|ESSAY|EXAM",
  "points": 100,
  "due_date": "2024-01-15T23:59:59Z",
  "instructions": "string",
  "rubric": [{
    "criteria": "string",
    "description": "string",
    "points": 25
  }],
  "submission_type": "FILE_UPLOAD|TEXT_ENTRY|URL",
  "max_file_size_mb": 10,
  "attempts_allowed": 1
}
```

### 9. Livros (`/api/books`)

#### Listar Livros
```http
GET /api/books?unit_id=&is_required=
```

#### Criar Livro
```http
POST /api/books
Content-Type: application/json

{
  "unit_id": "uuid",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "cover_url": "string",
  "file_url": "string",
  "pages": 300,
  "is_required": true
}
```

### 10. Grupos de Estudo (`/api/study-groups`)

#### Listar Grupos
```http
GET /api/study-groups?type=&visibility=&my_groups=true
```

#### Criar Grupo
```http
POST /api/study-groups
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "subject": "string",
  "type": "STUDY|PROJECT|RESEARCH",
  "visibility": "PUBLIC|PRIVATE|CLASS_ONLY",
  "max_members": 10,
  "meeting_schedule": {
    "frequency": "WEEKLY",
    "day_of_week": 3,
    "time": "19:00",
    "duration_minutes": 120
  },
  "goals": ["string"],
  "rules": ["string"],
  "tags": ["string"]
}
```

### 11. Fórum (`/api/forum/topics`)

#### Listar Tópicos
```http
GET /api/forum/topics?category_id=&type=&tags=&sort=recent
```

#### Criar Tópico
```http
POST /api/forum/topics
Content-Type: application/json

{
  "category_id": "uuid",
  "title": "string",
  "content": "string",
  "type": "QUESTION|DISCUSSION|ANNOUNCEMENT",
  "visibility": "PUBLIC|MEMBERS_ONLY",
  "tags": ["string"],
  "poll": {
    "question": "string",
    "options": ["option1", "option2"],
    "allow_multiple": false
  }
}
```

### 12. Notificações (`/api/notifications`)

#### Listar Notificações
```http
GET /api/notifications?type=&priority=&status=unread
```

#### Criar Notificação
```http
POST /api/notifications
Content-Type: application/json

{
  "title": "string",
  "message": "string",
  "type": "INFO|SUCCESS|WARNING|ANNOUNCEMENT",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "recipient_type": "USER|ROLE|CLASS|ALL",
  "recipient_ids": ["uuid"],
  "action_url": "string",
  "expires_at": "2024-12-31T23:59:59Z",
  "channels": ["IN_APP", "EMAIL"]
}
```

### 13. Questionários (`/api/quizzes`)

#### Listar Questionários
```http
GET /api/quizzes?lesson_id=&type=&difficulty=&status=
```

#### Criar Questionário
```http
POST /api/quizzes
Content-Type: application/json

{
  "lesson_id": "uuid",
  "title": "string",
  "description": "string",
  "type": "PRACTICE|GRADED|SURVEY",
  "difficulty": "EASY|MEDIUM|HARD",
  "time_limit_minutes": 30,
  "passing_score": 60,
  "max_attempts": 2,
  "questions": [{
    "type": "MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER",
    "question": "string",
    "points": 10,
    "options": [{
      "id": "a",
      "text": "string",
      "is_correct": true,
      "feedback": "string"
    }],
    "hints": ["string"]
  }],
  "settings": {
    "shuffle_questions": true,
    "show_correct_answers": true,
    "allow_review": true
  }
}
```

### 14. Relatórios (`/api/reports`)

#### Listar Relatórios
```http
GET /api/reports?type=&status=&format=
```

#### Gerar Relatório
```http
POST /api/reports
Content-Type: application/json

{
  "type": "STUDENT_PERFORMANCE|CLASS_OVERVIEW|ATTENDANCE",
  "title": "string",
  "filters": {
    "date_from": "2024-01-01T00:00:00Z",
    "date_to": "2024-12-31T23:59:59Z",
    "class_id": "uuid",
    "student_ids": ["uuid"]
  },
  "format": "PDF|EXCEL|CSV",
  "sections": ["SUMMARY", "CHARTS", "DETAILED_DATA"],
  "schedule": {
    "frequency": "ONCE|WEEKLY|MONTHLY",
    "send_email": true,
    "recipients": ["email@example.com"]
  }
}
```

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `409` - Conflito
- `429` - Muitas requisições (rate limit)
- `500` - Erro interno do servidor

## Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "error": "Mensagem de erro",
  "errors": {
    "campo": ["erro específico do campo"]
  }
}
```

### Listagem com Paginação
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Exemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}'
```

### Listar Cursos (Autenticado)
```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>"
```

### Criar Tarefa
```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_id": "123",
    "title": "Trabalho Final",
    "description": "Desenvolver um projeto completo",
    "type": "PROJECT",
    "points": 100,
    "due_date": "2024-12-15T23:59:59Z"
  }'
``` 