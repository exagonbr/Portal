# Migração de Usuários: MySQL → PostgreSQL

Este diretório contém scripts para migrar usuários do sistema legado (MySQL) para o sistema atual (PostgreSQL).

## Arquivos

- `import-legacy-users-mysql-to-postgres.js` - **Script principal** para migração MySQL → PostgreSQL
- `import-legacy-users.js` - Script para importação dentro do mesmo PostgreSQL
- `import-legacy-users.sql` - Script SQL puro para PostgreSQL
- `mysql-config.example.js` - Exemplo de configuração MySQL
- `README-import-legacy-users.md` - Este arquivo de instruções

## 🎯 Cenários de Uso

### Cenário 1: MySQL → PostgreSQL (Recomendado)
Use quando o sistema legado está no **MySQL** e o atual no **PostgreSQL**.
```bash
node scripts/import-legacy-users-mysql-to-postgres.js
```

### Cenário 2: PostgreSQL → PostgreSQL
Use quando ambos os sistemas estão no **PostgreSQL**.
```bash
node scripts/import-legacy-users.js
```

## Funcionalidades

✅ **Migração entre bancos**: MySQL (origem) → PostgreSQL (destino)  
✅ **Conversão de IDs**: Inteiros → UUIDs  
✅ **Preservação do ID legado**: Campo `user_id_legacy`  
✅ **Role padrão**: Define todos como TEACHER  
✅ **Prevenção de duplicatas**: Por email e user_id_legacy  
✅ **Mapeamento inteligente**: Campos com nomes diferentes  
✅ **Tratamento de senhas**: Preserva hash ou define padrão  
✅ **Logs detalhados**: Relatórios completos da migração  

## Configurações

### Role ID do Professor
```
TEACHER_ROLE_ID = "5b80c403-086b-414f-8501-10cff41fc6c3"
```

### Senha Padrão
Para usuários sem senha ou com senha em texto plano:
```
Senha: senha123
```

## Pré-requisitos

### 1. Dependências Node.js
```bash
npm install mysql2 knex uuid bcryptjs
```

### 2. Configuração do MySQL
Copie e configure o arquivo de conexão MySQL:
```bash
cp scripts/mysql-config.example.js scripts/mysql-config.js
```

Edite `mysql-config.js` com suas credenciais:
```javascript
module.exports = {
  mysql: {
    host: 'seu-servidor-mysql',
    port: 3306,
    user: 'seu_usuario',
    password: 'sua_senha',
    database: 'banco_legado',
    charset: 'utf8mb4'
  }
};
```

### 3. Variáveis de Ambiente (Alternativa)
```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=root
export MYSQL_PASSWORD=sua_senha
export MYSQL_DATABASE=banco_legado
```

### 4. Tabelas Necessárias
- **MySQL**: Tabela `user` deve existir
- **PostgreSQL**: Tabela `users` deve existir (execute migrações)
- **PostgreSQL**: Tabela `roles` deve conter o role TEACHER

## Uso

### Migração MySQL → PostgreSQL

```bash
# Navegar para o diretório do backend
cd backend

# Configurar credenciais MySQL (escolha uma opção):

# Opção 1: Arquivo de configuração
cp scripts/mysql-config.example.js scripts/mysql-config.js
# Edite mysql-config.js com suas credenciais

# Opção 2: Variáveis de ambiente
export MYSQL_HOST=localhost
export MYSQL_USER=root
export MYSQL_PASSWORD=sua_senha
export MYSQL_DATABASE=banco_legado

# Executar a migração
node scripts/import-legacy-users-mysql-to-postgres.js
```

**Vantagens do script MySQL → PostgreSQL**:
- Conecta em bancos diferentes simultaneamente
- Migração direta sem arquivos intermediários
- Logs detalhados de ambas as conexões
- Mapeamento automático de tipos de dados
- Tratamento de charset UTF-8

## Mapeamento de Campos

O script mapeia automaticamente os seguintes campos:

| Campo MySQL (Legado) | Campo PostgreSQL (Atual) | Observações |
|---------------------|---------------------------|-------------|
| `id` | `user_id_legacy` | ID original preservado |
| `email` | `email` | Gerado se não existir |
| `password` | `password` | Hasheado se necessário |
| `full_name` | `name` | Nome completo do usuário |
| `cpf` | `cpf` | CPF do usuário |
| `phone`, `telefone` | `phone` | Telefone |
| `birth_date`, `data_nascimento` | `birth_date` | Data de nascimento |
| `address`, `endereco` | `address` | Endereço |
| `city`, `cidade` | `city` | Cidade |
| `state`, `estado` | `state` | Estado |
| `zip_code`, `cep` | `zip_code` | CEP |
| `is_active`, `ativo` | `is_active` | Status ativo |
| `institution_id` | `institution_id` | ID da instituição |
| `school_id` | `school_id` | ID da escola |
| `created_at`, `data_criacao` | `created_at` | Data de criação |
| `updated_at`, `data_atualizacao` | `updated_at` | Data de atualização |

