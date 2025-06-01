const knex = require('knex');
const bcrypt = require('bcryptjs');
const { root } = require('postcss');
require('dotenv').config();

// Configuração do banco
const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
});

async function fixPassword() {
  try {
    console.log('🔧 Corrigindo senha do usuário admin...');
    
    // Gerar novo hash para a senha "password123"
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash('password123', salt);
    
    console.log('🔐 Novo hash gerado:', newHash);
    
    // Testar o novo hash
    const isValid = await bcrypt.compare('password123', newHash);
    console.log('✅ Novo hash válido:', isValid);
  

    // Atualizar a senha no banco
    const result = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .update({
        password: newHash,
        updated_at: new Date(),
        role_id: "ed7bfd3b-d502-4e05-9345-6b17c5386e63",
        role: "SYSTEM_ADMIN"
      });


    // Atualizar a senha no banco
    const result2 = await db('users')
      .where('email', 'maia.cspg@gmail.com')
      .update({
        password: newHash,
        updated_at: new Date(),
        role_id: "ed7bfd3b-d502-4e05-9345-6b17c5386e63",
        role: "SYSTEM_ADMIN"
      });

    console.log('📝 Usuários atualizados:', result);
    
    // Verificar se a atualização funcionou
    const user = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .first();
    
    if (user) {
      console.log('🔍 Verificando senha atualizada...');
      const isValidAfterUpdate = await bcrypt.compare('password123', user.password);
      console.log('✅ Senha funciona após atualização:', isValidAfterUpdate);
    }
    
    console.log('🎉 Senha corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir senha:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.destroy();
  }
}

fixPassword();