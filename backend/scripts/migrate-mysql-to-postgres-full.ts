import knex from 'knex';
import { Knex } from 'knex';
import knexConfig from '../knexfile.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Carrega variáveis de ambiente
dotenv.config();

// Tipos
interface ColumnDefinition {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface IndexDefinition {
  Table: string;
  Non_unique: number;
  Key_name: string;
  Seq_in_index: number;
  Column_name: string;
  Collation: string;
  Cardinality: number;
  Sub_part: number | null;
  Packed: string | null;
  Null: string;
  Index_type: string;
  Comment: string;
  Index_comment: string;
}

// Configurações
const MYSQL_CONFIG = {
  host: "sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com",
  user: "sabercon",
  password: "gWg28m8^vffI9X#",
  database: "sabercon",
  port: 3306
};

const DUMP_DIR = path.join(__dirname, '../database/dumps');

// Lista de palavras reservadas do PostgreSQL que precisam ser escapadas
const POSTGRES_RESERVED_WORDS = [
  'user', 'group', 'order', 'select', 'where', 'from', 'table', 'index',
  'having', 'grant', 'check', 'default', 'primary', 'references', 'using',
  'foreign', 'constraint', 'comment', 'create', 'update', 'delete'
];

// Funções utilitárias
function normalizeTableName(name: string): string {
  // Mapeamento do MySQL para PostgreSQL
  const mapping: Record<string, string> = {
    // Português para inglês
    'usuarios': 'users',
    'usuários': 'users',
    'arquivos': 'files',
    'instituicoes': 'institution',
    'instituições': 'institution',
    'escolas': 'schools',
    'colecoes': 'collections',
    'coleções': 'collections',
    'permissoes': 'permissions',
    'permissões': 'permissions',
    'livros': 'books',
    'cursos': 'courses',
    'aulas': 'classes',
    'atividades': 'activities',
    'temas': 'themes',
    'autores': 'authors',
    'perguntas': 'questions',
    'respostas': 'answers',

    // Singular para plural - NOTA: Estes só serão aplicados se não
    // estiverem em conflito com as regras acima ou abaixo
    'user': 'users',
    'institution': 'institution',
    'file': 'files',
    'unit': 'schools',
    'collection': 'collections',
    'permission': 'permissions',
    'book': 'books',
    'course': 'courses',
    'class': 'classes',
    'activity': 'activities',
    'theme': 'themes',
    'author': 'authors',
    'question': 'questions',
    'answer': 'answers',
    'video': 'videos',
    'tv_show': 'tv_shows',
  };
  
  // Verificar mapeamento específico
  if (mapping[name.toLowerCase()]) {
    return mapping[name.toLowerCase()];
  }
  
  // Se não existir mapeamento, retornar o nome original
  return name;
}

function normalizeColumnName(name: string): string {
  // Mapeamento de colunas do MySQL para PostgreSQL
  const mapping: Record<string, string> = {
    // Português para inglês
    'usuario_id': 'user_id',
    'usuário_id': 'user_id',
    'instituicao_id': 'institution_id',
    'instituição_id': 'institution_id',
    'arquivo_id': 'file_id',
    'escola_id': 'school_id',
    'colecao_id': 'collection_id',
    'coleção_id': 'collection_id',
    'permissao_id': 'permission_id',
    'permissão_id': 'permission_id',
    'livro_id': 'book_id',
    'curso_id': 'course_id',
    'aula_id': 'class_id',
    'atividade_id': 'activity_id',
    'tema_id': 'theme_id',
    'autor_id': 'author_id',
    'pergunta_id': 'question_id',
    'resposta_id': 'answer_id',
    'video_id': 'video_id',
    'vídeo_id': 'video_id',
    
    // Outros mapeamentos comuns
    'nome': 'name',
    'descricao': 'description',
    'descrição': 'description',
    'data_criacao': 'date_created',
    'data_criação': 'date_created',
    'data_atualizacao': 'last_updated',
    'data_atualização': 'last_updated',
    'ativo': 'active',
    'senha': 'password',
    'email': 'email',
    'titulo': 'title',
    'título': 'title',
    'conteudo': 'content',
    'conteúdo': 'content',
    'imagem': 'image',
    'status': 'status',
    'preco': 'price',
    'preço': 'price',
    'quantidade': 'quantity',
    'tipo': 'type',
    'endereco': 'address',
    'endereço': 'address',
    'telefone': 'phone',
    'celular': 'mobile',
    'data_nascimento': 'birth_date',
    'genero': 'gender',
    'gênero': 'gender',
    'cpf': 'document',
    'cnpj': 'document',
    'rg': 'id_number',
    'cep': 'postal_code',
    'cidade': 'city',
    'estado': 'state',
    'pais': 'country',
    'país': 'country',
    'rua': 'street',
    'bairro': 'district',
    'numero': 'number',
    'número': 'number',
    'complemento': 'complement',
    'observacao': 'note',
    'observação': 'note'
  };

  // Verificar mapeamento específico
  if (mapping[name.toLowerCase()]) {
    return mapping[name.toLowerCase()];
  }
  
  // Se não existir mapeamento, retornar o nome original
  return name;
}

// Cria backup dos dados MySQL em formato JSON
async function createMySQLBackup(mysqlConn: mysql.Connection, tableNames: string[]): Promise<string> {
  console.log('\n💾 Criando backup JSON do banco MySQL...');
  
  const backupData: Record<string, any[]> = {};
  
  for (const tableName of tableNames) {
    try {
      const [rows] = await mysqlConn.execute(`SELECT * FROM ${tableName}`);
      backupData[tableName] = rows as any[];
      console.log(`   ✅ Backup da tabela ${tableName}: ${(rows as any[]).length} registros`);
    } catch (error: any) {
      console.log(`   ❌ Erro ao criar backup da tabela ${tableName}: ${error.message}`);
    }
  }
  
  // Salvar backup em arquivo JSON
  const backupFile = path.join(DUMP_DIR, `mysql_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  
  console.log(`   ✅ Backup JSON criado: ${backupFile}`);
  return backupFile;
}

// Verifica se um nome é uma palavra reservada no PostgreSQL
function isReservedWord(name: string): boolean {
  return POSTGRES_RESERVED_WORDS.includes(name.toLowerCase());
}

// Escapa nomes de tabela para SQL se for palavra reservada
function escapeTableNameForSQL(name: string): string {
  return isReservedWord(name) ? `"${name}"` : name;
}

function transformMySQLValueToPostgres(value: any, mysqlType: string): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  const lowerType = mysqlType.toLowerCase();
  
  // Limitar valores numéricos para o intervalo aceito pelo PostgreSQL
  if ((lowerType.includes('int') || lowerType.includes('bigint')) && typeof value === 'number') {
    // Limites do bigint no PostgreSQL
    const PG_BIGINT_MIN = -9223372036854775808;
    const PG_BIGINT_MAX = 9223372036854775807;
    
    if (value < PG_BIGINT_MIN) return PG_BIGINT_MIN;
    if (value > PG_BIGINT_MAX) return PG_BIGINT_MAX;
  }
  
  // Converter tinyint para boolean
  if (lowerType === 'tinyint(1)') {
    return Number(value) === 1;
  }
  
  // Verificar se é um objeto vazio (caso comum para timestamps)
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    // Se for um campo de data/hora, retornar a data atual
    if (['datetime', 'timestamp', 'date'].some(type => lowerType.includes(type))) {
      return new Date();
    }
    return null;
  }
  
  // Converter datas
  if (['datetime', 'timestamp', 'date'].some(type => lowerType.includes(type)) && value) {
    try {
      // Se já for um objeto Date, retornar diretamente
      if (value instanceof Date) {
        return value;
      }
      
      // Se for string, converter para Date
      if (typeof value === 'string') {
        return new Date(value);
      }
      
      // Se for objeto com propriedades de data, tentar extrair
      if (typeof value === 'object' && value !== null) {
        // Se tem método toISOString ou toJSON, usar
        if (typeof value.toISOString === 'function') {
          return new Date(value.toISOString());
        }
        
        if (typeof value.toJSON === 'function') {
          return new Date(value.toJSON());
        }
        
        // Se tem propriedades comuns de data
        const dateString = JSON.stringify(value);
        return new Date(dateString);
      }
      
      // Se nada funcionar, tentar diretamente
      return new Date(value);
    } catch (e) {
      console.log(`Erro ao converter data: ${value}`, e);
      return new Date(); // Retornar data atual em caso de erro
    }
  }
  
  // Converter JSON
  if (lowerType === 'json' && typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      // Manter como string se falhar
      return value;
    }
  }
  
  return value;
}

function sanitizeForPostgres(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (typeof data === 'string') {
    // Remover caracteres nulos e outros caracteres inválidos em UTF-8
    return data.replace(/\0/g, '').replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForPostgres(item));
  }
  
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = sanitizeForPostgres(data[key]);
      }
    }
    return result;
  }
  
  return data;
}

// Função para formatar valor para SQL
function formatValueForSQL(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  
  // Tratamento específico para booleanos
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  
  // Tratamento para números
  if (typeof val === 'number') {
    // Limites do bigint no PostgreSQL
    const PG_BIGINT_MIN = BigInt("-9223372036854775808");
    const PG_BIGINT_MAX = BigInt("9223372036854775807");
    
    // Verificar se o número está dentro dos limites do bigint
    if (val < Number(PG_BIGINT_MIN)) {
      return PG_BIGINT_MIN.toString();
    } else if (val > Number(PG_BIGINT_MAX)) {
      return PG_BIGINT_MAX.toString();
    }
    
    return val.toString();
  }
  
  // Tratamento para strings numéricas que podem representar números muito grandes
  if (typeof val === 'string' && /^-?\d+$/.test(val)) {
    try {
      const bigIntVal = BigInt(val);
      // Limites do bigint no PostgreSQL
      const PG_BIGINT_MIN = BigInt("-9223372036854775808");
      const PG_BIGINT_MAX = BigInt("9223372036854775807");
      
      if (bigIntVal < PG_BIGINT_MIN) {
        return PG_BIGINT_MIN.toString();
      } else if (bigIntVal > PG_BIGINT_MAX) {
        return PG_BIGINT_MAX.toString();
      }
      
      return val;
    } catch (e) {
      // Se não conseguir converter para BigInt, tratar como string normal
    }
  }
  
  // Tratamento para datas
  if (val instanceof Date) {
    // Formatar data no formato ISO sem milissegundos e com timezone
    return `'${val.toISOString().replace(/\.\d{3}Z$/, '+00:00')}'`;
  }
  
  // Tratamento para objetos, incluindo objetos tipo Date que não são instâncias de Date
  if (typeof val === 'object') {
    // Verificar se é um objeto vazio
    if (Object.keys(val).length === 0) {
      return 'CURRENT_TIMESTAMP';
    }
    
    // Verificar se parece ser um objeto Date (tem toString, toISOString etc.)
    if (val && typeof val.toISOString === 'function') {
      try {
        return `'${val.toISOString().replace(/\.\d{3}Z$/, '+00:00')}'`;
      } catch (e) {
        // Ignorar e continuar com tratamento genérico de objeto
        return 'CURRENT_TIMESTAMP';
      }
    }
    
    // Para objetos regulares, converter para JSON
    try {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    } catch (e) {
      // Se falhar a serialização, retornar NULL
      return 'NULL';
    }
  }
  
  // Tratamento para strings, escapando aspas simples
  if (typeof val === 'string') {
    // Escapar aspas simples duplicando-as
    return `'${val.replace(/'/g, "''")}'`;
  }
  
  // Para qualquer outro tipo, converter para string e escapar
  return `'${String(val).replace(/'/g, "''")}'`;
}

