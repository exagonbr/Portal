/**
 * Script para corrigir as consultas no repositório TvShowRepository
 * para garantir que todas as tabelas tenham o filtro de deleted aplicado corretamente
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Caminho para o arquivo do repositório
const repositoryPath = './src/repositories/TvShowRepository.ts';
const absoluteRepositoryPath = '/var/www/portal/backend/src/repositories/TvShowRepository.ts';

async function fixRepositoryQueries() {
  console.log('🔧 Iniciando correção das consultas no repositório TvShowRepository...');
  
  try {
    // Verificar se o arquivo existe (tentar caminho absoluto se o relativo falhar)
    let repoPath = repositoryPath;
    if (!fs.existsSync(repositoryPath)) {
      console.log(`⚠️ Arquivo não encontrado em caminho relativo: ${repositoryPath}`);
      console.log(`🔍 Tentando caminho absoluto: ${absoluteRepositoryPath}`);
      
      if (fs.existsSync(absoluteRepositoryPath)) {
        repoPath = absoluteRepositoryPath;
        console.log(`✅ Arquivo encontrado em caminho absoluto`);
      } else {
        console.error(`❌ Arquivo não encontrado em caminho absoluto`);
        return;
      }
    }
    
    // Ler conteúdo do arquivo
    let content = await readFileAsync(repoPath, 'utf8');
    let modified = false;
    
    // 1. Corrigir consulta findModulesByTvShowId
    const findModulesPattern = /(findModulesByTvShowId.*?\{[\s\S]*?const videos = await this\.db\([^)]*\)[\s\S]*?\.where\('v\.show_id', tvShowId\)[\s\S]*?)\.where\("deleted", false\)([\s\S]*?\.timeout\(20000\);)/;
    if (findModulesPattern.test(content)) {
      content = content.replace(findModulesPattern, (match, before, after) => {
        return `${before}.where("v.deleted", false)${after}`;
      });
      modified = true;
      console.log('✅ Corrigida consulta findModulesByTvShowId');
    }
    
    // 2. Corrigir consulta findVideosByTvShowId
    const findVideosPattern = /(findVideosByTvShowId.*?\{[\s\S]*?const videos = await this\.db\([^)]*\)[\s\S]*?\.where\('v\.show_id', tvShowId\)[\s\S]*?)\.where\("deleted", false\)([\s\S]*?\.timeout\(20000\);)/;
    if (findVideosPattern.test(content)) {
      content = content.replace(findVideosPattern, (match, before, after) => {
        return `${before}.where("v.deleted", false)${after}`;
      });
      modified = true;
      console.log('✅ Corrigida consulta findVideosByTvShowId');
    }
    
    // 3. Corrigir consulta getStatsByTvShowId - contagem de vídeos
    const statsVideosPattern = /(getStatsByTvShowId.*?\{[\s\S]*?const videoCountResult = await this\.db\('video'\)[\s\S]*?\.where\('show_id', tvShowId\)[\s\S]*?)\.where\("deleted", false\)([\s\S]*?\.timeout\(20000\))/;
    if (statsVideosPattern.test(content)) {
      content = content.replace(statsVideosPattern, (match, before, after) => {
        return `${before}.where("deleted", false)${after}`;
      });
      modified = true;
      console.log('✅ Corrigida consulta getStatsByTvShowId (contagem de vídeos)');
    }
    
    // 4. Corrigir consulta getStatsByTvShowId - contagem de arquivos
    const statsFilesPattern = /(getStatsByTvShowId.*?\{[\s\S]*?const fileCountResult = await this\.db\('video as v'\)[\s\S]*?\.where\('v\.show_id', tvShowId\)[\s\S]*?)\.where\("deleted", false\)([\s\S]*?\.timeout\(20000\))/;
    if (statsFilesPattern.test(content)) {
      content = content.replace(statsFilesPattern, (match, before, after) => {
        return `${before}.where("v.deleted", false)${after}`;
      });
      modified = true;
      console.log('✅ Corrigida consulta getStatsByTvShowId (contagem de arquivos)');
    }
    
    // 5. Corrigir a subquery na consulta findWithFilters
    const findWithFiltersPattern = /(findWithFilters.*?\{[\s\S]*?\.leftJoin\(\s*this\.db\('video'\)\s*\.select\('show_id'\)\s*\.count\('\* as video_count'\)\s*?)\.where\("deleted", false\)([\s\S]*?\.groupBy\('show_id'\)\s*\.as\('video_counts'\))/;
    if (findWithFiltersPattern.test(content)) {
      content = content.replace(findWithFiltersPattern, (match, before, after) => {
        return `${before}.where("deleted", false)${after}`;
      });
      modified = true;
      console.log('✅ Corrigida subquery na consulta findWithFilters');
    }
    
    // Salvar arquivo modificado
    if (modified) {
      await writeFileAsync(repoPath, content, 'utf8');
      console.log(`✅ Arquivo ${repoPath} modificado com sucesso!`);
    } else {
      console.log(`ℹ️ Nenhuma modificação necessária em ${repoPath}`);
    }
    
    // Agora vamos corrigir os scripts de teste que usam whereNull('deleted')
    console.log('\n🔍 Procurando scripts de teste que usam whereNull("deleted")...');
    
    const testFiles = [
      '/var/www/portal/backend/test-tv-shows-simple.js',
      '/var/www/portal/backend/test-video-query.js',
      '/var/www/portal/backend/test-video-query-simple.js',
      '/var/www/portal/backend/test-investigate-data.js',
      '/var/www/portal/backend/scripts/check-video-file-relations-simple.js'
    ];
    
    let totalTestFilesModified = 0;
    
    for (const testFile of testFiles) {
      if (fs.existsSync(testFile)) {
        let testContent = await readFileAsync(testFile, 'utf8');
        const whereNullPattern = /\.whereNull\(['"]deleted['"]\)/g;
        
        if (whereNullPattern.test(testContent)) {
          const newTestContent = testContent.replace(whereNullPattern, ".where('deleted', false)");
          await writeFileAsync(testFile, newTestContent, 'utf8');
          totalTestFilesModified++;
          console.log(`✅ Corrigido arquivo: ${testFile}`);
        }
      } else {
        console.log(`⚠️ Arquivo não encontrado: ${testFile}`);
      }
    }
    
    console.log(`\n✅ Total de arquivos de teste corrigidos: ${totalTestFilesModified}`);
    console.log('\n✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar o script
fixRepositoryQueries().catch(console.error); 