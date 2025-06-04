# Seeds para Atualização de Roles TEACHER

Este documento explica como usar os seeds criados para atualizar todos os usuários onde `is_teacher = true` para ter `ROLE = TEACHER`.

## 📋 Visão Geral

Foram criados dois seeds para atender diferentes estruturas de banco de dados:

1. **`999_update_teacher_roles.ts`** - Versão padrão com Knex
2. **`999_update_teacher_roles_prisma.ts`** - Versão compatível com Prisma

## 🚀 Como Executar

### Opção 1: Script Automatizado (Recomendado)

```bash
# Executar seed padrão
node executar-seeds-teacher.js

# Executar versão Prisma
node executar-seeds-teacher.js --prisma

# Visualizar comandos sem executar (dry-run)
node executar-seeds-teacher.js --dry-run

# Executar rollback (reverter alterações)
node executar-seeds-teacher.js --rollback

# Ver ajuda
node executar-seeds-teacher.js --help
```

### Opção 2: Comandos Manuais

```bash
# Entrar na pasta backend
cd backend

# Executar seed padrão
npx knex seed:run --specific=999_update_teacher_roles

# Executar seed Prisma
npx knex seed:run --specific=999_update_teacher_roles_prisma

# Rollback
npx knex seed:rollback --specific=999_update_teacher_roles
```

## 🔍 O que o Seed Faz

1. **Verifica a estrutura do banco**: Confirma se as tabelas `users` e `roles` existem
2. **Verifica a coluna `is_teacher`**: Confirma se a coluna existe na tabela `users`
3. **Busca ou cria role TEACHER**: Se não existir, cria automaticamente
4. **Identifica usuários teachers**: Busca todos os usuários onde `is_teacher = true` (ou `1`)
5. **Atualiza roles**: Define `role_id` como TEACHER para esses usuários
6. **Fornece relatório**: Mostra quantos usuários foram atualizados

## 📊 Exemplo de Saída

```
🔄 Iniciando seed para atualizar roles de professores...
🔍 Role TEACHER encontrado com ID: abc123-def456-ghi789
🔍 Encontrados 342 usuários com is_teacher = true

📝 Exemplos de usuários que serão atualizados:
   - Prof. Ana Silva (ID: user1)
   - Prof. Carlos Santos (ID: user2)
   - Prof. Maria Oliveira (ID: user3)
   - Prof. João Pedro (ID: user4)
   - Prof. Lucia Costa (ID: user5)
   ... e mais 337 usuários

✅ Usuário Prof. Ana Silva (ID: user1) atualizado para TEACHER
✅ Usuário Prof. Carlos Santos (ID: user2) atualizado para TEACHER
...

🎯 Resumo da atualização:
   - Total de usuários com is_teacher = true: 342
   - Usuários atualizados com sucesso: 342
   - Usuários que já tinham role correto: 0
   - Role utilizado: TEACHER (ID: abc123-def456-ghi789)

✅ Verificação final: 342 usuários têm role TEACHER
✅ Todos os usuários com is_teacher = true agora têm role TEACHER
🏁 Seed de atualização de roles de professores concluído!
```

## 🔄 Rollback (Reverter Alterações)

Se precisar reverter as alterações:

```bash
# Com script
node executar-seeds-teacher.js --rollback

# Manualmente
cd backend
npx knex seed:rollback --specific=999_update_teacher_roles
```

O rollback tentará definir os usuários de volta para role `STUDENT` ou outro role disponível.

## ⚠️ Considerações Importantes

### Antes de Executar

1. **Backup do banco**: Sempre faça backup antes de executar
2. **Ambiente de teste**: Teste primeiro em ambiente de desenvolvimento
3. **Verificar estrutura**: Confirme que seu banco tem as tabelas e colunas necessárias

### Estrutura Esperada

O seed espera encontrar:

```sql
-- Tabela users com coluna is_teacher
users (
  id,
  name,
  email,
  is_teacher,  -- boolean ou bit(1)
  role_id,     -- referência para roles.id
  ...
)

-- Tabela roles
roles (
  id,
  name,        -- 'TEACHER', 'STUDENT', etc.
  description,
  ...
)
```

### Compatibilidade

- ✅ PostgreSQL
- ✅ MySQL
- ✅ SQLite
- ✅ Prisma
- ✅ Knex.js

## 🐛 Resolução de Problemas

### Erro: "Tabela users não encontrada"
- Verifique se o banco de dados está configurado corretamente
- Confirme se as migrações foram executadas

### Erro: "Coluna is_teacher não encontrada"
- Verifique se a migração que adiciona a coluna `is_teacher` foi executada
- Pode ser que o sistema use uma estrutura diferente

### Erro: "Role TEACHER não encontrado"
- O seed criará automaticamente se não existir
- Verifique se há permissões para inserir na tabela `roles`

### Nenhum usuário encontrado
- Confirme se existem usuários com `is_teacher = true` no banco
- Verifique se a coluna usa valores boolean (true/false) ou bit (1/0)

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs detalhados do seed
2. Confirme a estrutura do banco de dados
3. Teste com `--dry-run` primeiro
4. Use o rollback se algo der errado

## 🔧 Personalização

Para adaptar o seed às suas necessidades:

1. **Edite os arquivos de seed** em `backend/seeds/`
2. **Modifique as condições** de busca de usuários
3. **Ajuste os nomes dos roles** conforme sua estrutura
4. **Adicione validações** específicas do seu sistema

## 📝 Logs e Monitoramento

O seed produz logs detalhados:
- ✅ Sucessos em verde
- ⚠️ Avisos em amarelo  
- ❌ Erros em vermelho
- 🔍 Informações em azul

Monitore estes logs para acompanhar o progresso e identificar problemas. 