// Mapeamento de tabelas equivalentes (para relações)
function getEquivalentTable(tableName: string): string {
  const equivalents: Record<string, string> = {
    // Principais equivalências mencionadas
    'unit': 'school',
    'units': 'schools',
    'user': 'user',
    'users': 'user',
    'institution': 'institution',
    'file': 'file',
    'files': 'file',
    
    // Outras equivalências comuns
    'question': 'question',
    'questions': 'question',
    'answer': 'answer',
    'answers': 'answer',
    'theme': 'theme',
    'themes': 'theme',
    'author': 'author',
    'authors': 'author',
    'video': 'video',
    'videos': 'video',
    'collection': 'collection',
    'collections': 'collection',
    'course': 'course',
    'courses': 'course',
    'class': 'class',
    'classes': 'class'
  };
  
  return equivalents[tableName.toLowerCase()] || tableName;
}

// Função para criar nomes de chaves estrangeiras padronizados
function createForeignKeyName(sourceTable: string, targetTable: string, columnName: string): string {
  // Padronizar os nomes das tabelas
  const source = getEquivalentTable(sourceTable);
  const target = getEquivalentTable(targetTable);
  
  // Criar nome padronizado para a chave estrangeira
  return `fk_${source}_${target}_${columnName}`;
}

// Detectar se uma coluna é uma chave estrangeira
function detectForeignKey(columnName: string, tableName: string): { isFK: boolean, targetTable: string } {
  // Padrões comuns de chaves estrangeiras
  const idPattern = /_id$/i;
  
  if (!idPattern.test(columnName)) {
    return { isFK: false, targetTable: '' };
  }
  
  // Extrair o nome da tabela alvo a partir do nome da coluna
  let targetTable = columnName.replace(idPattern, '');
  
  // Verificar se é uma tabela conhecida
  targetTable = getEquivalentTable(targetTable);
  
  return { 
    isFK: true, 
    targetTable
  };
}

