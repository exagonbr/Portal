import db from '../config/database';

async function checkUsersSchema() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...\n');
    
    // Buscar informações sobre as colunas da tabela
    const columns = await db('information_schema.columns')
      .where({
        table_schema: 'public',
        table_name: 'users'
      })
      .select('column_name', 'data_type', 'is_nullable', 'column_default')
      .orderBy('ordinal_position');
    
    if (columns.length === 0) {
      console.log('❌ Tabela users não encontrada ou sem colunas!');
    } else {
      console.log('📋 Colunas da tabela users:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
    // Verificar instituições existentes
    console.log('\n📋 Instituições existentes:');
    const institutions = await db('institution').select('id', 'name').limit(5);
    institutions.forEach(inst => {
      console.log(`   - ID: ${inst.id} (tipo: ${typeof inst.id}) - ${inst.name}`);
    });
    
    // Verificar roles existentes
    console.log('\n📋 Roles existentes:');
    const roles = await db('roles').select('id', 'name').limit(5);
    roles.forEach(role => {
      console.log(`   - ID: ${role.id} (tipo: ${typeof role.id}) - ${role.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
  } finally {
    await db.destroy();
  }
}

checkUsersSchema();