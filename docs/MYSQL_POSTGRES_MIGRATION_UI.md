# Interface de Migração MySQL → PostgreSQL

## 📋 Visão Geral

A interface de migração MySQL → PostgreSQL é uma ferramenta visual completa que permite aos administradores do sistema configurar e executar migrações de dados do MySQL para PostgreSQL de forma intuitiva e controlada.

## 🔐 Acesso

**Permissões Necessárias:**
- Apenas usuários com role `SYSTEM_ADMIN` podem acessar esta funcionalidade
- Acesso via menu: `Admin` → `Migração de Dados` → `Migração MySQL → PostgreSQL`
- URL: `/admin/migration/mysql-postgres`

## 🚀 Funcionalidades

### 1. **Configuração de Conexão MySQL**
- Configuração visual dos parâmetros de conexão
- Teste de conectividade em tempo real
- Validação de credenciais
- Suporte a diferentes portas e hosts

### 2. **Seleção de Tabelas**
- Listagem automática de todas as tabelas do MySQL
- Contagem de registros por tabela
- Seleção múltipla de tabelas para migração
- Mapeamento automático de nomes (MySQL → PostgreSQL)
- Estatísticas em tempo real (tabelas selecionadas, registros estimados)

### 3. **Mapeamento de Colunas**
- Visualização detalhada da estrutura de cada tabela
- Mapeamento automático de tipos MySQL → PostgreSQL
- Edição manual de nomes de colunas e tipos
- Visualização de constraints e chaves estrangeiras
- Validação de compatibilidade de tipos

### 4. **Execução da Migração**
- Resumo completo da configuração antes da execução
- Logs em tempo real durante a migração
- Barra de progresso visual
- Tratamento de erros e avisos
- Relatório final com estatísticas

## 📱 Interface

### **Navegação por Abas**
A interface é organizada em 4 abas sequenciais:

1. **🔌 Conexão MySQL** - Configurar e testar conexão
2. **📋 Selecionar Tabelas** - Escolher tabelas para migração
3. **🔄 Mapear Colunas** - Revisar mapeamento de colunas
4. **▶️ Executar Migração** - Executar e monitorar migração

### **Recursos Visuais**
- ✅ Indicadores de status em tempo real
- 📊 Estatísticas dinâmicas
- 🔍 Logs detalhados com timestamps
- ⚠️ Notificações de sucesso/erro/aviso
- 📈 Barras de progresso animadas

## ⚙️ Configuração

### **Parâmetros de Conexão MySQL**
```
Host: endereço do servidor MySQL
Porta: porta do MySQL (padrão: 3306)
Usuário: usuário com permissões de leitura
Senha: senha do usuário
Banco: nome do banco de dados
```

### **Mapeamento Automático**
O sistema realiza mapeamento automático baseado em convenções:

**Tabelas:**
- `usuarios` → `users`
- `instituicoes` → `institutions`
- `escolas` → `schools`
- `colecoes` → `collections`
- `arquivos` → `files`

**Tipos de Dados:**
- `int` → `integer`
- `bigint` → `bigint`
- `varchar(n)` → `varchar(n)`
- `text` → `text`
- `datetime` → `timestamp`
- `tinyint(1)` → `boolean`
- `decimal` → `decimal`

## 🔧 Funcionalidades Técnicas

### **APIs Disponíveis**
- `POST /api/migration/test-mysql-connection` - Testar conexão MySQL
- `POST /api/migration/mysql-tables` - Listar tabelas MySQL
- `POST /api/migration/mysql-columns` - Obter estrutura de colunas
- `POST /api/migration/execute` - Executar migração

### **Recursos de Segurança**
- Validação de entrada em todas as APIs
- Timeout de conexão configurável
- Tratamento seguro de senhas
- Logs de auditoria
- Verificação de permissões

### **Tratamento de Erros**
- Conexão MySQL indisponível
- Credenciais inválidas
- Tabelas inexistentes
- Conflitos de tipos de dados
- Falhas de rede
- Problemas de memória

## 📊 Monitoramento

### **Logs em Tempo Real**
- ✅ **Sucessos** - Operações concluídas
- ⚠️ **Avisos** - Situações que requerem atenção
- ❌ **Erros** - Falhas que impedem a migração
- ℹ️ **Informações** - Status geral da operação

### **Estatísticas**
- Número de tabelas processadas
- Total de registros migrados
- Tempo de execução
- Taxa de sucesso
- Erros e avisos

## 🔄 Fluxo de Trabalho

### **1. Preparação**
1. Acesse a interface como SYSTEM_ADMIN
2. Configure as credenciais MySQL
3. Teste a conexão

### **2. Seleção**
1. Revise a lista de tabelas encontradas
2. Selecione as tabelas desejadas
3. Verifique as estatísticas

### **3. Configuração**
1. Revise o mapeamento de colunas
2. Ajuste nomes e tipos se necessário
3. Valide as configurações

### **4. Execução**
1. Revise o resumo final
2. Inicie a migração
3. Monitore os logs em tempo real
4. Aguarde a conclusão

### **5. Verificação**
1. Revise o relatório final
2. Verifique logs de erro/aviso
3. Valide os dados migrados
4. Documente o processo

## ⚠️ Considerações Importantes

### **Pré-requisitos**
- PostgreSQL configurado e acessível
- MySQL com dados a serem migrados
- Credenciais com permissões adequadas
- Espaço suficiente no PostgreSQL

### **Limitações**
- Migração apenas de estrutura e dados básicos
- Procedures e triggers não são migrados
- Alguns tipos específicos podem precisar ajuste manual
- Chaves estrangeiras podem precisar recriação

### **Boas Práticas**
- Sempre teste em ambiente de desenvolvimento primeiro
- Faça backup do PostgreSQL antes da migração
- Execute em horários de baixo uso
- Monitore o desempenho durante a migração
- Valide os dados após a conclusão

## 🆘 Solução de Problemas

### **Erro de Conexão MySQL**
```
Verificar:
- Host e porta corretos
- Credenciais válidas
- Firewall liberado
- Servidor MySQL ativo
```

### **Erro de Mapeamento**
```
Verificar:
- Tipos de dados compatíveis
- Nomes de colunas válidos
- Constraints conflitantes
- Chaves primárias duplicadas
```

### **Erro de Performance**
```
Verificar:
- Memória disponível
- Espaço em disco
- Conexões simultâneas
- Tamanho dos lotes
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte os logs detalhados da interface
2. Verifique a documentação técnica
3. Entre em contato com o suporte técnico
4. Documente erros para análise posterior

---

**Versão:** 1.0  
**Última Atualização:** 2024-01-XX  
**Compatibilidade:** MySQL 5.7+, PostgreSQL 12+ 