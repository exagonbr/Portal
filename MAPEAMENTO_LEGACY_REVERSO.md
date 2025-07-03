# Mapeamento Reverso: Sistema Novo → Legacy MySQL

## Visão Geral
Este documento detalha como mapear e unificar os dados do sistema novo (PostgreSQL) com o sistema legado (MySQL) para manter sincronização bidirecional.

## Mapeamento de Tabelas: PostgreSQL → MySQL

### Tabelas Principais de Dados

```typescript
const reverseMappings = {
  // Sistema de Usuários e Autenticação
  'users': 'user',                    // user (MySQL) ← users (PG)
  'roles': 'role',                    // role (MySQL) ← roles (PG)
  'user_roles': 'user_role',          // user_role (MySQL) ← user_roles (PG)
  'institutions': 'institution',       // institution (MySQL) ← institutions (PG)
  'user_sessions': 'cookie_signed',    // cookie_signed (MySQL) ← user_sessions (PG)
  'password_reset_tokens': 'forgot_password', // forgot_password (MySQL) ← password_reset_tokens (PG)

  // Sistema Educacional
  'schools': 'unit',                   // unit (MySQL) ← schools (PG)
  'classes': 'unit_class',            // unit_class (MySQL) ← classes (PG)
  'education_cycles': 'education_period', // education_period (MySQL) ← education_cycles (PG)
  'educational_stages': 'educational_stage', // educational_stage (MySQL) ← educational_stages (PG)
  
  // Conteúdo e Mídia
  'files': 'file',                    // file (MySQL) ← files (PG)
  'videos': 'video',                  // video (MySQL) ← videos (PG)
  'tv_shows': 'tv_show',              // tv_show (MySQL) ← tv_shows (PG)
  'books': 'book',                    // book (MySQL) ← books (PG)
  
  // Metadados de Conteúdo
  'authors': 'author',                // author (MySQL) ← authors (PG)
  'genres': 'genre',                  // genre (MySQL) ← genres (PG)
  'tags': 'tag',                      // tag (MySQL) ← tags (PG)
  'themes': 'theme',                  // theme (MySQL) ← themes (PG)
  'target_audiences': 'target_audience', // target_audience (MySQL) ← target_audiences (PG)
  
  // Sistema de Avaliação
  'questions': 'question',            // question (MySQL) ← questions (PG)
  'question_answers': 'answer',       // answer (MySQL) ← question_answers (PG)
  'user_question_answers': 'user_answer', // user_answer (MySQL) ← user_question_answers (PG)
  'quizzes': 'quiz',                  // quiz (MySQL) ← quizzes (PG)
  'certificates': 'certificate',      // certificate (MySQL) ← certificates (PG)
  
  // Relacionamentos e Associações
  'user_profiles': 'profile',         // profile (MySQL) ← user_profiles (PG)
  'user_school_units': 'user_unit',   // user_unit (MySQL) ← user_school_units (PG)
  'user_school_classes': 'user_unit_class', // user_unit_class (MySQL) ← user_school_classes (PG)
  'video_files': 'video_file',        // video_file (MySQL) ← video_files (PG)
  'video_authors': 'video_author',    // video_author (MySQL) ← video_authors (PG)
  'video_genres': 'generic_video_genre', // generic_video_genre (MySQL) ← video_genres (PG)
  'video_tags': 'generic_video_tag',  // generic_video_tag (MySQL) ← video_tags (PG)
  'video_themes': 'video_theme',      // video_theme (MySQL) ← video_themes (PG)
  'video_educational_stages': 'video_educational_stage', // video_educational_stage (MySQL) ← video_educational_stages (PG)
  'video_education_periods': 'video_education_period', // video_education_period (MySQL) ← video_education_periods (PG)
  'tv_show_authors': 'tv_show_author', // tv_show_author (MySQL) ← tv_show_authors (PG)
  'tv_show_genres': 'genre_tv_show',  // genre_tv_show (MySQL) ← tv_show_genres (PG)
  'tv_show_target_audiences': 'tv_show_target_audience', // tv_show_target_audience (MySQL) ← tv_show_target_audiences (PG)
  'movie_genres': 'genre_movie',      // genre_movie (MySQL) ← movie_genres (PG)
  'movie_tags': 'movie_tag',          // movie_tag (MySQL) ← movie_tags (PG)
  'institution_tv_shows': 'institution_tv_show', // institution_tv_show (MySQL) ← institution_tv_shows (PG)
  'institution_users': 'institution_user', // institution_user (MySQL) ← institution_users (PG)
  'user_genres': 'user_genre',        // user_genre (MySQL) ← user_genres (PG)
  'teacher_subjects': 'teacher_subject', // teacher_subject (MySQL) ← teacher_subjects (PG)
  'educational_stage_institutions': 'educational_stage_institution', // educational_stage_institution (MySQL) ← educational_stage_institutions (PG)
  'educational_stage_units': 'educational_stage_unit', // educational_stage_unit (MySQL) ← educational_stage_units (PG)
  'educational_stage_users': 'educational_stage_user', // educational_stage_user (MySQL) ← educational_stage_users (PG)
  'profile_target_audiences': 'profile_target_audience', // profile_target_audience (MySQL) ← profile_target_audiences (PG)
  
  // Sistema de Acesso e Controle
  'viewing_statuses': 'viewing_status', // viewing_status (MySQL) ← viewing_statuses (PG)
  'watchlist_entries': 'watchlist_entry', // watchlist_entry (MySQL) ← watchlist_entries (PG)
  'public_tv_shows': 'public_tv_show', // public_tv_show (MySQL) ← public_tv_shows (PG)
  'public_content': 'public',         // public (MySQL) ← public_content (PG)
  
  // Sistema de Configuração e Administração
  'system_settings': 'settings',      // settings (MySQL) ← system_settings (PG)
  'system_reports': 'report',         // report (MySQL) ← system_reports (PG)
  'notification_queue': 'notification_queue', // notification_queue (MySQL) ← notification_queue (PG)
  
  // Tabelas Novas (sem equivalente direto no Legacy)
  'courses': null,                    // Nova tabela - curso estruturado
  'modules': null,                    // Nova tabela - módulos de curso
  'announcements': null,              // Nova tabela - avisos
  'forum_threads': null,              // Nova tabela - fórum
  'forum_replies': null,              // Nova tabela - respostas do fórum
  'collections': null,                // Nova tabela - coleções de conteúdo
  'notifications': null,              // Nova tabela - notificações estruturadas
  'push_subscriptions': null,         // Nova tabela - push notifications
  'queue_jobs': null,                 // Nova tabela - fila de jobs
  'school_managers': null             // Nova tabela - gestores de escola
};
```

