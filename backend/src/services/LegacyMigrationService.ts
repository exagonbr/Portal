import { Client } from 'pg';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

interface MigrationMapping {
  mysql_table: string;
  postgres_table: string;
  requires_uuid_generation?: boolean;
  field_mappings?: { [mysqlField: string]: string };
  skip_fields?: string[];
  type_conversions?: { [field: string]: (value: any) => any };
  dependencies?: string[]; // Tabelas que devem ser migradas primeiro
  batch_size?: number;
}

interface MigrationProgress {
  table: string;
  total_records: number;
  migrated_records: number;
  start_time: Date;
  end_time?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message?: string;
}

export class LegacyMigrationService {
  private pgConnection: Client | null = null;
  private mysqlConnection: mysql.Connection | null = null;
  private idMappings = new Map<string, Map<number, string>>(); // MySQL ID -> PostgreSQL UUID
  private migrationProgress: MigrationProgress[] = [];

  // Mapeamento completo MySQL Legacy -> PostgreSQL Novo
  private readonly migrationMappings: { [key: string]: MigrationMapping } = {
    // 1. Tabelas independentes primeiro (sem dependências)
    'role': {
      mysql_table: 'role',
      postgres_table: 'roles',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'type': () => 'system',
        'status': () => 'active',
        'user_count': () => 0
      },
      batch_size: 1000
    },

    'institution': {
      mysql_table: 'institution',
      postgres_table: 'institutions',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'document': 'code',
        'company_name': 'description',
        'street': 'address',
        'district': 'city',
        'state': 'state',
        'postal_code': 'zip_code',
        'accountable_contact': 'phone',
        'accountable_contact': 'email',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted', 'contract_disabled', 'contract_num', 'invoice_date'],
      type_conversions: {
        'status': () => 'active'
      },
      batch_size: 500
    },

    'author': {
      mysql_table: 'author',
      postgres_table: 'authors',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      batch_size: 1000
    },

    'genre': {
      mysql_table: 'genre',
      postgres_table: 'genres',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      batch_size: 1000
    },

    'tag': {
      mysql_table: 'tag',
      postgres_table: 'tags',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      batch_size: 1000
    },

    'theme': {
      mysql_table: 'theme',
      postgres_table: 'themes',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      batch_size: 1000
    },

    'target_audience': {
      mysql_table: 'target_audience',
      postgres_table: 'target_audiences',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      batch_size: 1000
    },

    'education_period': {
      mysql_table: 'education_period',
      postgres_table: 'education_cycles',
      requires_uuid_generation: true,
      field_mappings: {
        'description': 'name',
        'is_active': 'is_active'
      },
      skip_fields: ['version'],
      type_conversions: {
        'description': (value: string) => value || 'Período Educacional',
        'is_active': (value: any) => value === 1 || value === true
      },
      batch_size: 1000
    },

    'educational_stage': {
      mysql_table: 'educational_stage',
      postgres_table: 'educational_stages',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9', 'uuid'],
      type_conversions: {
        'description': (value: any, record: any) => `Estágio educacional: ${record.name}`,
        'status': () => 'active'
      },
      batch_size: 1000
    },

    // 2. Tabelas com dependências
    'user': {
      mysql_table: 'user',
      postgres_table: 'users',
      requires_uuid_generation: true,
      dependencies: ['role', 'institution'],
      field_mappings: {
        'full_name': 'full_name',
        'email': 'email',
        'password': 'password',
        'enabled': 'is_active',
        'phone': 'phone',
        'address': 'address',
        'language': 'language',
        'username': 'username',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted', 'account_expired', 'account_locked', 'password_expired', 'invitation_sent', 'reset_password', 'pause_video_on_click', 'uuid', 'is_manager', 'type', 'certificate_path', 'is_certified', 'is_student', 'is_teacher', 'subject', 'subject_data_id', 'amount_of_media_entries'],
      type_conversions: {
        'is_admin': (value: any) => value === 1 || value === true,
        'is_active': (value: any) => value === 1 || value === true,
        'institution_id': (value: any) => this.getMappedUUID('institution', value),
        'role_id': () => null // Será mapeado depois via tabela user_role
      },
      batch_size: 500
    },

    'unit': {
      mysql_table: 'unit',
      postgres_table: 'schools',
      requires_uuid_generation: true,
      dependencies: ['institution'],
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'institution_id': (value: any) => this.getMappedUUID('institution', value),
        'status': () => 'active',
        'code': (value: any, record: any) => record.name?.substring(0, 10).toUpperCase() || 'SCHOOL'
      },
      batch_size: 500
    },