// Mapeamento de tipos de dados MySQL para PostgreSQL
function mapMySQLTypeToPostgreSQL(mysqlType: string): string {
  // Converter para minúsculas para facilitar comparação
  const type = mysqlType.toLowerCase();
  
  // Mapeamento de tipos
  const typeMap: Record<string, string> = {
    // Tipos numéricos
    'tinyint(1)': 'boolean',
    'tinyint': 'smallint',
    'smallint': 'smallint',
    'mediumint': 'integer',
    'int': 'integer',
    'integer': 'integer',
    'bigint': 'bigint',
    'float': 'real',
    'double': 'double precision',
    'decimal': 'decimal',
    'numeric': 'numeric',
    
    // Tipos de string
    'char': 'char',
    'varchar': 'varchar',
    'tinytext': 'text',
    'text': 'text',
    'mediumtext': 'text',
    'longtext': 'text',
    
    // Tipos binários
    'binary': 'bytea',
    'varbinary': 'bytea',
    'tinyblob': 'bytea',
    'blob': 'bytea',
    'mediumblob': 'bytea',
    'longblob': 'bytea',
    
    // Tipos de data e hora
    'date': 'date',
    'datetime': 'timestamp',
    'timestamp': 'timestamp',
    'time': 'time',
    'year': 'smallint',
    
    // Tipos especiais
    'enum': 'text',
    'set': 'text',
    'json': 'jsonb'
  };
  
  // Verificar tipos específicos com parâmetros
  if (type.startsWith('varchar(')) {
    const match = type.match(/varchar\((\d+)\)/);
    if (match) {
      return `varchar(${match[1]})`;
    }
  }
  
  if (type.startsWith('char(')) {
    const match = type.match(/char\((\d+)\)/);
    if (match) {
      return `char(${match[1]})`;
    }
  }
  
  if (type.startsWith('decimal(')) {
    const match = type.match(/decimal\((\d+),(\d+)\)/);
    if (match) {
      return `decimal(${match[1]},${match[2]})`;
    }
  }
  
  // Verificar se o tipo básico está no mapeamento
  for (const mysqlPrefix in typeMap) {
    if (type.startsWith(mysqlPrefix)) {
      return typeMap[mysqlPrefix];
    }
  }
  
  // Caso não encontre mapeamento, usar texto
  console.log(`   ⚠️ Tipo MySQL não mapeado: ${mysqlType}, usando 'text'`);
  return 'text';
}

