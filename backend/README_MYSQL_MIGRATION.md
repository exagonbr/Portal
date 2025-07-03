# Migração MySQL → PostgreSQL

Este documento descreve como migrar dados de um banco MySQL legado para o PostgreSQL do Portal Sabercon.

## 🎯 Objetivo

Migrar dados do sistema legado MySQL para PostgreSQL, garantindo que:
- ✅ Todos os usuários migrados recebam role **TEACHER**
- ✅ Dados sejam organizados em instituição/escola padrão
- ✅ Sistema funcione imediatamente após migração
- ✅ Não haja perda de dados importantes

## 📋 Pré-requisitos

1. **PostgreSQL configurado** e rodando
2. **MySQL legado** acessível
3. **Migrações PostgreSQL** executadas
4. **Seeds básicos** executados

## 🔧 Configuração

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp scripts/mysql-migration.env.example .env.mysql
```

Edite as configurações MySQL:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_mysql
MYSQL_DATABASE=sabercon
```

### 2. Adicionar ao .env Principal

Adicione as variáveis MySQL ao seu arquivo `.env` principal ou carregue o arquivo `.env.mysql`.

## 🚀 Execução

### Opção 1: Migração Completa (Recomendado)

```bash
npm run migrate:mysql:complete
```

Este comando executa:
1. Migrações PostgreSQL
2. Seeds de preparação
3. Migração de dados MySQL
4. Verificação automática

### Opção 2: Passos Individuais

```bash
# 1. Preparar banco PostgreSQL
npm run migrate:latest
npm run seed:run

# 2. Migrar apenas dados MySQL
npm run migrate:mysql:only

# 3. Verificar resultado
npm run migrate:mysql:verify
```

## 📊 Dados Migrados

### Tabelas Suportadas

| MySQL | PostgreSQL | Descrição |
|-------|------------|-----------|
| `usuarios` | `users` | Usuários (todos viram TEACHER) |
| `instituicoes` | `institutions` | Instituições |
| `escolas` | `schools` | Escolas |
| `arquivos` | `files` | Arquivos/documentos |
| `colecoes` | `collections` | Coleções de conteúdo |

### Mapeamento de Campos

#### Usuários (usuarios → users)
```
nome/name → name
email → email
senha/password → password (re-hash se necessário)
cpf → cpf
telefone/phone → phone
endereco/address → address
cidade/city → city
estado/state → state
cep/zip_code → zip_code
ativo → is_active
```

**Campos Automáticos:**
- `role_id` → TEACHER (sempre)
- `institution_id` → Instituição padrão
- `school_id` → Escola padrão
- `password` → Hash bcrypt de "123456" se inválida

## 🏢 Estrutura Padrão Criada

### Instituição Padrão
- **Nome:** "Instituição Migrada do MySQL"
- **Código:** "MYSQL_MIGRATED"
- **Status:** Ativa

### Escola Padrão
- **Nome:** "Escola Migrada do MySQL"
- **Código:** "MYSQL_MIGRATED_SCHOOL"
- **Instituição:** Vinculada à instituição padrão

### Role TEACHER
- **Nome:** "TEACHER"
- **Tipo:** Sistema
- **Permissões:** Básicas para professores

## 🔍 Verificação

### Comando de Verificação
```bash
npm run migrate:mysql:verify
```

### Saída Esperada
```
🔍 Verificando migração MySQL → PostgreSQL

✅ Role TEACHER encontrada
   📊 X usuários com role TEACHER
✅ Instituição padrão encontrada
   📍 Instituição Migrada do MySQL
✅ Escola padrão encontrada
   🏫 Escola Migrada do MySQL

📊 Estatísticas do banco:
   👥 X usuários total
   🏢 X instituições
   🏫 X escolas
   📁 X arquivos
   📚 X coleções
   🔐 X permissões para TEACHER
   ✅ X usuários ativos

🎉 VERIFICAÇÃO CONCLUÍDA!
✅ Migração realizada com sucesso
✅ Estrutura básica configurada
✅ Sistema pronto para uso
```

## 🛠️ Solução de Problemas

### Erro: "Table 'usuarios' doesn't exist"
- Verifique se o banco MySQL está acessível
- Confirme o nome da tabela no MySQL
- Verifique as credenciais de conexão

### Erro: "Role TEACHER not found"
- Execute: `npm run seed:run`
- Ou execute o seed específico: `008_mysql_migration_preparation`

### Erro: "Connection refused"
- Verifique se MySQL está rodando
- Confirme host e porta
- Teste conexão manual

### Usuários Duplicados
- O sistema pula usuários com email já existente
- Verifique logs para detalhes
- Use `TRUNCATE users CASCADE` para limpar (cuidado!)

## 📝 Logs e Estatísticas

Durante a migração, você verá:

```
🚀 Iniciando migração MySQL → PostgreSQL

🔧 Configurando dados padrão...
   ✅ Role TEACHER criada
   ✅ Instituição padrão criada
   ✅ Escola padrão criada

📊 Iniciando migração de dados...

🏢 Migrando instituições...
   📊 Encontradas X instituições
   ✅ X instituições migradas

🏫 Migrando escolas...
   📊 Encontradas X escolas
   ✅ X escolas migradas

👥 Migrando usuários...
   📊 Encontrados X usuários no MySQL
   ✅ X usuários migrados
   ⚠️ X usuários já existiam
   ❌ X erros

📁 Migrando arquivos...
   ✅ X arquivos migrados

📚 Migrando coleções...
   ✅ X coleções migradas

🎉 MIGRAÇÃO CONCLUÍDA!
```

## 🔄 Executar Novamente

A migração é **idempotente** - pode ser executada múltiplas vezes:
- Dados existentes são pulados
- Apenas novos dados são migrados
- Estrutura padrão é mantida

## 📚 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `migrate:mysql:complete` | Migração completa (recomendado) |
| `migrate:mysql:only` | Apenas migração de dados |
| `migrate:mysql:verify` | Verificar resultado |
| `migrate:mysql` | Script simples (legado) |

## 🎯 Resultado Final

Após a migração bem-sucedida:

1. **Todos os usuários** migrados têm role TEACHER
2. **Senhas inválidas** foram substituídas por "123456"
3. **Dados organizados** em estrutura padrão
4. **Sistema funcional** imediatamente
5. **Permissões configuradas** para professores

## 🔐 Segurança

- Senhas são re-hasheadas com bcrypt
- Dados sensíveis são preservados
- Conexões são fechadas adequadamente
- Logs não expõem senhas

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs detalhados
2. Execute verificação: `npm run migrate:mysql:verify`
3. Consulte este documento
4. Execute passos individuais para debug 