# Configuração das Políticas de Segurança

Este documento explica como configurar e usar a nova tabela de políticas de segurança criada para armazenar todas as configurações da tela de segurança do admin.

## Arquivos Criados

### 1. Migration
- **Arquivo**: `backend/src/database/migrations/20250630214500_create_security_policies_table.js`
- **Função**: Cria a tabela `security_policies` com todas as configurações de segurança

### 2. Seed
- **Arquivo**: `backend/src/database/seeds/20250630214500_security_policies_seed.js`
- **Função**: Insere os valores padrão das configurações de segurança

### 3. Modelo Prisma
- **Arquivo**: `prisma/schema.prisma`
- **Modelo**: `security_policies`
- **Função**: Define o modelo para uso com Prisma ORM

## Estrutura da Tabela

A tabela `security_policies` contém três grupos principais de configurações:

### 🔐 Política de Senhas
- `password_min_length`: Tamanho mínimo da senha (padrão: 8)
- `password_require_uppercase`: Exigir letra maiúscula (padrão: true)
- `password_require_lowercase`: Exigir letra minúscula (padrão: true)
- `password_require_numbers`: Exigir números (padrão: true)
- `password_require_special_chars`: Exigir caracteres especiais (padrão: true)
- `password_expiry_days`: Expiração de senha em dias (padrão: 90)
- `password_prevent_reuse`: Impedir reuso das últimas N senhas (padrão: 5)

### 👤 Política de Contas e Sessões
- `account_max_login_attempts`: Máximo de tentativas de login (padrão: 5)
- `account_lockout_duration_minutes`: Duração do bloqueio em minutos (padrão: 30)
- `account_session_timeout_minutes`: Timeout de sessão em minutos (padrão: 30)
- `account_require_mfa`: Exigir autenticação de dois fatores (padrão: false)
- `account_inactivity_lockout_days`: Bloqueio por inatividade em dias (padrão: 60)

### 🛡️ Política de Dados e Privacidade
- `data_retention_months`: Retenção de dados em meses (padrão: 36)
- `data_encrypt_sensitive_data`: Criptografar dados sensíveis (padrão: true)
- `data_anonymize_deleted_users`: Anonimizar usuários excluídos (padrão: true)
- `data_enable_audit_logging`: Habilitar logs de auditoria (padrão: true)

## Como Executar

### 1. Executar a Migration
```bash
# No diretório backend
npx knex migrate:latest
```

### 2. Executar o Seed
```bash
# No diretório backend
npx knex seed:run --specific=20250630214500_security_policies_seed.js
```

### 3. Gerar Cliente Prisma (se usando Prisma)
```bash
# No diretório raiz do projeto
npx prisma generate
```

## Uso no Código

### Com Knex.js
```javascript
// Buscar configurações
const securityPolicies = await knex('security_policies').first();

// Atualizar configurações
await knex('security_policies')
  .where('id', 1)
  .update({
    password_min_length: 10,
    account_require_mfa: true,
    updated_by: 'admin_user'
  });
```

### Com Prisma
```javascript
// Buscar configurações
const securityPolicies = await prisma.security_policies.findFirst();

// Atualizar configurações
await prisma.security_policies.update({
  where: { id: 1 },
  data: {
    password_min_length: 10,
    account_require_mfa: true,
    updated_by: 'admin_user'
  }
});
```

## Integração com a Tela de Segurança

A tela em `src/app/admin/security/page.tsx` já possui todos os campos correspondentes às colunas da tabela. Para integrar:

1. **Carregar dados**: Buscar as configurações da tabela ao carregar a página
2. **Salvar dados**: Atualizar a tabela quando o formulário for submetido
3. **Validação**: Usar as configurações para validar senhas e políticas no sistema

## Exemplo de Integração

```javascript
// Hook para carregar e salvar configurações
const useSecurityPolicies = () => {
  const [policies, setPolicies] = useState(null);
  
  const loadPolicies = async () => {
    const response = await fetch('/api/admin/security-policies');
    const data = await response.json();
    setPolicies(data);
  };
  
  const savePolicies = async (newPolicies) => {
    await fetch('/api/admin/security-policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPolicies)
    });
  };
  
  return { policies, loadPolicies, savePolicies };
};
```

## Observações

- A tabela é criada com um único registro (ID = 1) que contém todas as configurações globais
- A migration inclui migração automática de dados da tabela `security_settings` antiga, se existir
- Todos os campos têm valores padrão seguros baseados nas melhores práticas de segurança
- Os campos `created_by` e `updated_by` permitem rastrear quem fez as alterações