## Mapeamento de Campos (Conversão de Tipos)

### Campos Comuns com Diferenças

```typescript
const fieldMappings = {
  // IDs e Chaves Primárias
  'id': {
    postgres: 'UUID',
    mysql: 'BIGINT AUTO_INCREMENT',
    conversion: 'uuidToBigint' // Requer mapeamento especial
  },
  
  // Timestamps
  'created_at': {
    postgres: 'TIMESTAMP WITH TIME ZONE',
    mysql: 'datetime',
    legacy_field: 'date_created'
  },
  'updated_at': {
    postgres: 'TIMESTAMP WITH TIME ZONE', 
    mysql: 'datetime',
    legacy_field: 'last_updated'
  },
  
  // Campos Booleanos
  'is_active': {
    postgres: 'BOOLEAN',
    mysql: 'bit(1)',
    conversion: 'booleanToBit'
  },
  'deleted': {
    postgres: 'deleted_at IS NOT NULL',
    mysql: 'bit(1)',
    legacy_field: 'deleted'
  },
  
  // Campos de Texto
  'description': {
    postgres: 'TEXT',
    mysql: 'longtext'
  },
  'name': {
    postgres: 'VARCHAR(255)',
    mysql: 'varchar(255)'
  },
  
  // Campos JSON (PostgreSQL) → VARCHAR (MySQL)
  'metadata': {
    postgres: 'JSONB',
    mysql: 'longtext',
    conversion: 'jsonToString'
  },
  'settings': {
    postgres: 'JSONB',
    mysql: 'longtext', 
    conversion: 'jsonToString'
  }
};
```

