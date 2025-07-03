# Migração MySQL → PostgreSQL: Funcionalidade DROP CASCADE

## 📋 Resumo da Implementação

Foi implementada uma nova funcionalidade na interface de migração MySQL → PostgreSQL que permite **recriar tabelas completamente** usando `DROP CASCADE`, garantindo consistência total dos dados.

## 🆕 Nova Funcionalidade: Recriar Tabelas

### Opções de Migração Disponíveis

Na aba "Executar Migração", agora existem 3 modos de operação:

#### 1. 🛡️ **Modo Incremental (Padrão)**
- **Preservar Dados Existentes**: ✅ Ativado
- **Recriar Tabelas**: ❌ Desativado
- **Comportamento**: Adiciona apenas dados novos, evita duplicatas
- **Uso**: Migrações incrementais e atualizações

#### 2. 📝 **Modo Sobrescrever**
- **Preservar Dados Existentes**: ❌ Desativado  
- **Recriar Tabelas**: ❌ Desativado
- **Comportamento**: Limpa tabela (TRUNCATE) e adiciona todos os dados
- **Uso**: Atualização completa de dados existentes

#### 3. 🔥 **Modo Recriar Tabelas (DESTRUTIVO)**
- **Recriar Tabelas**: ✅ Ativado
- **Comportamento**: DROP CASCADE + recriação completa
- **Uso**: Garantir consistência total, mudanças estruturais

## ⚠️ Modo DROP CASCADE

### O que faz:
1. **DROP TABLE ... CASCADE**: Remove a tabela e TODAS as dependências
2. **Recriação**: Cria a tabela do zero baseada na estrutura MySQL
3. **Migração**: Adiciona todos os dados do MySQL
4. **Índices**: Recria índices automaticamente

### Vantagens:
- ✅ **Consistência Total**: Estrutura idêntica ao MySQL
- ✅ **Sem Conflitos**: Remove dependências problemáticas
- ✅ **Dados Limpos**: Sem dados órfãos ou inconsistentes
- ✅ **Estrutura Atualizada**: Reflete mudanças no MySQL

### ⚠️ ATENÇÃO - Operação Destrutiva:
- 🔥 **DELETA PERMANENTEMENTE** a tabela PostgreSQL
- 🔥 **REMOVE DEPENDÊNCIAS** (views, foreign keys, etc.)
- 🔥 **PERDE DADOS** que não existem no MySQL
- 🔥 **IRREVERSÍVEL** - Não há como desfazer

## 🎯 Interface do Usuário

### Seção "Opções de Migração"
```
┌─────────────────────────────────────────┐
│ ⚙️ Opções de Migração                   │
├─────────────────────────────────────────┤
│ ☐ Recriar Tabelas (DROP CASCADE)       │
│   Remove tabelas existentes e recria   │
│   do zero. ATENÇÃO: Remove todos os    │
│   dados existentes e dependências.     │
│                                         │
│ ☑ Preservar Dados Existentes           │
│   Evita duplicar dados já existentes   │
│   no PostgreSQL. Recomendado para      │
│   migrações incrementais.               │
└─────────────────────────────────────────┘
```

### Aviso de Segurança
Quando "Recriar Tabelas" é selecionado:
```
┌─────────────────────────────────────────┐
│ ⚠️ ATENÇÃO: Operação Destrutiva         │
├─────────────────────────────────────────┤
│ Esta opção irá DELETAR PERMANENTEMENTE │
│ todas as tabelas selecionadas e seus   │
│ dados no PostgreSQL, incluindo tabelas │
│ dependentes (CASCADE). Use apenas se   │
│ tiver certeza absoluta.                 │
└─────────────────────────────────────────┘
```

### Resumo Visual
O resumo mostra o modo selecionado:
- 🛡️ **Incremental (Preservar Dados)**
- 📝 **Sobrescrever Dados**  
- 🔥 **Recriar Tabelas (Destrutivo)**

## 🔧 Implementação Técnica

