const { AppDataSource } = require('./dist/config/typeorm.config.js');

async function testTypeORMInit() {
  try {
    console.log('🔧 Testando inicialização do TypeORM...');
    
    // Verificar se o DataSource está configurado
    console.log('📋 Configuração do DataSource:');
    console.log('  - Tipo:', AppDataSource.options.type);
    console.log('  - Host:', AppDataSource.options.host);
    console.log('  - Database:', AppDataSource.options.database);
    console.log('  - Entidades configuradas:', AppDataSource.options.entities.length);
    
    // Listar as entidades configuradas
    console.log('\n📊 Entidades configuradas:');
    AppDataSource.options.entities.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });
    
    // Tentar inicializar
    if (!AppDataSource.isInitialized) {
      console.log('\n🔄 Inicializando TypeORM...');
      await AppDataSource.initialize();
      console.log('✅ TypeORM inicializado com sucesso!');
    } else {
      console.log('\n✅ TypeORM já estava inicializado');
    }
    
    // Verificar se as entidades foram carregadas
    console.log('\n🔍 Verificando metadados das entidades...');
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log(`📋 Total de metadados carregados: ${entityMetadatas.length}`);
    
    // Procurar especificamente pela entidade User
    const userMetadata = entityMetadatas.find(meta => meta.name === 'User');
    if (userMetadata) {
      console.log('✅ Metadados da entidade User encontrados!');
      console.log('  - Nome da tabela:', userMetadata.tableName);
      console.log('  - Colunas:', userMetadata.columns.length);
    } else {
      console.log('❌ Metadados da entidade User NÃO encontrados!');
      console.log('📋 Entidades disponíveis:');
      entityMetadatas.forEach(meta => {
        console.log(`  - ${meta.name} (tabela: ${meta.tableName})`);
      });
    }
    
    // Tentar obter o repositório User
    try {
      const { User } = require('./dist/entities/User.js');
      const userRepo = AppDataSource.getRepository(User);
      console.log('✅ Repositório User obtido com sucesso!');
      
      // Tentar fazer uma consulta simples
      const count = await userRepo.count();
      console.log(`📊 Total de usuários na tabela: ${count}`);
      
    } catch (repoError) {
      console.log('❌ Erro ao obter repositório User:', repoError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testTypeORMInit(); 