## Estratégia de Unificação Bidirecional

### 1. Sistema de Sincronização em Tempo Real

```typescript
class LegacyUnificationService {
  
  // Configuração de conexões
  private pgConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'portal_sabercon',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD
  };
  
  private mysqlConfig = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'sabercon',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  };
  
  // Mapeamento de IDs para sincronização
  private idMappings = new Map<string, Map<string, number>>();
  
  /**
   * Sincroniza dados do PostgreSQL para MySQL
   */
  async syncToLegacy(tableName: string, operation: 'CREATE' | 'UPDATE' | 'DELETE', data: any) {
    const legacyTable = reverseMappings[tableName];
    if (!legacyTable) {
      console.log(`Tabela ${tableName} não possui equivalente no legacy`);
      return;
    }
    
    const convertedData = await this.convertToLegacyFormat(data, tableName);
    
    switch (operation) {
      case 'CREATE':
        await this.insertToLegacy(legacyTable, convertedData);
        break;
      case 'UPDATE':
        await this.updateLegacy(legacyTable, convertedData);
        break;
      case 'DELETE':
        await this.deleteLegacy(legacyTable, convertedData.id);
        break;
    }
  }
  
  /**
   * Converte dados do PostgreSQL para formato MySQL Legacy
   */
  private async convertToLegacyFormat(data: any, tableName: string): Promise<any> {
    const converted: any = {};
    
    for (const [pgField, value] of Object.entries(data)) {
      const legacyField = this.mapFieldToLegacy(pgField, tableName);
      if (!legacyField) continue;
      
      converted[legacyField] = await this.convertValue(value, pgField, tableName);
    }
    
    // Campos específicos do Legacy
    converted.version = 0; // Campo de versionamento do Hibernate
    converted.date_created = converted.created_at || new Date();
    converted.last_updated = converted.updated_at || new Date();
    
    return converted;
  }
  
  /**
   * Mapeia campos do PostgreSQL para MySQL Legacy
   */
  private mapFieldToLegacy(pgField: string, tableName: string): string | null {
    const specificMappings: { [key: string]: { [field: string]: string } } = {
      'users': {
        'full_name': 'full_name',
        'is_active': 'enabled',
        'is_admin': 'is_admin',
        'institution_id': 'institution_id'
      },
      'institutions': {
        'name': 'name',
        'code': 'document',
        'address': 'street',
        'city': 'district',
        'state': 'state',
        'zip_code': 'postal_code'
      },
      'videos': {
        'title': 'title',
        'synopsis': 'overview',
        'duration': 'duration',
        'release_date': 'release_date'
      }
    };
    
    return specificMappings[tableName]?.[pgField] || pgField;
  }
  
  /**
   * Converte valores entre os sistemas
   */
  private async convertValue(value: any, fieldName: string, tableName: string): Promise<any> {
    // UUID → BIGINT
    if (fieldName === 'id' && typeof value === 'string') {
      return await this.getOrCreateLegacyId(tableName, value);
    }
    
    // BOOLEAN → BIT(1)
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    
    // JSON → STRING
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    
    // TIMESTAMP → DATETIME
    if (value instanceof Date || (typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value))) {
      return new Date(value);
    }
    
    return value;
  }
  
  /**
   * Mapeia UUID do PostgreSQL para ID numérico do MySQL
   */
  private async getOrCreateLegacyId(tableName: string, uuid: string): Promise<number> {
    if (!this.idMappings.has(tableName)) {
      this.idMappings.set(tableName, new Map());
    }
    
    const tableMap = this.idMappings.get(tableName)!;
    
    if (tableMap.has(uuid)) {
      return tableMap.get(uuid)!;
    }
    
    // Buscar no mapeamento salvo ou gerar novo
    const legacyId = await this.generateLegacyId(tableName);
    tableMap.set(uuid, legacyId);
    
    // Salvar mapeamento no banco para persistência
    await this.saveIdMapping(tableName, uuid, legacyId);
    
    return legacyId;
  }
}
```

