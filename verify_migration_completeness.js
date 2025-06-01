const fs = require('fs');
const path = require('path');

const dumpDir = 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601';

// Tabelas mapeadas nos seeds
const mappedTables = {
  // Seed 006 - Dados Principais
  'sabercon_role.sql': '✅ Roles',
  'sabercon_institution.sql': '✅ Institutions',
  'sabercon_user.sql': '✅ Users',
  'sabercon_author.sql': '✅ Authors',
  'sabercon_genre.sql': '✅ Genres',
  'sabercon_tag.sql': '✅ Tags',
  'sabercon_theme.sql': '✅ Themes',
  'sabercon_target_audience.sql': '✅ Target Audiences',
  'sabercon_education_period.sql': '✅ Education Periods',
  'sabercon_educational_stage.sql': '✅ Educational Stages',
  'sabercon_file.sql': '✅ Media Files',
  'sabercon_tv_show.sql': '✅ TV Shows',
  
  // Seed 007 - Vídeos e Relacionamentos
  'sabercon_video.sql': '✅ Videos',
  'sabercon_video_file.sql': '✅ Video-File Relationships',
  'sabercon_video_author.sql': '✅ Video-Author Relationships',
  'sabercon_video_theme.sql': '✅ Video-Theme Relationships',
  'sabercon_video_educational_stage.sql': '✅ Video-Educational Stage Relationships',
  'sabercon_video_education_period.sql': '✅ Video-Education Period Relationships',
  
  // Seed 008 - Estruturas Complementares
  'sabercon_unit.sql': '✅ School Units',
  'sabercon_unit_class.sql': '✅ School Classes',
  'sabercon_profile.sql': '✅ User Profiles',
  'sabercon_question.sql': '✅ Questions',
  'sabercon_answer.sql': '✅ Question Answers',
  'sabercon_certificate.sql': '✅ Certificates',
  'sabercon_viewing_status.sql': '✅ Viewing Statuses',
  'sabercon_watchlist_entry.sql': '✅ Watchlist Entries',
  'sabercon_user_answer.sql': '✅ User Question Answers',
  'sabercon_tv_show_author.sql': '✅ TV Show-Author Relationships',
  'sabercon_tv_show_target_audience.sql': '✅ TV Show-Target Audience Relationships',
  'sabercon_institution_tv_show.sql': '✅ Institution-TV Show Relationships',
  'sabercon_user_role.sql': '✅ User-Role Relationships',
  'sabercon_user_unit.sql': '✅ User-Unit Relationships',
  'sabercon_user_unit_class.sql': '✅ User-Unit Class Relationships',
  'sabercon_profile_target_audience.sql': '✅ Profile-Target Audience Relationships'
};

// Tabelas intencionalmente não importadas
const ignoredTables = {
  'sabercon_cookie_signed.sql': '⏭️ Session data (not essential)',
  'sabercon_forgot_password.sql': '⏭️ Temporary password recovery data',
  'sabercon_generic_video_genre.sql': '⏭️ Generic relationships (not used)',
  'sabercon_generic_video_tag.sql': '⏭️ Generic relationships (not used)',
  'sabercon_genre_movie.sql': '⏭️ Movies not in current scope',
  'sabercon_genre_tv_show.sql': '⏭️ Can be derived from direct relationships',
  'sabercon_institution_user.sql': '⏭️ Replaced by institution_id in users',
  'sabercon_movie_tag.sql': '⏭️ Movies not in current scope',
  'sabercon_notification_queue.sql': '⏭️ Notification system will be reimplemented',
  'sabercon_public.sql': '⏭️ Public data managed differently',
  'sabercon_public_tv_show.sql': '⏭️ Public relationships managed differently',
  'sabercon_report.sql': '⏭️ Report system will be reimplemented',
  'sabercon_settings.sql': '⏭️ Settings migrated separately',
  'sabercon_teacher_subject.sql': '⏭️ Will be reimplemented as part of educational system',
  'sabercon_user_genre.sql': '⏭️ User preferences will be reimplemented',
  
  // Relationship tables that might exist but are covered by other relationships
  'sabercon_educational_stage_institution.sql': '⏭️ Covered by other relationships',
  'sabercon_educational_stage_unit.sql': '⏭️ Covered by other relationships',
  'sabercon_educational_stage_user.sql': '⏭️ Covered by other relationships',
  'sabercon_institution_user.sql': '⏭️ Covered by institution_id in users'
};

