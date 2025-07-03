import { AppDataSource } from '../src/config/typeorm.config';
import { VideoCollection } from '../src/entities/VideoCollection';
import { VideoModule } from '../src/entities/VideoModule';

async function testTypeORMConnection() {
  try {
    console.log('🔧 Testando conexão TypeORM...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ TypeORM inicializado com sucesso');
    }

    // Testar se as entidades estão registradas
    const videoCollectionRepo = AppDataSource.getRepository(VideoCollection);
    const videoModuleRepo = AppDataSource.getRepository(VideoModule);

    console.log('✅ Repository VideoCollection criado com sucesso');
    console.log('✅ Repository VideoModule criado com sucesso');

    // Testar criação de uma coleção
    const testCollection = videoCollectionRepo.create({
      name: 'Teste TypeORM',
      synopsis: 'Teste de conexão TypeORM',
      authors: ['Teste'],
      target_audience: ['Teste']
    });

    console.log('✅ Entidade VideoCollection criada em memória com sucesso');
    console.log('📝 Coleção teste:', testCollection.name);
    console.log('📝 Repositories disponíveis:', videoModuleRepo ? 'VideoModule OK' : 'VideoModule ERRO');
    console.log('📊 Teste de conexão TypeORM concluído com sucesso!');

  } catch (error) {
    console.log('❌ Erro no teste TypeORM:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão TypeORM fechada');
    }
  }
}

// Executar o teste
testTypeORMConnection()
  .then(() => {
    console.log('🎉 Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('💥 Teste falhou:', error);
    process.exit(1);
  }); 