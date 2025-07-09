import { AppDataSource } from './src/config/typeorm.config';

async function createUserTable() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('✅ Conectado ao banco!');
    
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Criar tabela users (plural, como esperado pela entidade)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        full_name VARCHAR(255),
        enabled BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        is_manager BOOLEAN DEFAULT false,
        is_teacher BOOLEAN DEFAULT false,
        is_student BOOLEAN DEFAULT false,
        institution_id INTEGER,
        role_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabela users criada!');
    
    // Inserir usuário admin
    await queryRunner.query(`
      INSERT INTO "users" (email, password, full_name, enabled, is_admin, is_manager, is_teacher, is_student)
      VALUES ('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, true, false, false, false)
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Usuário admin criado!');
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createUserTable(); 