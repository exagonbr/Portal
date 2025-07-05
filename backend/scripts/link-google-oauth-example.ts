import knex from 'knex';
import { Knex } from 'knex';
import knexConfig from '../knexfile.js';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Interface para dados do Google OAuth
interface GoogleOAuthData {
  google_id: string;
  google_email: string;
  google_name: string;
  google_picture?: string;
  google_access_token: string;
  google_refresh_token?: string;
  google_token_expires_at: Date;
}

// Função para vincular conta Google a um usuário existente
async function linkGoogleOAuthToUser(
  db: Knex, 
  userEmail: string, 
  googleData: GoogleOAuthData
): Promise<boolean> {
  try {
    console.log(`🔗 Vinculando conta Google ao usuário: ${userEmail}`);
    
    // Verificar se o usuário existe
    const user = await db('user').where('email', userEmail).first();
    if (!user) {
      console.log(`   ❌ Usuário ${userEmail} não encontrado`);
      return false;
    }
    
    // Verificar se o Google ID já está em uso
    const existingGoogleUser = await db('user').where('google_id', googleData.google_id).first();
    if (existingGoogleUser && existingGoogleUser.id !== user.id) {
      console.log(`   ❌ Google ID ${googleData.google_id} já está vinculado a outro usuário`);
      return false;
    }
    
    // Atualizar usuário com dados do Google
    await db('user')
      .where('id', user.id)
      .update({
        google_id: googleData.google_id,
        google_email: googleData.google_email,
        google_name: googleData.google_name,
        google_picture: googleData.google_picture || null,
        google_access_token: googleData.google_access_token,
        google_refresh_token: googleData.google_refresh_token || null,
        google_token_expires_at: googleData.google_token_expires_at,
        is_google_verified: true,
        google_linked_at: new Date(),
        updated_at: new Date()
      });
    
    console.log(`   ✅ Conta Google vinculada com sucesso!`);
    console.log(`   📧 Google Email: ${googleData.google_email}`);
    console.log(`   👤 Google Name: ${googleData.google_name}`);
    console.log(`   🆔 Google ID: ${googleData.google_id}`);
    
    return true;
    
  } catch (error: any) {
    console.log(`   ❌ Erro ao vincular conta Google: ${error.message}`);
    return false;
  }
}

// Função para desvincular conta Google de um usuário
async function unlinkGoogleOAuthFromUser(db: Knex, userEmail: string): Promise<boolean> {
  try {
    console.log(`🔓 Desvinculando conta Google do usuário: ${userEmail}`);
    
    // Verificar se o usuário existe
    const user = await db('user').where('email', userEmail).first();
    if (!user) {
      console.log(`   ❌ Usuário ${userEmail} não encontrado`);
      return false;
    }
    
    // Limpar dados do Google
    await db('user')
      .where('id', user.id)
      .update({
        google_id: null,
        google_email: null,
        google_name: null,
        google_picture: null,
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null,
        is_google_verified: false,
        google_linked_at: null,
        updated_at: new Date()
      });
    
    console.log(`   ✅ Conta Google desvinculada com sucesso!`);
    return true;
    
  } catch (error: any) {
    console.log(`   ❌ Erro ao desvincular conta Google: ${error.message}`);
    return false;
  }
}

// Função para listar usuários com contas Google vinculadas
async function listUsersWithGoogleOAuth(db: Knex): Promise<void> {
  try {
    console.log('📋 Usuários com contas Google vinculadas:');
    
    const usersWithGoogle = await db('user')
      .select('email', 'name', 'google_email', 'google_name', 'google_id', 'is_google_verified', 'google_linked_at')
      .whereNotNull('google_id')
      .orderBy('google_linked_at', 'desc');
    
    if (usersWithGoogle.length === 0) {
      console.log('   ℹ️  Nenhum usuário com conta Google vinculada encontrado');
      return;
    }
    
    usersWithGoogle.forEach((user, index) => {
      console.log(`\n   ${index + 1}. ${user.email} (${user.name})`);
      console.log(`      📧 Google Email: ${user.google_email}`);
      console.log(`      👤 Google Name: ${user.google_name}`);
      console.log(`      🆔 Google ID: ${user.google_id}`);
      console.log(`      ✅ Verificado: ${user.is_google_verified ? 'Sim' : 'Não'}`);
      console.log(`      📅 Vinculado em: ${user.google_linked_at ? new Date(user.google_linked_at).toLocaleString('pt-BR') : 'N/A'}`);
    });
    
    console.log(`\n📊 Total: ${usersWithGoogle.length} usuário(s) com conta Google vinculada`);
    
  } catch (error: any) {
    console.log(`❌ Erro ao listar usuários: ${error.message}`);
  }
}

// Função principal para demonstração
async function demonstrateGoogleOAuth(): Promise<void> {
  console.log('🚀 DEMONSTRAÇÃO DE VINCULAÇÃO OAUTH GOOGLE\n');
  
  let db: Knex | null = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Listar usuários existentes com Google OAuth
    await listUsersWithGoogleOAuth(db);
    
    console.log('\n' + '='.repeat(60));
    console.log('📖 EXEMPLO DE COMO USAR AS FUNÇÕES:');
    console.log('='.repeat(60));
    
    console.log(`
// Exemplo de dados do Google OAuth (obtidos do Google API)
const googleData = {
  google_id: "123456789012345678901",
  google_email: "admin@sabercon.edu.br",
  google_name: "Administrador do Sistema",
  google_picture: "https://lh3.googleusercontent.com/a/example",
  google_access_token: "ya29.a0AfH6SMC...",
  google_refresh_token: "1//04...",
  google_token_expires_at: new Date(Date.now() + 3600000) // 1 hora
};

// Vincular conta Google ao usuário
await linkGoogleOAuthToUser(db, "admin@sabercon.edu.br", googleData);

// Desvincular conta Google do usuário
await unlinkGoogleOAuthFromUser(db, "admin@sabercon.edu.br");

// Listar usuários com Google OAuth
await listUsersWithGoogleOAuth(db);
    `);
    
    console.log('\n💡 DICAS DE IMPLEMENTAÇÃO:');
    console.log('• Use estas funções em seus controllers de autenticação');
    console.log('• Implemente middleware para verificar tokens expirados');
    console.log('• Considere renovar tokens automaticamente usando refresh_token');
    console.log('• Valide sempre os dados do Google antes de salvar');
    console.log('• Implemente logs de auditoria para vinculações/desvinculações');
    
  } catch (error: any) {
    console.log('\n❌ ERRO DURANTE A DEMONSTRAÇÃO:');
    console.log(error.message);
    throw error;
  } finally {
    // Fechar conexão
    if (db) {
      await db.destroy();
    }
  }
}

// Executar demonstração
if (require.main === module) {
  demonstrateGoogleOAuth()
    .then(() => {
      console.log('\n✅ Demonstração finalizada.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

export { 
  linkGoogleOAuthToUser, 
  unlinkGoogleOAuthFromUser, 
  listUsersWithGoogleOAuth,
  demonstrateGoogleOAuth 
}; 