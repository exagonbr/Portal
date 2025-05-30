# Sistema de Gerenciamento de Conteúdo S3

Este sistema permite gerenciar arquivos armazenados em buckets S3 da AWS com rastreamento completo no banco de dados.

## 🏗️ Arquitetura

### Componentes Principais

1. **Frontend (React/Next.js)**
   - Interface com 3 abas: Conteúdo Literário, Professor e Aluno
   - Filtros globais (nome, tipo, ordenação)
   - Ações: visualizar, substituir, renomear, mover/copiar, deletar
   - Alertas visuais para arquivos sem referência no banco

2. **Backend (Next.js API Routes)**
   - Integração com AWS S3
   - CRUD completo de arquivos
   - Verificação de referências no banco de dados

3. **Banco de Dados (PostgreSQL)**
   - Tabela `files` para rastrear arquivos S3
   - Views e funções auxiliares
   - Índices otimizados para consultas

## 📁 Estrutura de Arquivos

```
src/
├── types/files.ts                           # Tipos TypeScript
├── services/fileService.ts                  # Serviço para comunicação com API
├── app/
│   ├── admin/content/search/page.tsx        # Página principal
│   └── api/content/files/
│       ├── route.ts                         # CRUD principal
│       ├── all/route.ts                     # Buscar todos os arquivos
│       └── check-references/route.ts        # Verificar referências
backend/
├── migrations/
│   └── 20250129000002_create_files_table.ts # Migration da tabela files
└── seeds/
    └── 002_files_initial_data.ts            # Dados iniciais da tabela
```

## ✅ Status da Implementação

**Migration e Seeds**: ✅ Funcionando
- Migration executada com sucesso
- Seeds com 11 arquivos inseridos
- Estrutura completa de banco criada

**Problema Resolvido**: Campo `uploaded_by` 
- Seeds executam sem chave estrangeira inicialmente
- Campo pode ser atualizado posteriormente via SQL
- Sistema funcional mesmo sem associação de usuário

## 🛠️ Configuração

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 Buckets
S3_BUCKET_LITERARIO=literario-bucket
S3_BUCKET_PROFESSOR=professor-bucket
S3_BUCKET_ALUNO=aluno-bucket

# Database (exemplo com PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/portal
```

### 2. Dependências

Instale as dependências necessárias:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. Banco de Dados

Execute as migrations para criar a tabela:

```bash
# Se usando Knex.js
npx knex migrate:latest --cwd backend

# Executar seeds para dados iniciais
npx knex seed:run --cwd backend
```

### 4. Buckets S3

Configure os buckets na AWS S3:
- `literario-bucket` - Para conteúdo literário
- `professor-bucket` - Para material de professores
- `aluno-bucket` - Para conteúdo dos alunos

Configure as permissões adequadas:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::literario-bucket/*",
        "arn:aws:s3:::professor-bucket/*",
        "arn:aws:s3:::aluno-bucket/*"
      ]
    }
  ]
}
```

## 🎯 Funcionalidades

### Interface do Usuário

#### Abas de Conteúdo
- **Conteúdo Literário**: Livros, textos, material de literatura
- **Conteúdo Professor**: Planos de aula, apresentações, material didático
- **Conteúdo Aluno**: Exercícios, jogos educativos, material para estudantes

#### Filtros Globais
- **Busca por Nome**: Pesquisa nos nomes e descrições dos arquivos
- **Tipo**: Filtro por extensão (PDF, DOCX, PPTX, EPUB, ZIP, MP4, MP3)
- **Ordenação**: Por nome, data, tamanho ou tipo

#### Coluna de Referência do Banco
- ✅ **Vinculado**: Arquivo tem referência no banco de dados
- ❌ **Não vinculado**: Arquivo apenas no S3, sem referência no banco
- **Botão "Criar"**: Permite criar referência no banco para arquivos órfãos

#### Ações por Arquivo
1. **👁️ Visualizar**: Abre o arquivo em nova aba
2. **📤 Substituir**: Upload de novo arquivo
3. **✏️ Renomear**: Alterar nome do arquivo
4. **🔄 Mover/Copiar**: Transferir entre buckets
5. **🗑️ Deletar**: Remover arquivo (S3 + banco)

### Alertas Visuais

#### Arquivos sem Referência
- Linha destacada em vermelho claro
- Ícone de aviso ao lado do nome
- Status "Não vinculado" na coluna de referência
- Botão para criar referência no banco

#### Estatísticas
- Total de arquivos na aba atual
- Arquivos com referência no banco
- Arquivos sem referência no banco

## 🔧 API Endpoints

### GET `/api/content/files?category={category}`
Busca arquivos de uma categoria específica.

**Parâmetros:**
- `category`: literario | professor | aluno

