# Sistema de Gestão de Permissões - Portal Educacional

## Visão Geral

O sistema de gestão de permissões foi completamente refatorado para ser modular, personalizável e integrado com as definições específicas do sistema educacional. O novo sistema permite criar e gerenciar funções personalizadas baseadas em permissões granulares e categorizadas.

## Principais Funcionalidades

### 🏗️ Arquitetura Modular

- **Roles do Sistema**: Funções pré-definidas baseadas no arquivo `roles.ts`
- **Roles Personalizadas**: Funções criadas pelos administradores
- **Permissões Categorizadas**: Organizadas em 7 grupos funcionais
- **Interface Unificada**: Sistema integrado para gerenciar ambos os tipos

### 📊 Estatísticas em Tempo Real

- Total de funções (sistema + personalizadas)
- Funções ativas/inativas
- Distribuição de usuários
- Grupos de permissões disponíveis

### 🎛️ Operações CRUD Completas

- **Criar**: Novas funções personalizadas com permissões específicas
- **Ler**: Visualizar todas as funções e suas permissões
- **Atualizar**: Editar informações e permissões (apenas roles personalizadas)
- **Deletar**: Remover funções personalizadas (com validações)

### 🔄 Funcionalidades Avançadas

- **Clonagem**: Duplicar funções existentes como base para novas
- **Visualização de Permissões**: Interface detalhada para cada grupo
- **Proteção de Sistema**: Roles do sistema são somente leitura
- **Validação de Dependências**: Impede exclusão de roles em uso

## Estrutura de Permissões

### 1. Gestão do Sistema
- Gerenciar Sistema
- Gerenciar Instituições
- Gerenciar Usuários Globais
- Visualizar Análises do Sistema
- Gerenciar Políticas de Segurança

### 2. Gestão Institucional
- Gerenciar Escolas
- Gerenciar Usuários da Instituição
- Gerenciar Turmas
- Gerenciar Horários
- Visualizar Análises Institucionais

### 3. Gestão Acadêmica
- Gerenciar Ciclos Educacionais
- Gerenciar Currículo
- Monitorar Professores
- Visualizar Análises Acadêmicas
- Coordenar Departamentos

### 4. Ensino
- Gerenciar Presença
- Gerenciar Notas
- Gerenciar Planos de Aula
- Enviar Recursos
- Comunicar com Alunos/Responsáveis

### 5. Acesso do Aluno
- Visualizar Próprio Horário
- Visualizar Próprias Notas
- Acessar Materiais de Aprendizagem
- Enviar Tarefas
- Acompanhar Próprio Progresso
- Enviar Mensagens para Professores

### 6. Acesso do Responsável
- Visualizar Informações dos Filhos
- Visualizar Notas dos Filhos
- Visualizar Presença dos Filhos
- Acompanhar Tarefas
- Receber Comunicados
- Comunicar com a Escola
- Agendar Reuniões

### 7. Acesso Financeiro
- Visualizar Informações Financeiras
- Visualizar Pagamentos
- Visualizar Boletos
- Visualizar Histórico Financeiro

## Roles do Sistema Pré-definidas

### 🔴 SYSTEM_ADMIN
**Administrador do Sistema**
- Acesso completo a todas as funcionalidades
- Supervisão de toda a infraestrutura
- Gerenciamento de políticas de segurança

### 🟣 INSTITUTION_MANAGER
**Gestor Institucional**
- Gerenciamento de escolas e unidades
- Administração de usuários institucionais
- Coordenação de atividades acadêmicas

### 🔵 ACADEMIC_COORDINATOR
**Coordenador Acadêmico**
- Supervisão de ciclos educacionais
- Monitoramento de professores
- Coordenação pedagógica

### 🟢 TEACHER
**Professor**
- Gerenciamento de turmas
- Lançamento de notas e presença
- Comunicação com alunos e responsáveis

