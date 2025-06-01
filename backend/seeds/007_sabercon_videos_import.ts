import type { Knex } from 'knex';
import fs from 'fs';
import path from 'path';

// Função para validar e converter para bigint
function safeBigInt(value: any): number | null {
  if (value === null || value === undefined) return null;
  
  // Se for string, verificar se é um número válido
  if (typeof value === 'string') {
    // Remover espaços
    value = value.trim();
    
    // Se for vazia ou contém caracteres não numéricos, retornar null
    if (value === '' || !/^\d+$/.test(value)) {
      return null;
    }
    
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }
  
  // Se for número, verificar se é válido
  if (typeof value === 'number') {
    return isNaN(value) ? null : Math.floor(value);
  }
  
  return null;
}

// Função utilitária para converter bit(1) para boolean
function convertBitToBoolean(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (Buffer.isBuffer(value)) {
    return value[0] === 1;
  }
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

// Função para extrair dados SQL do arquivo de dump
function extractDataFromSqlFile(filePath: string): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const insertMatch = content.match(/INSERT INTO `\w+` VALUES\s*([\s\S]*?);/);
    
    if (!insertMatch) return [];
    
    const valuesString = insertMatch[1];
    const rows: any[] = [];
    
    // Parse manual básico - em produção seria melhor usar um parser SQL adequado
    const valueMatches = valuesString.match(/\(([^)]+)\)/g);
    
    if (valueMatches) {
      for (const match of valueMatches) {
        const values = match.slice(1, -1).split(',').map(v => {
          v = v.trim();
          if (v === 'NULL') return null;
          if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
          if (v.startsWith('_binary')) return v.includes("'\\0'") ? false : true;
          if (!isNaN(Number(v))) return Number(v);
          return v;
        });
        rows.push(values);
      }
    }
    
    return rows;
  } catch (error) {
    console.error(`Erro ao processar arquivo ${filePath}:`, (error as Error).message);
    return [];
  }
}

