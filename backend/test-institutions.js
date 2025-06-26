const knex = require('knex');
const path = require('path');

// Configuração do banco de dados
const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'portal_sabercon'
  },
  pool: {
    min: 2,
    max: 10
  }
});

async function testInstitutions() {
  try {
    console.log('🔍 Testando conexão com a tabela institutions...');
    
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('institutions');
    console.log('📋 Tabela institutions existe:', hasTable);
    
    if (!hasTable) {
      console.log('❌ Tabela institutions não encontrada!');
      return;
    }
    
    // Verificar estrutura da tabela
    const columns = await db('information_schema.columns')
      .where('table_name', 'institutions')
      .andWhere('table_schema', 'public')
      .select('column_name', 'data_type', 'is_nullable');
    
    console.log('📊 Estrutura da tabela institutions:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Contar registros
    const count = await db('institutions').count('* as total').first();
    console.log('📈 Total de registros:', count.total);
    
    // Buscar alguns registros
    const institutions = await db('institutions').select('*').limit(5);
    console.log('📋 Primeiros registros:');
    institutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.code}) - Ativo: ${inst.is_active}`);
    });
    
    // Testar inserção de uma instituição de teste
    const testInstitution = {
      id: db.raw('gen_random_uuid()'),
      name: 'Instituição Teste',
      code: 'TEST_' + Date.now(),
      type: 'SCHOOL',
      description: 'Instituição criada para teste',
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    };
    
    console.log('➕ Inserindo instituição de teste...');
    const inserted = await db('institutions').insert(testInstitution).returning('*');
    console.log('✅ Instituição inserida:', inserted[0].name);
    
    // Remover a instituição de teste
    await db('institutions').where('code', testInstitution.code).del();
    console.log('🗑️ Instituição de teste removida');
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await db.destroy();
  }
}

testInstitutions(); 