### API Atualizada
```typescript
interface MigrationRequest {
  mysqlConnection: MySQLConnection
  selectedTables: TableMapping[]
  options?: {
    recreateTables: boolean    // Nova opção
    preserveData: boolean      // Opção existente
  }
}
```

### Fluxo de Execução

#### Modo DROP CASCADE:
1. **Verificação**: Tabela existe no PostgreSQL?
2. **DROP CASCADE**: `DROP TABLE IF EXISTS "tabela" CASCADE`
3. **Criação**: Cria tabela baseada na estrutura MySQL
4. **Migração**: Adiciona todos os dados (sem verificação de duplicatas)
5. **Índices**: Cria índices automaticamente

#### Outros Modos:
1. **Criação**: Cria tabela se não existir
2. **Limpeza**: TRUNCATE se não preservar dados
3. **Migração**: Com ou sem verificação de duplicatas
4. **Índices**: Cria índices se necessário

### Logs Detalhados
```
🚀 Iniciando migração MySQL → PostgreSQL
📊 5 tabelas selecionadas para migração
⚙️ Opções: Recriar=true, Preservar=false

🔥 RECREANDO tabela 'users' (DROP CASCADE)...
✅ Tabela 'users' removida com CASCADE
✅ Tabela 'users' criada no PostgreSQL
📊 Migrando dados da tabela 'usuarios' → 'users'
✅ 1,500 registros migrados com sucesso
```

## 🎯 Casos de Uso

### 1. **Primeira Migração**
- **Modo**: Incremental ou Recriar
- **Cenário**: Migração inicial de MySQL para PostgreSQL
- **Recomendação**: Incremental (mais seguro)

### 2. **Correção de Estrutura**
- **Modo**: Recriar Tabelas
- **Cenário**: Estrutura MySQL mudou, PostgreSQL desatualizado
- **Recomendação**: DROP CASCADE para garantir consistência

### 3. **Atualização de Dados**
- **Modo**: Sobrescrever
- **Cenário**: Dados MySQL atualizados, quer substituir PostgreSQL
- **Recomendação**: TRUNCATE + migração completa

### 4. **Migração Incremental**
- **Modo**: Incremental
- **Cenário**: Adicionar apenas novos registros
- **Recomendação**: Preservar dados + verificação de duplicatas

## 🛡️ Segurança

### Validações Implementadas:
- ✅ Confirmação visual obrigatória
- ✅ Avisos destacados para operações destrutivas
- ✅ Logs detalhados de todas as operações
- ✅ Rollback automático em caso de erro crítico

### Recomendações:
1. **Backup**: Sempre faça backup do PostgreSQL antes
2. **Teste**: Use primeiro em ambiente de desenvolvimento
3. **Validação**: Confirme estruturas antes da migração
4. **Monitoramento**: Acompanhe logs durante o processo

## 📊 Exemplo de Uso

### Cenário: Atualização Completa
```
1. Selecionar tabelas: users, posts, comments
2. Escolher: ☑ Recriar Tabelas (DROP CASCADE)
3. Confirmar avisos de segurança
4. Executar migração
5. Resultado: Estrutura 100% idêntica ao MySQL
```

### Logs Esperados:
```
🔥 RECREANDO tabela 'users' (DROP CASCADE)...
🔥 RECREANDO tabela 'posts' (DROP CASCADE)...  
🔥 RECREANDO tabela 'comments' (DROP CASCADE)...
✅ 3 tabelas recriadas com sucesso
📊 Total migrado: 15,000 registros
⏱️ Tempo total: 2m 30s
```

## 🎉 Benefícios

1. **Flexibilidade**: 3 modos para diferentes necessidades
2. **Segurança**: Avisos claros sobre operações destrutivas  
3. **Consistência**: Garantia de estrutura idêntica
4. **Transparência**: Logs detalhados de cada operação
5. **Facilidade**: Interface visual intuitiva

Esta implementação oferece controle total sobre o processo de migração, permitindo desde atualizações incrementais até reconstrução completa do banco de dados PostgreSQL. 