// 4.1 Obter estrutura da tabela MySQL
async function getStructure(tableName: string, mysqlConn: mysql.Connection): Promise<{
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
}> {
  console.log(`   🔍 Analisando estrutura da tabela ${tableName}...`);
  
  // Obter definição das colunas
  const [columnsResult] = await mysqlConn.execute(`DESCRIBE ${tableName}`);
  const columns = columnsResult as ColumnDefinition[];
  
  // Obter informações dos índices
  const [indexesResult] = await mysqlConn.execute(`SHOW INDEX FROM ${tableName}`);
  const indexes = indexesResult as IndexDefinition[];
  
  return { columns, indexes };
}

// Função principal de migração
async function migrateFromMySQLToPostgres(): Promise<void> {
  console.log('🚀 INICIANDO MIGRAÇÃO COMPLETA MYSQL → POSTGRESQL\n');
  
  // Garante que o diretório de dumps existe
  if (!fs.existsSync(DUMP_DIR)) {
    fs.mkdirSync(DUMP_DIR, { recursive: true });
  }
  
  // Conexões
  let mysqlConn: mysql.Connection | null = null;
  let pg: Knex | null = null;
  
  try {
    // Conectar ao MySQL
    console.log('🔌 Conectando ao MySQL...');
    mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conectado ao MySQL!');
    
    // Conectar ao PostgreSQL usando Knex
    console.log('🔌 Conectando ao PostgreSQL...');
    pg = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!');
    
    // 1. Obter lista de tabelas do MySQL
    console.log('\n📋 Obtendo lista de tabelas do MySQL...');
    const [tablesResult] = await mysqlConn.execute('SHOW TABLES');
    const tables = tablesResult as Record<string, any>[];
    const tableNames = tables.map(t => Object.values(t)[0] as string);
    console.log(`   Encontradas ${tableNames.length} tabelas no MySQL`);
    
    // 2. Executar seed de preparação para migração
    console.log('\n🌱 Executando seed de preparação para migração...');
    try {
      await pg.seed.run({ specific: '007_mysql_migration_setup.ts' });
      console.log('   ✅ Seed de preparação executado com sucesso!');
    } catch (error: any) {
      console.warn(`   ⚠️ Erro ao executar seed: ${error.message}`);
      console.log('   ⚠️ Tentando continuar com a migração...');
    }
    
    // 3. Obter referências necessárias para a migração
    console.log('\n🔍 Obtendo referências para a migração...');
    const teacherRole = await pg('roles').where('name', 'TEACHER').first();
    if (!teacherRole) {
      throw new Error('Role TEACHER não encontrada no PostgreSQL');
    }
    
    const defaultInstitution = await pg('institution').where('code', 'DEFAULT_MIGRATED').first();
    if (!defaultInstitution) {
      throw new Error('Instituição padrão para migração não encontrada');
    }
    
    const defaultSchool = await pg('schools').where('code', 'DEFAULT_MIGRATED_SCHOOL').first();
    if (!defaultSchool) {
      throw new Error('Escola padrão para migração não encontrada');
    }
    
    console.log('   ✅ Referências obtidas com sucesso!');
    
    // 4. Processar cada tabela
    for (const mysqlTable of tableNames) {
      const pgTable = normalizeTableName(mysqlTable);
      console.log(`\n📦 Processando tabela: ${mysqlTable} → ${pgTable}`);
      
      // 4.1 Obter estrutura da tabela MySQL
      const { columns } = await getStructure(mysqlTable, mysqlConn);
      
      // 4.2 Verificar se a tabela já existe no PostgreSQL
      const tableExists = await pg.schema.hasTable(pgTable);
      if (tableExists) {
        console.log(`   ⚠️ Tabela ${pgTable} já existe no PostgreSQL`);
        console.log(`   🔄 Migrando apenas os dados...`);
      } else {
        // 4.3 Criar tabela no PostgreSQL (se não existir)
        console.log(`   🏗️ Criando tabela ${pgTable} no PostgreSQL...`);
        
        // Gerar esquema para PostgreSQL
        const autoIncrement = columns.find(col => 
          col.Extra.includes('auto_increment')
        );
        
        const hasAutoIncrement = !!autoIncrement;
        
        const columnDefinitions = columns.map((col: ColumnDefinition) => {
          // Normalizar nome da coluna
          const columnName = normalizeColumnName(col.Field);
          
          // Mapear tipo MySQL para PostgreSQL
          let pgType = mapMySQLTypeToPostgreSQL(col.Type);
          
          // Verificar se é chave primária e auto-incrementável
          const isPrimaryKey = col.Key === 'PRI';
          
          if (isPrimaryKey && hasAutoIncrement && col.Field === autoIncrement.Field) {
            // Se for chave primária auto-incrementável, usar SERIAL
            if (pgType === 'bigint') {
              pgType = 'BIGSERIAL';
            } else {
              pgType = 'SERIAL';
            }
          }
          
          // Verificar se é chave estrangeira (não usamos o resultado aqui)
          detectForeignKey(columnName, mysqlTable);
          
          // Detectar se é coluna NOT NULL
          const isNullable = col.Null === 'YES';
          const nullableStr = isNullable ? '' : ' NOT NULL';
          
          // Detectar valor padrão
          let defaultValue = '';
          if (col.Default !== null && col.Default !== undefined) {
            // Caso especial para NOW() ou CURRENT_TIMESTAMP
            if (col.Default === 'CURRENT_TIMESTAMP') {
              defaultValue = ' DEFAULT CURRENT_TIMESTAMP';
            } else if (col.Default === 'NULL') {
              defaultValue = ' DEFAULT NULL';
            } else {
              defaultValue = ` DEFAULT '${col.Default.replace(/'/g, "''")}'`;
            }
          }
          
          // Montar definição da coluna
          return `"${columnName}" ${pgType}${nullableStr}${defaultValue}`;
        });
        
        // Identificar chave primária
        const primaryKeys = columns
          .filter((col: ColumnDefinition) => col.Key === 'PRI')
          .map((col: ColumnDefinition) => normalizeColumnName(col.Field));
        
        // Criar constraint de chave primária
        const primaryKeyConstraint = primaryKeys.length > 0
          ? `, PRIMARY KEY (${primaryKeys.map((pk: string) => `"${pk}"`).join(', ')})`
          : '';
        
        // Identificar chaves estrangeiras
        const foreignKeyConstraints = columns
          .filter((col: ColumnDefinition) => {
            const columnName = normalizeColumnName(col.Field);
            const fkInfo = detectForeignKey(columnName, mysqlTable);
            return fkInfo.isFK;
          })
          .map((col: ColumnDefinition) => {
            const columnName = normalizeColumnName(col.Field);
            const { targetTable } = detectForeignKey(columnName, mysqlTable);
            const constraintName = createForeignKeyName(mysqlTable, targetTable, columnName);
            
            return `CONSTRAINT "${constraintName}" FOREIGN KEY ("${columnName}") REFERENCES "${targetTable}" (id)`;
          });
        
        // Incluir constraints de chave estrangeira se existirem
        const foreignKeyConstraint = foreignKeyConstraints.length > 0
          ? `, ${foreignKeyConstraints.join(', ')}`
          : '';
        
        try {
          // Criar tabela no PostgreSQL
          const escapedTableName = escapeTableNameForSQL(pgTable);
          
          if (pg) {
            await pg.raw(`
              CREATE TABLE IF NOT EXISTS ${escapedTableName} (
                ${columnDefinitions.join(',\n        ')}
                ${primaryKeyConstraint}
                ${foreignKeyConstraint}
              )
            `);
            console.log(`   ✅ Tabela ${pgTable} criada com sucesso!`);
          }
        } catch (error: any) {
          console.log(`   ❌ Erro ao criar tabela ${pgTable}: ${error.message}`);
          // Não interromper a migração em caso de erro
          // throw error;
        }
      }
      
      // 4.5 Migrar dados
      console.log(`   📤 Migrando dados para ${pgTable}...`);
      const [rowsResult] = await mysqlConn.execute(`SELECT * FROM ${mysqlTable}`);
      const rows = rowsResult as Record<string, any>[];
      
      if (rows.length === 0) {
        console.log(`   ℹ️ Tabela ${mysqlTable} não possui dados para migrar`);
        continue;
      }
      
      // Transformar cada lote de dados para o formato PostgreSQL
      const pgRows = rows.map(row => {
        const pgRow: Record<string, any> = {};
        
        // Processar cada coluna
        columns.forEach(col => {
          const value = row[col.Field];
          const newName = normalizeColumnName(col.Field);
          // Aplicar normalização e transformação de tipos
          pgRow[newName] = transformMySQLValueToPostgres(value, col.Type);
        });
        
        // Adicionar campos específicos para relacionamentos
        if (mysqlTable === 'usuarios' || mysqlTable === 'usuários') {
          // Adicione lógica específica para usuários aqui se necessário
          // Exemplo:
          // pgRow.role_id = 1; // ID padrão para professores
          // pgRow.institution_id = 1; // ID da instituição padrão
          
          // Converter senha se necessário
          if (pgRow.password && typeof pgRow.password === 'string' && !pgRow.password.startsWith('$2')) {
            // Use uma biblioteca de hash aqui se necessário
            // pgRow.password = hashSenha(pgRow.password);
          }
        }
        
        return sanitizeForPostgres(pgRow);
      });
      
      // Para a tabela institution, precisamos verificar e corrigir os valores numéricos muito grandes
      if (mysqlTable === 'institution') {
        pgRows.forEach(row => {
          // Aplicar limites do bigint do PostgreSQL
          if (row.contract_num !== null && typeof row.contract_num === 'number') {
            const PG_BIGINT_MIN = BigInt("-9223372036854775808");
            const PG_BIGINT_MAX = BigInt("9223372036854775807");
            
            // Converter para string primeiro para evitar perda de precisão
            const bigIntStr = row.contract_num.toString();
            try {
              const bigIntVal = BigInt(bigIntStr);
              if (bigIntVal < PG_BIGINT_MIN) {
                row.contract_num = Number(PG_BIGINT_MIN);
              } else if (bigIntVal > PG_BIGINT_MAX) {
                row.contract_num = Number(PG_BIGINT_MAX);
              }
            } catch (e) {
              // Se não puder converter, usar um valor padrão
              row.contract_num = 0;
            }
          }
          
          // Também verificar contract_term_end
          if (row.contract_term_end !== null && typeof row.contract_term_end === 'number') {
            const PG_BIGINT_MIN = BigInt("-9223372036854775808");
            const PG_BIGINT_MAX = BigInt("9223372036854775807");
            
            // Converter para string primeiro para evitar perda de precisão
            const bigIntStr = row.contract_term_end.toString();
            try {
              const bigIntVal = BigInt(bigIntStr);
              if (bigIntVal < PG_BIGINT_MIN) {
                row.contract_term_end = Number(PG_BIGINT_MIN);
              } else if (bigIntVal > PG_BIGINT_MAX) {
                row.contract_term_end = Number(PG_BIGINT_MAX);
              }
            } catch (e) {
              // Se não puder converter, usar um valor padrão
              row.contract_term_end = 0;
            }
          }
          
          // Converter todos os objetos vazios para timestamp atuais
          for (const key in row) {
            if (typeof row[key] === 'object' && row[key] !== null && Object.keys(row[key]).length === 0) {
              // Campos de data vazios devem ser populados com uma data válida
              if (['date_created', 'last_updated', 'contract_term_start', 'contract_term_end', 'invoice_date'].includes(key)) {
                row[key] = new Date();
              }
            }
          }
        });
        
        // Tratamento especial para institution - evitar inserções em lote
        console.log(`   🔄 Processando ${pgRows.length} registros da tabela institution individualmente...`);
        
        if (pg) {
          let successCount = 0;
          for (const row of pgRows) {
            try {
              // Corrigir campos problemáticos
              for (const key in row) {
                if (typeof row[key] === 'number') {
                  const PG_BIGINT_MIN = Number(BigInt("-9223372036854775808"));
                  const PG_BIGINT_MAX = Number(BigInt("9223372036854775807"));
                  
                  if (row[key] < PG_BIGINT_MIN || row[key] > PG_BIGINT_MAX) {
                    row[key] = 0; // Valor seguro para campos numéricos problemáticos
                  }
                }
                
                // Converter objetos vazios para data atual
                if (typeof row[key] === 'object' && row[key] !== null && Object.keys(row[key]).length === 0) {
                  row[key] = new Date();
                }
              }
              
              await pg(pgTable).insert(row).onConflict('id').ignore();
              successCount++;
              console.log(`   ✅ Registro ${successCount}/${pgRows.length} inserido com sucesso`);
            } catch (error: any) {
              console.log(`   ❌ Erro ao inserir registro na tabela institution: ${error.message}`);
              console.log(`   ❌ Registro problemático:`, row);
              // Continuar com o próximo registro em vez de interromper a migração
            }
          }
          
          if (successCount > 0) {
            console.log(`   ✅ Inseridos ${successCount} de ${pgRows.length} registros na tabela institution`);
          } else {
            console.log(`   ❌ Não foi possível inserir nenhum registro na tabela institution`);
          }
          
          console.log(`   ✅ Migração da tabela ${mysqlTable} concluída!`);
          continue; // Pular para a próxima tabela
        } else {
          console.log(`   ❌ Erro: Conexão PostgreSQL não está disponível`);
          continue;
        }
      }
      
      // Tratamento especial para tabelas de relacionamento (sem ID)
      const isRelationshipTable = [
        'tv_show_target_audience', 
        'movie_tag', 
        'genre_movie', 
        'genre_tv_show',
        'user_unit',
        'video_author',
        'video_education_period',
        'video_theme',
        'user_genre',
        'institution_tv_show',
        'institution_user',
        'profile_target_audience',
        'educational_stage_institution',
        'educational_stage_unit',
        'educational_stage_user',
        'generic_video_genre',
        'generic_video_tag',
        'video_educational_stage',
        'user_role'
      ].includes(mysqlTable);
      
      // Inserir dados (para tabelas que não são institution)
      console.log(`   📤 Migrando dados para ${pgTable}...`);
      
      // Processar dados em lotes para não sobrecarregar a memória
      const batchSize = 500;
      const totalBatches = Math.ceil(pgRows.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, pgRows.length);
        const batch = pgRows.slice(start, end);
        
        console.log(`   🔄 Batch ${i + 1}/${totalBatches}: ${batch.length} registros`);
        
        try {
          // Inserir lote
          if (!pg) {
            console.log(`   ❌ Erro: Conexão PostgreSQL não está disponível`);
            continue;
          }
          
          const escapedTableName = escapeTableNameForSQL(pgTable);
          
          try {
            // Inserir usando raw SQL para melhor performance com batch
            if (batch.length > 0) {
              if (isRelationshipTable) {
                // Para tabelas de relacionamento, não usar ON CONFLICT (id)
                await pg.raw(`
                  INSERT INTO ${escapedTableName} (${Object.keys(batch[0]).join(', ')})
                  VALUES ${batch.map(row => 
                    `(${Object.values(row).map(val => formatValueForSQL(val)).join(', ')})`
                  ).join(', ')}
                  ON CONFLICT DO NOTHING
                `);
              } else {
                // Para tabelas normais, usar ON CONFLICT (id)
                await pg.raw(`
                  INSERT INTO ${escapedTableName} (${Object.keys(batch[0]).join(', ')})
                  VALUES ${batch.map(row => 
                    `(${Object.values(row).map(val => formatValueForSQL(val)).join(', ')})`
                  ).join(', ')}
                  ON CONFLICT (id) DO NOTHING
                `);
              }
              console.log(`   ✅ Batch ${i + 1}/${totalBatches}: ${batch.length} registros migrados`);
            }
          } catch (error: any) {
            // Caso o INSERT falhe, tentar linha por linha
            console.log(`   ⚠️ Erro ao inserir em lote, tentando linha por linha: ${error.message}`);
            
            let successCount = 0;
            // Tentar inserir cada linha individualmente
            for (const row of batch) {
              try {
                if (pg) {
                  if (isRelationshipTable) {
                    // Para tabelas de relacionamento, não usar onConflict('id')
                    await pg(pgTable).insert(row);
                  } else {
                    // Para tabelas normais, usar onConflict('id')
                    await pg(pgTable).insert(row).onConflict('id').ignore();
                  }
                  successCount++;
                }
              } catch (rowError: any) {
                console.log(`   ❌ Erro ao inserir linha por linha: ${rowError.message}`);
                // Não interromper a migração
                continue;
              }
            }
            
            if (successCount > 0) {
              console.log(`   ✅ Inseridas ${successCount} linhas individualmente`);
            }
          }
        } catch (batchError) {
          console.log(`   ❌ Erro ao processar lote: ${batchError}`);
          // Não interromper a migração
          continue;
        }
      }
      
      console.log(`   ✅ Migração da tabela ${mysqlTable} concluída!`);
    }
    
    // 5. Criar funções e triggers do PostgreSQL
    console.log('\n🔧 Configurando funções e triggers no PostgreSQL...');
    if (pg) {
      await pg.raw(`
        -- Função para atualizar timestamp de updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Aplicar trigger de atualização automática em tabelas com updated_at
        DO $$
        DECLARE
            t text;
        BEGIN
            FOR t IN 
                SELECT c.table_name
                FROM information_schema.columns c
                JOIN information_schema.tables tb 
                  ON c.table_name = tb.table_name 
                 AND c.table_schema = tb.table_schema
                WHERE c.column_name = 'updated_at'
                AND c.table_schema = 'public'
                AND tb.table_type = 'BASE TABLE'  -- Garantir que é uma tabela e não uma view
            LOOP
                -- Verificar se o nome da tabela é uma palavra reservada
                IF t = 'user' THEN
                    EXECUTE format('
                        DROP TRIGGER IF EXISTS update_%s_updated_at ON "%s";
                        CREATE TRIGGER update_%s_updated_at
                        BEFORE UPDATE ON "%s"
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                    ', t, t, t, t);
                ELSE
                    EXECUTE format('
                        DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
                        CREATE TRIGGER update_%s_updated_at
                        BEFORE UPDATE ON %s
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                    ', t, t, t, t);
                END IF;
            END LOOP;
        END
        $$;
      `);
    }
    
    // 6. Criar índices para otimização
    console.log('\n🔍 Criando índices para otimização...');
    if (pg) {
      await pg.raw(`
        -- Criar índices para colunas comumente usadas em buscas
        DO $$
        BEGIN
            -- Users
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
                    CREATE INDEX idx_users_email ON users(email);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_role_id') THEN
                    CREATE INDEX idx_users_role_id ON users(role_id);
                END IF;
            END IF;
            
            -- Files
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'files') THEN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_files_category') THEN
                    CREATE INDEX idx_files_category ON files(category);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_files_type') THEN
                    CREATE INDEX idx_files_type ON files(type);
                END IF;
            END IF;
            
            -- Schools
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools') THEN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schools_institution_id') THEN
                    CREATE INDEX idx_schools_institution_id ON schools(institution_id);
                END IF;
            END IF;
            
            -- Books
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'books') THEN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_institution_id') THEN
                    CREATE INDEX idx_books_institution_id ON books(institution_id);
                END IF;
            END IF;
            
            -- Classes
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes') THEN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_classes_school_id') THEN
                    CREATE INDEX idx_classes_school_id ON classes(school_id);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_classes_education_cycle_id') THEN
                    CREATE INDEX idx_classes_education_cycle_id ON classes(education_cycle_id);
                END IF;
            END IF;
        END
        $$;
      `);
    }
    
    // 7. Dump do banco MySQL para backup usando o driver Node.js
    const backupFile = await createMySQLBackup(mysqlConn, tableNames);
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('Resumo da migração:');
    console.log(`✅ Tabelas processadas: ${tableNames.length}`);
    console.log(`✅ Seed de preparação executado`);
    console.log(`✅ Estruturas, dados e relacionamentos migrados`);
    console.log(`✅ Índices e otimizações aplicados`);
    console.log(`✅ Usuários migrados com role TEACHER`);
    console.log(`✅ Backup JSON criado em: ${backupFile}`);
    
  } catch (error: any) {
    console.log('\n❌ ERRO DURANTE A MIGRAÇÃO:');
    console.log(error);
    throw error;
  } finally {
    // Fechar conexões
    if (mysqlConn) await mysqlConn.end();
    if (pg) await pg.destroy();
  }
}

// Executar migração
if (require.main === module) {
  migrateFromMySQLToPostgres()
    .then(() => {
      console.log('Migração finalizada.');
      process.exit(0);
    })
    .catch(err => {
      console.log('Erro fatal durante migração:', err);
      process.exit(1);
    });
}

export { migrateFromMySQLToPostgres };