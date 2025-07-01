const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'password123';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Senha:', password);
    console.log('🔑 Hash gerado:', hash);
    
    // Testar se o hash funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Verificação:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    
    // Gerar comando SQL
    console.log('\n📋 Comando SQL para atualizar:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@sabercon.edu.br';`);
    
  } catch (error) {
    console.log('❌ Erro:', error);
  }
}

generateHash();