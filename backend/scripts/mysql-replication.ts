import mysql from 'mysql2/promise';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
dotenv.config();

interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: any;
}

interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

interface ReplicationStatus {
  lastSyncTime: Date;
  totalRecordsProcessed: number;
  errorsCount: number;
  tablesProcessed: string[];
}

interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  primaryKey: string[];
  indexes: IndexInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  autoIncrement: boolean;
}

interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

class MySQLReplicator {
  private mysqlConnection: mysql.Connection | null = null;
  private pgConnection: Client | null = null;
  private replicationStatus: ReplicationStatus;
  private isRunning = false;

  private mysqlConfig: MysqlConfig = {
    host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password: 'gWg28m8^vffI9X#',
    database: 'sabercon',
    ssl: { rejectUnauthorized: false }
  };

  private postgresConfig: PostgresConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'portal_sabercon',
    ssl: process.env.DB_SSL === 'true'
  };

  // Mapeamento de tabelas MySQL -> PostgreSQL
  private tableMappings = {
    // Tabelas principais de dados
    'users': 'users',
    'institution': 'institutions', 
    'role': 'roles',
    'author': 'authors',
    'file': 'files',
    'video': 'videos',
    'tv_show': 'tv_shows',
    'genre': 'genres',
    'tag': 'tags',
    'theme': 'themes',
    'target_audience': 'target_audiences',
    'education_period': 'education_periods',
    'educational_stage': 'educational_stages',
    'question': 'questions',
    'answer': 'question_answers',
    'certificate': 'certificates',
    'profile': 'user_profiles',
    'unit': 'school_units',
    'unit_class': 'school_classes',
    'viewing_status': 'viewing_statuses',
    'watchlist_entry': 'watchlist_entries',
    
    // Tabelas de relacionamento
    'video_file': 'video_files',
    'video_author': 'video_authors',
    'video_theme': 'video_themes',
    'video_educational_stage': 'video_educational_stages',
    'video_education_period': 'video_education_periods',
    'tv_show_author': 'tv_show_authors',
    'tv_show_target_audience': 'tv_show_target_audiences',
    'institution_tv_show': 'institution_tv_shows',
    'user_answer': 'user_question_answers',
    'profile_target_audience': 'profile_target_audiences',
    'user_unit': 'user_school_units',
    'user_unit_class': 'user_school_classes',
    
    // Tabelas de relacionamento adicionais
    'generic_video_genre': 'video_genres',
    'generic_video_tag': 'video_tags', 
    'genre_movie': 'movie_genres',
    'genre_tv_show': 'tv_show_genres',
    'movie_tag': 'movie_tags',
    'institution_user': 'institution_users',
    'user_genre': 'user_genres',
    'user_role': 'user_roles',
    'teacher_subject': 'teacher_subjects',
    'educational_stage_institution': 'educational_stage_institutions',
    'educational_stage_unit': 'educational_stage_units', 
    'educational_stage_user': 'educational_stage_users',
    'public_tv_show': 'public_tv_shows',
    
    // Tabelas de sistema e configuração
    'settings': 'system_settings',
    'notification_queue': 'notification_queue',
    'forgot_password': 'password_reset_tokens',
    'cookie_signed': 'user_sessions',
    'report': 'system_reports',
    'public': 'public_content',
    
    // Outras tabelas úteis
    'courses': 'courses',
    'quizzes': 'quizzes'
  };

  // Mapeamento de colunas que podem ter nomes diferentes
  private columnMappings = {
    'created_at': 'created_at',
    'updated_at': 'updated_at',
    'deleted_at': 'deleted_at'
  };

  constructor() {
    this.replicationStatus = {
      lastSyncTime: new Date(),
      totalRecordsProcessed: 0,
      errorsCount: 0,
      tablesProcessed: []
    };
  }

  /**
   * Conecta ao banco MySQL da AWS
   */
  private async connectToMySQL(): Promise<void> {
    try {
      this.mysqlConnection = await mysql.createConnection({
        host: this.mysqlConfig.host,
        port: this.mysqlConfig.port,
        user: this.mysqlConfig.user,
        password: this.mysqlConfig.password,
        database: this.mysqlConfig.database,
        ssl: this.mysqlConfig.ssl,
        timezone: 'UTC',
        charset: 'utf8mb4'
      });

      console.log('✅ Conectado ao MySQL (AWS RDS) com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar ao MySQL:', error);
      throw error;
    }
  }

  /**
   * Conecta ao banco PostgreSQL local
   */
  private async connectToPostgreSQL(): Promise<void> {
    try {
      this.pgConnection = new Client({
        host: this.postgresConfig.host,
        port: this.postgresConfig.port,
        user: this.postgresConfig.user,
        password: this.postgresConfig.password,
        database: this.postgresConfig.database,
        ssl: this.postgresConfig.ssl ? { rejectUnauthorized: false } : false
      });

      await this.pgConnection.connect();
      console.log('✅ Conectado ao PostgreSQL local com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Obtém a lista de tabelas do MySQL
   */
  private async getMySQLTables(): Promise<string[]> {
    if (!this.mysqlConnection) {
      throw new Error('Conexão MySQL não estabelecida');
    }

    try {
      const [rows] = await this.mysqlConnection.execute(
        'SHOW TABLES'
      ) as any[];

      return rows.map((row: any) => Object.values(row)[0] as string);
    } catch (error) {
      console.error('❌ Erro ao obter tabelas do MySQL:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma tabela existe no PostgreSQL
   */
  private async checkPostgreSQLTable(tableName: string): Promise<boolean> {
    if (!this.pgConnection) {
      throw new Error('Conexão PostgreSQL não estabelecida');
    }

    try {
      const result = await this.pgConnection.query(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );

      return result.rows[0].exists;
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela ${tableName} no PostgreSQL:`, error);
      return false;
    }
  }

  /**
   * Obtém dados de uma tabela MySQL com timestamp para incremental
   */
  private async getMySQLTableData(tableName: string, lastSync?: Date): Promise<any[]> {
    if (!this.mysqlConnection) {
      throw new Error('Conexão MySQL não estabelecida');
    }

    try {
      // Primeiro, verifica se a tabela tem campo 'id'
      const [columns] = await this.mysqlConnection.execute(
        `SHOW COLUMNS FROM ${tableName}`
      ) as any[];

      const hasId = columns.some((col: any) => col.Field === 'id');
      const hasUpdatedAt = columns.some((col: any) => 
        col.Field === 'updated_at' || col.Field === 'modified_at'
      );
      const hasCreatedAt = columns.some((col: any) => 
        col.Field === 'created_at'
      );

      let query = `SELECT * FROM ${tableName}`;
      const params: any[] = [];

      // Se há um último sync, buscar apenas registros modificados após essa data
      if (lastSync) {
        if (hasUpdatedAt) {
          query += ' WHERE updated_at > ? OR created_at > ?';
          params.push(lastSync, lastSync);
        } else if (hasCreatedAt) {
          query += ' WHERE created_at > ?';
          params.push(lastSync);
        }
      }

      // Adiciona ORDER BY apenas se a tabela tem campo 'id'
      if (hasId) {
        query += ' ORDER BY id ASC LIMIT 1000';
      } else {
        query += ' LIMIT 1000';
      }

      const [rows] = await this.mysqlConnection.execute(query, params) as any[];
      return rows;
    } catch (error) {
      console.error(`❌ Erro ao obter dados da tabela ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Converte dados MySQL para formato PostgreSQL
   */
  private convertMySQLDataToPostgreSQL(data: any[], tableName: string): any[] {
    return data.map(row => {
      const convertedRow: any = {};
      
      for (const [key, value] of Object.entries(row)) {
        // Pular campos que sabemos que não existem no PostgreSQL
        if (this.shouldSkipField(key, tableName)) {
          continue;
        }
        
        // Mapeia nomes de colunas se necessário
        const pgColumnName = this.columnMappings[key as keyof typeof this.columnMappings] || key;
        
        // Converte tipos de dados específicos
        if (value instanceof Date) {
          convertedRow[pgColumnName] = value.toISOString();
        } else if (typeof value === 'boolean') {
          convertedRow[pgColumnName] = value;
        } else if (Buffer.isBuffer(value)) {
          // Para campos BLOB/BINARY do MySQL
          convertedRow[pgColumnName] = value.toString('base64');
        } else {
          convertedRow[pgColumnName] = value;
        }
      }
      
      return convertedRow;
    });
  }

  /**
   * Verifica se um campo deve ser pulado na conversão
   */
  private shouldSkipField(fieldName: string, tableName: string): boolean {
    // Campos comuns do MySQL que geralmente não existem no PostgreSQL
    const commonSkipFields = [
      'version', // Campo de versionamento do Hibernate
      'date_created', // Usar created_at
      'last_updated', // Usar updated_at
      'deleted', // Usar soft delete específico
      'uuid' // Se não mapeado especificamente
    ];
    
    // Campos específicos por tabela
    const tableSpecificSkips: { [key: string]: string[] } = {
      'question_answers': ['version'],
      'authors': ['version'],
      'users': ['version', 'uuid'],
      'institutions': ['version'],
      'roles': ['version'],
      'files': ['version'],
      'videos': ['version'],
      'tv_shows': ['version']
    };
    
    // Verificar campos comuns
    if (commonSkipFields.includes(fieldName)) {
      return true;
    }
    
    // Verificar campos específicos da tabela
    const pgTableName = this.tableMappings[tableName as keyof typeof this.tableMappings];
    if (pgTableName && tableSpecificSkips[pgTableName]?.includes(fieldName)) {
      return true;
    }
    
    return false;
  }

  /**
   * Insere ou atualiza dados no PostgreSQL (UPSERT)
   */
  private async upsertToPostgreSQL(tableName: string, data: any[]): Promise<number> {
    if (!this.pgConnection || data.length === 0) {
      return 0;
    }

    try {
      let processedRecords = 0;
      
      for (const row of data) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, index) => `$${index + 1}`);

        // Verifica se existe campo 'id' para fazer UPSERT
        const hasId = columns.includes('id');
        
        if (hasId) {
          // UPSERT: INSERT ... ON CONFLICT DO UPDATE
          const updateSet = columns
            .filter(col => col !== 'id')
            .map(col => `${col} = EXCLUDED.${col}`)
            .join(', ');

          const query = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            ON CONFLICT (id) DO UPDATE SET ${updateSet}
          `;

          await this.pgConnection.query(query, values);
        } else {
          // Se não tem ID, apenas INSERT
          const query = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
          `;

          await this.pgConnection.query(query, values);
        }
        
        processedRecords++;
      }

      return processedRecords;
    } catch (error) {
      console.error(`❌ Erro ao inserir dados na tabela ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Processa a replicação de uma tabela específica
   */
  private async replicateTable(mysqlTableName: string): Promise<void> {
    const pgTableName = this.tableMappings[mysqlTableName as keyof typeof this.tableMappings];
    
    if (!pgTableName) {
      console.log(`⚠️  Tabela ${mysqlTableName} não mapeada, pulando...`);
      return;
    }

    try {
      console.log(`🔄 Processando tabela: ${mysqlTableName} -> ${pgTableName}`);

      // Verifica se a tabela existe no PostgreSQL
      const tableExists = await this.checkPostgreSQLTable(pgTableName);
      if (!tableExists) {
        console.log(`⚠️  Tabela ${pgTableName} não existe no PostgreSQL, pulando...`);
        return;
      }

      // Obtém dados do MySQL (incremental se possível)
      const lastSync = this.replicationStatus.tablesProcessed.includes(mysqlTableName) 
        ? this.replicationStatus.lastSyncTime 
        : undefined;

      const mysqlData = await this.getMySQLTableData(mysqlTableName, lastSync);
      
      if (mysqlData.length === 0) {
        console.log(`✅ Nenhum dado novo para ${mysqlTableName}`);
        return;
      }

      // Converte dados para formato PostgreSQL
      const convertedData = this.convertMySQLDataToPostgreSQL(mysqlData, mysqlTableName);

      // Insere/atualiza no PostgreSQL
      const processedRecords = await this.upsertToPostgreSQL(pgTableName, convertedData);

      console.log(`✅ ${processedRecords} registros processados para ${pgTableName}`);
      
      // Atualiza status
      this.replicationStatus.totalRecordsProcessed += processedRecords;
      if (!this.replicationStatus.tablesProcessed.includes(mysqlTableName)) {
        this.replicationStatus.tablesProcessed.push(mysqlTableName);
      }

    } catch (error) {
      console.error(`❌ Erro ao replicar tabela ${mysqlTableName}:`, error);
      this.replicationStatus.errorsCount++;
      throw error;
    }
  }

  /**
   * Executa a replicação completa
   */
  public async runReplication(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Replicação já está em execução, aguardando...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando replicação MySQL -> PostgreSQL...');

    try {
      // Conecta aos bancos
      await this.connectToMySQL();
      await this.connectToPostgreSQL();

      // Obtém lista de tabelas do MySQL
      const mysqlTables = await this.getMySQLTables();
      console.log(`📋 Encontradas ${mysqlTables.length} tabelas no MySQL`);

      // Processa cada tabela mapeada
      for (const tableName of mysqlTables) {
        if (this.tableMappings[tableName as keyof typeof this.tableMappings]) {
          await this.replicateTable(tableName);
        }
      }

      // Atualiza timestamp do último sync
      this.replicationStatus.lastSyncTime = new Date();

      console.log('✅ Replicação concluída com sucesso!');
      console.log(`📊 Status: ${this.replicationStatus.totalRecordsProcessed} registros processados`);
      console.log(`⚠️  Erros: ${this.replicationStatus.errorsCount}`);

    } catch (error) {
      console.error('❌ Erro durante a replicação:', error);
      this.replicationStatus.errorsCount++;
    } finally {
      // Fecha conexões
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        this.mysqlConnection = null;
      }
      if (this.pgConnection) {
        await this.pgConnection.end();
        this.pgConnection = null;
      }
      this.isRunning = false;
    }
  }

  /**
   * Obtém a estrutura de uma tabela MySQL
   */
  private async getMySQLTableSchema(tableName: string): Promise<TableSchema> {
    if (!this.mysqlConnection) {
      throw new Error('Conexão MySQL não estabelecida');
    }

    try {
      // Obtém informações das colunas
      const [columns] = await this.mysqlConnection.execute(
        `DESCRIBE ${tableName}`
      ) as any[];

      // Obtém informações dos índices
      const [indexes] = await this.mysqlConnection.execute(
        `SHOW INDEX FROM ${tableName}`
      ) as any[];

      const columnInfos: ColumnInfo[] = columns.map((col: any) => ({
        name: col.Field,
        type: col.Type, // Manter tipo original do MySQL
        nullable: col.Null === 'YES',
        defaultValue: col.Default,
        autoIncrement: col.Extra.includes('auto_increment')
      }));

      // Agrupa índices
      const indexGroups: { [key: string]: IndexInfo } = {};
      indexes.forEach((idx: any) => {
        if (!indexGroups[idx.Key_name]) {
          indexGroups[idx.Key_name] = {
            name: idx.Key_name,
            columns: [],
            unique: idx.Non_unique === 0
          };
        }
        indexGroups[idx.Key_name].columns.push(idx.Column_name);
      });

      const primaryKey = indexGroups['PRIMARY']?.columns || [];
      const indexInfos = Object.values(indexGroups).filter(idx => idx.name !== 'PRIMARY');

      return {
        tableName,
        columns: columnInfos,
        primaryKey,
        indexes: indexInfos
      };
    } catch (error) {
      console.error(`❌ Erro ao obter schema da tabela ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Gera migration baseada na estrutura MySQL
   */
  private generateMigrationContent(schema: TableSchema, pgTableName: string): string {
    const columns = schema.columns.map(col => {
      let columnDef = '';
      
      // Mapear tipo MySQL para Knex
      const knexType = this.getKnexTypeFromMySQL(col.type, col.name);
      
      if (col.autoIncrement && col.name === 'id') {
        columnDef = `        table.increments('${col.name}')`;
      } else {
        columnDef = `        table.${knexType}('${col.name}')`;
      }
      
      if (!col.nullable && col.name !== 'id') {
        columnDef += '.notNullable()';
      }
      
      // Tratar valores default - aplicação mais simples e direta
      if (col.defaultValue && col.defaultValue !== 'NULL' && !col.autoIncrement) {
        const defaultVal = this.simplifyDefaultValue(col.defaultValue, col.type);
        if (defaultVal !== null) {
          columnDef += `.defaultTo(${defaultVal})`;
        }
      }

      return columnDef;
    }).join('\n');

    return `/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: ${schema.tableName} -> ${pgTableName}
 * Gerado em: ${new Date().toISOString()}
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('${pgTableName}');
  if (!hasTable) {
    return knex.schema.createTable('${pgTableName}', function (table) {
${columns}
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
${schema.indexes.map(idx => 
  `      table.${idx.unique ? 'unique' : 'index'}([${idx.columns.map(c => `'${c}'`).join(', ')}]);`
).join('\n')}
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('${pgTableName}');
}
`;
  }

  /**
   * Simplifica valores default para casos mais comuns
   */
  private simplifyDefaultValue(value: string, type: string): string | null {
    if (!value || value === 'NULL') return null;
    
    const lowerType = type.toLowerCase();
    
    // Casos especiais de timestamp
    if (value === 'CURRENT_TIMESTAMP' || value === 'NOW()') {
      return 'knex.fn.now()';
    }
    
    // Boolean/bit - tratamento mais direto
    if (lowerType.includes('tinyint') || lowerType.includes('bit')) {
      // Para qualquer valor que indique verdadeiro
      if (value.includes('1') || value.toLowerCase().includes('true')) {
        return 'true';
      }
      // Para qualquer valor que indique falso
      return 'false';
    }
    
    // Numbers - simples parse
    if (lowerType.includes('int') || lowerType.includes('decimal') || lowerType.includes('float')) {
      const cleanValue = value.replace(/'/g, '');
      const num = parseFloat(cleanValue);
      return isNaN(num) ? null : num.toString();
    }
    
    // Strings - garantir aspas simples
    let cleanValue = value;
    if (cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
      cleanValue = cleanValue.slice(1, -1);
    }
    return `'${cleanValue}'`;
  }

  /**
   * Mapeia tipos MySQL para tipos Knex
   */
  private getKnexTypeFromMySQL(mysqlType: string, columnName: string): string {
    const type = mysqlType.toLowerCase();
    
    // Extrair tipo base e parâmetros
    const baseType = type.split('(')[0];
    
    // Detecção especial para campos boolean baseados no nome
    if (columnName && (columnName.includes('is_') || columnName.includes('has_') || 
        columnName === 'active' || columnName === 'enabled' || columnName === 'deleted')) {
      if (baseType === 'tinyint' || baseType === 'bit') {
        return 'boolean';
      }
    }
    
    const typeMap: { [key: string]: string } = {
      'int': 'integer',
      'bigint': 'bigInteger',
      'smallint': 'integer',
      'tinyint': 'boolean', // MySQL tinyint(1) geralmente é boolean
      'varchar': 'string',
      'text': 'text',
      'longtext': 'text',
      'mediumtext': 'text',
      'datetime': 'datetime',
      'timestamp': 'timestamp',
      'date': 'date',
      'time': 'time',
      'decimal': 'decimal',
      'float': 'float',
      'double': 'double',
      'boolean': 'boolean',
      'bit': 'boolean', // MySQL bit geralmente é boolean
      'json': 'json',
      'blob': 'binary',
      'longblob': 'binary',
      'enum': 'string'
    };

    return typeMap[baseType] || 'string';
  }

  /**
   * Gera seed com dados MySQL
   */
  private generateSeedContent(tableName: string, pgTableName: string, sampleData: any[]): string {
    
    // Limita a 100 registros para exemplo
    const limitedData = sampleData.slice(0, 100);
    
    return `/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: ${tableName} -> ${pgTableName}
 * Gerado em: ${new Date().toISOString()}
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('${pgTableName}').del();

  // Insere dados de exemplo do MySQL
  await knex('${pgTableName}').insert(${JSON.stringify(limitedData, null, 4)});
}
`;
  }

  /**
   * Cria migrations e seeds automaticamente
   */
  public async generateMigrationsAndSeeds(): Promise<void> {
    console.log('🏗️  Gerando migrations e seeds automaticamente...');

    try {
      // Conecta ao MySQL para obter estruturas
      await this.connectToMySQL();
      
      const mysqlTables = await this.getMySQLTables();
      const migrationsDir = path.join(process.cwd(), 'migrations');
      const seedsDir = path.join(process.cwd(), 'seeds');

      // Garante que os diretórios existem
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }
      if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, { recursive: true });
      }

      for (const tableName of mysqlTables) {
        const pgTableName = this.tableMappings[tableName as keyof typeof this.tableMappings];
        
        if (!pgTableName) {
          console.log(`⚠️  Pulando tabela não mapeada: ${tableName}`);
          continue;
        }

        console.log(`🔄 Processando estrutura: ${tableName} -> ${pgTableName}`);

        try {
          // Obtém schema da tabela
          const schema = await this.getMySQLTableSchema(tableName);
          
          // Gera migration
          const migrationContent = this.generateMigrationContent(schema, pgTableName);
          const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);
          const migrationFile = path.join(migrationsDir, `${timestamp}_create_${pgTableName}_from_mysql.ts`);
          
          fs.writeFileSync(migrationFile, migrationContent);
          console.log(`✅ Migration criada: ${path.basename(migrationFile)}`);

          // Obtém dados de exemplo para seed
          const sampleData = await this.getMySQLTableData(tableName);
          if (sampleData.length > 0) {
            // Converte dados para PostgreSQL
            const convertedData = this.convertMySQLDataToPostgreSQL(sampleData, tableName);
            
            // Gera seed
            const seedContent = this.generateSeedContent(tableName, pgTableName, convertedData);
            const seedFile = path.join(seedsDir, `${timestamp}_${pgTableName}_data_from_mysql.ts`);
            
            fs.writeFileSync(seedFile, seedContent);
            console.log(`✅ Seed criado: ${path.basename(seedFile)}`);
          }

          // Pequena pausa para evitar conflitos de timestamp
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Erro ao processar tabela ${tableName}:`, error);
        }
      }

      console.log('✅ Migrations e seeds gerados com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao gerar migrations e seeds:', error);
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        this.mysqlConnection = null;
      }
    }
  }

  /**
   * Executa migrations e seeds
   */
  private async runMigrationsAndSeeds(): Promise<void> {
    console.log('🚀 Executando migrations e seeds...');

    try {
      // Executa migrations
      console.log('📋 Executando migrations...');
      const migrateResult = await execAsync('npm run migrate');
      console.log('✅ Migrations executadas:', migrateResult.stdout);

      // Executa seeds
      console.log('🌱 Executando seeds...');
      const seedResult = await execAsync('npm run seed');
      console.log('✅ Seeds executados:', seedResult.stdout);

    } catch (error) {
      console.error('❌ Erro ao executar migrations/seeds:', error);
      throw error;
    }
  }

  /**
   * Inicia o serviço de replicação com agendamento
   * Agora inclui geração automática de migrations e seeds
   */
  public async startReplicationService(): Promise<void> {
    console.log('🎯 Iniciando serviço de replicação MySQL -> PostgreSQL com setup automático');
    console.log('⏰ Agendamento: A cada 2 minutos');

    try {
      // 1. Gera migrations e seeds automaticamente
      await this.generateMigrationsAndSeeds();
      
      // 2. Executa migrations e seeds
      await this.runMigrationsAndSeeds();
      
      // 3. Executa primeira replicação
      await this.runReplication();

      // 4. Agenda execução a cada 2 minutos
      cron.schedule('*/2 * * * *', async () => {
        console.log(`⏰ [${new Date().toISOString()}] Executando replicação agendada...`);
        await this.runReplication();
      });

      console.log('✅ Serviço de replicação iniciado com sucesso!');
      console.log('📋 Migrations e seeds foram criados e executados automaticamente');
      console.log('🔄 Replicação contínua ativa a cada 2 minutos');

    } catch (error) {
      console.error('❌ Erro ao iniciar serviço de replicação:', error);
      throw error;
    }
  }

  /**
   * Para o serviço de replicação
   */
  public async stopReplicationService(): Promise<void> {
    console.log('🛑 Parando serviço de replicação...');
    this.isRunning = false;
    
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
    }
    if (this.pgConnection) {
      await this.pgConnection.end();
    }
    
    console.log('✅ Serviço de replicação parado');
  }

  /**
   * Obtém status da replicação
   */
  public getReplicationStatus(): ReplicationStatus {
    return { ...this.replicationStatus };
  }

  /**
   * Testa conectividade com ambos os bancos
   */
  public async testConnections(): Promise<void> {
    console.log('🔍 Testando conectividade...');
    
    try {
      await this.connectToMySQL();
      console.log('✅ MySQL: Conexão OK');
      
      await this.connectToPostgreSQL();
      console.log('✅ PostgreSQL: Conexão OK');
      
      // Testa query simples
      if (this.mysqlConnection) {
        await this.mysqlConnection.execute('SELECT 1 as test');
        console.log('✅ MySQL: Query de teste OK');
      }
      
      if (this.pgConnection) {
        await this.pgConnection.query('SELECT 1 as test');
        console.log('✅ PostgreSQL: Query de teste OK');
      }
      
    } catch (error) {
      console.error('❌ Erro nos testes de conectividade:', error);
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        this.mysqlConnection = null;
      }
      if (this.pgConnection) {
        await this.pgConnection.end();
        this.pgConnection = null;
      }
    }
  }
}

// Função principal para execução via CLI
async function main() {
  const replicator = new MySQLReplicator();
  
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'test':
        await replicator.testConnections();
        break;
        
      case 'sync':
        await replicator.runReplication();
        break;
        
      case 'generate':
        console.log('🏗️  Gerando apenas migrations e seeds...');
        await replicator.generateMigrationsAndSeeds();
        console.log('✅ Migrations e seeds gerados! Execute "npm run migrate && npm run seed" para aplicá-los.');
        break;
        
      case 'start':
        await replicator.startReplicationService();
        // Mantém o processo rodando
        process.on('SIGINT', async () => {
          console.log('\n🛑 Recebido sinal de interrupção...');
          await replicator.stopReplicationService();
          process.exit(0);
        });
        break;
        
      case 'status':
        const status = replicator.getReplicationStatus();
        console.log('📊 Status da Replicação:');
        console.log(JSON.stringify(status, null, 2));
        break;
        
      default:
        console.log(`
🎯 Script de Replicação MySQL -> PostgreSQL

Uso: npm run replicate [comando]

Comandos disponíveis:
  test      - Testa conectividade com ambos os bancos
  generate  - Gera migrations e seeds baseados na estrutura MySQL
  sync      - Executa uma sincronização manual
  start     - Inicia serviço completo (gera migrations/seeds + replicação contínua)
  status    - Mostra status da última replicação

Exemplos:
  npm run replicate test
  npm run replicate generate
  npm run replicate sync  
  npm run replicate start

⚡ NOVO: O comando 'start' agora cria automaticamente migrations e seeds
   para replicação instantânea baseada na estrutura do MySQL!
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Erro na execução:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

export default MySQLReplicator; 