// Função para truncar strings
function truncateString(value: any, maxLength: number = 255): string | null {
  if (!value) return null;
  if (typeof value !== 'string') return String(value).substring(0, maxLength);
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

export async function seed(knex: Knex): Promise<void> {
  console.log('Iniciando importação dos vídeos do Sabercon...');
  
  const dumpDir = 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601';
  
  try {
    // 1. Importar vídeos
    console.log('Importando vídeos...');
    const videoData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video.sql'));
    for (const row of videoData) {
      if (row.length < 20) continue; // Skip incomplete rows
      
      const [
        id, version, api_id, date_created, deleted, imdb_id, intro_end,
        intro_start, last_updated, original_language, outro_start, overview,
        popularity, report_count, vote_average, vote_count, video_class,
        // Campos específicos por tipo de vídeo
        backdrop_path, poster_path, release_date, title, trailer_key,
        backdrop_image_id, poster_image_id, air_date, episode_string,
        episode_number, season_number, season_episode_merged, tv_show_id,
        still_path, still_image_id
      ] = row;
      
      if (convertBitToBoolean(deleted)) continue; // Skip deleted records
      
      // Pular registros com ID inválido
      const validId = safeBigInt(id);
      if (validId === null) {
        console.log(`Pulando vídeo com ID inválido: ${id}`);
        continue;
      }
      
      // Verificar se o vídeo já foi importado
      const existingVideo = await knex('videos')
        .where('sabercon_id', validId)
        .first();
      
      if (existingVideo) {
        console.log(`Vídeo ${validId} já existe, pulando...`);
        continue;
      }
      
      // Mapear IDs de imagens e TV show se existirem
      let mappedBackdropId = null;
      let mappedPosterId = null;
      let mappedStillId = null;
      let mappedTvShowId = null;
      
      if (backdrop_image_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(backdrop_image_id) })
          .first();
        if (mapping) {
          // Verificar se o arquivo realmente existe
          const fileExists = await knex('files').where('id', mapping.new_id).first();
          mappedBackdropId = fileExists ? mapping.new_id : null;
        }
      }
      
      if (poster_image_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(poster_image_id) })
          .first();
        if (mapping) {
          // Verificar se o arquivo realmente existe
          const fileExists = await knex('files').where('id', mapping.new_id).first();
          mappedPosterId = fileExists ? mapping.new_id : null;
        }
      }
      
      if (still_image_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(still_image_id) })
          .first();
        if (mapping) {
          // Verificar se o arquivo realmente existe
          const fileExists = await knex('files').where('id', mapping.new_id).first();
          mappedStillId = fileExists ? mapping.new_id : null;
        }
      }
      
      if (tv_show_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'tv_show', original_id: safeBigInt(tv_show_id) })
          .first();
        if (mapping) {
          // Verificar se o TV show realmente existe
          const showExists = await knex('tv_shows').where('id', mapping.new_id).first();
          mappedTvShowId = showExists ? mapping.new_id : null;
        }
      }
      
      const newVideo = await knex('videos').insert({
        name: truncateString(title || episode_string || 'Sem Título'),
        title: truncateString(title || episode_string || 'Sem Título'),
        description: overview,
        status: 'published',
        video_url: trailer_key ? `https://www.youtube.com/watch?v=${trailer_key}` : 'https://placeholder.video',
        duration: 0, // Duração padrão em segundos
        // Campos específicos do Sabercon
        sabercon_id: validId,
        api_id: truncateString(api_id),
        imdb_id: truncateString(imdb_id),
        class: truncateString(video_class),
        intro_start: safeBigInt(intro_start),
        intro_end: safeBigInt(intro_end),
        outro_start: safeBigInt(outro_start),
        original_language: truncateString(original_language),
        popularity: safeBigInt(popularity),
        vote_average: safeBigInt(vote_average),
        vote_count: safeBigInt(vote_count),
        report_count: safeBigInt(report_count) || 0,
        overview: overview,
        
        // Campos para filmes
        backdrop_path: truncateString(backdrop_path),
        poster_path: truncateString(poster_path),
        release_date: release_date,
        trailer_key: truncateString(trailer_key),
        backdrop_image_id: mappedBackdropId,
        poster_image_id: mappedPosterId,
        
        // Campos para episódios
        air_date: air_date,
        episode_string: truncateString(episode_string),
        episode_number: safeBigInt(episode_number),
        season_number: safeBigInt(season_number),
        season_episode_merged: typeof season_episode_merged === 'string' && isNaN(Number(season_episode_merged)) ? null : season_episode_merged,
        show_id: mappedTvShowId,
        still_path: truncateString(still_path),
        still_image_id: mappedStillId
      }).returning('id');
      
      // Mapear ID original para novo ID
      await knex('sabercon_migration_mapping').insert({
        table_name: 'video',
        original_id: validId,
        new_id: newVideo[0].id
      });
    }

    // 2. Importar relacionamentos vídeo-arquivo
    console.log('Importando relacionamentos vídeo-arquivo...');
    const videoFileData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video_file.sql'));
    for (const row of videoFileData) {
      const [video_files_id, file_id, video_id] = row;
      
      // Pular se IDs são inválidos
      const validVideoId = safeBigInt(video_id);
      const validFileId = safeBigInt(file_id);
      if (validVideoId === null || validFileId === null) continue;
      
      // Buscar IDs mapeados
      const videoMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'video', original_id: validVideoId })
        .first();
      
      const fileMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'file', original_id: validFileId })
        .first();
      
      if (videoMapping && fileMapping) {
        // Verificar se o arquivo realmente existe na tabela files
        const fileExists = await knex('files').where('id', fileMapping.new_id).first();
        
        if (!fileExists) {
          console.log(`⚠️  Arquivo ${fileMapping.new_id} não encontrado na tabela files, pulando relacionamento`);
          continue;
        }
        
        // Verificar se o relacionamento já existe antes de inserir
        const existingRelation = await knex('video_files')
          .where({
            video_id: videoMapping.new_id,
            file_id: fileMapping.new_id
          })
          .first();
        
        if (!existingRelation) {
          try {
            await knex('video_files').insert({
              video_id: videoMapping.new_id,
              file_id: fileMapping.new_id,
              file_type: 'video', // Valor padrão
              quality: 'original', // Valor padrão
              language: 'pt-BR' // Valor padrão
            });
          } catch (error) {
            // Se der erro por duplicata, apenas continue
            const err = error as Error;
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.error(`Erro ao inserir video_file (video: ${videoMapping.new_id}, file: ${fileMapping.new_id}):`, err.message);
            }
          }
        }
      }
    }

    // 3. Importar relacionamentos vídeo-autor
    console.log('Importando relacionamentos vídeo-autor...');
    const videoAuthorData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video_author.sql'));
    for (const row of videoAuthorData) {
      const [video_authors_id, author_id, video_id] = row;
      
      // Pular se IDs são inválidos
      const validVideoId = safeBigInt(video_id);
      const validAuthorId = safeBigInt(author_id);
      if (validVideoId === null || validAuthorId === null) continue;
      
      // Buscar IDs mapeados
      const videoMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'video', original_id: validVideoId })
        .first();
      
      const authorMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'author', original_id: validAuthorId })
        .first();
      
      if (videoMapping && authorMapping) {
        // Verificar se o relacionamento já existe
        const existingRelation = await knex('video_authors')
          .where({
            video_id: videoMapping.new_id,
            author_id: authorMapping.new_id
          })
          .first();
        
        if (!existingRelation) {
          try {
            await knex('video_authors').insert({
              video_id: videoMapping.new_id,
              author_id: authorMapping.new_id
            });
          } catch (error) {
            const err = error as Error;
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.error(`Erro ao inserir video_author:`, err.message);
            }
          }
        }
      }
    }

    // 4. Importar relacionamentos vídeo-tema
    console.log('Importando relacionamentos vídeo-tema...');
    const videoThemeData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video_theme.sql'));
    for (const row of videoThemeData) {
      const [video_themes_id, theme_id, video_id] = row;
      
      // Validar se os IDs não são undefined/null
      if (!video_id || !theme_id) continue;
      
      // Buscar IDs mapeados
      const videoMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'video', original_id: video_id })
        .first();
      
      const themeMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'theme', original_id: theme_id })
        .first();
      
      if (videoMapping && themeMapping) {
        // Verificar se o relacionamento já existe
        const existingRelation = await knex('video_themes')
          .where({
            video_id: videoMapping.new_id,
            theme_id: themeMapping.new_id
          })
          .first();
        
        if (!existingRelation) {
          try {
            await knex('video_themes').insert({
              video_id: videoMapping.new_id,
              theme_id: themeMapping.new_id
            });
          } catch (error) {
            const err = error as Error;
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.error(`Erro ao inserir video_theme:`, err.message);
            }
          }
        }
      }
    }

    // 5. Importar relacionamentos vídeo-estágio educacional
    console.log('Importando relacionamentos vídeo-estágio educacional...');
    const videoEducationalStageData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video_educational_stage.sql'));
    for (const row of videoEducationalStageData) {
      const [video_educational_stages_id, educational_stage_id, video_id] = row;
      
      // Validar se os IDs não são undefined/null
      if (!video_id || !educational_stage_id) continue;
      
      // Buscar IDs mapeados
      const videoMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'video', original_id: video_id })
        .first();
      
      const stageMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'educational_stage', original_id: educational_stage_id })
        .first();
      
      if (videoMapping && stageMapping) {
        // Verificar se o relacionamento já existe
        const existingRelation = await knex('video_educational_stages')
          .where({
            video_id: videoMapping.new_id,
            educational_stage_id: stageMapping.new_id
          })
          .first();
        
        if (!existingRelation) {
          try {
            await knex('video_educational_stages').insert({
              video_id: videoMapping.new_id,
              educational_stage_id: stageMapping.new_id
            });
          } catch (error) {
            const err = error as Error;
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.error(`Erro ao inserir video_educational_stage:`, err.message);
            }
          }
        }
      }
    }

    // 6. Importar relacionamentos vídeo-período educacional
    console.log('Importando relacionamentos vídeo-período educacional...');
    const videoEducationPeriodData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_video_education_period.sql'));
    for (const row of videoEducationPeriodData) {
      const [video_education_periods_id, education_period_id, video_id] = row;
      
      // Validar se os IDs não são undefined/null
      if (!video_id || !education_period_id) continue;
      
      // Buscar IDs mapeados
      const videoMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'video', original_id: video_id })
        .first();
      
      const periodMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'education_period', original_id: education_period_id })
        .first();
      
      if (videoMapping && periodMapping) {
        // Verificar se o relacionamento já existe
        const existingRelation = await knex('video_education_periods')
          .where({
            video_id: videoMapping.new_id,
            education_period_id: periodMapping.new_id
          })
          .first();
        
        if (!existingRelation) {
          try {
            await knex('video_education_periods').insert({
              video_id: videoMapping.new_id,
              education_period_id: periodMapping.new_id
            });
          } catch (error) {
            const err = error as Error;
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.error(`Erro ao inserir video_education_period:`, err.message);
            }
          }
        }
      }
    }

    console.log('Importação dos vídeos e relacionamentos do Sabercon concluída!');
    
  } catch (error) {
    console.error('Erro durante a importação de vídeos:', error);
    throw error;
  }
} 