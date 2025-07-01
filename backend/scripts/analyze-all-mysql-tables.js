const mysql = require('mysql2/promise');
const knex = require('knex');

// Configurações de conexão
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portal',
  connectTimeout: 30000
};

const pgConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal'
  }
};

// Função para mapear nomes de tabelas MySQL para PostgreSQL
function mapTableName(mysqlTableName) {
  const mappings = {
    // Mapeamentos específicos conhecidos
    'usuario': 'users',
    'usuarios': 'users',
    'instituicao': 'institutions',
    'instituicoes': 'institutions',
    'curso': 'courses',
    'cursos': 'courses',
    'turma': 'classes',
    'turmas': 'classes',
    'aula': 'lessons',
    'aulas': 'lessons',
    'atividade': 'assignments',
    'atividades': 'assignments',
    'resposta': 'answers',
    'respostas': 'answers',
    'answer': 'answers',
    'pergunta': 'questions',
    'perguntas': 'questions',
    'question': 'questions',
    'arquivo': 'files',
    'arquivos': 'files',
    'livro': 'books',
    'livros': 'books',
    'book': 'books',
    'modulo': 'modules',
    'modulos': 'modules',
    'module': 'modules',
    'forum': 'forums',
    'chat': 'chats',
    'mensagem': 'messages',
    'mensagens': 'messages',
    'message': 'messages',
    'notificacao': 'notifications',
    'notificacoes': 'notifications',
    'notification': 'notifications',
    'permissao': 'permissions',
    'permissoes': 'permissions',
    'permission': 'permissions',
    'papel': 'roles',
    'papeis': 'roles',
    'role': 'roles',
    'sessao': 'sessions',
    'sessoes': 'sessions',
    'session': 'sessions'
  };

  // Se existe mapeamento específico, usar
  if (mappings[mysqlTableName.toLowerCase()]) {
    return mappings[mysqlTableName.toLowerCase()];
  }

  // Pluralização automática para tabelas em inglês
  const name = mysqlTableName.toLowerCase();
  if (name.endsWith('y')) {
    return name.slice(0, -1) + 'ies'; // category → categories
  } else if (name.endsWith('s') || name.endsWith('x') || name.endsWith('ch') || name.endsWith('sh')) {
    return name + 'es'; // class → classes
  } else if (!name.endsWith('s')) {
    return name + 's'; // user → users
  }
  
  return name; // Já está no plural
}

// Função para mapear tipos MySQL para PostgreSQL
function mapMySQLToPostgreSQLType(mysqlColumn) {
  const dataType = mysqlColumn.DATA_TYPE.toLowerCase();
  const columnType = mysqlColumn.COLUMN_TYPE.toLowerCase();
  const maxLength = mysqlColumn.CHARACTER_MAXIMUM_LENGTH;
  const precision = mysqlColumn.NUMERIC_PRECISION;
  const scale = mysqlColumn.NUMERIC_SCALE;

  switch (dataType) {
    case 'tinyint':
      if (columnType === 'tinyint(1)') {
        return { type: 'boolean', compatible: true, note: 'MySQL boolean → PostgreSQL boolean' };
      }
      return { type: 'smallint', compatible: true, note: 'Pequenos inteiros' };
      
    case 'smallint':
      return { type: 'smallint', compatible: true, note: 'Compatível direto' };
      
    case 'mediumint':
    case 'int':
      return { type: 'integer', compatible: true, note: 'Inteiros padrão' };
      
    case 'bigint':
      return { type: 'bigint', compatible: true, note: 'Compatível direto' };

    case 'float':
      return { type: 'real', compatible: true, note: 'Ponto flutuante simples' };
      
    case 'double':
      return { type: 'double precision', compatible: true, note: 'Ponto flutuante duplo' };
      
    case 'decimal':
    case 'numeric':
      if (precision && scale !== undefined) {
        return { type: `numeric(${precision},${scale})`, compatible: true, note: `Precisão mantida: ${precision},${scale}` };
      }
      return { type: 'numeric', compatible: true, note: 'Decimal genérico' };

    case 'char':
      if (maxLength && maxLength <= 255) {
        return { type: `character(${maxLength})`, compatible: true, note: `Char fixo: ${maxLength}` };
      }
      return { type: 'text', compatible: true, note: 'Char grande → text' };
      
    case 'varchar':
      if (maxLength && maxLength <= 10485760) {
        return { type: `character varying(${maxLength})`, compatible: true, note: `Varchar: ${maxLength}` };
      }
      return { type: 'text', compatible: true, note: 'Varchar grande → text' };
      
    case 'tinytext':
    case 'text':
    case 'mediumtext':
    case 'longtext':
      return { type: 'text', compatible: true, note: 'Texto longo' };

    case 'date':
      return { type: 'date', compatible: true, note: 'Compatível direto' };
      
    case 'time':
      return { type: 'time without time zone', compatible: true, note: 'Hora sem timezone' };
      
    case 'datetime':
      return { type: 'timestamp without time zone', compatible: true, note: 'Data/hora sem timezone' };
      
    case 'timestamp':
      return { type: 'timestamp without time zone', compatible: true, note: 'Timestamp sem timezone' };
      
    case 'year':
      return { type: 'smallint', compatible: true, note: 'Ano como smallint' };

    case 'binary':
    case 'varbinary':
    case 'tinyblob':
    case 'blob':
    case 'mediumblob':
    case 'longblob':
      return { type: 'bytea', compatible: true, note: 'Dados binários' };

    case 'json':
      return { type: 'jsonb', compatible: true, note: 'JSON otimizado (jsonb)' };

    case 'enum':
      return { type: 'text', compatible: false, note: 'ENUM → text + constraint necessária', warning: true };
      
    case 'set':
      return { type: 'text', compatible: false, note: 'SET → text + constraint necessária', warning: true };

    case 'geometry':
    case 'point':
    case 'linestring':
    case 'polygon':
      return { type: 'text', compatible: false, note: 'Tipo geométrico → text (perda de funcionalidade)', warning: true };

    default:
      return { type: 'text', compatible: false, note: `Tipo não reconhecido: ${dataType}`, error: true };
  }
}

