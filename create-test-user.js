const { AppDataSource } = require('./backend/dist/config/typeorm.config');
const { User } = require('./backend/dist/entities/User');
const { Role } = require('./backend/dist/entities/Role');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        console.log('🚀 Criando usuário de teste...');
        
        // Inicializar conexão com o banco
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Conectado ao banco de dados via TypeORM');
        }
        
        const userRepository = AppDataSource.getRepository(User);
        const roleRepository = AppDataSource.getRepository(Role);
        
        // Verificar se o usuário já existe
        const existingUser = await userRepository.findOne({
            where: { email: 'teste@portal.com' }
        });
        
        if (existingUser) {
            console.log('✅ Usuário de teste já existe!');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Nome: ${existingUser.fullName}`);
            return existingUser;
        }
        
        // Buscar ou criar uma role padrão
        let role = await roleRepository.findOne({
            where: { name: 'STUDENT' }
        });
        
        if (!role) {
            console.log('📝 Criando role STUDENT...');
            role = roleRepository.create({
                name: 'STUDENT',
                description: 'Estudante do sistema',
                isActive: true
            });
            await roleRepository.save(role);
            console.log('✅ Role STUDENT criada');
        }
        
        // Criar usuário de teste
        console.log('👤 Criando usuário...');
        const hashedPassword = await bcrypt.hash('teste123', 12);
        
        const user = userRepository.create({
            email: 'teste@portal.com',
            fullName: 'Usuário de Teste',
            password: hashedPassword,
            enabled: true,
            isAdmin: false,
            isManager: false,
            isStudent: true,
            isTeacher: false,
            role: role
        });
        
        await userRepository.save(user);
        console.log('✅ Usuário de teste criado com sucesso!');
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.fullName}`);
        console.log(`   Role: ${role.name}`);
        console.log(`   Senha: teste123`);
        
        return user;
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário de teste:', error.message);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    createTestUser()
        .then(() => {
            console.log('\n🎉 Usuário de teste criado com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro:', error.message);
            process.exit(1);
        });
}

module.exports = { createTestUser };