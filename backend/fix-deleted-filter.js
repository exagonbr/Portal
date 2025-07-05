/**
 * Script para garantir que todas as consultas filtrem corretamente por deleted = false
 * nas tabelas tv_show, video e file
 */

const knex = require('knex');
const configFile = require('./knexfile');

async function fixDeletedFilters() {
  console.log('🔧 Iniciando script para verificar e corrigir filtros de deleted...');
  
  // Criar conexão com o banco de dados
  // Usar a configuração development diretamente
  let db;
  try {
    const config = configFile.default || configFile;
    
    if (!config.development || !config.development.client) {
      throw new Error('Configuração de desenvolvimento não encontrada');
    }
    
    db = knex(config.development);
    console.log('✅ Conexão com o banco estabelecida');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return;
  }
  
  try {
    // 1. Verificar tabela tv_show
    console.log('\n📺 Verificando tabela tv_show...');
    
    // Contar total de registros
    const totalTvShows = await db('tv_show').count('* as total').first();
    console.log(`Total de registros: ${totalTvShows.total}`);
    
    // Contar registros com deleted = false
    const activeTvShows = await db('tv_show')
      .where('deleted', false)
      .count('* as total')
      .first();
    console.log(`Registros com deleted = false: ${activeTvShows.total}`);
    
    // Contar registros com deleted = true
    const deletedTvShows = await db('tv_show')
      .where('deleted', true)
      .count('* as total')
      .first();
    console.log(`Registros com deleted = true: ${deletedTvShows.total}`);
    
    // Contar registros com deleted = null
    const nullDeletedTvShows = await db('tv_show')
      .whereNull('deleted')
      .count('* as total')
      .first();
    console.log(`Registros com deleted = null: ${nullDeletedTvShows.total}`);
    
    // 2. Verificar tabela video
    console.log('\n🎬 Verificando tabela video...');
    
    // Contar total de registros
    const totalVideos = await db('video').count('* as total').first();
    console.log(`Total de registros: ${totalVideos.total}`);
    
    // Contar registros com deleted = false
    const activeVideos = await db('video')
      .where('deleted', false)
      .count('* as total')
      .first();
    console.log(`Registros com deleted = false: ${activeVideos.total}`);
    
    // Contar registros com deleted = true
    const deletedVideos = await db('video')
      .where('deleted', true)
      .count('* as total')
      .first();
    console.log(`Registros com deleted = true: ${deletedVideos.total}`);
    
    // Contar registros com deleted = null
    const nullDeletedVideos = await db('video')
      .whereNull('deleted')
      .count('* as total')
      .first();
    console.log(`Registros com deleted = null: ${nullDeletedVideos.total}`);
    
    // 3. Verificar tabela file
    console.log('\n📄 Verificando tabela file...');
    
    // Verificar se a tabela file tem a coluna deleted
    const hasDeletedColumn = await db.schema.hasColumn('file', 'deleted');
    console.log(`Tabela file tem coluna deleted: ${hasDeletedColumn}`);
    
    if (hasDeletedColumn) {
      // Contar total de registros
      const totalFiles = await db('file').count('* as total').first();
      console.log(`Total de registros: ${totalFiles.total}`);
      
      // Contar registros com deleted = false
      const activeFiles = await db('file')
        .where('deleted', false)
        .count('* as total')
        .first();
      console.log(`Registros com deleted = false: ${activeFiles.total}`);
      
      // Contar registros com deleted = true
      const deletedFiles = await db('file')
        .where('deleted', true)
        .count('* as total')
        .first();
      console.log(`Registros com deleted = true: ${deletedFiles.total}`);
      
      // Contar registros com deleted = null
      const nullDeletedFiles = await db('file')
        .whereNull('deleted')
        .count('* as total')
        .first();
      console.log(`Registros com deleted = null: ${nullDeletedFiles.total}`);
    } else {
      console.log('A tabela file não tem coluna deleted. Verificando is_active...');
      
      // Verificar se a tabela file tem a coluna is_active
      const hasIsActiveColumn = await db.schema.hasColumn('file', 'is_active');
      console.log(`Tabela file tem coluna is_active: ${hasIsActiveColumn}`);
      
      if (hasIsActiveColumn) {
        // Contar total de registros
        const totalFiles = await db('file').count('* as total').first();
        console.log(`Total de registros: ${totalFiles.total}`);
        
        // Contar registros com is_active = true
        const activeFiles = await db('file')
          .where('is_active', true)
          .count('* as total')
          .first();
        console.log(`Registros com is_active = true: ${activeFiles.total}`);
        
        // Contar registros com is_active = false
        const inactiveFiles = await db('file')
          .where('is_active', false)
          .count('* as total')
          .first();
        console.log(`Registros com is_active = false: ${inactiveFiles.total}`);
        
        // Contar registros com is_active = null
        const nullActiveFiles = await db('file')
          .whereNull('is_active')
          .count('* as total')
          .first();
        console.log(`Registros com is_active = null: ${nullActiveFiles.total}`);
      }
    }
    
    // 4. Verificar relações entre tabelas
    console.log('\n🔄 Verificando relações entre tabelas...');
    
    // Selecionar um TV Show ativo para teste
    const testTvShow = await db('tv_show')
      .where('deleted', false)
      .first();
    
    if (testTvShow) {
      console.log(`Usando TV Show "${testTvShow.name}" (ID: ${testTvShow.id}) para testes`);
      
      // Contar vídeos ativos para este TV Show
      const activeVideosCount = await db('video')
        .where('show_id', testTvShow.id)
        .where('deleted', false)
        .count('* as total')
        .first();
      
      console.log(`Vídeos ativos para este TV Show: ${activeVideosCount.total}`);
      
      // Testar JOIN completo com filtro em todas as tabelas
      console.log('\n🔍 Testando JOIN completo com filtro correto...');
      
      const query = db('tv_show as ts')
        .leftJoin('video as v', 'ts.id', 'v.show_id')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'ts.id as tv_show_id',
          'ts.name as tv_show_name',
          'v.id as video_id',
          'v.title as video_title',
          'f.id as file_id',
          'f.name as file_name'
        )
        .where('ts.id', testTvShow.id)
        .where('ts.deleted', false)
        .where(function() {
          this.where('v.deleted', false).orWhereNull('v.id');
        });
      
      const results = await query.limit(5);
      
      console.log(`Resultados do JOIN completo: ${results.length}`);
      results.forEach(result => {
        console.log(`- TV Show: ${result.tv_show_name}, Vídeo: ${result.video_title || 'N/A'}, Arquivo: ${result.file_name || 'N/A'}`);
      });
      
      // Testar consulta usada no repositório
      console.log('\n🔍 Testando consulta como no repositório...');
      
      const repoQuery = db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id',
          'v.title',
          'v.name',
          'v.overview as description',
          'v.duration',
          'v.season_number',
          'v.episode_number',
          'v.still_path as thumbnail_url',
          'f.sha256hex as file_sha256hex',
          'f.extension as file_extension',
          'f.name as file_name',
          'f.content_type as file_mimetype',
          'f.size as file_size'
        )
        .where('v.show_id', testTvShow.id)
        .where('v.deleted', false)
        .orderBy('v.season_number')
        .orderBy('v.episode_number')
        .limit(5);
      
      const repoResults = await repoQuery;
      
      console.log(`Resultados da consulta do repositório: ${repoResults.length}`);
      repoResults.forEach(result => {
        console.log(`- Vídeo: ${result.title || result.name}, Arquivo: ${result.file_name || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    if (db) {
      await db.destroy();
      console.log('\n🔌 Conexão com o banco fechada');
    }
  }
}

// Executar o script
fixDeletedFilters().catch(console.error); 