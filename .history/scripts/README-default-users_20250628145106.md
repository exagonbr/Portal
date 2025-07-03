# Scripts de Inserção de Usuários Padrão

Este diretório contém scripts para inserir os usuários padrão do sistema Portal diretamente no banco de dados PostgreSQL.

## 📋 Usuários Padrão

Os seguintes usuários serão criados:

| Email | Nome | Role | Instituição |
|-------|------|------|-------------|
| admin@sabercon.edu.br | Administrador do Sistema | SYSTEM_ADMIN | Sabercon Educação |
| gestor@sabercon.edu.br | Gestor Institucional | INSTITUTION_MANAGER | Sabercon Educação |
| professor@sabercon.edu.br | Professor do Sistema | TEACHER | Sabercon Educação |
| julia.c@ifsp.com | Julia Costa Ferreira | STUDENT | IFSP |
| coordenador@sabercon.edu.com | Coordenador Acadêmico | ACADEMIC_COORDINATOR | Sabercon Educação |
| renato@gmail.com | Renato Oliveira Silva | GUARDIAN | Sabercon Educação |

**Senha padrão para todos:** `password123`

## 🚀 Como Usar

### Opção 1: Usando o script wrapper (Recomendado para Produção)

```bash
# Tornar o script executável
chmod +x scripts/insert-default-users-prod.sh

# Executar o script (irá carregar variáveis do .env automaticamente)
./scripts/insert-default-users-prod.sh
```

### Opção 2: Executando diretamente com variáveis de ambiente

```bash
# Tornar o script executável
chmod +x scripts/insert-default-users.sh

# Definir variáveis de ambiente
export DB_HOST=seu-host-producao
export DB_PORT=5432
export DB_NAME=portal
export DB_USER=seu-usuario
export DB_PASSWORD=sua-senha

# Executar o script
./scripts/insert-default-users.sh
```

### Opção 3: Passando variáveis inline

```bash
DB_HOST=seu-host DB_PASSWORD=sua-senha ./scripts/insert-default-users.sh
```

## 📁 Arquivos

- **`insert-default-users.sh`**: Script principal que executa as inserções SQL
- **`insert-default-users-prod.sh`**: Script wrapper que carrega variáveis do .env e executa o script principal
- **`check-db-structure.sh`**: Script para verificar a estrutura das tabelas no banco
- **`fix-user-table.sh`**: Script para corrigir problemas na tabela 'user' (adiciona colunas faltantes)
- **`README-default-users.md`**: Esta documentação

## ⚙️ O que o script faz

1. **Verifica conexão** com o banco de dados
2. **Cria instituições**:
   - Sabercon Educação
   - Instituto Federal de São Paulo (IFSP)
3. **Cria roles e permissões**:
   - SYSTEM_ADMIN com permissões completas
   - INSTITUTION_MANAGER para gestão institucional
   - TEACHER para professores
   - STUDENT para alunos
   - ACADEMIC_COORDINATOR para coordenadores
   - GUARDIAN para responsáveis
4. **Verifica tabelas** existentes (`users` e/ou `user`)
5. **Cria/atualiza usuários** em todas as tabelas encontradas

## 🔒 Segurança

- O script usa um hash bcrypt pré-gerado para a senha `password123`
- Não expõe senhas em texto plano nos logs
- Verifica se usuários já existem antes de criar (evita duplicatas)
- Atualiza usuários existentes mantendo seus dados

## ⚠️ Avisos Importantes

1. **SEMPRE** teste primeiro em um ambiente de desenvolvimento
2. O script pedirá confirmação antes de executar em produção
3. Certifique-se de ter backup do banco antes de executar
4. Altere as senhas padrão após o primeiro login

## 🐛 Troubleshooting

### Erro de conexão
```bash
❌ Erro: Não foi possível conectar ao banco de dados
```
**Solução**: Verifique as variáveis de ambiente e credenciais do banco

### Tabelas não encontradas
```bash
❌ Erro: Nenhuma tabela de usuários encontrada (nem 'users' nem 'user')
```
**Solução**: Verifique se as migrações do banco foram executadas

### Erro: column "email" does not exist
```bash
ERROR: column "email" does not exist
```
**Solução**: A tabela 'user' pode ter uma estrutura diferente. Execute o script de correção:
```bash
bash scripts/fix-user-table.sh
```

### Erro: column "updated_at" does not exist
```bash
ERROR: column "updated_at" of relation "institution" does not exist
```
**Solução**: Este erro é tratado automaticamente pelo script, que detecta se a coluna existe antes de usá-la

### Verificar estrutura do banco
Para diagnosticar problemas, você pode verificar a estrutura das tabelas:
```bash
bash scripts/check-db-structure.sh
```

### Permissão negada
```bash
bash: ./scripts/insert-default-users.sh: Permission denied
```
**Solução**: Execute `chmod +x scripts/*.sh` para tornar os scripts executáveis

## 📝 Logs

O script exibe logs coloridos indicando:
- ✅ Operações bem-sucedidas (verde)
- ↻ Atualizações de registros existentes (amarelo)
- ❌ Erros (vermelho)
- 📋 Informações gerais (azul)

## 🔄 Execução Repetida

O script é **idempotente**, ou seja, pode ser executado múltiplas vezes sem causar problemas:
- Usuários existentes são atualizados, não duplicados
- Roles e permissões existentes são reutilizadas
- Instituições existentes são atualizadas

## 📞 Suporte

Em caso de problemas, verifique:
1. Os logs de execução do script
2. Os logs do PostgreSQL
3. A conectividade com o banco de dados
4. As permissões do usuário do banco
5. A estrutura das tabelas usando `scripts/check-db-structure.sh`

## 🔧 Scripts Auxiliares

### check-db-structure.sh
Verifica a estrutura de todas as tabelas relevantes:
```bash
bash scripts/check-db-structure.sh
```

### fix-user-table.sh
Corrige problemas na tabela 'user' adicionando colunas faltantes:
```bash
bash scripts/fix-user-table.sh
```

## ⚡ Execução Rápida para Produção

```bash
# 1. Verificar estrutura (opcional)
bash scripts/check-db-structure.sh

# 2. Corrigir tabela user se necessário (opcional)
bash scripts/fix-user-table.sh

# 3. Inserir usuários padrão
bash scripts/insert-default-users-prod.sh
```