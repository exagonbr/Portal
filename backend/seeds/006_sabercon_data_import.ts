import type { Knex } from 'knex';
import fs from 'fs';
import path from 'path';

// Função utilitária para validar e converter bigint
function safeBigInt(value: any): number | null {
  if (value === null || value === undefined || value === 'NULL') return null;
  
  // Converter para string para verificação de range
  const str = String(value);
  
  // Se contém texto não numérico (exceto sinal negativo), retorna null
  if (!/^-?\d+$/.test(str)) return null;
  
  // Verificar se é muito grande usando string comparison
  // PostgreSQL bigint range: -9223372036854775808 to 9223372036854775807
  const maxBigInt = '9223372036854775807';
  const minBigInt = '-9223372036854775808';
  
  if (str.startsWith('-')) {
    const absValue = str.substring(1);
    if (absValue.length > minBigInt.length - 1 || 
        (absValue.length === minBigInt.length - 1 && absValue > minBigInt.substring(1))) {
      return null;
    }
  } else {
    if (str.length > maxBigInt.length || 
        (str.length === maxBigInt.length && str > maxBigInt)) {
      return null;
    }
  }
  
  const num = Number(value);
  if (isNaN(num)) return null;
  return num;
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

// Função utilitária para validar e converter datas
function safeDate(value: any): Date | null {
  if (value === null || value === undefined || value === 'NULL') return null;
  
  try {
    const date = new Date(value);
    // Verificar se a data é válida
    if (isNaN(date.getTime())) return null;
    
    // Verificar se o ano está em um range razoável (evitar datas muito antigas ou futuras)
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) return null;
    
    return date;
  } catch (error) {
    return null;
  }
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
  console.log('Iniciando importação dos dados do Sabercon...');
  
  const dumpDir = 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601';
  
  try {
    // 1. Importar dados de roles
    console.log('Importando roles...');
    const roleData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_role.sql'));
    
    // Mapeamento de roles antigos para novos
    const roleMapping = {
      'ROLE_ADMIN': 'SYSTEM_ADMIN',
      'ROLE_CONTENT_MANAGER': 'INSTITUTION_MANAGER',
      'ROLE_TEACHER': 'TEACHER',
      'ROLE_STUDENT': 'STUDENT',
      'ROLE_MANAGER': 'INSTITUTION_MANAGER',
      'ROLE_COORDINATOR': 'ACADEMIC_COORDINATOR',
      'ROLE_GUARDIAN': 'GUARDIAN',
      'ROLE_USER': 'STUDENT',
      'ADMIN': 'SYSTEM_ADMIN',
      'TEACHER': 'TEACHER',
      'STUDENT': 'STUDENT',
      'MANAGER': 'INSTITUTION_MANAGER',
      'COORDINATOR': 'ACADEMIC_COORDINATOR',
      'GUARDIAN': 'GUARDIAN'
    };
    
    for (const row of roleData) {
      const [id, version, authority, display_name] = row;
      
      // Mapear o nome do role para um valor válido
      const mappedName = (roleMapping as any)[authority] || (roleMapping as any)[display_name] || 'STUDENT';
      
      // Verificar se o role já existe
      let existingRole = await knex('roles').where('name', mappedName).first();
      
      if (!existingRole) {
        const newRole = await knex('roles').insert({
          name: mappedName,
          description: display_name || authority,
          active: true
        }).returning('id');
        
        existingRole = { id: newRole[0].id };
      }
      
      // Mapear ID original para novo ID
      await knex('sabercon_migration_mapping').insert({
        table_name: 'role',
        original_id: id,
        new_id: existingRole.id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 2. Importar dados de instituições
    console.log('Importando instituições...');
    const institutionData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_institution.sql'));
    for (const row of institutionData) {
      const [
        id, 
        version, 
        accountable_contact, 
        accountable_name, 
        company_name, 
        complement, 
        contract_disabled, 
        contract_invoice_num, 
        contract_num, 
        contract_term_end, 
        contract_term_start, 
        date_created, 
        deleted, 
        district, 
        document, 
        invoice_date, 
        last_updated, 
        name, 
        postal_code, 
        state, 
        street, 
        score, 
        has_library_platform, 
        has_principal_platform, 
        has_student_platform
      ] = row;
      
      if (convertBitToBoolean(deleted)) continue; // Skip deleted records
      
      // Verificar se a instituição já existe
      let existingInstitution = await knex('institutions').where('code', document).first();
      
      if (!existingInstitution) {
        const newInstitution = await knex('institutions').insert({
          name: name,
          code: document,
          description: company_name,
          address: street,
          city: district,
          state: state,
          zip_code: postal_code,
          email: null,
          website: null,
          status: 'active',
          // Campos específicos do Sabercon
          sabercon_id: safeBigInt(id),
          accountable_contact,
          accountable_name,
          company_name,
          complement,
          contract_disabled: convertBitToBoolean(contract_disabled),
          contract_invoice_num: safeBigInt(contract_invoice_num),
          contract_num: safeBigInt(contract_num),
          contract_term_end: safeDate(contract_term_end),
          contract_term_start: safeDate(contract_term_start),
          district,
          document,
          invoice_date: safeDate(invoice_date),
          postal_code,
          score: safeBigInt(score),
          has_library_platform: convertBitToBoolean(has_library_platform),
          has_principal_platform: convertBitToBoolean(has_principal_platform),
          has_student_platform: convertBitToBoolean(has_student_platform)
        }).returning('id');
        
        existingInstitution = { id: newInstitution[0].id };
      }
      
      // Mapear ID original para novo ID
      await knex('sabercon_migration_mapping').insert({
        table_name: 'institution',
        original_id: id,
        new_id: existingInstitution.id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 3. Importar dados de usuários
    console.log('Importando usuários...');
    const userData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_user.sql'));
    for (const row of userData) {
      if (row.length < 25) continue; // Skip incomplete rows
      
      const [
        id, version, account_expired, account_locked, address,
        amount_of_media_entries, date_created, deleted, email, enabled,
        full_name, invitation_sent, is_admin, language, last_updated,
        password, password_expired, pause_video_on_click, phone,
        reset_password, username, uuid, is_manager, type, certificate_path,
        is_certified, is_student, is_teacher, institution_id, subject,
        subject_data_id
      ] = row;
      
      if (convertBitToBoolean(deleted) || !convertBitToBoolean(enabled)) continue;
      
      // Buscar institution_id mapeado se existir
      let mappedInstitutionId = null;
      if (institution_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'institution', original_id: institution_id })
          .first();
        mappedInstitutionId = mapping?.new_id || null;
      }
      
      // Verificar se o usuário já existe
      let existingUser = await knex('users').where('email', email).first();
      
      if (!existingUser) {
        const newUser = await knex('users').insert({
          email: email,
          password: password,
          name: full_name,
          phone: phone,
          address: address,
          is_active: convertBitToBoolean(enabled),
          institution_id: mappedInstitutionId,
          // Campos específicos do Sabercon
          sabercon_id: id,
          account_expired: convertBitToBoolean(account_expired),
          account_locked: convertBitToBoolean(account_locked),
          amount_of_media_entries: amount_of_media_entries || 0,
          invitation_sent: convertBitToBoolean(invitation_sent),
          is_admin: convertBitToBoolean(is_admin),
          password_expired: convertBitToBoolean(password_expired),
          pause_video_on_click: convertBitToBoolean(pause_video_on_click),
          reset_password: convertBitToBoolean(reset_password),
          is_manager: convertBitToBoolean(is_manager),
          is_student: convertBitToBoolean(is_student),
          is_teacher: convertBitToBoolean(is_teacher),
          is_certified: convertBitToBoolean(is_certified),
          certificate_path,
          subject,
          type,
          username,
          language: language || 'pt'
        }).returning('id');
        
        existingUser = { id: newUser[0].id };
      }
      
      // Mapear ID original para novo ID
      await knex('sabercon_migration_mapping').insert({
        table_name: 'user',
        original_id: id,
        new_id: existingUser.id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 4. Importar autores
    console.log('Importando autores...');
    const authorData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_author.sql'));
    for (const row of authorData) {
      const [id, version, description, email, is_active, name] = row;
      
      // Pular autores sem nome ou usar nome padrão
      if (!name || name === null || name === undefined) {
        console.log(`Pulando autor ID ${id} sem nome`);
        continue;
      }
      
      // Verificar se o autor já existe
      let existingAuthor = null;
      if (email) {
        existingAuthor = await knex('authors').where('email', email).first();
      }
      
      if (!existingAuthor) {
        const newAuthor = await knex('authors').insert({
          name: name,
          description: description,
          email: email,
          is_active: convertBitToBoolean(is_active)
        }).returning('id');
        
        existingAuthor = { id: newAuthor[0].id };
      }
      
      // Mapear ID original para novo ID
      await knex('sabercon_migration_mapping').insert({
        table_name: 'author',
        original_id: id,
        new_id: existingAuthor.id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 5. Importar gêneros
    console.log('Importando gêneros...');
    const genreData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_genre.sql'));
    for (const row of genreData) {
      const [id, version, api_id, name] = row;
      
      const newGenre = await knex('genres').insert({
        name: name,
        api_id: api_id
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'genre',
        original_id: id,
        new_id: newGenre[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 6. Importar tags
    console.log('Importando tags...');
    const tagData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_tag.sql'));
    for (const row of tagData) {
      const [id, version, date_created, deleted, last_updated, name] = row;
      
      if (convertBitToBoolean(deleted)) continue;
      
      const newTag = await knex('tags').insert({
        name: name,
        is_active: true
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'tag',
        original_id: id,
        new_id: newTag[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 7. Importar temas
    console.log('Importando temas...');
    const themeData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_theme.sql'));
    for (const row of themeData) {
      const [id, version, description, is_active, name] = row;
      
      const newTheme = await knex('themes').insert({
        name: name,
        description: description,
        is_active: convertBitToBoolean(is_active)
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'theme',
        original_id: id,
        new_id: newTheme[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 8. Importar público-alvo
    console.log('Importando público-alvo...');
    const targetAudienceData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_target_audience.sql'));
    for (const row of targetAudienceData) {
      const [id, version, description, is_active, name] = row;
      
      const newTargetAudience = await knex('target_audiences').insert({
        name: name,
        description: description,
        is_active: convertBitToBoolean(is_active)
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'target_audience',
        original_id: id,
        new_id: newTargetAudience[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 9. Importar períodos educacionais
    console.log('Importando períodos educacionais...');
    const educationPeriodData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_education_period.sql'));
    for (const row of educationPeriodData) {
      const [id, version, description, is_active] = row;
      
      const newEducationPeriod = await knex('education_periods').insert({
        name: description,
        description: description,
        is_active: convertBitToBoolean(is_active)
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'education_period',
        original_id: id,
        new_id: newEducationPeriod[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 10. Importar estágios educacionais
    console.log('Importando estágios educacionais...');
    const educationalStageData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_educational_stage.sql'));
    for (const row of educationalStageData) {
      const [
        id, version, date_created, deleted, grade_1, grade_2, grade_3,
        grade_4, grade_5, grade_6, grade_7, grade_8, grade_9,
        last_updated, name, uuid
      ] = row;
      
      if (convertBitToBoolean(deleted)) continue;
      
      // Verificar se o estágio educacional já existe
      let existingStage = await knex('educational_stages').where('sabercon_id', id).first();
      
      if (!existingStage) {
        const newEducationalStage = await knex('educational_stages').insert({
          sabercon_id: id,
          name: name,
          uuid: uuid,
          grade_1: convertBitToBoolean(grade_1),
          grade_2: convertBitToBoolean(grade_2),
          grade_3: convertBitToBoolean(grade_3),
          grade_4: convertBitToBoolean(grade_4),
          grade_5: convertBitToBoolean(grade_5),
          grade_6: convertBitToBoolean(grade_6),
          grade_7: convertBitToBoolean(grade_7),
          grade_8: convertBitToBoolean(grade_8),
          grade_9: convertBitToBoolean(grade_9),
          is_active: true
        }).returning('id');
        
        existingStage = { id: newEducationalStage[0].id };
      }
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'educational_stage',
        original_id: id,
        new_id: existingStage.id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 11. Importar arquivos de mídia
    console.log('Importando arquivos de mídia...');
    const fileData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_file.sql'));
    for (const row of fileData) {
      const [
        id, version, content_type, date_created, extension, external_link,
        is_default, is_public, label, last_updated, local_file, name,
        original_filename, quality, sha256hex, size, subtitle_label,
        subtitle_src_lang, is_subtitled
      ] = row;
      
      // Pular registros com ID inválido
      const validId = safeBigInt(id);
      if (validId === null) {
        console.log(`Pulando arquivo com ID inválido: ${id}`);
        continue;
      }
      
      const newFile = await knex('files').insert({
        name: name || original_filename || 'Arquivo',
        original_name: original_filename || name || 'arquivo.ext',
        type: extension || 'unknown',
        size: safeBigInt(size) || 0,
        size_formatted: safeBigInt(size) ? `${Math.round(safeBigInt(size)! / 1024)} KB` : '0 KB',
        bucket: 'sabercon-legacy',
        s3_key: local_file || external_link || `legacy/${validId}_${Date.now()}`,
        s3_url: external_link || local_file || `https://legacy.sabercon.com/${validId}`,
        description: label || name,
        category: 'professor', // categoria padrão
        metadata: JSON.stringify({
          sabercon_id: validId,
          quality: quality,
          sha256hex: sha256hex,
          is_default: convertBitToBoolean(is_default),
          is_public: convertBitToBoolean(is_public),
          is_subtitled: convertBitToBoolean(is_subtitled),
          subtitle_label: subtitle_label,
          subtitle_src_lang: subtitle_src_lang
        }),
        checksum: sha256hex,
        is_active: true,
        tags: []
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'file',
        original_id: validId,
        new_id: newFile[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    // 12. Importar TV Shows
    console.log('Importando TV Shows...');
    const tvShowData = extractDataFromSqlFile(path.join(dumpDir, 'sabercon_tv_show.sql'));
    for (const row of tvShowData) {
      if (row.length < 20) continue;
      
      const [
        id, version, api_id, backdrop_image_id, backdrop_path,
        contract_term_end, date_created, deleted, first_air_date,
        imdb_id, last_updated, manual_input, manual_support_id,
        manual_support_path, name, original_language, overview,
        popularity, poster_image_id, poster_path, producer,
        vote_average, vote_count, total_load
      ] = row;
      
      // Pular registros com ID inválido
      const validId = safeBigInt(id);
      if (validId === null) {
        console.log(`Pulando TV Show com ID inválido: ${id}`);
        continue;
      }
      
      if (convertBitToBoolean(deleted)) continue;
      
      // Mapear IDs de imagens se existirem
      let mappedBackdropId = null;
      let mappedPosterId = null;
      let mappedSupportId = null;
      
      if (backdrop_image_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(backdrop_image_id) })
          .first();
        mappedBackdropId = mapping?.new_id || null;
      }
      
      if (poster_image_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(poster_image_id) })
          .first();
        mappedPosterId = mapping?.new_id || null;
      }
      
      if (manual_support_id) {
        const mapping = await knex('sabercon_migration_mapping')
          .where({ table_name: 'file', original_id: safeBigInt(manual_support_id) })
          .first();
        mappedSupportId = mapping?.new_id || null;
      }
      
      const newTvShow = await knex('tv_shows').insert({
        title: name || 'TV Show sem título',
        synopsis: overview || null,
        description: overview || null,
        cover_image_url: poster_path || null,
        banner_image_url: backdrop_path || null,
        trailer_url: null,
        total_episodes: safeBigInt(total_load) || 0,
        total_seasons: 1,
        total_duration: safeBigInt(total_load) || 0,
        release_date: safeDate(first_air_date),
        genre: null,
        target_audience: null,
        content_rating: null,
        created_by: null,
        institution_id: null,
        education_cycle: JSON.stringify({
          sabercon_id: validId,
          api_id: api_id,
          imdb_id: imdb_id,
          original_language: original_language,
          popularity: safeBigInt(popularity),
          vote_average: safeBigInt(vote_average),
          vote_count: safeBigInt(vote_count),
          contract_term_end: safeDate(contract_term_end),
          producer: producer,
          manual_input: convertBitToBoolean(manual_input),
          manual_support_path: manual_support_path,
          backdrop_image_id: mappedBackdropId,
          poster_image_id: mappedPosterId,
          manual_support_id: mappedSupportId
        }),
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      
      await knex('sabercon_migration_mapping').insert({
        table_name: 'tv_show',
        original_id: validId,
        new_id: newTvShow[0].id
      }).onConflict(['table_name', 'original_id']).ignore();
    }

    console.log('Importação dos dados principais do Sabercon concluída!');
    console.log('Próximas etapas: executar seeds adicionais para relacionamentos e dados específicos.');
    
  } catch (error) {
    console.error('Erro durante a importação:', error);
    throw error;
  }
} 