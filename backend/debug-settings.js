const knex = require('knex');
const path = require('path');

// Configuração do banco de dados
const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal_db'
  }
};

const db = knex(config);

async function debugSettings() {
  try {
    console.log('🔍 Verificando tabela system_settings...');
    
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('system_settings');
    console.log('✅ Tabela system_settings existe:', hasTable);
    
    if (hasTable) {
      // Contar registros
      const count = await db('system_settings').count('* as total').first();
      console.log('📊 Total de configurações:', count.total);
      
      // Listar algumas configurações
      const settings = await db('system_settings').select('*').limit(10);
      console.log('📋 Configurações encontradas:');
      settings.forEach(setting => {
        console.log(`  - ${setting.key}: ${setting.value} (${setting.type}, ${setting.category})`);
      });
      
      // Testar operação de update
      console.log('\n🧪 Testando operação de update...');
      try {
        // Primeiro, inserir uma configuração de teste
        const testId = 'test-' + Date.now();
        await db('system_settings').insert({
          id: testId,
          key: 'test_setting',
          value: 'test_value',
          type: 'string',
          category: 'general',
          description: 'Configuração de teste',
          is_public: false,
          is_encrypted: false,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('✅ Inserção de teste bem-sucedida');
        
        // Tentar atualizar
        await db('system_settings')
          .where('key', 'test_setting')
          .update({
            value: 'updated_value',
            updated_at: new Date()
          });
        console.log('✅ Update de teste bem-sucedido');
        
        // Verificar se foi atualizado
        const updated = await db('system_settings')
          .where('key', 'test_setting')
          .first();
        console.log('📝 Valor atualizado:', updated.value);
        
        // Limpar teste
        await db('system_settings').where('key', 'test_setting').del();
        console.log('🧹 Limpeza concluída');
        
      } catch (updateError) {
        console.error('❌ Erro na operação de update:', updateError.message);
        console.error('Stack completo:', updateError.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack completo:', error.stack);
  } finally {
    await db.destroy();
    console.log('🔌 Conexão fechada');
  }
}

// Executar debug
debugSettings().catch(console.error); 