## Arquivos Gerados

### Mapeamento de IDs
```
mysql_to_postgres_id_mapping_YYYY-MM-DDTHH-MM-SS.json
```
Contém o mapeamento entre IDs MySQL (integer) e PostgreSQL UUIDs.

### Relatório de Erros
```
mysql_to_postgres_errors_YYYY-MM-DDTHH-MM-SS.json
```
Lista todos os erros encontrados durante a migração.

## Verificações de Segurança

O script realiza as seguintes verificações:

1. ✅ Conecta e verifica tabela `user` no MySQL
2. ✅ Conecta e verifica tabela `users` no PostgreSQL  
3. ✅ Verifica se o role TEACHER existe no PostgreSQL
4. ✅ Evita duplicatas por email
5. ✅ Evita duplicatas por user_id_legacy
6. ✅ Usa transações para garantir consistência
7. ✅ Fecha conexões adequadamente

## Exemplo de Saída

```
🚀 Iniciando migração MySQL → PostgreSQL...
============================================================
🔌 Conectando ao MySQL...
✅ Conectado ao MySQL
✅ Role TEACHER encontrada: Professor
📊 Registros no MySQL "user": 250
📊 Registros no PostgreSQL "users": 5

📥 Carregando usuários do MySQL...
✅ 250 usuários carregados do MySQL

🔄 Iniciando processo de migração...
------------------------------------------------------------
📈 Progresso: 50/250 usuários migrados
📈 Progresso: 100/250 usuários migrados
📈 Progresso: 150/250 usuários migrados
📈 Progresso: 200/250 usuários migrados
📈 Progresso: 250/250 usuários migrados

💾 Mapeamento de IDs salvo em: mysql_to_postgres_id_mapping_2024-01-15T14-30-45.json

============================================================
📊 RELATÓRIO FINAL DA MIGRAÇÃO
============================================================
🔄 Origem: MySQL (localhost:3306/legado_db)
🎯 Destino: PostgreSQL
✅ Usuários migrados com sucesso: 247
⏭️  Usuários ignorados (duplicados): 3
❌ Erros durante a migração: 0
📈 Total de usuários no PostgreSQL: 252
🎯 Role definida para todos: TEACHER (5b80c403-086b-414f-8501-10cff41fc6c3)

✨ Migração concluída com sucesso!
🔌 Conexão MySQL fechada
🔌 Conexão PostgreSQL fechada
```

## Solução de Problemas

### Erro: Conexão MySQL recusada
```bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Testar conexão manualmente
mysql -h localhost -u root -p

# Verificar firewall/porta
telnet localhost 3306
```

### Erro: Tabela "user" não encontrada no MySQL
```sql
-- Verificar tabelas existentes
SHOW TABLES;

-- Verificar estrutura da tabela
DESCRIBE user;
```

### Erro: Role TEACHER não encontrada no PostgreSQL
```bash
# Executar seeds do PostgreSQL
npm run seed

# Verificar roles existentes
psql -c "SELECT id, name FROM roles;"
```

### Erro: Charset/Encoding
- O script usa `utf8mb4` para MySQL
- Certifique-se de que os dados estão em UTF-8
- Verifique configurações de charset no MySQL

### Performance Lenta
- Ajuste `batchSize` no arquivo de configuração
- Considere criar índices temporários
- Execute em horários de menor uso

## Próximos Passos

Após a migração bem-sucedida:

1. **Verificar dados**: Compare contagens e amostras entre MySQL e PostgreSQL
2. **Testar login**: Confirme se os usuários conseguem fazer login
3. **Notificar usuários**: Informe sobre credenciais (senha padrão: `senha123`)
4. **Configurar instituições**: Associe usuários às instituições corretas
5. **Backup do MySQL**: Faça backup antes de desativar o sistema legado
6. **Monitorar**: Acompanhe logs por alguns dias após a migração

## Rollback

Em caso de problemas:

```sql
-- PostgreSQL: Remover usuários migrados
DELETE FROM users WHERE user_id_legacy IS NOT NULL;

-- Verificar limpeza
SELECT COUNT(*) FROM users WHERE user_id_legacy IS NOT NULL;
```

## Suporte

Em caso de problemas:

1. Verifique logs detalhados do script
2. Consulte arquivos de erro gerados
3. Teste conexões MySQL e PostgreSQL separadamente
4. Verifique configurações de charset e timezone
5. Confirme se todas as dependências estão instaladas
``` 