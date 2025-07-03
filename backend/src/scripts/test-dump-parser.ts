import { DumpParser } from './dump-parser';

async function testDumpParser() {
  console.log('🧪 Testando o parser do dump...\n');

  const parser = new DumpParser({
    dumpDirectory: 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601',
    defaultInstitutionId: 'test-institution-id'
  });

  try {
    // Teste individual de cada parser
    console.log('📺 Testando parse de TV Shows...');
    const tvShows = await parser.parseTvShows();
    console.log(`✅ ${tvShows.length} TV Shows encontradas`);
    if (tvShows.length > 0) {
      console.log('📋 Amostra:', JSON.stringify(tvShows[0], null, 2));
    }

    console.log('\n🎬 Testando parse de Videos...');
    const videos = await parser.parseVideos();
    console.log(`✅ ${videos.length} Videos encontrados`);
    if (videos.length > 0) {
      console.log('📋 Amostra:', JSON.stringify(videos[0], null, 2));
    }

    console.log('\n👥 Testando parse de Users...');
    const users = await parser.parseUsers();
    console.log(`✅ ${users.length} Users encontrados`);
    if (users.length > 0) {
      const userSample = { ...users[0] };
      userSample.password = '[HIDDEN]'; // Não mostrar senha
      console.log('📋 Amostra:', JSON.stringify(userSample, null, 2));
    }

    console.log('\n📁 Testando parse de Files...');
    const files = await parser.parseFiles();
    console.log(`✅ ${files.length} Files encontrados`);
    if (files.length > 0) {
      console.log('📋 Amostra:', JSON.stringify(files[0], null, 2));
    }

    console.log('\n✍️ Testando parse de Authors...');
    const authors = await parser.parseAuthors();
    console.log(`✅ ${authors.length} Authors encontrados`);
    if (authors.length > 0) {
      console.log('📋 Amostra:', JSON.stringify(authors[0], null, 2));
    }

    console.log('\n🏛️ Testando parse de Institutions...');
    const institutions = await parser.parseInstitutions();
    console.log(`✅ ${institutions.length} Institutions encontradas`);
    if (institutions.length > 0) {
      console.log('📋 Amostra:', JSON.stringify(institutions[0], null, 2));
    }

    console.log('\n🔗 Testando parse de Relacionamentos...');
    const tvShowAuthors = await parser.parseTvShowAuthors();
    console.log(`✅ ${tvShowAuthors.length} TV Show Authors encontrados`);
    
    const videoAuthors = await parser.parseVideoAuthors();
    console.log(`✅ ${videoAuthors.length} Video Authors encontrados`);
    
    const videoFiles = await parser.parseVideoFiles();
    console.log(`✅ ${videoFiles.length} Video Files encontrados`);

    const genres = await parser.parseGenres();
    console.log(`✅ ${genres.length} Genres encontrados`);

    // Teste do parseAll
    console.log('\n🚀 Testando parseAll...');
    const allData = await parser.parseAll();
    
    console.log(`\n📊 RESUMO COMPLETO:
      📺 TV Shows: ${allData.tvShows.length}
      🎬 Videos: ${allData.videos.length}
      👥 Users: ${allData.users.length}
      📁 Files: ${allData.files.length}
      ✍️ Authors: ${allData.authors.length}
      🎭 Genres: ${allData.genres.length}
      🏛️ Institutions: ${allData.institutions.length}
      
      🔗 Relacionamentos:
      - TV Show Authors: ${allData.relationships.tvShowAuthors.length}
      - Video Authors: ${allData.relationships.videoAuthors.length}
      - Video Files: ${allData.relationships.videoFiles.length}
      - TV Show Genres: ${allData.relationships.tvShowGenres.length}
    `);

    // Validações básicas
    console.log('\n✅ VALIDAÇÕES:');
    
    // Verificar se temos dados essenciais
    if (allData.tvShows.length === 0) {
      console.log('⚠️ Nenhuma TV Show encontrada');
    } else {
      console.log(`✅ ${allData.tvShows.length} TV Shows validadas`);
    }

    if (allData.users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado');
    } else {
      console.log(`✅ ${allData.users.length} usuários validados`);
    }

    // Verificar integridade dos dados
    const tvShowsWithTitle = allData.tvShows.filter(ts => ts.title && ts.title.length > 0);
    console.log(`✅ ${tvShowsWithTitle.length}/${allData.tvShows.length} TV Shows têm título válido`);

    const usersWithEmail = allData.users.filter(u => u.email && u.email.includes('@'));
    console.log(`✅ ${usersWithEmail.length}/${allData.users.length} usuários têm email válido`);

    const filesWithSize = allData.files.filter(f => f.size && f.size > 0);
    console.log(`✅ ${filesWithSize.length}/${allData.files.length} arquivos têm tamanho válido`);

    console.log('\n🎉 Teste do parser concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testDumpParser().catch(console.error);
}

export { testDumpParser }; 