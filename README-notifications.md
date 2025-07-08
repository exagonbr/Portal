# Refatoração do Sistema de Notificações

Este documento descreve as alterações realizadas no sistema de notificações do Portal Sabercon.

## Principais Mudanças

### 1. Remoção do Menu Interno
- Removido o menu de navegação interna com tabs na página de envio de notificações
- Substituído por uma interface mais limpa e direta

### 2. Novos Componentes
- **EmailSender**: Componente unificado para envio de emails
  - Suporte para templates
  - Campo aberto para destinatários (suporta colar múltiplos emails)
  - Preview em tempo real do email
  - Suporte para conteúdo HTML

- **EmailTemplateManager**: Componente para gerenciar templates de email
  - Visualização, edição e criação de templates
  - Suporte para conteúdo em texto simples e HTML
  - Preview dos templates

### 3. API Refatorada
- Endpoint para envio de emails (`/api/notifications/send`)
  - Suporte para diferentes tipos de destinatários (email, usuário, papel/função)
  - Validação de emails
  - Suporte para conteúdo HTML

- Endpoints para gerenciar templates (`/api/notifications/templates`)
  - Listar todos os templates
  - Criar novo template
  - Obter, atualizar e excluir templates específicos

### 4. Nova Página de Templates
- Adicionada página para gerenciar templates de email em `/notifications/templates`
- Interface completa para criar, editar, visualizar e excluir templates

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (main)/
│   │   └── notifications/
│   │       ├── send/
│   │       │   └── page.tsx       # Página refatorada de envio de notificações
│   │       └── templates/
│   │           └── page.tsx       # Nova página para gerenciar templates
│   └── api/
│       └── notifications/
│           ├── send/
│           │   └── route.ts       # API refatorada para envio de emails
│           ├── templates/
│           │   ├── route.ts       # API para listar e criar templates
│           │   └── [id]/
│           │       └── route.ts   # API para gerenciar templates específicos
└── components/
    └── notifications/
        ├── EmailSender.tsx        # Novo componente para envio de emails
        └── EmailTemplateManager.tsx # Novo componente para gerenciar templates
```

## Fluxo de Uso

1. **Envio de Email**
   - Acesse a página de envio de notificações
   - Selecione um template (opcional)
   - Adicione destinatários (emails, usuários ou papéis)
   - Preencha o assunto e a mensagem
   - Visualize o preview e envie

2. **Gerenciamento de Templates**
   - Acesse a página de templates
   - Visualize a lista de templates disponíveis
   - Crie um novo template ou edite um existente
   - Visualize o preview do template
   - Salve as alterações

## Próximos Passos

- Implementação real da funcionalidade de notificações push
- Integração com serviço de email real
- Suporte para agendamento de envios
- Histórico de notificações enviadas 