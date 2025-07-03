const { AppDataSource } = require('./backend/dist/config/typeorm.config');
const { User } = require('./backend/dist/entities/User');
const { Role } = require('./backend/dist/entities/Role');

async function debugAuth() {
  try {
    console.log('🔍 Iniciando debug de autenticação...');
    
    // Inicializar conexão com banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão com banco estabelecida');
    }
    
    // Verificar se o usuário admin existe
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({
      where: { email: 'admin@portal.com' },
      relations: ['role', 'institution']
    });
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado no banco');
      return;
    }
    
    console.log('✅ Usuário admin encontrado:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      is_active: adminUser.is_active,
      role: adminUser.role ? adminUser.role.name : 'sem role'
    });
    
    // Testar comparação de senha
    const isValidPassword = await adminUser.comparePassword('admin123');
    console.log('🔐 Teste de senha:', isValidPassword ? '✅ Válida' : '❌ Inválida');
    
    if (!isValidPassword) {
      console.log('🔍 Hash da senha no banco:', adminUser.password);
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

debugAuth(); 