    'unit_class': {
      mysql_table: 'unit_class',
      postgres_table: 'classes',
      requires_uuid_generation: true,
      dependencies: ['unit', 'education_period'],
      field_mappings: {
        'name': 'name',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'school_id': (value: any) => this.getMappedUUID('unit', value),
        'education_cycle_id': (value: any) => this.getMappedUUID('education_period', value),
        'status': () => 'active'
      },
      batch_size: 500
    },

    'file': {
      mysql_table: 'file',
      postgres_table: 'files',
      requires_uuid_generation: true,
      field_mappings: {
        'name': 'name',
        'original_name': 'original_name',
        'content_type': 'type',
        'size': 'size',
        'url': 's3_url',
        'description': 'description',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'bucket': () => 'legacy-files',
        's3_key': (value: any, record: any) => `legacy/${record.id}/${record.name}`,
        'size_formatted': (value: any, record: any) => this.formatFileSize(record.size),
        'category': () => 'literario',
        'is_active': () => true,
        'uploaded_by': () => null
      },
      batch_size: 200
    },

    'tv_show': {
      mysql_table: 'tv_show',
      postgres_table: 'tv_shows',
      requires_uuid_generation: true,
      dependencies: ['file'],
      field_mappings: {
        'name': 'title',
        'overview': 'synopsis',
        'overview': 'description',
        'poster_path': 'cover_image_url',
        'backdrop_path': 'banner_image_url',
        'first_air_date': 'release_date',
        'original_language': 'language',
        'popularity': 'popularity',
        'vote_average': 'vote_average',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted', 'api_id', 'imdb_id', 'manual_input', 'manual_support_id', 'manual_support_path', 'producer', 'contract_term_end'],
      type_conversions: {
        'total_episodes': () => 0,
        'total_seasons': () => 1,
        'total_duration': () => 0,
        'genre': () => 'educacional',
        'target_audience': () => 'geral',
        'content_rating': () => 'livre',
        'is_public': () => false,
        'is_premium': () => false,
        'is_featured': () => false,
        'status': () => 'published',
        'views_count': () => 0,
        'likes_count': () => 0,
        'poster_image_id': (value: any) => this.getMappedUUID('file', value),
        'backdrop_image_id': (value: any) => this.getMappedUUID('file', value)
      },
      batch_size: 200
    },

    'video': {
      mysql_table: 'video',
      postgres_table: 'videos',
      requires_uuid_generation: true,
      dependencies: ['tv_show', 'file'],
      field_mappings: {
        'title': 'title',
        'name': 'title',
        'overview': 'synopsis',
        'overview': 'description',
        'duration': 'duration',
        'release_date': 'release_date',
        'air_date': 'release_date',
        'poster_path': 'poster_url',
        'backdrop_path': 'backdrop_url',
        'still_path': 'thumbnail_url',
        'original_language': 'language',
        'popularity': 'popularity',
        'vote_average': 'rating',
        'vote_count': 'rating_count',
        'episode_number': 'episode_number',
        'season_number': 'season_number',
        'intro_start': 'intro_start',
        'intro_end': 'intro_end',
        'outro_start': 'outro_start',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted', 'api_id', 'imdb_id', 'class', 'episode_string', 'season_episode_merged', 'trailer_key', 'report_count'],
      type_conversions: {
        'tv_show_id': (value: any) => this.getMappedUUID('tv_show', value),
        'poster_image_id': (value: any) => this.getMappedUUID('file', value),
        'backdrop_image_id': (value: any) => this.getMappedUUID('file', value),
        'still_image_id': (value: any) => this.getMappedUUID('file', value),
        'show_id': (value: any) => this.getMappedUUID('tv_show', value),
        'video_type': () => 'episode',
        'is_public': () => false,
        'status': () => 'published',
        'views_count': () => 0,
        'duration_seconds': (value: any, record: any) => this.parseDuration(record.duration)
      },
      batch_size: 100
    },

    'question': {
      mysql_table: 'question',
      postgres_table: 'questions',
      requires_uuid_generation: true,
      dependencies: ['video'],
      field_mappings: {
        'description': 'question_text',
        'title': 'title',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'video_id': (value: any) => this.getMappedUUID('video', value),
        'question_type': () => 'multiple_choice',
        'points': () => 10,
        'is_active': () => true
      },
      batch_size: 500
    },

    'answer': {
      mysql_table: 'answer',
      postgres_table: 'question_answers',
      requires_uuid_generation: true,
      dependencies: ['question'],
      field_mappings: {
        'description': 'answer_text',
        'is_correct': 'is_correct',
        'date_created': 'created_at',
        'last_updated': 'updated_at'
      },
      skip_fields: ['version', 'deleted'],
      type_conversions: {
        'question_id': (value: any) => this.getMappedUUID('question', value),
        'is_correct': (value: any) => value === 1 || value === true,
        'order_position': () => 0
      },
      batch_size: 1000
    }

    // Adicionar mais mapeamentos conforme necessário...
  };

  private readonly pgConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'portal_sabercon',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'root'
  };

