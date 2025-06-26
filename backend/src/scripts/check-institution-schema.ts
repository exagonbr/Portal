import db from '../config/database';

async function checkInstitutionSchema() {
  try {
    console.log('🔍 Verificando estrutura da tabela institution...\n');
    
    // Buscar informações sobre as colunas da tabela
    const columns = await db('information_schema.columns')
      .where({
        table_schema: 'public',
        table_name: 'institution'
      })
      .select('column_name', 'data_type', 'is_nullable', 'column_default')
      .orderBy('ordinal_position');
    
    if (columns.length === 0) {
      console.log('❌ Tabela institution não encontrada ou sem colunas!');
    } else {
      console.log('📋 Colunas da tabela institution:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Verificar se existem instituições
    console.log('\n📋 Instituições existentes:');
    const institutions = await db('institution').select('*').limit(5);
    
    if (institutions.length === 0) {
      console.log('   Nenhuma instituição encontrada.');
    } else {
      institutions.forEach(inst => {
        console.log(`   - ID: ${inst.id}, Nome: ${inst.name || inst.nome || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
  } finally {
    await db.destroy();
  }
}

checkInstitutionSchema();