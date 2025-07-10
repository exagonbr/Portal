# 🚀 Scripts de Teste da API - Portal Educacional

Este conjunto de scripts foi criado para testar todas as rotas da API do Portal Educacional de forma automatizada e abrangente.

## 📋 Scripts Disponíveis

### 1. `test-services.sh` - Testes de Leitura (GET)
- **Propósito**: Testa todas as rotas GET da API
- **Cobertura**: 17 categorias de endpoints
- **Funcionalidades**:
  - ✅ Verificação de conectividade com o servidor
  - ✅ Autenticação automática
  - ✅ Testes organizados por categoria
  - ✅ Códigos de status HTTP detalhados
  - ✅ Estatísticas finais com taxa de sucesso
  - ✅ Logs coloridos e informativos

### 2. `test-crud-services.sh` - Testes CRUD
- **Propósito**: Testa operações CREATE, READ, UPDATE, DELETE
- **Funcionalidades**:
  - ✅ Criação de registros de teste
  - ✅ Leitura e validação
  - ✅ Atualização de dados
  - ✅ Limpeza automática dos dados criados
  - ✅ Rastreamento de IDs criados
  - ✅ Códigos de status HTTP específicos

### 3. `run-all-tests.sh` - Script Principal
- **Propósito**: Interface unificada para executar todos os testes
- **Funcionalidades**:
  - ✅ Menu interativo
  - ✅ Execução via linha de comando
  - ✅ Verificação de dependências
  - ✅ Relatório consolidado

## 🔧 Configuração

### Pré-requisitos
- Servidor da API rodando na porta 3001
- Usuário admin com credenciais válidas
- `curl` instalado no sistema

### Configuração das Credenciais
Por padrão, os scripts usam:
- **Email**: `admin@sabercon.edu.br`
- **Senha**: `password`
- **URL da API**: `http://localhost:3001`

Para alterar, edite as variáveis no início de cada script:
```bash
EMAIL="seu-email@exemplo.com"
PASSWORD="sua-senha"
API_URL="http://seu-servidor:porta"
```

## 🚀 Como Usar

### Opção 1: Script Principal (Recomendado)
```bash
# Menu interativo
./run-all-tests.sh

# Ou executar diretamente via linha de comando
./run-all-tests.sh read    # Apenas testes de leitura
./run-all-tests.sh crud    # Apenas testes CRUD
./run-all-tests.sh all     # Todos os testes
```

### Opção 2: Scripts Individuais
```bash
# Testes de leitura
./test-services.sh

# Testes CRUD
./test-crud-services.sh
```

## 📊 Categorias de Testes

### Testes de Leitura (GET)
1. **Sistema e Saúde** - Health checks
2. **Autenticação e Sessões** - Login, perfil, sessões
3. **Usuários** - Gestão de usuários
4. **Instituições** - Gestão de instituições
5. **Escolas** - Gestão de escolas
6. **Roles e Permissões** - Sistema de autorização
7. **Cursos e Conteúdo** - Conteúdo educacional
8. **Conteúdo Multimídia** - Vídeos, livros, coleções
9. **Metadados** - Tags, gêneros, autores
10. **Sistema Educacional** - Etapas, ciclos, períodos
11. **Avaliação** - Questionários, questões, certificados
12. **Comunicação** - Notificações, fórum, chat
13. **Dashboard** - Analytics e métricas
14. **Atividades** - Tracking e relatórios
15. **Configurações** - Settings do sistema
16. **Arquivos** - Gestão de arquivos e AWS
17. **Rotas Públicas** - Endpoints públicos

### Testes CRUD
1. **Roles** - Criar, ler, atualizar roles
2. **Usuários** - Gestão completa de usuários
3. **Instituições** - CRUD de instituições
4. **Escolas** - CRUD de escolas
5. **Cursos** - CRUD de cursos
6. **Unidades** - CRUD de unidades
7. **Turmas** - CRUD de turmas
8. **Questionários** - CRUD de questionários
9. **Questões** - CRUD de questões
10. **Notificações** - CRUD de notificações
11. **Livros** - CRUD de livros
12. **Certificados** - CRUD de certificados
13. **Configurações** - Leitura de configurações
14. **Tags e Metadados** - CRUD de metadados
15. **Fórum** - CRUD de tópicos
16. **Anúncios** - CRUD de anúncios

## 📈 Interpretando os Resultados

### Códigos de Status HTTP
- **2xx** - Sucesso (200 OK, 201 Created, 204 No Content)
- **4xx** - Erro do cliente (400 Bad Request, 401 Unauthorized, 404 Not Found)
- **5xx** - Erro do servidor (500 Internal Server Error)

### Estatísticas Finais
```
=== ESTATÍSTICAS FINAIS ===
✅ Testes Passaram: 45
❌ Testes Falharam: 3
📊 Total de Testes: 48
📈 Taxa de Sucesso: 94%
```

## 🐛 Solução de Problemas

### Erro de Conexão
```
[ERROR] Não foi possível conectar ao servidor em http://localhost:3001
```
**Solução**: Verifique se o servidor está rodando na porta correta.

### Erro de Autenticação
```
[ERROR] Falha ao obter token de autenticação
```
**Solução**: Verifique as credenciais de login no script.

### Erro de Permissão
```
chmod: changing permissions: Operation not permitted
```
**Solução**: Use `sudo chmod +x nome-do-script.sh`

### Muitos Testes Falhando
1. Verifique se o banco de dados está configurado
2. Confirme se todas as rotas estão implementadas
3. Verifique os logs do servidor para erros específicos

## 🔧 Personalização

### Modo Debug
Para ativar/desativar logs detalhados:
```bash
# No início do script
DEBUG=1  # Ativado
DEBUG=0  # Desativado
```

### Timeout de Conexão
Para ajustar o timeout:
```bash
# Alterar o valor em segundos
server_check=$(curl -s -m 10 "$API_URL/health" ...)
```

### Adicionar Novos Testes
Para adicionar um novo teste:
```bash
# No test-services.sh
test_endpoint "/api/nova-rota" "GET" "" "Descrição do teste"

# No test-crud-services.sh
test_crud_endpoint "/api/nova-rota" "POST" '{"campo":"valor"}' "Criar novo item" 201
```

## 📝 Logs

Os scripts geram logs coloridos e informativos:
- 🟡 **[INFO]** - Informações gerais
- 🟢 **[SUCCESS]** - Operações bem-sucedidas
- 🔴 **[ERROR]** - Erros e falhas
- 🟡 **[DEBUG]** - Informações detalhadas (modo debug)

## 🤝 Contribuindo

Para contribuir com melhorias:
1. Adicione novos endpoints conforme a API evolui
2. Melhore a cobertura de testes
3. Adicione validações mais específicas
4. Otimize a performance dos testes

## 📄 Licença

Este projeto faz parte do Portal Educacional e segue as mesmas diretrizes de licenciamento. 