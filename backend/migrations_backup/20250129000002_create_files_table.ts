import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar tabela para rastrear arquivos S3 no banco de dados
  await knex.schema.createTable('files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('type', 10).notNullable();
    table.bigInteger('size').notNullable(); // tamanho em bytes
    table.string('size_formatted', 20).notNullable(); // ex: "2.4 MB"
    table.string('bucket', 100).notNullable();
    table.string('s3_key', 500).notNullable().unique(); // chave única no S3
    table.text('s3_url').notNullable();
    table.text('description');
    table.enum('category', ['literario', 'professor', 'aluno']).notNullable();
    table.json('metadata').defaultTo('{}'); // metadados adicionais
    table.string('checksum', 64); // MD5 ou SHA-256 do arquivo
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('SET NULL'); // ID do usuário
    table.boolean('is_active').defaultTo(true);
    table.specificType('tags', 'text[]').defaultTo('{}'); // array de tags
    table.timestamps(true, true);
  });

  // Criar índices para otimizar consultas
  await knex.schema.alterTable('files', (table) => {
    table.index(['category']);
    table.index(['bucket']);
    table.index(['s3_key']);
    table.index(['type']);
    table.index(['uploaded_by']);
    table.index(['is_active']);
    table.index(['created_at']);
  });

  // Criar índice GIN para tags (PostgreSQL específico)
  await knex.raw('CREATE INDEX idx_files_tags ON files USING gin(tags)');

  // Criar trigger para atualizar updated_at automaticamente
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_files_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER trigger_files_updated_at
        BEFORE UPDATE ON files
        FOR EACH ROW
        EXECUTE FUNCTION update_files_updated_at();
  `);

  // Criar view para resumo de arquivos por categoria
  await knex.raw(`
    CREATE VIEW v_files_summary AS
    SELECT 
        category,
        COUNT(*) as total_files,
        COUNT(*) FILTER (WHERE is_active = true) as active_files,
        SUM(size) as total_size,
        pg_size_pretty(SUM(size)) as total_size_formatted
    FROM files
    GROUP BY category;
  `);

  // Criar função para buscar arquivos órfãos (no S3 mas não no banco)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION find_orphan_s3_files(p_s3_keys TEXT[])
    RETURNS TABLE(s3_key TEXT) AS $$
    BEGIN
        RETURN QUERY
        SELECT unnest(p_s3_keys) AS s3_key
        EXCEPT
        SELECT files.s3_key FROM files WHERE files.is_active = true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Adicionar comentários na tabela
  await knex.raw(`
    COMMENT ON TABLE files IS 'Tabela para rastrear arquivos armazenados no S3';
    COMMENT ON COLUMN files.id IS 'Identificador único do arquivo';
    COMMENT ON COLUMN files.name IS 'Nome atual do arquivo';
    COMMENT ON COLUMN files.original_name IS 'Nome original do arquivo quando foi enviado';
    COMMENT ON COLUMN files.type IS 'Tipo/extensão do arquivo (PDF, DOCX, etc.)';
    COMMENT ON COLUMN files.size IS 'Tamanho do arquivo em bytes';
    COMMENT ON COLUMN files.size_formatted IS 'Tamanho formatado para exibição';
    COMMENT ON COLUMN files.bucket IS 'Nome do bucket S3 onde o arquivo está armazenado';
    COMMENT ON COLUMN files.s3_key IS 'Chave/caminho do arquivo no S3';
    COMMENT ON COLUMN files.s3_url IS 'URL completa do arquivo no S3';
    COMMENT ON COLUMN files.description IS 'Descrição do arquivo';
    COMMENT ON COLUMN files.category IS 'Categoria do arquivo (literario, professor, aluno)';
    COMMENT ON COLUMN files.metadata IS 'Metadados adicionais em formato JSON';
    COMMENT ON COLUMN files.checksum IS 'Hash do arquivo para verificação de integridade';
    COMMENT ON COLUMN files.uploaded_by IS 'Usuário que fez o upload';
    COMMENT ON COLUMN files.is_active IS 'Se o arquivo está ativo (não deletado logicamente)';
    COMMENT ON COLUMN files.tags IS 'Tags/etiquetas do arquivo';
    COMMENT ON VIEW v_files_summary IS 'Resumo de arquivos por categoria';
    COMMENT ON FUNCTION find_orphan_s3_files IS 'Encontra arquivos que existem no S3 mas não têm referência no banco';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remover função e view
  await knex.raw('DROP FUNCTION IF EXISTS find_orphan_s3_files(TEXT[])');
  await knex.raw('DROP VIEW IF EXISTS v_files_summary');
  
  // Remover trigger e função
  await knex.raw('DROP TRIGGER IF EXISTS trigger_files_updated_at ON files');
  await knex.raw('DROP FUNCTION IF EXISTS update_files_updated_at()');
  
  // Remover tabela
  await knex.schema.dropTableIfExists('files');
} 