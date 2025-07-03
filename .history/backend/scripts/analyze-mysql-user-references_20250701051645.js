const mysql = require('mysql2/promise');

async function analyzeUserReferences() {
  const connection = await mysql.createConnection({
    host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password: 'gWg28m8^vffI9X#',
    database: 'sabercon'
  });

  try {
    console.log('🔍 Analyzing MySQL tables for user ID references...\n');

    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    
    const userReferences = [];
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        
        // Look for user-related columns
        const userColumns = columns.filter(col => 
          col.Field.toLowerCase().includes('user') || 
          col.Field.toLowerCase().includes('student') ||
          col.Field.toLowerCase().includes('created_by') ||
          col.Field.toLowerCase().includes('updated_by') ||
          col.Field.toLowerCase().includes('uploaded_by') ||
          col.Field.toLowerCase().includes('generated_by')
        );
        
        if (userColumns.length > 0) {
          userReferences.push({
            table: tableName,
            columns: userColumns.map(col => ({
              field: col.Field,
              type: col.Type,
              key: col.Key,
              null: col.Null,
              default: col.Default
            }))
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not analyze table ${tableName}: ${error.message}`);
      }
    }
    
    console.log('📊 Tables with user ID references:');
    console.log('=====================================\n');
    
    userReferences.forEach(ref => {
      console.log(`Table: ${ref.table}`);
      ref.columns.forEach(col => {
        console.log(`  - ${col.field} (${col.type}) ${col.key ? '[' + col.key + ']' : ''}`);
      });
      console.log('');
    });
    
    console.log(`\nTotal tables with user references: ${userReferences.length}`);
    
    // Generate mapping recommendations
    console.log('\n🔧 Recommended PostgreSQL Legacy ID Mappings:');
    console.log('==============================================\n');
    
    userReferences.forEach(ref => {
      console.log(`Table: ${ref.table}`);
      ref.columns.forEach(col => {
        let legacyColumnName;
        if (col.field === 'user_id') {
          legacyColumnName = 'user_id_legacy';
        } else if (col.field === 'student_id') {
          legacyColumnName = 'student_id_legacy';
        } else if (col.field.includes('created_by')) {
          legacyColumnName = 'created_by_legacy';
        } else if (col.field.includes('updated_by')) {
          legacyColumnName = 'updated_by_legacy';
        } else if (col.field.includes('uploaded_by')) {
          legacyColumnName = 'uploaded_by_legacy';
        } else if (col.field.includes('generated_by')) {
          legacyColumnName = 'generated_by_legacy';
        } else {
          legacyColumnName = col.field + '_legacy';
        }
        
        console.log(`  ${col.field} -> ${legacyColumnName}`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.log('Error analyzing database:', error);
  } finally {
    await connection.end();
  }
}

analyzeUserReferences();