// Função para verificar problemas nos dados
function analyzeDataProblems(sampleData, tableName) {
  const problems = [];
  
  sampleData.forEach((row, index) => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value.includes('\0')) {
          problems.push({
            type: 'null_chars',
            table: tableName,
            column: key,
            record: index + 1,
            description: 'Contém caracteres NULL (\\0)'
          });
        }
        if (value === '0000-00-00' || value === '0000-00-00 00:00:00') {
          problems.push({
            type: 'invalid_date',
            table: tableName,
            column: key,
            record: index + 1,
            description: 'Data MySQL inválida'
          });
        }
        if (value.length > 50000) {
          problems.push({
            type: 'large_text',
            table: tableName,
            column: key,
            record: index + 1,
            description: `Texto muito longo (${value.length} chars)`
          });
        }
      }
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        problems.push({
          type: 'invalid_number',
          table: tableName,
          column: key,
          record: index + 1,
          description: 'Número inválido (NaN/Infinity)'
        });
      }
    });
  });
  
  return problems;
}

async function analyzeAllTables() {
  let mysqlConnection;
  let pgConnection;

  try {
    console.log('🔍 Análise Completa de Migração MySQL → PostgreSQL\n');
    console.log('=' .repeat(70));

    // Conectar aos bancos
    console.log('🔌 Conectando aos bancos de dados...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    pgConnection = knex(pgConfig);
    await pgConnection.raw('SELECT 1');
    console.log('✅ Conexões estabelecidas\n');

    // 1. Listar todas as tabelas MySQL
    console.log('📋 Obtendo lista de tabelas MySQL...');
    const [mysqlTables] = await mysqlConnection.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        CREATE_TIME,
        UPDATE_TIME,
        TABLE_COMMENT
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [mysqlConfig.database]);

    console.log(`📊 Encontradas ${mysqlTables.length} tabelas no MySQL:\n`);

    // Estatísticas gerais
    const totalRows = mysqlTables.reduce((sum, table) => sum + (table.TABLE_ROWS || 0), 0);
    const totalSize = mysqlTables.reduce((sum, table) => sum + (table.DATA_LENGTH || 0), 0);
    
    console.log(`📈 Estatísticas Gerais:`);
    console.log(`   Total de tabelas: ${mysqlTables.length}`);
    console.log(`   Total de registros: ${totalRows.toLocaleString()}`);
    console.log(`   Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // 2. Verificar tabelas no PostgreSQL
    console.log('🔍 Verificando tabelas existentes no PostgreSQL...');
    const pgTablesResult = await pgConnection.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    const pgTables = pgTablesResult.rows.map(row => row.table_name);
    console.log(`📊 Encontradas ${pgTables.length} tabelas no PostgreSQL\n`);

    // 3. Análise detalhada de cada tabela
    console.log('🔍 Análise Detalhada por Tabela:');
    console.log('=' .repeat(70));

    const analysisResults = [];
    const globalProblems = [];

    for (const table of mysqlTables) {
      const tableName = table.TABLE_NAME;
      const postgresTableName = mapTableName(tableName);
      
      console.log(`\n📋 Tabela: ${tableName} → ${postgresTableName}`);
      console.log(`   Registros: ${(table.TABLE_ROWS || 0).toLocaleString()}`);
      console.log(`   Tamanho: ${((table.DATA_LENGTH || 0) / 1024).toFixed(2)} KB`);
      
      const tableAnalysis = {
        mysqlName: tableName,
        postgresName: postgresTableName,
        rowCount: table.TABLE_ROWS || 0,
        size: table.DATA_LENGTH || 0,
        existsInPostgres: pgTables.includes(postgresTableName),
        columns: [],
        problems: [],
        warnings: [],
        recommendations: []
      };

      try {
        // Obter estrutura da tabela
        const [columns] = await mysqlConnection.execute(`
          SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT,
            CHARACTER_MAXIMUM_LENGTH,
            NUMERIC_PRECISION,
            NUMERIC_SCALE,
            COLUMN_TYPE,
            EXTRA,
            COLUMN_KEY,
            COLUMN_COMMENT
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [mysqlConfig.database, tableName]);

        console.log(`   Colunas: ${columns.length}`);

        // Analisar cada coluna
        let hasProblems = false;
        columns.forEach(col => {
          const pgType = mapMySQLToPostgreSQLType(col);
          
          const columnAnalysis = {
            name: col.COLUMN_NAME,
            mysqlType: col.COLUMN_TYPE,
            postgresType: pgType.type,
            compatible: pgType.compatible,
            note: pgType.note,
            nullable: col.IS_NULLABLE === 'YES',
            defaultValue: col.COLUMN_DEFAULT,
            isPrimaryKey: col.COLUMN_KEY === 'PRI',
            isAutoIncrement: col.EXTRA.includes('auto_increment')
          };

          if (pgType.warning || pgType.error) {
            hasProblems = true;
            const problem = {
              type: pgType.error ? 'error' : 'warning',
              column: col.COLUMN_NAME,
              issue: pgType.note
            };
            
            if (pgType.error) {
              tableAnalysis.problems.push(problem);
            } else {
              tableAnalysis.warnings.push(problem);
            }
          }

          tableAnalysis.columns.push(columnAnalysis);
        });

        // Verificar se há chave primária
        const hasPrimaryKey = columns.some(col => col.COLUMN_KEY === 'PRI');
        if (!hasPrimaryKey) {
          tableAnalysis.warnings.push({
            type: 'warning',
            column: 'N/A',
            issue: 'Tabela sem chave primária - será adicionada coluna "id"'
          });
        }

        // Analisar dados de exemplo (se a tabela não for muito grande)
        if (table.TABLE_ROWS && table.TABLE_ROWS < 1000000) {
          try {
            const [sampleData] = await mysqlConnection.execute(`SELECT * FROM \`${tableName}\` LIMIT 5`);
            if (sampleData.length > 0) {
              const dataProblems = analyzeDataProblems(sampleData, tableName);
              tableAnalysis.problems.push(...dataProblems);
              globalProblems.push(...dataProblems);
            }
          } catch (sampleError) {
            console.log(`   ⚠️  Erro ao analisar dados: ${sampleError.message}`);
          }
        }

        // Status da tabela
        if (tableAnalysis.problems.length > 0) {
          console.log(`   ❌ ${tableAnalysis.problems.length} problema(s) encontrado(s)`);
        } else if (tableAnalysis.warnings.length > 0) {
          console.log(`   ⚠️  ${tableAnalysis.warnings.length} aviso(s)`);
        } else {
          console.log(`   ✅ Compatível`);
        }

        if (tableAnalysis.existsInPostgres) {
          console.log(`   📊 Existe no PostgreSQL`);
        } else {
          console.log(`   🆕 Será criada no PostgreSQL`);
        }

      } catch (error) {
        console.log(`   ❌ Erro ao analisar: ${error.message}`);
        tableAnalysis.problems.push({
          type: 'error',
          column: 'N/A',
          issue: `Erro de análise: ${error.message}`
        });
      }

      analysisResults.push(tableAnalysis);
    }

    // 4. Relatório de Resumo
    console.log('\n\n📊 RELATÓRIO DE RESUMO');
    console.log('=' .repeat(70));

    const tablesWithProblems = analysisResults.filter(t => t.problems.length > 0);
    const tablesWithWarnings = analysisResults.filter(t => t.warnings.length > 0);
    const compatibleTables = analysisResults.filter(t => t.problems.length === 0 && t.warnings.length === 0);

    console.log(`✅ Tabelas totalmente compatíveis: ${compatibleTables.length}`);
    console.log(`⚠️  Tabelas com avisos: ${tablesWithWarnings.length}`);
    console.log(`❌ Tabelas com problemas: ${tablesWithProblems.length}`);

    // 5. Tabelas com problemas críticos
    if (tablesWithProblems.length > 0) {
      console.log('\n❌ TABELAS COM PROBLEMAS CRÍTICOS:');
      tablesWithProblems.forEach(table => {
        console.log(`\n📋 ${table.mysqlName} → ${table.postgresName}`);
        table.problems.forEach(problem => {
          if (typeof problem === 'object' && problem.column) {
            console.log(`   ❌ ${problem.column}: ${problem.issue}`);
          } else {
            console.log(`   ❌ ${problem.type}: ${problem.description}`);
          }
        });
      });
    }

    // 6. Tabelas com avisos
    if (tablesWithWarnings.length > 0) {
      console.log('\n⚠️  TABELAS COM AVISOS:');
      tablesWithWarnings.forEach(table => {
        console.log(`\n📋 ${table.mysqlName} → ${table.postgresName}`);
        table.warnings.forEach(warning => {
          console.log(`   ⚠️  ${warning.column}: ${warning.issue}`);
        });
      });
    }

    // 7. Recomendações gerais
    console.log('\n💡 RECOMENDAÇÕES PARA MIGRAÇÃO:');
    console.log('=' .repeat(70));

    console.log('\n🔧 Configurações Recomendadas:');
    if (tablesWithProblems.length > 0) {
      console.log('   ✅ Usar "🔥 Recriar Tabelas (DROP CASCADE)" para tabelas problemáticas');
      console.log('   ✅ Monitorar logs durante migração');
      console.log('   ✅ Validar dados após migração');
    } else {
      console.log('   ✅ Usar migração incremental (preservar dados)');
      console.log('   ✅ Verificar duplicatas por chave primária');
    }

    console.log('\n📋 Tipos Problemáticos Encontrados:');
    const problemTypes = {};
    analysisResults.forEach(table => {
      table.columns.forEach(col => {
        if (!col.compatible) {
          const mysqlType = col.mysqlType.split('(')[0];
          problemTypes[mysqlType] = (problemTypes[mysqlType] || 0) + 1;
        }
      });
    });

    Object.entries(problemTypes).forEach(([type, count]) => {
      console.log(`   ⚠️  ${type}: ${count} ocorrência(s)`);
    });

    // 8. Estimativa de tempo
    console.log('\n⏱️  ESTIMATIVA DE MIGRAÇÃO:');
    const totalRecords = analysisResults.reduce((sum, table) => sum + table.rowCount, 0);
    const estimatedMinutes = Math.ceil(totalRecords / 10000); // ~10k registros/minuto
    console.log(`   📊 Total de registros: ${totalRecords.toLocaleString()}`);
    console.log(`   ⏱️  Tempo estimado: ${estimatedMinutes} minuto(s)`);

    // 9. Mapeamento de tabelas
    console.log('\n🗺️  MAPEAMENTO DE TABELAS:');
    console.log('=' .repeat(70));
    analysisResults.forEach(table => {
      const status = table.problems.length > 0 ? '❌' : 
                    table.warnings.length > 0 ? '⚠️ ' : '✅';
      console.log(`${status} ${table.mysqlName.padEnd(25)} → ${table.postgresName}`);
    });

    console.log('\n✅ Análise completa finalizada!');
    console.log(`📋 ${analysisResults.length} tabelas analisadas`);
    console.log(`📊 ${totalRecords.toLocaleString()} registros para migrar`);

  } catch (error) {
    console.log('❌ Erro durante análise:', error.message);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
    if (pgConnection) {
      await pgConnection.destroy();
    }
  }
}

// Executar análise
if (require.main === module) {
  analyzeAllTables().catch(console.log);
}

module.exports = { analyzeAllTables }; 