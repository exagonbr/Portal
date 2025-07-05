# Migrations e Seeds do Portal Educacional

Este diretório contém todas as migrations e seeds necessárias para configurar o banco de dados do Portal Educacional.

## 📋 Migrations Criadas

### 1. `20250704120000_create_initial_schema.js`
Cria as tabelas base do sistema:
- `institution` - Instituições de ensino
- `roles` - Papéis de usuário
- `permissions` - Permissões do sistema
- `role_permissions` - Associação entre papéis e permissões
- `teacher_subject` - Disciplinas dos professores
- `user` - Usuários do sistema
- `security_policies` - Políticas de segurança
- `unit` - Unidades educacionais
- `education_cycles` - Ciclos educacionais
- `classes` - Turmas
- `user_classes` - Associação usuário-turma
- `forgot_password` - Recuperação de senha

### 2. `20250704130000_create_media_tables.js`
Cria as tabelas relacionadas a mídia e conteúdo:
- `authors` - Autores de livros
- `publishers` - Editoras
- `genres` - Gêneros de conteúdo
- `languages` - Idiomas
- `tags` - Tags/etiquetas
- `target_audiences` - Público-alvo
- `themes` - Temas
- `books` - Livros
- `videos` - Vídeos
- `tv_shows` - Programas de TV
- `collections` - Coleções de conteúdo
- `collection_items` - Itens das coleções
- `media_files` - Arquivos de mídia
- `media_entries` - Histórico de visualização

### 3. `20250704131000_create_course_tables.js`
Cria as tabelas do sistema de cursos:
- `subjects` - Disciplinas/Matérias
- `courses` - Cursos
- `modules` - Módulos dos cursos
- `lessons` - Lições/Aulas
- `course_enrollments` - Matrículas em cursos
- `lesson_progress` - Progresso nas lições
- `quizzes` - Questionários
- `questions` - Questões dos quizzes
- `quiz_attempts` - Tentativas de quiz
- `quiz_answers` - Respostas dos quizzes
- `certificates` - Certificados

### 4. `20250704132000_create_communication_tables.js`
Cria as tabelas de comunicação:
- `forum_threads` - Tópicos do fórum
- `forum_replies` - Respostas do fórum
- `announcements` - Anúncios
- `announcement_acknowledgments` - Confirmações de leitura
- `chat_messages` - Mensagens de chat
- `notifications` - Notificações
- `notification_logs` - Logs de notificações
- `notification_preferences` - Preferências de notificação
- `profiles` - Perfis de usuário
- `user_sessions` - Sessões de usuário

### 5. `20250704133000_create_remaining_tables.js`
Cria as tabelas restantes:
- `schools` - Escolas
- `school_managers` - Gestores de escola
- `settings` - Configurações do sistema
- `files` - Arquivos gerais
- `education_periods` - Períodos educacionais
- `educational_stages` - Estágios educacionais
- `cookie_signed` - Cookies de autenticação
- `public_content` - Conteúdo público
- `user_roles` - Associação usuário-papel
- `unit_classes` - Turmas por unidade
- `video_modules` - Módulos de vídeo
- `video_collections` - Coleções de vídeo
- `video_collection_items` - Itens das coleções de vídeo
- `tv_show_complete` - Metadados completos de TV Shows

## 🌱 Seeds Criados

### Seeds Existentes (já estavam no projeto):
1. `01_authors.js` - Autores padrão
2. `02_cookie_signed.js` - Cookies de teste
3. `03_education_period.js` - Períodos educacionais
4. `04_educational_stage.js` - Estágios educacionais
5. `05_file.js` - Arquivos de exemplo
6. `06_forgot_password.js` - Dados de recuperação de senha
7. `07_genre.js` - Gêneros
8. `08_institution.js` - Instituições
9. `09_public.js` - Conteúdo público
10. `10_role.js` - Papéis de usuário
11. `11_settings.js` - Configurações
12. `12_tag.js` - Tags
13. `13_target_audience.js` - Público-alvo
14. `14_teacher_subject.js` - Disciplinas dos professores
15. `15_theme.js` - Temas

### Seeds Novos Criados:
16. `16_languages.js` - Idiomas (Português, Inglês, Espanhol, etc.)
17. `17_subjects.js` - Disciplinas escolares (Matemática, Português, Ciências, etc.)
18. `18_education_cycles.js` - Ciclos educacionais (Educação Infantil, Fundamental I/II, Médio, EJA, Técnico)
19. `19_classes.js` - Turmas por ciclo educacional
20. `20_publishers.js` - Editoras educacionais brasileiras
21. `21_schools.js` - Escolas de exemplo
22. `22_education_periods.js` - Períodos educacionais (semestres e bimestres)
23. `23_permissions.js` - Todas as permissões do sistema
24. `24_role_permissions.js` - Associação de permissões aos papéis

### Seeds Existentes (mantidos):
- `20240115_settings_seed.js` - Configurações adicionais
- `20250630210000-users-seed.js` - Usuários de teste
- `20250630214500_security_policies_seed.js` - Políticas de segurança
- `20250630220100_units_seed.js` - Unidades educacionais

## 🚀 Como Executar

### Executar todas as migrations e seeds:
```bash
cd backend
node src/scripts/run-migrations-and-seeds.js
```

### Executar apenas as migrations:
```bash
cd backend
npx knex migrate:latest
```

### Executar apenas os seeds:
```bash
cd backend
npx knex seed:run
```

### Reverter migrations:
```bash
cd backend
npx knex migrate:rollback
```

## 📝 Observações

1. As migrations devem ser executadas na ordem em que foram criadas (por isso o timestamp no nome).
2. Os seeds têm dependências entre si, por isso devem ser executados na ordem numérica.
3. O script `run-migrations-and-seeds.js` garante a execução na ordem correta.
4. Certifique-se de que o banco de dados PostgreSQL está rodando antes de executar as migrations.
5. Configure as variáveis de ambiente no arquivo `.env` antes de executar.

## 🔧 Variáveis de Ambiente Necessárias

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=portal_dev
NODE_ENV=development