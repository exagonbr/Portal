# 🚀 Migração Completa do Dump SABERCON

Este sistema oferece migração automatizada e completa dos dados do dump MySQL do sistema SABERCON para a nova estrutura do Portal Educacional.

## 📋 Visão Geral

O sistema de migração inclui:

- **Parser de SQL**: Extrai dados de arquivos SQL do dump
- **Mapeamento de Dados**: Converte estruturas antigas para novas
- **Migração em Lotes**: Processa grandes volumes de dados
- **Validações**: Verifica integridade dos dados
- **Relatórios**: Mostra estatísticas pós-migração

## 🗂️ Arquivos do Dump Suportados

O sistema processa automaticamente os seguintes arquivos:

### Dados Principais
- `sabercon_tv_show.sql` → `tv_shows` (94 séries educacionais)
- `sabercon_video.sql` → `videos` (conteúdo em vídeo)
- `sabercon_user.sql` → `users` (usuários do sistema)
- `sabercon_file.sql` → `files` (arquivos e mídia)
- `sabercon_author.sql` → `authors` (autores de conteúdo)
- `sabercon_institution.sql` → `institutions` (instituições)

### Relacionamentos
- `sabercon_tv_show_author.sql` → `content_authors`
- `sabercon_video_author.sql` → `content_authors`
- `sabercon_video_file.sql` → `video_files`
- `sabercon_genre_tv_show.sql` → relacionamentos de gênero
- `sabercon_genre.sql` → metadados de gêneros

## 🛠️ Comandos Disponíveis

### 1. Teste do Parser (Recomendado primeiro)
```bash
cd backend
npm run migrate:dump:test
```
Este comando:
- ✅ Testa o parser sem modificar o banco
- 📊 Mostra estatísticas dos dados encontrados
- 🔍 Valida a integridade dos dados
- 📋 Exibe amostras dos dados parseados

### 2. Teste Completo (Dry Run)
```bash
npm run migrate:dump:dry
```
Este comando:
- 🧪 Executa toda a lógica de migração
- 🚫 **NÃO insere dados no banco**
- 📊 Mostra relatório detalhado
- ⚡ Testa performance

### 3. Migração Completa
```bash
npm run migrate:dump
```
Este comando:
- ✅ **Insere dados reais no banco**
- 🔄 Processa em lotes para performance
- 📊 Gera relatório final
- 🔗 Cria todos os relacionamentos

### 4. Comandos com Opções Avançadas
```bash
# Migração com caminho customizado
npm run migrate:dump -- --dump-path "/caminho/para/dump"

# Migração com lotes menores (para sistemas com menos memória)
npm run migrate:dump -- --batch-size 25

# Pular teste inicial
npm run migrate:dump -- --no-test

# Ver todas as opções
npm run migrate:dump -- --help
```

## 📂 Estrutura de Diretórios

```
backend/
├── src/scripts/
│   ├── dump-parser.ts           # Parser dos arquivos SQL
│   ├── migrate-dump-data.ts     # Lógica de migração
│   ├── test-dump-parser.ts      # Testes do parser
│   └── run-complete-migration.ts # Script principal
└── migrations/
    ├── 20250201000002_create_videos_table.ts
    ├── 20250201000003_create_tvshows_table.ts
    └── 20250201000004_enhance_files_table.ts
```

## 🔧 Pré-requisitos

### 1. Banco de Dados Configurado
```bash
# Executar migrações das estruturas
npm run migrate

# Executar setup inicial (criar roles)
curl -X POST http://localhost:3000/api/setup
```

### 2. Dump Disponível
Certifique-se de que o dump está em:
```
C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601/
```

Ou especifique um caminho diferente com `--dump-path`

### 3. Variáveis de Ambiente
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/portal
NODE_ENV=development
```

## 📊 Dados Migrados

### TV Shows (Series Educacionais)
- **Origem**: `sabercon_tv_show.sql` (107KB)
- **Total**: ~94 séries educacionais
- **Campos mapeados**: título, sinopse, avaliações, metadados

### Videos
- **Origem**: `sabercon_video.sql` (458KB)
- **Campos mapeados**: título, descrição, URLs, estatísticas

### Users
- **Origem**: `sabercon_user.sql` (2.2MB)
- **Campos mapeados**: email, nome, permissões, status

### Files
- **Origem**: `sabercon_file.sql` (920KB)
- **Campos mapeados**: nome, tipo, tamanho, URLs S3

### Authors
- **Origem**: `sabercon_author.sql` (23KB)
- **Campos mapeados**: nome, email, biografia, status

## 🔗 Relacionamentos Criados

### 1. Content Authors
- Vincula autores a TV Shows e vídeos
- Suporta diferentes papéis (creator, director, producer)

### 2. Video Files
- Vincula vídeos aos seus arquivos
- Suporta múltiplas qualidades e formatos

### 3. TV Show Videos
- Organiza vídeos em episódios de séries
- Suporta temporadas e numeração

## 📈 Relatório de Migração

Após a migração, você verá um relatório como:

```
📋 RELATÓRIO FINAL:
  🏛️ Instituições: 1
  👥 Usuários: 15,000+
  ✍️ Autores: 150+
  📁 Arquivos: 8,000+
  🎬 Vídeos: 1,200+
  📺 TV Shows: 94
  🔗 Relacionamentos Autor-Conteúdo: 500+
  🔗 Relacionamentos Vídeo-Arquivo: 2,000+

🔍 VERIFICAÇÕES DE INTEGRIDADE:
📊 Vídeos sem arquivos: 0
📊 TV Shows sem episódios: 12
📊 Autores sem conteúdo: 5
```

## 🚨 Solução de Problemas

### Erro: "Tabelas faltando"
```bash
npm run migrate
```

### Erro: "Role padrão não encontrada"
```bash
curl -X POST http://localhost:3000/api/setup
```

### Erro: "Diretório do dump não encontrado"
```bash
# Verificar caminho
ls -la "C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601/"

# Ou especificar caminho correto
npm run migrate:dump -- --dump-path "/seu/caminho/para/dump"
```

### Erro de memória com grandes volumes
```bash
# Usar lotes menores
npm run migrate:dump -- --batch-size 25
```

### Parser não funciona
```bash
# Teste isolado do parser
npm run migrate:dump:test
```

## 🔄 Rollback

Se precisar desfazer a migração:

```bash
# Rollback das estruturas (cuidado - remove dados!)
npm run migrate:rollback

# Ou limpar tabelas específicas
psql -d portal -c "TRUNCATE tv_shows, videos, files, authors, content_authors CASCADE;"
```

## 🎯 Próximos Passos

Após migração bem-sucedida:

1. **Verificar APIs**: Teste endpoints `/api/tvshows`
2. **Configurar S3**: Atualizar URLs de arquivos se necessário
3. **Validar Frontend**: Teste componente `TvShowCard`
4. **Otimizar**: Adicionar índices se performance for lenta
5. **Backup**: Fazer backup do banco migrado

## 📞 Suporte

Em caso de problemas:

1. Execute primeiro `npm run migrate:dump:test`
2. Verifique logs de erro detalhados
3. Use `--dry-run` para testar sem modificar dados
4. Consulte `MIGRATION_GUIDE.md` para detalhes técnicos

---

🎉 **Boa migração!** Este sistema foi projetado para migrar todos os dados do SABERCON de forma segura e eficiente para o Portal Educacional. 