**Resposta:**
```json
[
  {
    "id": "lit_1",
    "name": "Dom Casmurro.pdf",
    "type": "PDF",
    "size": "2.4 MB",
    "bucket": "literario-bucket",
    "lastModified": "2024-01-15",
    "description": "Clássico da literatura brasileira",
    "url": "https://...",
    "hasDbReference": true,
    "dbRecord": { ... }
  }
]
```

### GET `/api/content/files/all`
Busca todos os arquivos de todas as categorias.

### GET `/api/content/files/check-references?category={category}`
Verifica referências no banco de dados para uma categoria.

### POST `/api/content/files`
Upload de novo arquivo.

**Body (FormData):**
- `file`: Arquivo a ser enviado
- `category`: Categoria do arquivo
- `description`: Descrição (opcional)
- `tags`: Tags em JSON (opcional)

### PUT `/api/content/files/replace`
Substitui um arquivo existente.

### PATCH `/api/content/files/{id}`
Atualiza metadados de um arquivo.

### DELETE `/api/content/files/{id}`
Remove um arquivo (S3 + banco).

### POST `/api/content/files/move`
Move ou copia arquivo entre buckets.

### POST `/api/content/files/create-reference`
Cria referência no banco para arquivo S3 existente.

## 🗃️ Estrutura do Banco

### Tabela `files`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | VARCHAR(255) | Nome atual do arquivo |
| original_name | VARCHAR(255) | Nome original |
| type | VARCHAR(10) | Tipo/extensão |
| size | BIGINT | Tamanho em bytes |
| size_formatted | VARCHAR(20) | Tamanho formatado |
| bucket | VARCHAR(100) | Bucket S3 |
| s3_key | VARCHAR(500) | Chave no S3 |
| s3_url | TEXT | URL completa |
| description | TEXT | Descrição |
| category | VARCHAR(20) | literario/professor/aluno |
| metadata | JSONB | Metadados adicionais |
| checksum | VARCHAR(64) | Hash para integridade |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |
| uploaded_by | UUID | ID do usuário responsável |
| is_active | BOOLEAN | Status ativo |
| tags | TEXT[] | Array de tags |

### Views Úteis

#### `v_files_summary`
Resumo de arquivos por categoria com estatísticas.

### Funções

#### `find_orphan_s3_files(s3_keys)`
Encontra arquivos que existem no S3 mas não têm referência no banco.

## 🚀 Uso

1. **Acesse a página**: `/admin/content/search`
2. **Escolha uma aba**: Literário, Professor ou Aluno
3. **Use os filtros**: Para encontrar arquivos específicos
4. **Verifique alertas**: Arquivos sem referência aparecem destacados
5. **Execute ações**: Visualizar, editar, mover ou deletar arquivos
6. **Crie referências**: Para arquivos órfãos no S3

## 🔍 Monitoramento

### Verificar Integridade

Para verificar se há arquivos órfãos:

```sql
-- Arquivos no banco sem correspondência no S3 (verificar manualmente)
SELECT s3_key, name FROM files WHERE is_active = true;

-- Ver resumo por categoria
SELECT * FROM v_files_summary;

-- Usar função para encontrar órfãos
SELECT * FROM find_orphan_s3_files(ARRAY['arquivo1.pdf', 'arquivo2.docx']);
```

### Limpeza de Dados

```sql
-- Desativar arquivos órfãos (soft delete)
UPDATE files SET is_active = false 
WHERE s3_key NOT IN (/* lista de chaves do S3 */);
```

## 🛡️ Segurança

1. **Autenticação**: Verificar contexto de usuário antes de operações
2. **Autorização**: Validar permissões por categoria/bucket
3. **Validação**: Verificar tipos de arquivo permitidos
4. **Sanitização**: Limpar nomes de arquivo
5. **Rate Limiting**: Implementar limites de upload

## 📈 Próximos Passos

1. **Implementar upload em lote**
2. **Adicionar preview de arquivos**
3. **Histórico de versões**
4. **Sincronização automática S3 ↔ Banco**
5. **Dashboard de analytics**
6. **Notificações de arquivos órfãos**
7. **Backup e restore**

## 🐛 Troubleshooting

### Erro: "Cannot find module '@aws-sdk/client-s3'"
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Erro: Arquivo não carrega
1. Verificar permissões do bucket S3
2. Verificar credenciais AWS
3. Verificar URLs assinadas (expiração)

### Referências inconsistentes
1. Execute a função `find_orphan_s3_files()`
2. Use o botão "Criar" para arquivos órfãos
3. Verifique logs de erro na API

### Problemas com Migrations
```bash
# Verificar status das migrations
npx knex migrate:status --cwd backend

# Rollback da última migration
npx knex migrate:rollback --cwd backend

# Executar migration específica
npx knex migrate:up 20250129000002_create_files_table.ts --cwd backend
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Teste as credenciais AWS
3. Confirme a configuração dos buckets
4. Execute queries de diagnóstico no banco
5. Verifique se as migrations foram executadas corretamente 