### 🟡 STUDENT
**Aluno**
- Acesso ao ambiente de aprendizagem
- Visualização de notas e horários
- Submissão de trabalhos

### 🟠 GUARDIAN
**Responsável**
- Acompanhamento do progresso dos filhos
- Acesso a informações acadêmicas e financeiras
- Comunicação com a escola

## Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Custom Hooks** para lógica de estado
- **Material Symbols** para ícones

### Gerenciamento de Estado
- **useState** para estado local
- **useMemo** para otimização de performance
- **Custom Hook** (`useRoleManagement`) para lógica centralizada

### Tipagem TypeScript
- Interfaces bem definidas
- Tipos union para flexibilidade
- Generics para reutilização

## Estrutura de Arquivos

```
src/
├── types/
│   ├── roles.ts                    # Definições das roles do sistema
│   └── roleManagement.ts           # Tipos para o sistema de gestão
├── hooks/
│   └── useRoleManagement.ts        # Hook principal de gerenciamento
├── app/admin/roles/
│   └── page.tsx                    # Interface principal
└── docs/
    └── ROLE_MANAGEMENT_SYSTEM.md   # Esta documentação
```

## Como Usar

### 1. Acessar o Sistema
```typescript
// Navegue para /admin/roles
// Apenas usuários com permissão adequada podem acessar
```

### 2. Criar Nova Função
```typescript
// Clique em "Nova Função"
// Defina nome e descrição
// Selecione permissões por categoria
// Confirme a criação
```

### 3. Editar Função Existente
```typescript
// Clique no ícone de edição
// Modifique informações básicas
// Roles do sistema são protegidas contra edição
```

### 4. Gerenciar Permissões
```typescript
// Clique no ícone de segurança
// Visualize/edite permissões por categoria
// Roles do sistema são somente leitura
```

### 5. Clonar Função
```typescript
// Clique no ícone de cópia
// Uma nova função é criada baseada na original
// Pode ser editada livremente
```

## Validações e Regras

### ✅ Validações Implementadas
- Nomes de função obrigatórios e únicos
- Descrições obrigatórias
- Pelo menos uma permissão deve ser selecionada
- Roles do sistema não podem ser editadas/deletadas
- Roles em uso não podem ser deletadas

### 🔒 Regras de Segurança
- Apenas administradores podem acessar o sistema
- Roles do sistema são protegidas
- Auditoria de alterações (timestamps)
- Validação de permissões antes de operações

## Extensibilidade

### Adicionar Novas Permissões
1. Atualizar `RolePermissions` interface
2. Adicionar à categoria apropriada em `PERMISSION_GROUPS`
3. Implementar a lógica de validação

### Adicionar Novos Grupos
1. Criar novo grupo em `PERMISSION_GROUPS`
2. Definir permissões relacionadas
3. Atualizar interfaces se necessário

### Integração com Backend
O sistema está preparado para integração com APIs:
- Interfaces compatíveis com estruturas REST
- Hooks isolam lógica de estado
- Tipos TypeScript facilitam validação

## Benefícios da Refatoração

### 🎯 Modularidade
- Componentes reutilizáveis
- Separação clara de responsabilidades
- Fácil manutenção e extensão

### 🔧 Personalização
- Criação de roles específicas
- Permissões granulares
- Flexibilidade para diferentes cenários

### 📈 Escalabilidade
- Suporte a grandes volumes de dados
- Performance otimizada
- Arquitetura preparada para crescimento

### 🎨 Usabilidade
- Interface intuitiva
- Feedback visual claro
- Navegação simplificada

## Próximos Passos

1. **Integração com Backend**: Conectar com APIs reais
2. **Auditoria Avançada**: Log detalhado de alterações
3. **Importação/Exportação**: Backup e migração de configurações
4. **Templates de Roles**: Conjuntos pré-definidos para diferentes cenários
5. **Validação Avançada**: Regras de negócio mais complexas 