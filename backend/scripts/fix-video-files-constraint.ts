import knex from 'knex';

interface ColumnInfo {
  column_name: string;
  is_nullable: string;
  data_type: string;
  column_default: string | null;
}

interface ConstraintInfo {
  conname: string;
  contype: string;
}

async function fixVideoFilesConstraint() {
  console.log('🔧 Verificando constraints da tabela video_files...');
  
  const db = knex({
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'postgres',
      password: 'root'
    }
  });
  
  try {
    // Verificar se a constraint já existe
    const constraints = await db.raw(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'video_files'::regclass;
    `);
    
    console.log('📋 Constraints existentes:', constraints.rows);
    
    // Verificar se a tabela tem chave primária composta
    const tableInfo = await db.raw(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'video_files' 
      ORDER BY ordinal_position;
    `);
    
    console.log('🗃️  Estrutura da tabela video_files:');
    (tableInfo.rows as ColumnInfo[]).forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });
    
    // Adicionar constraint única se não existir
    const uniqueConstraintExists = (constraints.rows as ConstraintInfo[]).some(c => 
      c.conname.includes('video_files') && c.contype === 'u'
    );
    
    if (!uniqueConstraintExists) {
      console.log('➕ Adicionando constraint única...');
      await db.raw(`
        ALTER TABLE video_files 
        ADD CONSTRAINT video_files_video_id_file_id_unique 
        UNIQUE (video_id, file_id);
      `);
      console.log('✅ Constraint única adicionada com sucesso!');
    } else {
      console.log('✅ Constraint única já existe!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar/corrigir constraints:', error);
  } finally {
    await db.destroy();
  }
}

fixVideoFilesConstraint(); 