import { MigrationService } from '../src/services/MigrationService';
import { AppDataSource } from '../src/config/typeorm.config';

async function testMigration() {
  try {
    console.log('🚀 Iniciando teste de migração...');
    
    // Inicializar conexão TypeORM
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão TypeORM inicializada');
    }
    
    const migrationService = new MigrationService();
    
    // Verificar estatísticas antes da migração
    console.log('\n📊 Estatísticas antes da migração:');
    const statsBefore = await migrationService.getMigrationStats();
    console.log('- Total MySQL:', statsBefore.totalMySQLRecords);
    console.log('- Total migrado:', statsBefore.totalMigratedRecords);
    console.log('- Pendente migração:', statsBefore.pendingMigration);
    
    // Executar migração
    console.log('\n🔄 Executando migração...');
    const result = await migrationService.migrateTVShowsToCollections();
    
    console.log('\n✅ Resultado da migração:');
    console.log('- Migrados:', result.migrated);
    console.log('- Pulados:', result.skipped);
    console.log('- Erros:', result.errors.length);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Erros encontrados:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Verificar estatísticas após a migração
    console.log('\n📊 Estatísticas após a migração:');
    const statsAfter = await migrationService.getMigrationStats();
    console.log('- Total MySQL:', statsAfter.totalMySQLRecords);
    console.log('- Total migrado:', statsAfter.totalMigratedRecords);
    console.log('- Pendente migração:', statsAfter.pendingMigration);
    
    console.log('\n🎉 Teste de migração concluído!');
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão TypeORM finalizada');
    }
    process.exit(0);
  }
}

// Executar o teste
testMigration(); 