function verifyMigrationCompleteness() {
  console.log('🔍 Verificando completude da migração Sabercon...\n');
  
  try {
    // Listar todos os arquivos .sql no diretório de dump
    const files = fs.readdirSync(dumpDir).filter(file => file.endsWith('.sql'));
    
    console.log(`📁 Total de arquivos SQL encontrados: ${files.length}\n`);
    
    // Arquivos mapeados
    const mappedFiles = [];
    // Arquivos ignorados
    const ignoredFiles = [];
    // Arquivos não processados
    const unmappedFiles = [];
    
    files.forEach(file => {
      if (mappedTables[file]) {
        mappedFiles.push({ file, status: mappedTables[file] });
      } else if (ignoredTables[file]) {
        ignoredFiles.push({ file, status: ignoredTables[file] });
      } else {
        unmappedFiles.push(file);
      }
    });
    
    // Relatório de arquivos mapeados
    console.log('✅ ARQUIVOS MAPEADOS E PRONTOS PARA IMPORTAÇÃO:');
    console.log('=' .repeat(60));
    mappedFiles.forEach(({ file, status }, index) => {
      console.log(`${index + 1}. ${file.replace('sabercon_', '').replace('.sql', '')} → ${status}`);
    });
    
    console.log(`\n📊 Total mapeado: ${mappedFiles.length} arquivos\n`);
    
    // Relatório de arquivos ignorados
    console.log('⏭️ ARQUIVOS INTENCIONALMENTE NÃO IMPORTADOS:');
    console.log('=' .repeat(60));
    ignoredFiles.forEach(({ file, status }, index) => {
      console.log(`${index + 1}. ${file.replace('sabercon_', '').replace('.sql', '')} → ${status}`);
    });
    
    console.log(`\n📊 Total ignorado: ${ignoredFiles.length} arquivos\n`);
    
    // Arquivos não processados (se houver)
    if (unmappedFiles.length > 0) {
      console.log('⚠️ ARQUIVOS NÃO PROCESSADOS:');
      console.log('=' .repeat(60));
      unmappedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file} → ❌ PRECISA SER ANALISADO`);
      });
      console.log(`\n📊 Total não processado: ${unmappedFiles.length} arquivos\n`);
    }
    
    // Resumo final
    console.log('🎯 RESUMO FINAL:');
    console.log('=' .repeat(60));
    console.log(`✅ Arquivos mapeados para importação: ${mappedFiles.length}`);
    console.log(`⏭️ Arquivos intencionalmente ignorados: ${ignoredFiles.length}`);
    console.log(`❌ Arquivos não processados: ${unmappedFiles.length}`);
    console.log(`📁 Total de arquivos: ${files.length}`);
    
    const coveragePercentage = ((mappedFiles.length + ignoredFiles.length) / files.length * 100).toFixed(1);
    console.log(`📈 Cobertura: ${coveragePercentage}%`);
    
    if (unmappedFiles.length === 0) {
      console.log('\n🎉 MIGRAÇÃO COMPLETA! Todos os arquivos foram analisados e mapeados.');
      console.log('✅ Status: PRONTO PARA EXECUÇÃO');
    } else {
      console.log('\n⚠️ ATENÇÃO: Alguns arquivos ainda precisam ser analisados.');
      console.log('❌ Status: REQUER ANÁLISE ADICIONAL');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar migração:', error.message);
  }
}

// Executar verificação
verifyMigrationCompleteness(); 