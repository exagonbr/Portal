const { AppDataSource } = require('./backend/src/config/typeorm.config');
const { User } = require('./backend/src/entities/User');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('✅ Conectado ao banco de dados');
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Verificar se o usuário já existe
    const existingUser = await userRepository.findOne({
      where: { email: 'admin@exemplo.com' }
    });
    
    if (existingUser) {
      console.log('👤 Usuário admin@exemplo.com já existe');
      
      // Atualizar a senha
      const hashedPassword = await bcrypt.hash('senha123', 12);
      existingUser.password = hashedPassword;
      await userRepository.save(existingUser);
      
      console.log('🔐 Senha atualizada para: senha123');
    } else {
      console.log('➕ Criando novo usuário admin@exemplo.com...');
      
      const hashedPassword = await bcrypt.hash('senha123', 12);
      
      const newUser = userRepository.create({
        email: 'admin@exemplo.com',
        password: hashedPassword,
        name: 'Administrador Teste',
        is_active: true,
        role_id: 1, // Assumindo que existe um role com ID 1
        institution_id: 1 // Assumindo que existe uma instituição com ID 1
      });
      
      await userRepository.save(newUser);
      console.log('✅ Usuário criado com sucesso!');
    }
    
    console.log('\n🎯 CREDENCIAIS DE TESTE:');
    console.log('📧 Email: admin@exemplo.com');
    console.log('🔐 Senha: senha123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

createTestUser();