  private readonly mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'sabercon',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root'
  };

  /**
   * Conecta aos bancos de dados
   */
  async connect(): Promise<void> {
    try {
      // Conexão MySQL Legacy
      this.mysqlConnection = await mysql.createConnection(this.mysqlConfig);
      console.log('✅ Conectado ao MySQL Legacy');

      // Conexão PostgreSQL Novo
      this.pgConnection = new Client(this.pgConfig);
      await this.pgConnection.connect();
      console.log('✅ Conectado ao PostgreSQL Novo');

      // Inicializa tabela de mapeamento de IDs
      await this.initializeIdMappingTable();

      // Carrega mapeamentos existentes
      await this.loadExistingMappings();

    } catch (error) {
      console.error('❌ Erro ao conectar aos bancos:', error);
      throw error;
    }
  }

  /**
   * Desconecta dos bancos de dados
   */
  async disconnect(): Promise<void> {
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
      this.mysqlConnection = null;
    }
    if (this.pgConnection) {
      await this.pgConnection.end();
      this.pgConnection = null;
    }
    console.log('🔌 Desconectado dos bancos de dados');
  }

  /**
   * Inicializa a tabela de mapeamento de IDs no PostgreSQL
   */
  private async initializeIdMappingTable(): Promise<void> {
    if (!this.pgConnection) return;

    await this.pgConnection.query(`
      CREATE TABLE IF NOT EXISTS legacy_migration_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mysql_table VARCHAR(255) NOT NULL,
        mysql_id BIGINT NOT NULL,
        postgres_uuid UUID NOT NULL,
        migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(mysql_table, mysql_id),
        UNIQUE(mysql_table, postgres_uuid)
      )
    `);

    await this.pgConnection.query(`
      CREATE TABLE IF NOT EXISTS migration_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(255) NOT NULL,
        total_records BIGINT NOT NULL,
        migrated_records BIGINT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('📋 Tabelas de controle de migração inicializadas');
  }

  /**
   * Carrega mapeamentos existentes
   */
  private async loadExistingMappings(): Promise<void> {
    if (!this.pgConnection) return;

    const result = await this.pgConnection.query(
      'SELECT mysql_table, mysql_id, postgres_uuid FROM legacy_migration_mappings'
    );

    for (const row of result.rows) {
      if (!this.idMappings.has(row.mysql_table)) {
        this.idMappings.set(row.mysql_table, new Map());
      }
      this.idMappings.get(row.mysql_table)!.set(row.mysql_id, row.postgres_uuid);
    }

    console.log(`📋 Carregados ${result.rows.length} mapeamentos existentes`);
  }

  /**
   * Executa a migração completa na ordem correta
   */
  async runFullMigration(): Promise<void> {
    console.log('🚀 Iniciando migração completa dos dados legados...');

    try {
      await this.connect();

      // Ordena tabelas por dependências
      const migrationOrder = this.getMigrationOrder();
      
      console.log(`📋 Ordem de migração: ${migrationOrder.join(' → ')}`);

      for (const tableName of migrationOrder) {
        await this.migrateTable(tableName);
      }

      // Migra relacionamentos (tabelas de junção) por último
      await this.migrateRelationshipTables();

      console.log('🎉 Migração completa concluída com sucesso!');
      await this.generateMigrationReport();

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Determina a ordem correta de migração baseada nas dependências
   */
  private getMigrationOrder(): string[] {
    const order: string[] = [];
    const processed = new Set<string>();
    
    const processTable = (tableName: string) => {
      if (processed.has(tableName)) return;
      
      const mapping = this.migrationMappings[tableName];
      if (!mapping) return;
      
      // Processa dependências primeiro
      if (mapping.dependencies) {
        for (const dep of mapping.dependencies) {
          processTable(dep);
        }
      }
      
      if (!processed.has(tableName)) {
        order.push(tableName);
        processed.add(tableName);
      }
    };

    // Processa todas as tabelas
    for (const tableName of Object.keys(this.migrationMappings)) {
      processTable(tableName);
    }

    return order;
  }

  /**
   * Migra uma tabela específica
   */
  async migrateTable(tableName: string): Promise<void> {
    const mapping = this.migrationMappings[tableName];
    if (!mapping) {
      console.log(`⚠️  Mapeamento não encontrado para ${tableName}`);
      return;
    }

    console.log(`🔄 Migrando ${mapping.mysql_table} → ${mapping.postgres_table}`);

    const progress: MigrationProgress = {
      table: tableName,
      total_records: 0,
      migrated_records: 0,
      start_time: new Date(),
      status: 'in_progress'
    };

    try {
      // Conta total de registros
      const countResult = await this.mysqlConnection!.execute(
        `SELECT COUNT(*) as total FROM ${mapping.mysql_table}`
      ) as any[];
      progress.total_records = countResult[0][0].total;

      console.log(`📊 Total de registros: ${progress.total_records}`);

      // Migra em lotes
      const batchSize = mapping.batch_size || 500;
      let offset = 0;

      while (offset < progress.total_records) {
        const batch = await this.getMySQLBatch(mapping.mysql_table, offset, batchSize);
        const convertedBatch = await this.convertBatch(batch, mapping);
        
        if (convertedBatch.length > 0) {
          await this.insertBatchToPostgreSQL(mapping.postgres_table, convertedBatch, mapping);
          progress.migrated_records += convertedBatch.length;
        }

        offset += batchSize;
        
        const percentage = Math.round((progress.migrated_records / progress.total_records) * 100);
        console.log(`   📈 Progresso: ${progress.migrated_records}/${progress.total_records} (${percentage}%)`);
      }

      progress.status = 'completed';
      progress.end_time = new Date();
      console.log(`✅ Tabela ${tableName} migrada com sucesso!`);

    } catch (error) {
      progress.status = 'failed';
      progress.error_message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ Erro na migração de ${tableName}:`, error);
      throw error;
    } finally {
      this.migrationProgress.push(progress);
      await this.logMigrationProgress(progress);
    }
  }

  /**
   * Obtém um lote de registros do MySQL
   */
  private async getMySQLBatch(tableName: string, offset: number, limit: number): Promise<any[]> {
    const query = `SELECT * FROM ${tableName} ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await this.mysqlConnection!.execute(query) as any[];
    return rows;
  }

  /**
   * Converte um lote de registros para o formato PostgreSQL
   */
  private async convertBatch(batch: any[], mapping: MigrationMapping): Promise<any[]> {
    const converted: any[] = [];

    for (const record of batch) {
      try {
        const convertedRecord = await this.convertRecord(record, mapping);
        if (convertedRecord) {
          converted.push(convertedRecord);
        }
      } catch (error) {
        console.error(`❌ Erro ao converter registro ID ${record.id}:`, error);
        // Continua com outros registros
      }
    }

    return converted;
  }

  /**
   * Converte um registro individual
   */
  private async convertRecord(record: any, mapping: MigrationMapping): Promise<any | null> {
    const converted: any = {};

    // Gera UUID se necessário
    let newUuid: string;
    if (mapping.requires_uuid_generation) {
      newUuid = uuidv4();
      converted.id = newUuid;
      
      // Salva mapeamento de ID
      await this.saveIdMapping(mapping.mysql_table, record.id, newUuid);
    }

    // Mapeia campos básicos
    if (mapping.field_mappings) {
      for (const [mysqlField, pgField] of Object.entries(mapping.field_mappings)) {
        if (record[mysqlField] !== undefined && record[mysqlField] !== null) {
          converted[pgField] = this.convertValue(record[mysqlField], mysqlField);
        }
      }
    }

    // Aplica conversões de tipo
    if (mapping.type_conversions) {
      for (const [field, converter] of Object.entries(mapping.type_conversions)) {
        try {
          converted[field] = await converter(record[field], record);
        } catch (error) {
          console.warn(`⚠️  Erro na conversão do campo ${field}:`, error);
          converted[field] = null;
        }
      }
    }

    // Remove campos a serem ignorados
    if (mapping.skip_fields) {
      for (const field of mapping.skip_fields) {
        delete converted[field];
      }
    }

    // Define timestamps padrão se não existirem
    if (!converted.created_at) {
      converted.created_at = record.date_created || new Date();
    }
    if (!converted.updated_at) {
      converted.updated_at = record.last_updated || record.date_created || new Date();
    }

    return converted;
  }

  /**
   * Converte valores individuais
   */
  private convertValue(value: any, fieldName: string): any {
    // MySQL BIT(1) → PostgreSQL BOOLEAN
    if (fieldName.includes('is_') || fieldName.includes('enabled') || fieldName.includes('deleted')) {
      return value === 1 || value === true;
    }

    // MySQL DATETIME → PostgreSQL TIMESTAMP
    if (value instanceof Date) {
      return value.toISOString();
    }

    // MySQL LONGTEXT → PostgreSQL TEXT
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 5000); // Limita tamanho se necessário
    }

    return value;
  }

  /**
   * Insere lote no PostgreSQL
   */
  private async insertBatchToPostgreSQL(
    tableName: string, 
    batch: any[], 
    mapping: MigrationMapping
  ): Promise<void> {
    if (!this.pgConnection || batch.length === 0) return;

    // Prepara dados para inserção em lote
    const fields = Object.keys(batch[0]);
    const values = batch.map(record => fields.map(field => record[field]));

    // Gera query de inserção
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const valueRows = values.map((_, rowIndex) => 
      `(${fields.map((_, fieldIndex) => `$${rowIndex * fields.length + fieldIndex + 1}`).join(', ')})`
    ).join(', ');

    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES ${valueRows}
      ON CONFLICT (id) DO NOTHING
    `;

    const flatValues = values.flat();

    try {
      await this.pgConnection.query(query, flatValues);
    } catch (error) {
      // Se falhar inserção em lote, tenta uma por uma
      console.warn(`⚠️  Inserção em lote falhou para ${tableName}, tentando individual...`);
      await this.insertRecordsIndividually(tableName, batch);
    }
  }

  /**
   * Insere registros individualmente (fallback)
   */
  private async insertRecordsIndividually(tableName: string, batch: any[]): Promise<void> {
    if (!this.pgConnection) return;

    for (const record of batch) {
      try {
        const fields = Object.keys(record);
        const values = Object.values(record);
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

        const query = `
          INSERT INTO ${tableName} (${fields.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (id) DO NOTHING
        `;

        await this.pgConnection.query(query, values);
      } catch (error) {
        console.error(`❌ Erro ao inserir registro individual em ${tableName}:`, error);
      }
    }
  }

  /**
   * Salva mapeamento de ID
   */
  private async saveIdMapping(tableName: string, mysqlId: number, pgUuid: string): Promise<void> {
    if (!this.pgConnection) return;

    // Salva no cache local
    if (!this.idMappings.has(tableName)) {
      this.idMappings.set(tableName, new Map());
    }
    this.idMappings.get(tableName)!.set(mysqlId, pgUuid);

    // Salva no banco
    try {
      await this.pgConnection.query(
        `INSERT INTO legacy_migration_mappings (mysql_table, mysql_id, postgres_uuid) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (mysql_table, mysql_id) DO NOTHING`,
        [tableName, mysqlId, pgUuid]
      );
    } catch (error) {
      console.error(`❌ Erro ao salvar mapeamento ${tableName}:`, error);
    }
  }

  /**
   * Obtém UUID mapeado a partir do ID MySQL
   */
  private getMappedUUID(tableName: string, mysqlId: any): string | null {
    if (!mysqlId || mysqlId === null) return null;
    
    const tableMap = this.idMappings.get(tableName);
    if (!tableMap) return null;
    
    return tableMap.get(parseInt(mysqlId)) || null;
  }

  /**
   * Migra tabelas de relacionamento (many-to-many)
   */
  private async migrateRelationshipTables(): Promise<void> {
    console.log('🔗 Migrando tabelas de relacionamento...');

    // Mapear tabelas de relacionamento que precisam ser migradas
    const relationshipMappings = {
      'user_role': {
        mysql_table: 'user_role',
        postgres_table: 'user_roles',
        mappings: [
          { mysql_field: 'user_roles_id', pg_field: 'user_id', reference_table: 'user' },
          { mysql_field: 'role_id', pg_field: 'role_id', reference_table: 'role' }
        ]
      },
      'video_author': {
        mysql_table: 'video_author',
        postgres_table: 'video_authors',
        mappings: [
          { mysql_field: 'video_authors_id', pg_field: 'video_id', reference_table: 'video' },
          { mysql_field: 'author_id', pg_field: 'author_id', reference_table: 'author' }
        ]
      }
      // Adicionar mais conforme necessário...
    };

    for (const [name, config] of Object.entries(relationshipMappings)) {
      await this.migrateRelationshipTable(name, config as any);
    }
  }

  /**
   * Migra uma tabela de relacionamento específica
   */
  private async migrateRelationshipTable(name: string, config: any): Promise<void> {
    console.log(`🔗 Migrando relacionamento ${config.mysql_table} → ${config.postgres_table}`);

    try {
      const [rows] = await this.mysqlConnection!.execute(
        `SELECT * FROM ${config.mysql_table}`
      ) as any[];

      for (const row of rows) {
        const converted: any = { id: uuidv4() };

        for (const mapping of config.mappings) {
          const mysqlValue = row[mapping.mysql_field];
          const pgUuid = this.getMappedUUID(mapping.reference_table, mysqlValue);
          
          if (pgUuid) {
            converted[mapping.pg_field] = pgUuid;
          }
        }

        // Só insere se todos os UUIDs foram encontrados
        if (Object.keys(converted).length === config.mappings.length + 1) {
          const fields = Object.keys(converted);
          const values = Object.values(converted);
          const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

          await this.pgConnection!.query(
            `INSERT INTO ${config.postgres_table} (${fields.join(', ')}) 
             VALUES (${placeholders})
             ON CONFLICT DO NOTHING`,
            values
          );
        }
      }

      console.log(`✅ Relacionamento ${name} migrado`);
    } catch (error) {
      console.error(`❌ Erro na migração do relacionamento ${name}:`, error);
    }
  }

  /**
   * Funções utilitárias
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private parseDuration(duration: string): number {
    if (!duration) return 0;
    // Implementar parsing de duração conforme formato do legacy
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  /**
   * Registra progresso da migração
   */
  private async logMigrationProgress(progress: MigrationProgress): Promise<void> {
    if (!this.pgConnection) return;

    await this.pgConnection.query(
      `INSERT INTO migration_log 
       (table_name, total_records, migrated_records, start_time, end_time, status, error_message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        progress.table,
        progress.total_records,
        progress.migrated_records,
        progress.start_time,
        progress.end_time,
        progress.status,
        progress.error_message
      ]
    );
  }

  /**
   * Gera relatório final da migração
   */
  private async generateMigrationReport(): Promise<void> {
    console.log('\n📊 RELATÓRIO DE MIGRAÇÃO');
    console.log('=' * 50);

    let totalRecords = 0;
    let totalMigrated = 0;

    for (const progress of this.migrationProgress) {
      const status = progress.status === 'completed' ? '✅' : '❌';
      const duration = progress.end_time 
        ? Math.round((progress.end_time.getTime() - progress.start_time.getTime()) / 1000)
        : 0;

      console.log(`${status} ${progress.table}: ${progress.migrated_records}/${progress.total_records} (${duration}s)`);
      
      totalRecords += progress.total_records;
      totalMigrated += progress.migrated_records;
    }

    console.log('=' * 50);
    console.log(`📊 TOTAL: ${totalMigrated}/${totalRecords} registros migrados`);
    console.log(`📈 Taxa de sucesso: ${Math.round((totalMigrated / totalRecords) * 100)}%`);
  }

  /**
   * Verifica integridade dos dados migrados
   */
  async verifyMigration(): Promise<void> {
    console.log('🔍 Verificando integridade da migração...');

    for (const [tableName, mapping] of Object.entries(this.migrationMappings)) {
      const [mysqlCount] = await this.mysqlConnection!.execute(
        `SELECT COUNT(*) as count FROM ${mapping.mysql_table}`
      ) as any[];

      const pgCount = await this.pgConnection!.query(
        `SELECT COUNT(*) as count FROM ${mapping.postgres_table}`
      );

      const mysqlTotal = mysqlCount[0].count;
      const pgTotal = parseInt(pgCount.rows[0].count);

      if (mysqlTotal === pgTotal) {
        console.log(`✅ ${tableName}: ${pgTotal} registros ✓`);
      } else {
        console.log(`⚠️  ${tableName}: MySQL=${mysqlTotal}, PostgreSQL=${pgTotal}`);
      }
    }
  }

  /**
   * Executa migração de uma tabela específica
   */
  async migrateSingleTable(tableName: string): Promise<void> {
    console.log(`🎯 Migrando tabela específica: ${tableName}`);
    
    await this.connect();
    try {
      await this.migrateTable(tableName);
    } finally {
      await this.disconnect();
    }
  }
}

export default LegacyMigrationService; 