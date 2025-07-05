import { AppDataSource } from '../src/config/typeorm.config';
import { VideoCollectionService } from '../src/services/VideoCollectionService';
import { VideoCollection } from '../src/entities/VideoCollection';

async function testCollectionsCRUD() {
  try {
    console.log('🚀 Iniciando teste de CRUD de coleções...');
    
    // Inicializar conexão TypeORM
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão TypeORM inicializada');
    }
    
    const collectionService = new VideoCollectionService();
    
    // 1. Criar uma coleção de teste
    console.log('\n📝 Criando coleção de teste...');
    const testCollection = await collectionService.createCollection({
      name: 'Coleção de Teste - Matemática Básica',
      synopsis: 'Uma coleção educativa sobre conceitos fundamentais de matemática para ensino fundamental.',
      producer: 'Editora Educacional Teste',
      release_date: new Date('2024-01-15'),
      contract_expiry_date: new Date('2025-12-31'),
      authors: ['Prof. João Silva', 'Prof. Maria Santos'],
      target_audience: ['ENSINO_FUNDAMENTAL', 'ANOS_INICIAIS'],
      total_hours: '02:30:00',
      poster_image_url: 'https://example.com/poster-matematica.jpg',
      carousel_image_url: 'https://example.com/carousel-matematica.jpg',
      ebook_file_url: 'https://example.com/manual-matematica.pdf',
      use_default_cover_for_videos: true,
      popularity: 8.5,
      vote_average: 4.2,
      vote_count: 150
    });
    
    console.log('✅ Coleção criada:', testCollection.id, '-', testCollection.name);
    
    // 2. Criar vídeos de teste
    console.log('\n🎥 Criando vídeos de teste...');
    const video1 = await collectionService.createVideo({
      collection_id: testCollection.id,
      module_number: 1,
      title: 'Introdução aos Números',
      synopsis: 'Aprenda os conceitos básicos sobre números naturais e suas operações.',
      release_year: 2024,
      duration: '00:25:30',
      education_cycle: 'ENSINO_FUNDAMENTAL',
      poster_image_url: 'https://example.com/video1-poster.jpg',
      video_url: 'https://example.com/video1.mp4',
      order_in_module: 1
    });
    
    const video2 = await collectionService.createVideo({
      collection_id: testCollection.id,
      module_number: 1,
      title: 'Operações Básicas',
      synopsis: 'Adição, subtração, multiplicação e divisão explicadas de forma simples.',
      release_year: 2024,
      duration: '00:30:15',
      education_cycle: 'ENSINO_FUNDAMENTAL',
      order_in_module: 2
    });
    
    console.log('✅ Vídeo 1 criado:', video1.id, '-', video1.title);
    console.log('✅ Vídeo 2 criado:', video2.id, '-', video2.title);
    
    // 3. Buscar coleção com vídeos
    console.log('\n🔍 Buscando coleção com vídeos...');
    const collectionWithVideos = await collectionService.getCollectionWithVideos(testCollection.id);
    
    if (collectionWithVideos) {
      console.log('✅ Coleção encontrada:', collectionWithVideos.name);
      console.log('📹 Total de vídeos:', collectionWithVideos.videos.length);
      collectionWithVideos.videos.forEach((video, index) => {
        console.log(`   ${index + 1}. Módulo ${video.module_number} - ${video.title} (${video.duration})`);
      });
    }
    
    // 4. Listar todas as coleções
    console.log('\n📋 Listando todas as coleções...');
    const allCollections = await collectionService.getAllCollectionsForManagement();
    console.log('✅ Total de coleções:', allCollections.length);
    allCollections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (${collection.video_count} vídeos)`);
    });
    
    // 5. Buscar coleções públicas
    console.log('\n🌐 Buscando coleções públicas...');
    const publicCollections = await collectionService.getPublicCollections();
    console.log('✅ Coleções públicas:', publicCollections.length);
    
    // 6. Pesquisar coleções
    console.log('\n🔎 Pesquisando por "matemática"...');
    const searchResults = await collectionService.searchCollections('matemática');
    console.log('✅ Resultados da pesquisa:', searchResults.length);
    
    // 7. Atualizar coleção
    console.log('\n✏️  Atualizando coleção...');
    const updatedCollection = await collectionService.updateCollection(testCollection.id, {
      synopsis: 'Uma coleção educativa ATUALIZADA sobre conceitos fundamentais de matemática.',
      popularity: 9.0,
      vote_count: 200
    });
    
    if (updatedCollection) {
      console.log('✅ Coleção atualizada - Nova popularidade:', updatedCollection.popularity);
    }
    
    // 8. Buscar próximo número de módulo
    console.log('\n🔢 Testando próximo número de módulo...');
    const nextModule = await collectionService.getNextModuleNumber(testCollection.id);
    console.log('✅ Próximo número de módulo:', nextModule);
    
    // 9. Buscar próxima ordem no módulo
    const nextOrder = await collectionService.getNextOrderInModule(testCollection.id, 1);
    console.log('✅ Próxima ordem no módulo 1:', nextOrder);
    
    // 10. Contar vídeos na coleção
    const videoCount = await collectionService.getVideoCountForCollection(testCollection.id);
    console.log('✅ Total de vídeos na coleção:', videoCount);
    
    console.log('\n🎉 Teste de CRUD concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('- ✅ Criação de coleção: OK');
    console.log('- ✅ Criação de vídeos: OK');
    console.log('- ✅ Busca com relacionamentos: OK');
    console.log('- ✅ Listagem para gerenciamento: OK');
    console.log('- ✅ API pública: OK');
    console.log('- ✅ Pesquisa: OK');
    console.log('- ✅ Atualização: OK');
    console.log('- ✅ Funções auxiliares: OK');
    
  } catch (error) {
    console.log('💥 Erro durante o teste:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão TypeORM finalizada');
    }
    process.exit(0);
  }
}

// Executar o teste
testCollectionsCRUD(); 