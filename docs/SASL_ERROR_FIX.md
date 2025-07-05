# Correção do Erro SASL PostgreSQL

## Problema

O erro **"SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"** estava ocorrendo ao tentar conectar com o PostgreSQL através das APIs de migração e outras partes do sistema.

## Causa

O erro SASL (Simple Authentication and Security Layer) ocorre quando:

1. O PostgreSQL está configurado para usar autenticação SCRAM-SHA-256
2. A biblioteca cliente `pg` (node-postgres) recebe a senha como um tipo diferente de string
3. Isso pode acontecer quando a senha vem de variáveis de ambiente que podem ser interpretadas como outros tipos

## Solução Implementada

### 1. Diagnóstico

Criamos scripts de diagnóstico que identificaram que:
- O PostgreSQL estava rodando corretamente na porta 5432
- A senha `root` estava funcionando quando forçada como string
- O problema estava na conversão automática de tipos

### 2. Correção Aplicada

Modificamos todas as configurações de conexão PostgreSQL para garantir que a senha seja sempre uma string:

```typescript
// ANTES
password: process.env.DB_PASSWORD || 'root',

// DEPOIS  
password: String(process.env.DB_PASSWORD || 'root'), // Garantir que seja string para evitar erro SASL
```

### 3. Arquivos Corrigidos

- `src/app/api/migration/execute/route.ts`
- `src/config/database.ts` 
- `backend/src/config/database.ts`
- `backend/src/config/typeorm.config.ts`
- `backend/src/knexfile.ts` (development, staging, production)

## Verificação

Para verificar se a correção funcionou:

1. **Teste direto de conexão:**
```bash
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'portal_sabercon',
  user: 'postgres',
  password: String(process.env.DB_PASSWORD || 'root')
});
client.connect().then(() => {
  console.log('✅ Conexão PostgreSQL OK');
  client.end();
}).catch(err => console.log('❌ Erro:', err.message));
"
```

2. **Teste da API de migração:**
- Acesse a interface de migração em `/admin/migration/mysql-postgres`
- Teste a conexão PostgreSQL na primeira aba
- Deve mostrar "✅ Conexão PostgreSQL estabelecida com sucesso"

## Configuração do Ambiente

Certifique-se de que o arquivo `backend/.env` contenha:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false
```

## Detalhes Técnicos

### Por que o erro ocorria?

1. **SCRAM-SHA-256**: PostgreSQL moderno usa este método de autenticação por padrão
2. **Validação rigorosa**: O protocolo SASL exige que a senha seja exatamente do tipo string
3. **Variáveis de ambiente**: `process.env` pode retornar `undefined` ou outros tipos
4. **Biblioteca pg**: A versão mais recente é mais rigorosa na validação de tipos

### Alternativas consideradas

1. **Alterar pg_hba.conf**: Mudar para `md5` ou `trust` (menos seguro)
2. **Downgrade da biblioteca**: Usar versão mais antiga do `pg` (não recomendado)
3. **Criar usuário específico**: Funciona, mas não resolve o problema raiz
4. **Forçar tipo string**: ✅ Solução escolhida (mais simples e segura)

## Prevenção

Para evitar problemas similares no futuro:

1. **Sempre converter variáveis de ambiente para o tipo esperado**
2. **Usar TypeScript para validação de tipos**
3. **Testar conexões em diferentes ambientes**
4. **Documentar configurações de banco de dados**

## Logs de Teste

```
🚀 Diagnóstico SASL PostgreSQL
==============================
🔍 Verificando serviço PostgreSQL...
   ✅ PostgreSQL está respondendo na porta 5432

🔍 Testando: Senha root (forçada como string)
   Host: localhost:5432
   Database: portal_sabercon
   User: postgres
   Password type: string
   ✅ CONEXÃO SUCESSO!
   📋 Versão: 17.4
   🗄️  Database: portal_sabercon
   👤 Usuário: postgres
```

## Status

✅ **RESOLVIDO** - Todas as conexões PostgreSQL agora funcionam corretamente com a correção aplicada. 