# Guia de Migração de Dados - Portal Educacional

Este guia explica como migrar dados do sistema antigo para as novas estruturas criadas no Portal Educacional.

## Estruturas Criadas

### 1. Tabelas de Banco de Dados

#### Videos (`videos`)
- **Descrição**: Armazena informações detalhadas sobre vídeos educacionais
- **Campos principais**:
  - `id`: UUID único
  - `name`: Nome do vídeo
  - `description`: Descrição detalhada
  - `video_url`: URL do arquivo de vídeo
  - `thumbnail_url`: URL da miniatura
  - `duration`: Duração em segundos
  - `quality`: Qualidade (SD, HD, FHD, 4K)
  - `format`: Formato do arquivo (mp4, avi, mkv)
  - `file_size`: Tamanho do arquivo em bytes
  - `resolution`: Resolução (ex: 1920x1080)
  - `education_cycle`: Metadados educacionais (JSON)
  - `authors`: Array de autores (JSON)
  - `tags`: Tags para busca (JSON)
  - `subject`: Disciplina
  - `difficulty_level`: Nível de dificuldade
  - `is_public`, `is_premium`: Controle de acesso
  - `status`: Status de publicação
  - Estatísticas: `views_count`, `likes_count`, `rating_average`, etc.

#### TV Shows (`tv_shows`)
- **Descrição**: Representa coleções de vídeos organizadas como séries educacionais
- **Campos principais**:
  - `id`: UUID único
  - `title`: Título da série
  - `synopsis`: Sinopse curta
  - `description`: Descrição detalhada
  - `cover_image_url`: Imagem de capa
  - `banner_image_url`: Banner da série
  - `total_episodes`: Número total de episódios
  - `total_seasons`: Número de temporadas
  - `genre`: Gênero da série
  - `target_audience`: Público-alvo
  - `content_rating`: Classificação etária
  - `subjects`: Disciplinas abordadas (JSON)
  - `language`: Idioma (padrão: pt-BR)
  - `is_featured`: Destaque na plataforma
  - Estatísticas similares aos vídeos

#### TV Show Videos (`tv_show_videos`)
- **Descrição**: Relacionamento entre séries e vídeos (episódios)
- **Campos principais**:
  - `tv_show_id`: ID da série
  - `video_id`: ID do vídeo
  - `season_number`: Número da temporada
  - `episode_number`: Número do episódio
  - `episode_title`: Título do episódio
  - `order_index`: Ordem de exibição

#### Files (`files`)
- **Descrição**: Sistema de arquivos aprimorado
- **Campos principais**:
  - `id`: UUID único
  - `name`: Nome do arquivo
  - `original_name`: Nome original
  - `type`: Tipo MIME
  - `size`: Tamanho em bytes
  - `bucket`: Bucket S3
  - `s3_key`: Chave no S3
  - `s3_url`: URL de acesso
  - `category`: Categoria do arquivo
  - `metadata`: Metadados adicionais (JSON)
  - `checksum`: Hash de verificação
  - `tags`: Tags para organização (JSON)

#### Authors (`authors`)
- **Descrição**: Autores de conteúdo educacional
- **Campos principais**:
  - `id`: UUID único
  - `name`: Nome do autor
  - `email`: Email (único)
  - `bio`: Biografia
  - `avatar_url`: Foto do autor
  - `website`: Site pessoal
  - `social_links`: Links de redes sociais (JSON)
  - `specialization`: Área de especialização
  - `type`: Tipo (internal, external, guest)

#### Content Authors (`content_authors`)
- **Descrição**: Relacionamento entre autores e conteúdo
- **Campos principais**:
  - `author_id`: ID do autor
  - `content_id`: ID do conteúdo
  - `content_type`: Tipo de conteúdo (video, tv_show, etc.)
  - `role`: Papel do autor (creator, director, producer, etc.)

#### Video Files (`video_files`)
- **Descrição**: Relacionamento entre vídeos e arquivos
- **Campos principais**:
  - `video_id`: ID do vídeo
  - `file_id`: ID do arquivo
  - `file_type`: Tipo (video, thumbnail, subtitle, etc.)
  - `quality`: Qualidade para vídeos
  - `language`: Idioma para legendas

## Como Executar a Migração

### 1. Executar as Migrações do Banco

```bash
cd backend
npm run migrate
```

### 2. Preparar os Dados do Dump

Extraia os dados do dump MySQL e organize-os nos seguintes formatos:

```typescript
// Exemplo de estrutura de dados
const migrationData = {
  users: [
    {
      id: "uuid-opcional",
      email: "usuario@exemplo.com",
      name: "Nome do Usuário",
      password: "hash-da-senha" // opcional
    }
  ],
  videos: [
    {
      id: "uuid-opcional",
      name: "Nome do Vídeo",
      description: "Descrição do vídeo",
      video_url: "https://exemplo.com/video.mp4",
      duration: 3600 // em segundos
    }
  ],
  tvShows: [
    {
      id: "uuid-opcional",
      title: "Título da Série",
      synopsis: "Sinopse da série",
      description: "Descrição detalhada"
    }
  ],
  files: [
    {
      id: "uuid-opcional",
      name: "arquivo.mp4",
      original_name: "arquivo_original.mp4",
      type: "video/mp4",
      size: 1024000,
      s3_url: "https://s3.amazonaws.com/bucket/arquivo.mp4"
    }
  ],
  authors: [
    {
      id: "uuid-opcional",
      name: "Nome do Autor",
      email: "autor@exemplo.com",
      bio: "Biografia do autor"
    }
  ]
};
```

