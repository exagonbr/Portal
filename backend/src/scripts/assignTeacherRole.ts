#!/usr/bin/env node

import { RoleService } from '../services/RoleService';
import testDatabaseConnection from '../config/database';
import closeDatabaseConnection from '../config/database';
import { Logger } from '../utils/Logger';

const logger = new Logger('AssignTeacherRoleScript');

async function assignTeacherRoleToImportedUsers() {
  logger.info('🚀 Iniciando script para atribuir role TEACHER aos usuários importados...');

  try {
    // Testar conexão com o banco
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      logger.error('❌ Falha na conexão com o banco de dados');
      process.exit(1);
    }

    const roleService = new RoleService();
    
    logger.info('🔍 Buscando usuários sem role definida...');
    
    const result = await roleService.assignTeacherRoleToImportedUsers();
    
    if (!result.success) {
      logger.error('❌ Erro ao atribuir role TEACHER:', result.error);
      process.exit(1);
    }

    const { updated } = result.data!;
    
    if (updated > 0) {
      logger.info(`✅ Role TEACHER atribuída com sucesso a ${updated} usuários importados`);
    } else {
      logger.info('ℹ️  Nenhum usuário sem role encontrado. Todos os usuários já possuem roles atribuídas.');
    }

    logger.info('🎉 Script concluído com sucesso!');

  } catch (error) {
    logger.error('❌ Erro inesperado durante a execução do script:', error as Error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  assignTeacherRoleToImportedUsers()
    .then(() => {
      logger.info('✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { assignTeacherRoleToImportedUsers }; 