### 2. Triggers para Sincronização Automática

```sql
-- Trigger PostgreSQL para sincronizar com MySQL
CREATE OR REPLACE FUNCTION sync_to_legacy() 
RETURNS TRIGGER AS $$
BEGIN
  -- Chama serviço Node.js para sincronizar
  PERFORM pg_notify('legacy_sync', json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'data', row_to_json(COALESCE(NEW, OLD))
  )::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas principais
CREATE TRIGGER trigger_users_sync_legacy
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_to_legacy();

CREATE TRIGGER trigger_videos_sync_legacy
  AFTER INSERT OR UPDATE OR DELETE ON videos
  FOR EACH ROW EXECUTE FUNCTION sync_to_legacy();
```

### 3. Serviço de Escuta para Notificações

```typescript
class LegacySyncListener {
  private client: Client;
  
  async startListening() {
    this.client = new Client(pgConfig);
    await this.client.connect();
    
    this.client.on('notification', async (msg) => {
      if (msg.channel === 'legacy_sync') {
        const payload = JSON.parse(msg.payload!);
        await legacyUnificationService.syncToLegacy(
          payload.table, 
          payload.operation, 
          payload.data
        );
      }
    });
    
    await this.client.query('LISTEN legacy_sync');
  }
}
```

## Considerações Importantes

### 1. Gestão de Conflitos

```typescript
interface ConflictResolution {
  strategy: 'newest_wins' | 'manual_review' | 'legacy_priority' | 'new_priority';
  field_priorities: { [field: string]: 'legacy' | 'new' };
  conflict_table: string; // Tabela para registrar conflitos
}

const conflictRules: { [table: string]: ConflictResolution } = {
  'users': {
    strategy: 'newest_wins',
    field_priorities: {
      'password': 'new', // Sistema novo tem hash mais seguro
      'last_login': 'newest_wins',
      'profile_data': 'new'
    },
    conflict_table: 'user_conflicts'
  },
  'videos': {
    strategy: 'manual_review',
    field_priorities: {
      'metadata': 'new',
      'legacy_path': 'legacy'
    },
    conflict_table: 'video_conflicts'
  }
};
```

### 2. Campos Calculados e Derivados

```typescript
const derivedFields = {
  'users.amount_of_media_entries': async (userId: string) => {
    // Calcular no PostgreSQL e sincronizar para MySQL
    const count = await pgQuery('SELECT COUNT(*) FROM viewing_statuses WHERE user_id = $1', [userId]);
    return count.rows[0].count;
  },
  
  'tv_shows.total_episodes': async (showId: string) => {
    const count = await pgQuery('SELECT COUNT(*) FROM videos WHERE show_id = $1', [showId]);
    return count.rows[0].count;
  }
};
```

### 3. Migração Gradual

```typescript
class GradualMigrationStrategy {
  
  // Fase 1: Sincronização somente leitura (Legacy → Novo)
  async phase1_ReadOnlySync() {
    // Sincronizar dados do legacy para o novo sistema
    // Manter legacy como fonte da verdade
  }
  
  // Fase 2: Sincronização bidirecional
  async phase2_BidirectionalSync() {
    // Ativar sincronização nos dois sentidos
    // Implementar resolução de conflitos
  }
  
  // Fase 3: Migração de funcionalidades
  async phase3_FeatureMigration() {
    // Migrar funcionalidades uma por vez
    // Redirecionar tráfego gradualmente
  }
  
  // Fase 4: Desativação do legacy
  async phase4_LegacyDecommission() {
    // Desativar sincronização
    // Manter legacy como backup/arquivo
  }
}
```

## Comandos de Implementação

```bash
# 1. Gerar migrações de sincronização
npm run generate:sync-migrations

# 2. Executar sincronização inicial
npm run sync:initial-legacy

# 3. Ativar sincronização em tempo real
npm run sync:start-realtime

# 4. Monitorar sincronização
npm run sync:monitor

# 5. Resolver conflitos
npm run sync:resolve-conflicts
```

Este mapeamento permite uma unificação gradual e controlada entre o sistema novo e o legado, mantendo a integridade dos dados e permitindo uma migração suave. 