### 3. Executar o Script de Migração

```typescript
import { DataMigrationService } from './backend/src/scripts/migrate-data';

const migrationService = new DataMigrationService();

// Migração completa
await migrationService.runFullMigration(migrationData);

// Ou migração por partes
await migrationService.migrateUsers(migrationData.users);
await migrationService.migrateVideos(migrationData.videos);
await migrationService.migrateTvShows(migrationData.tvShows);
await migrationService.migrateFiles(migrationData.files);
await migrationService.migrateAuthors(migrationData.authors);

// Vincular vídeos a séries
await migrationService.linkTvShowVideos(tvShowId, [videoId1, videoId2]);

// Vincular autores a conteúdo
await migrationService.linkContentAuthors(contentId, 'video', [authorId1]);
```

### 4. Verificar a Migração

Após a migração, verifique:

1. **Contagem de registros**: Compare o número de registros migrados
2. **Integridade referencial**: Verifique se os relacionamentos estão corretos
3. **Dados obrigatórios**: Confirme que todos os campos obrigatórios foram preenchidos
4. **URLs e arquivos**: Teste se as URLs de vídeos e imagens estão funcionando

## Componentes Frontend Criados

### TvShowCard
Componente React para exibir cards de séries educacionais:

```tsx
import TvShowCard from '@/components/TvShowCard';

<TvShowCard
  tvShow={tvShowData}
  onPlay={(tvShow) => console.log('Reproduzir:', tvShow)}
  onLike={(tvShow) => console.log('Curtir:', tvShow)}
  onFavorite={(tvShow) => console.log('Favoritar:', tvShow)}
/>
```

## APIs Criadas

### TvShows API
- `GET /api/tvshows` - Listar séries
- `GET /api/tvshows/:id` - Obter série com episódios
- `POST /api/tvshows` - Criar nova série
- `PUT /api/tvshows/:id` - Atualizar série
- `DELETE /api/tvshows/:id` - Excluir série
- `POST /api/tvshows/:id/like` - Curtir série
- `POST /api/tvshows/:id/rate` - Avaliar série

### Parâmetros de Consulta
- `genre`: Filtrar por gênero
- `featured`: Apenas séries em destaque
- `search`: Busca por termo
- `limit`: Limitar resultados

## Repositórios Criados

### TvShowRepository
Métodos disponíveis:
- `findByInstitution(institutionId)`: Séries por instituição
- `findFeatured(limit)`: Séries em destaque
- `findByGenre(genre, limit)`: Séries por gênero
- `searchTvShows(term, institutionId)`: Busca de séries
- `getTvShowWithEpisodes(id)`: Série com episódios
- `updateStatistics(id, type, value)`: Atualizar estatísticas

### AuthorRepository
Métodos disponíveis:
- `findByName(name)`: Buscar por nome
- `findByEmail(email)`: Buscar por email
- `searchAuthors(term)`: Busca de autores
- `getAuthorWithContent(authorId)`: Autor com conteúdo
- `getContentAuthors(contentId, type)`: Autores de conteúdo
- `addContentAuthor(...)`: Vincular autor a conteúdo

## Considerações Importantes

1. **UUIDs**: O sistema usa UUIDs para todas as chaves primárias
2. **Timestamps**: Todas as tabelas têm `created_at` e `updated_at`
3. **Soft Deletes**: Use o campo `is_active` em vez de deletar registros
4. **Instituições**: Todos os conteúdos devem estar vinculados a uma instituição
5. **Permissões**: Verifique as permissões de usuário antes de criar conteúdo
6. **Validação**: Todos os endpoints têm validação de JWT
7. **Estatísticas**: As estatísticas são atualizadas automaticamente

## Troubleshooting

### Problemas Comuns

1. **Erro de chave estrangeira**: Verifique se as instituições e usuários existem antes de migrar conteúdo
2. **URLs inválidas**: Valide todas as URLs de vídeos e imagens antes da migração
3. **Dados duplicados**: Use `onConflict().ignore()` para evitar duplicatas
4. **Encoding**: Certifique-se de que os dados estão em UTF-8

### Logs de Migração

O script de migração produz logs detalhados. Monitore:
- Número de registros processados
- Erros de validação
- Avisos sobre dados faltantes
- Tempo de execução

## Próximos Passos

Após a migração bem-sucedida:

1. **Testes**: Execute testes completos da aplicação
2. **Performance**: Monitore a performance das consultas
3. **Backup**: Faça backup do banco migrado
4. **Documentação**: Atualize a documentação da API
5. **Treinamento**: Treine os usuários nas novas funcionalidades 