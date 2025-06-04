# Migração: Roles e Users

Esta migração cria as tabelas para roles (perfis) e users (usuários) no sistema, além de inserir os dados iniciais para os perfis e usuários.

## Tabelas criadas

1. `roles` - Armazena os perfis de usuário disponíveis no sistema
2. `users` - Armazena os usuários do sistema, vinculados a um perfil

## Perfis criados

- SYSTEM_ADMIN - Administrador do Sistema
- INSTITUTION_MANAGER - Gestor da Instituição
- TEACHER - Professor
- STUDENT - Estudante
- ACADEMIC_COORDINATOR - Coordenador Acadêmico
- GUARDIAN - Responsável

## Usuários iniciais

| Email | Perfil | Senha |
|-------|--------|-------|
| admin@sabercon.edu.br | SYSTEM_ADMIN | password123 |
| gestor@sabercon.edu.br | INSTITUTION_MANAGER | password123 |
| professor@sabercon.edu.br | TEACHER | password123 |
| julia.c@ifsp.com | STUDENT | password123 |
| coordenador@sabercon.edu.com | ACADEMIC_COORDINATOR | password123 |
| renato@gmail.com | GUARDIAN | password123 |

**Observação importante:** As senhas estão armazenadas em texto puro nesta migração inicial para fins de desenvolvimento. Em um ambiente de produção, estas senhas devem ser substituídas por versões devidamente criptografadas. 