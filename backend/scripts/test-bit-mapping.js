const mysql = require('mysql2/promise');

async function testBitMapping() {
  let connection;
  
  try {
    // Conectar ao MySQL (usar suas credenciais)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'portal'
    });

    console.log('🔍 Testando mapeamento de campos bit(1)...\n');

    // Buscar tabelas com campos bit(1)
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND DATA_TYPE = 'bit'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `, [process.env.MYSQL_DATABASE || 'portal']);

    if (tables.length === 0) {
      console.log('❌ Nenhum campo bit(1) encontrado no banco de dados');
      return;
    }

    console.log(`✅ Encontrados ${tables.length} campos bit(1):\n`);

    // Mostrar campos encontrados
    tables.forEach(table => {
      console.log(`📊 Tabela: ${table.TABLE_NAME}`);
      console.log(`   📝 Coluna: ${table.COLUMN_NAME}`);
      console.log(`   🔧 Tipo: ${table.DATA_TYPE} (${table.COLUMN_TYPE})`);
      console.log(`   ❓ Nullable: ${table.IS_NULLABLE}`);
      console.log(`   🎯 Default: ${table.COLUMN_DEFAULT}`);
      console.log('');
    });

    // Testar alguns valores de exemplo
    console.log('🧪 Testando conversão de valores bit(1):\n');

    for (const table of tables.slice(0, 3)) { // Testar apenas as 3 primeiras
      try {
        const [rows] = await connection.execute(
          `SELECT ${table.COLUMN_NAME} FROM ${table.TABLE_NAME} LIMIT 5`
        );

        console.log(`📊 Valores de ${table.TABLE_NAME}.${table.COLUMN_NAME}:`);
        
        rows.forEach((row, index) => {
          const value = row[table.COLUMN_NAME];
          console.log(`   ${index + 1}. Valor original:`, value);
          console.log(`      Tipo:`, typeof value);
          console.log(`      É Buffer:`, Buffer.isBuffer(value));
          
          if (Buffer.isBuffer(value)) {
            console.log(`      Buffer[0]:`, value[0]);
            console.log(`      → Boolean:`, value[0] === 1);
          } else {
            console.log(`      → Boolean:`, Boolean(value));
          }
          console.log('');
        });

      } catch (error) {
        console.log(`❌ Erro ao testar tabela ${table.TABLE_NAME}:`, error.message);
      }
    }

    // Mostrar mapeamento PostgreSQL
    console.log('🐘 Mapeamento para PostgreSQL:\n');
    console.log('   MySQL bit(1) → PostgreSQL boolean');
    console.log('   Conversão: Buffer[0] === 1 ? true : false');
    console.log('   Alternativa: Boolean(value)');

  } catch (error) {
    console.log('❌ Erro ao conectar ou testar:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar teste
testBitMapping().catch(console.log); 