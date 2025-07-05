# Otimização do Endpoint TV Shows

## Problema Identificado
- O endpoint `/api/tv-shows/9` estava retornando erro 500 em produção
- A listagem `/api/tv-shows` funcionava normalmente
- O problema ocorria apenas ao buscar um TV Show específico por ID

## Diagnóstico
1. A tabela `tv_show` existe e contém o registro ID 9
2. O erro ocorria devido a timeout na query de vídeos relacionados
3. A query original usava `DISTINCT ON` com múltiplos JOINs sem limite de resultados

## Solução Implementada

### 1. Query Otimizada para Vídeos
- Substituída a query `DISTINCT ON` por uma CTE (Common Table Expression) com `ROW_NUMBER()`
- Adicionado `LIMIT 100` para evitar retornar muitos registros
- Melhor performance com particionamento por ID do vídeo

```sql
WITH ranked_videos AS (
  SELECT 
    v.*,
    f.*,
    ROW_NUMBER() OVER (
      PARTITION BY v.id 
      ORDER BY f.size DESC NULLS LAST
    ) as rn
  FROM video v
  LEFT JOIN video_file vf ON v.id = vf.video_files_id
  LEFT JOIN file f ON vf.file_id = f.id
  WHERE v.show_id = $1 
    AND (v.deleted IS NULL OR v.deleted = false)
)
SELECT * FROM ranked_videos 
WHERE rn = 1
ORDER BY season_number ASC, episode_number ASC
LIMIT 100
```

### 2. Timeout de Segurança
- Adicionado timeout de 5 segundos para a busca de vídeos
- Se a busca demorar mais que 5 segundos, retorna o TV Show sem os vídeos
- Evita que a API trave completamente

```typescript
const videoPromise = this.getVideosByTvShowGrouped(id);
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout ao buscar vídeos')), 5000)
);

videosGrouped = await Promise.race([videoPromise, timeoutPromise]);
```

### 3. Tratamento de Erros
- Melhor tratamento de erros na busca de vídeos
- A API continua funcionando mesmo se houver erro ao buscar vídeos
- Logs detalhados para debugging

## Arquivos Modificados
- `backend/src/services/TvShowCompleteService.ts` - Arquivo otimizado
- `backend/src/services/TvShowCompleteService.ts.backup` - Backup do original

## Próximos Passos
1. Deploy das alterações em produção
2. Monitorar performance do endpoint
3. Considerar adicionar índices nas tabelas:
   - `video(show_id, deleted)`
   - `video_file(video_files_id)`
   - `file(id)`

## Comandos para Reverter (se necessário)
```bash
cd backend/src/services
cp TvShowCompleteService.ts.backup TvShowCompleteService.ts