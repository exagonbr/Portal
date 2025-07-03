import type { Knex } from 'knex';
import fs from 'fs';
import path from 'path';

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

export async function seed(knex: Knex): Promise<void> {
  console.log('Iniciando importação completa das tabelas restantes do Sabercon...');
  
  const dumpDir = 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601';
  
  try {
    // 1. Importar unidades escolares (unit)
    console.log('Importando unidades escolares...');
    const unitData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_unit.sql'));
    for (const row of unitData) {
      const [id, version, date_created, deleted, institution_id, last_updated, name, institution_name] = row;
      
      if (convertBitToBoolean(deleted)) continue;
      
      // Verificar se a unidade já foi importada
      const existingUnit = await knex('school_units')
        .where('sabercon_id', id)
        .first();
      
      if (existingUnit) {
        console.log(`Unidade escolar ${id} já existe, pulando...`);
        continue;
      }
      
      // Buscar institution_id mapeado
      let mappedInstitutionId = null;
      if (institution_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'institution', original_id: institution_id.toString() })
          .first();
        mappedInstitutionId = mapping?.new_id || null;
      }
      
      const newUnit = await knex('school_units').insert({
        sabercon_id: id,
        name: name,
        institution_id: mappedInstitutionId,
        institution_name: institution_name,
        is_active: true
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'unit',
        original_id: id.toString(),
        new_id: newUnit[0].id
      });
    }

    // 2. Importar turmas escolares (unit_class)
    console.log('Importando turmas escolares...');
    const unitClassData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_unit_class.sql'));
    for (const row of unitClassData) {
      const [id, version, date_created, deleted, institution_id, last_updated, name, unit_id, institution_name, unit_name] = row;
      
      if (convertBitToBoolean(deleted)) continue;
      
      // Verificar se a turma já foi importada
      const existingClass = await knex('school_classes')
        .where('sabercon_id', id)
        .first();
      
      if (existingClass) {
        console.log(`Turma ${id} já existe, pulando...`);
        continue;
      }
      
      // Buscar IDs mapeados
      let mappedInstitutionId = null;
      let mappedUnitId = null;
      
      if (institution_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'institution', original_id: institution_id.toString() })
          .first();
        mappedInstitutionId = mapping?.new_id || null;
      }
      
      if (unit_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'unit', original_id: unit_id.toString() })
          .first();
        mappedUnitId = mapping?.new_id || null;
      }
      
      const newClass = await knex('school_classes').insert({
        sabercon_id: id,
        name: name,
        school_unit_id: mappedUnitId,
        institution_id: mappedInstitutionId,
        institution_name: institution_name,
        unit_name: unit_name,
        is_active: true
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'unit_class',
        original_id: id.toString(),
        new_id: newClass[0].id
      });
    }

    // 3. Importar perfis de usuário (profile)
    console.log('Importando perfis de usuário...');
    const profileData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_profile.sql'));
    for (const row of profileData) {
      const [id, version, avatar_color, is_child, is_deleted, profile_language, profile_name, user_id] = row;
      
      if (convertBitToBoolean(is_deleted)) continue;
      
      // Verificar se o perfil já foi importado
      const existingProfile = await knex('user_profiles')
        .where('sabercon_id', id)
        .first();
      
      if (existingProfile) {
        console.log(`Perfil ${id} já existe, pulando...`);
        continue;
      }
      
      // Buscar user_id mapeado
      let mappedUserId = null;
      if (user_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'user', original_id: user_id.toString() })
          .first();
        mappedUserId = mapping?.new_id || null;
      }
      
      if (mappedUserId) {
        // Verificar se o usuário realmente existe na tabela users
        const userExists = await knex('users').where('id', mappedUserId).first();
        
        if (!userExists) {
          console.log(`⚠️  Usuário ${mappedUserId} não encontrado, pulando perfil ${id}`);
          continue;
        }
        
        const newProfile = await knex('user_profiles').insert({
          sabercon_id: id,
          profile_name: profile_name,
          avatar_color: avatar_color,
          is_child: convertBitToBoolean(is_child),
          profile_language: profile_language || 'pt',
          user_id: mappedUserId,
          is_active: true
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'profile',
          original_id: id.toString(),
          new_id: newProfile[0].id
        });
      }
    }

    // 4. Importar questões (question) - Verificar se estrutura é compatível
    console.log('Importando questões...');
    
    // Verificar se a tabela tem os campos esperados do Sabercon
    const questionColumns = await knex.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions'
    `);
    
    const hasEpisodeId = questionColumns.rows.some((row: any) => row.column_name === 'episode_id');
    
    if (!hasEpisodeId) {
      console.log('⚠️  Tabela questions tem estrutura diferente (quiz), pulando importação de questões do Sabercon');
    } else {
      const questionData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_question.sql'));
      for (const row of questionData) {
        const [id, version, date_created, deleted, file_id, last_updated, test, tv_show_id, episode_id] = row;
        
        if (convertBitToBoolean(deleted)) continue;
        
        // Verificar se a questão já foi importada
        const existingQuestion = await knex('questions')
          .where('sabercon_id', id)
          .first();
        
        if (existingQuestion) {
          console.log(`Questão ${id} já existe, pulando...`);
          continue;
        }
        
        // Buscar IDs mapeados
        let mappedTvShowId = null;
        let mappedEpisodeId = null;
        let mappedFileId = null;
        
        if (tv_show_id) {
          const mapping = await knex('sabercon_migration_mapping')
            .where({ table_name: 'tv_show', original_id: tv_show_id.toString() })
            .first();
          mappedTvShowId = mapping?.new_id || null;
        }
        
        if (episode_id) {
          const mapping = await knex('sabercon_migration_mapping')
            .where({ table_name: 'video', original_id: episode_id.toString() })
            .first();
          mappedEpisodeId = mapping?.new_id || null;
        }
        
        if (file_id) {
          const mapping = await knex('sabercon_migration_mapping')
            .where({ table_name: 'file', original_id: file_id.toString() })
            .first();
          mappedFileId = mapping?.new_id || null;
        }
        
        const newQuestion = await knex('questions').insert({
          sabercon_id: id,
          test: test,
          tv_show_id: mappedTvShowId,
          episode_id: mappedEpisodeId,
          file_id: mappedFileId,
          is_active: true
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'question',
          original_id: id.toString(),
          new_id: newQuestion[0].id
        });
      }
    }

    // 5. Importar respostas (answer)
    console.log('Importando respostas...');
    const answerData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_answer.sql'));
    for (const row of answerData) {
      const [id, version, date_created, deleted, is_correct, last_updated, question_id, reply] = row;
      
      if (convertBitToBoolean(deleted)) continue;
      
      // Buscar question_id mapeado
      let mappedQuestionId = null;
      if (question_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'question', original_id: question_id })
          .first();
        mappedQuestionId = mapping?.new_id || null;
      }
      
      if (mappedQuestionId) {
        const newAnswer = await knex('question_answers').insert({
          sabercon_id: id,
          reply: reply,
          is_correct: convertBitToBoolean(is_correct),
          question_id: mappedQuestionId,
          is_active: true
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'answer',
          original_id: id,
          new_id: newAnswer[0].id
        });
      }
    }

    // 6. Importar certificados (certificate)
    console.log('Importando certificados...');
    const certificateData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_certificate.sql'));
    for (const row of certificateData) {
      const [id, version, date_created, last_updated, path, score, tv_show_id, user_id, document, license_code, tv_show_name, recreate] = row;
      
      // Buscar IDs mapeados
      let mappedTvShowId = null;
      let mappedUserId = null;
      
      if (tv_show_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'tv_show', original_id: tv_show_id })
          .first();
        mappedTvShowId = mapping?.new_id || null;
      }
      
      if (user_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'user', original_id: user_id })
          .first();
        mappedUserId = mapping?.new_id || null;
      }
      
      if (mappedUserId) {
        // Verificar se o usuário realmente existe na tabela users
        const userExists = await knex('users').where('id', mappedUserId).first();
        
        if (!userExists) {
          console.log(`⚠️  Usuário ${mappedUserId} não encontrado, pulando certificado ${id}`);
          continue;
        }
        
        const newCertificate = await knex('certificates').insert({
          sabercon_id: id,
          path: path,
          document: document,
          license_code: license_code,
          tv_show_name: tv_show_name,
          score: score,
          recreate: convertBitToBoolean(recreate),
          tv_show_id: mappedTvShowId,
          user_id: mappedUserId
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'certificate',
          original_id: id.toString(),
          new_id: newCertificate[0].id
        });
      }
    }

    // 7. Importar status de visualização (viewing_status)
    console.log('Importando status de visualização...');
    const viewingStatusData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_viewing_status.sql'));
    for (const row of viewingStatusData) {
      const [id, version, completed, current_play_time, date_created, last_updated, profile_id, runtime, tv_show_id, user_id, video_id] = row;
      
      // Buscar IDs mapeados
      let mappedProfileId = null;
      let mappedTvShowId = null;
      let mappedUserId = null;
      let mappedVideoId = null;
      
      if (profile_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'profile', original_id: profile_id })
          .first();
        mappedProfileId = mapping?.new_id || null;
      }
      
      if (tv_show_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'tv_show', original_id: tv_show_id })
          .first();
        mappedTvShowId = mapping?.new_id || null;
      }
      
      if (user_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'user', original_id: user_id })
          .first();
        mappedUserId = mapping?.new_id || null;
      }
      
      if (video_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'video', original_id: video_id })
          .first();
        mappedVideoId = mapping?.new_id || null;
      }
      
      if (mappedUserId) {
        // Verificar se o usuário realmente existe na tabela users
        const userExists = await knex('users').where('id', mappedUserId).first();
        
        if (!userExists) {
          console.log(`⚠️  Usuário ${mappedUserId} não encontrado, pulando status ${id}`);
          continue;
        }
        
        const newViewingStatus = await knex('viewing_statuses').insert({
          sabercon_id: id,
          completed: convertBitToBoolean(completed),
          current_play_time: current_play_time || 0,
          runtime: runtime || 0,
          user_id: mappedUserId,
          profile_id: mappedProfileId,
          video_id: mappedVideoId,
          tv_show_id: mappedTvShowId
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'viewing_status',
          original_id: id.toString(),
          new_id: newViewingStatus[0].id
        });
      }
    }

    // 8. Importar lista de observação (watchlist_entry)
    console.log('Importando lista de observação...');
    const watchlistData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_watchlist_entry.sql'));
    for (const row of watchlistData) {
      const [id, version, date_created, is_deleted, last_updated, profile_id, tv_show_id, user_id, video_id] = row;
      
      if (convertBitToBoolean(is_deleted)) continue;
      
      // Buscar IDs mapeados
      let mappedProfileId = null;
      let mappedTvShowId = null;
      let mappedUserId = null;
      let mappedVideoId = null;
      
      if (profile_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'profile', original_id: profile_id })
          .first();
        mappedProfileId = mapping?.new_id || null;
      }
      
      if (tv_show_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'tv_show', original_id: tv_show_id })
          .first();
        mappedTvShowId = mapping?.new_id || null;
      }
      
      if (user_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'user', original_id: user_id })
          .first();
        mappedUserId = mapping?.new_id || null;
      }
      
      if (video_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'video', original_id: video_id })
          .first();
        mappedVideoId = mapping?.new_id || null;
      }
      
      if (mappedUserId && mappedProfileId) {
        const newWatchlistEntry = await knex('watchlist_entries').insert({
          sabercon_id: id,
          profile_id: mappedProfileId,
          tv_show_id: mappedTvShowId,
          user_id: mappedUserId,
          video_id: mappedVideoId,
          is_active: true
        }).returning('id');
        
        await knex('sabercon_migration_mapping').insert({
          table_name: 'watchlist_entry',
          original_id: id,
          new_id: newWatchlistEntry[0].id
        });
      }
    }

    // 9. Importar relacionamentos usuário-resposta (user_answer)
    console.log('Importando relacionamentos usuário-resposta...');
    const userAnswerData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_user_answer.sql'));
    for (const row of userAnswerData) {
      const [answer_id, question_id, version, date_created, is_correct, last_updated, score, user_id, id] = row;
      
      // Buscar IDs mapeados
      let mappedUserId = null;
      let mappedQuestionId = null;
      let mappedAnswerId = null;
      
      if (user_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'user', original_id: user_id })
          .first();
        mappedUserId = mapping?.new_id || null;
      }
      
      if (question_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'question', original_id: question_id })
          .first();
        mappedQuestionId = mapping?.new_id || null;
      }
      
      if (answer_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'answer', original_id: answer_id })
          .first();
        mappedAnswerId = mapping?.new_id || null;
      }
      
      if (mappedUserId && mappedQuestionId && mappedAnswerId) {
        await knex('user_question_answers').insert({
          sabercon_id: id,
          user_id: mappedUserId,
          question_id: mappedQuestionId,
          answer_id: mappedAnswerId,
          is_correct: convertBitToBoolean(is_correct),
          score: score
        });
      }
    }

    // 10. Importar relacionamentos TV Show-Autor
    console.log('Importando relacionamentos TV Show-Autor...');
    const tvShowAuthorData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_tv_show_author.sql'));
    for (const row of tvShowAuthorData) {
      const [tv_show_authors_id, author_id, id] = row;
      
      // Buscar IDs mapeados
      const tvShowMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'tv_show', original_id: tv_show_authors_id })
        .first();
      
      const authorMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'author', original_id: author_id })
        .first();
      
      if (tvShowMapping && authorMapping) {
        await knex('tv_show_authors').insert({
          tv_show_id: tvShowMapping.new_id,
          author_id: authorMapping.new_id
        }).onConflict(['tv_show_id', 'author_id']).ignore();
      }
    }

    // 11. Importar relacionamentos TV Show-Target Audience
    console.log('Importando relacionamentos TV Show-Target Audience...');
    const tvShowTargetAudienceData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_tv_show_target_audience.sql'));
    for (const row of tvShowTargetAudienceData) {
      const [tv_show_target_audiences_id, target_audience_id] = row;
      
      // Buscar IDs mapeados
      const tvShowMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'tv_show', original_id: tv_show_target_audiences_id })
        .first();
      
      const targetAudienceMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'target_audience', original_id: target_audience_id })
        .first();
      
      if (tvShowMapping && targetAudienceMapping) {
        await knex('tv_show_target_audiences').insert({
          tv_show_id: tvShowMapping.new_id,
          target_audience_id: targetAudienceMapping.new_id
        }).onConflict(['tv_show_id', 'target_audience_id']).ignore();
      }
    }

    // 12. Importar relacionamentos Institution-TV Show
    console.log('Importando relacionamentos Institution-TV Show...');
    const institutionTvShowData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_institution_tv_show.sql'));
    for (const row of institutionTvShowData) {
      const [tv_show_id, institution_id] = row;
      
      // Buscar IDs mapeados
      const institutionMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'institution', original_id: institution_id })
        .first();
      
      const tvShowMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'tv_show', original_id: tv_show_id })
        .first();
      
      if (institutionMapping && tvShowMapping) {
        await knex('institution_tv_shows').insert({
          institution_id: institutionMapping.new_id,
          tv_show_id: tvShowMapping.new_id
        }).onConflict(['institution_id', 'tv_show_id']).ignore();
      }
    }

    // 13. Importar relacionamentos User-Role
    console.log('Importando relacionamentos User-Role...');
    const userRoleData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_user_role.sql'));
    for (const row of userRoleData) {
      const [role_id, user_id] = row;
      
      // Buscar IDs mapeados
      const userMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'user', original_id: user_id })
        .first();
      
      const roleMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'role', original_id: role_id })
        .first();
      
      if (userMapping && roleMapping) {
        // Atualizar o role_id do usuário na tabela users
        await knex('users')
          .where('id', userMapping.new_id)
          .update({ role_id: roleMapping.new_id });
      }
    }

    // 14. Importar relacionamentos User-Unit
    console.log('Importando relacionamentos User-Unit...');
    const userUnitData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_user_unit.sql'));
    for (const row of userUnitData) {
      const [user_units_id, unit_id, user_id] = row;
      
      // Validar se os IDs não são undefined/null
      if (!user_id || !unit_id) continue;
      
      // Buscar IDs mapeados
      const userMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'user', original_id: user_id.toString() })
        .first();
      
      const unitMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'unit', original_id: unit_id.toString() })
        .first();
      
      if (userMapping && unitMapping) {
        // Verificar se o usuário realmente existe na tabela users
        const userExists = await knex('users').where('id', userMapping.new_id).first();
        
        if (!userExists) {
          console.log(`⚠️  Usuário ${userMapping.new_id} não encontrado, pulando relacionamento User-Unit`);
          continue;
        }
        
        await knex('user_school_units').insert({
          user_id: userMapping.new_id,
          school_unit_id: unitMapping.new_id
        }).onConflict(['user_id', 'school_unit_id']).ignore();
      }
    }

    // 15. Importar relacionamentos User-Unit-Class
    console.log('Importando relacionamentos User-Unit-Class...');
    const userUnitClassData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_user_unit_class.sql'));
    for (const row of userUnitClassData) {
      const [unit_class_id, user_id] = row;
      
      // Validar se os IDs não são undefined/null
      if (!user_id || !unit_class_id) continue;
      
      // Buscar IDs mapeados
      const userMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'user', original_id: user_id.toString() })
        .first();
      
      const classMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'unit_class', original_id: unit_class_id.toString() })
        .first();
      
      if (userMapping && classMapping) {
        await knex('user_school_classes').insert({
          user_id: userMapping.new_id,
          school_class_id: classMapping.new_id
        }).onConflict(['user_id', 'school_class_id']).ignore();
      }
    }

    // 16. Importar relacionamentos Profile-Target Audience
    console.log('Importando relacionamentos Profile-Target Audience...');
    const profileTargetAudienceData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_profile_target_audience.sql'));
    for (const row of profileTargetAudienceData) {
      const [profile_target_audiences_id, target_audience_id] = row;
      
      // Buscar IDs mapeados
      const profileMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'profile', original_id: profile_target_audiences_id })
        .first();
      
      const targetAudienceMapping = await knex('sabercon_migration_mapping')
        .where({ table_name: 'target_audience', original_id: target_audience_id })
        .first();
      
      if (profileMapping && targetAudienceMapping) {
        await knex('profile_target_audiences').insert({
          profile_id: profileMapping.new_id,
          target_audience_id: targetAudienceMapping.new_id
        }).onConflict(['profile_id', 'target_audience_id']).ignore();
      }
    }

    console.log('Importação completa de todas as tabelas do Sabercon concluída!');
    console.log('Dados migrados com sucesso para a nova estrutura do Portal.');
    
  } catch (error) {
    console.error('Erro durante a importação completa:', error);
    throw error;
  }
} 