import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Adicionar colunas para melhorar a relação files-books
  await knex.schema.alterTable('files', (table) => {
    table.uuid('linked_book_id').references('id').inTable('books').onDelete('SET NULL');
    table.timestamp('linked_at');
    table.index(['linked_book_id']);
  });

  // Adicionar coluna file_id na tabela books para referência direta
  await knex.schema.alterTable('books', (table) => {
    table.uuid('file_id').references('id').inTable('files').onDelete('SET NULL');
    table.index(['file_id']);
  });

  // Criar view para arquivos com suas referências de livros
  await knex.raw(`
    CREATE VIEW v_files_with_books AS
    SELECT 
        f.id,
        f.name,
        f.original_name,
        f.type,
        f.size,
        f.size_formatted,
        f.bucket,
        f.s3_key,
        f.s3_url,
        f.description,
        f.category,
        f.metadata,
        f.tags,
        f.is_active,
        f.created_at,
        f.updated_at,
        f.linked_book_id,
        f.linked_at,
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.publisher as book_publisher,
        b.status as book_status,
        CASE 
            WHEN b.id IS NOT NULL THEN true 
            ELSE false 
        END as has_book_reference
    FROM files f
    LEFT JOIN books b ON f.linked_book_id = b.id OR b.file_id = f.id
    WHERE f.is_active = true;
  `);

  // Criar função para vincular arquivo a livro
  await knex.raw(`
    CREATE OR REPLACE FUNCTION link_file_to_book(
        p_file_id UUID,
        p_book_id UUID
    )
    RETURNS BOOLEAN AS $$
    DECLARE
        file_exists BOOLEAN := false;
        book_exists BOOLEAN := false;
    BEGIN
        -- Verificar se arquivo existe
        SELECT EXISTS(SELECT 1 FROM files WHERE id = p_file_id AND is_active = true) INTO file_exists;
        
        -- Verificar se livro existe  
        SELECT EXISTS(SELECT 1 FROM books WHERE id = p_book_id) INTO book_exists;
        
        IF NOT file_exists THEN
            RAISE EXCEPTION 'Arquivo não encontrado ou não está ativo';
        END IF;
        
        IF NOT book_exists THEN
            RAISE EXCEPTION 'Livro não encontrado';
        END IF;
        
        -- Atualizar arquivo para referenciar o livro
        UPDATE files 
        SET 
            linked_book_id = p_book_id,
            linked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_file_id;
        
        -- Atualizar livro para referenciar o arquivo
        UPDATE books 
        SET 
            file_id = p_file_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_book_id;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Criar função para desvincular arquivo de livro
  await knex.raw(`
    CREATE OR REPLACE FUNCTION unlink_file_from_book(p_file_id UUID)
    RETURNS BOOLEAN AS $$
    DECLARE
        linked_book_id UUID;
    BEGIN
        -- Buscar o livro vinculado
        SELECT files.linked_book_id INTO linked_book_id 
        FROM files 
        WHERE id = p_file_id;
        
        -- Remover vinculação do arquivo
        UPDATE files 
        SET 
            linked_book_id = NULL,
            linked_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_file_id;
        
        -- Remover vinculação do livro se existir
        IF linked_book_id IS NOT NULL THEN
            UPDATE books 
            SET 
                file_id = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = linked_book_id;
        END IF;
        
        RETURN true;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Adicionar comentários
  await knex.raw(`
    COMMENT ON COLUMN files.linked_book_id IS 'ID do livro vinculado a este arquivo';
    COMMENT ON COLUMN files.linked_at IS 'Timestamp de quando foi vinculado ao livro';
    COMMENT ON COLUMN books.file_id IS 'ID do arquivo associado a este livro';
    COMMENT ON VIEW v_files_with_books IS 'View com arquivos e suas referências de livros';
    COMMENT ON FUNCTION link_file_to_book IS 'Vincula um arquivo a um livro (relação bidirecional)';
    COMMENT ON FUNCTION unlink_file_from_book IS 'Remove vinculação entre arquivo e livro';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remover funções
  await knex.raw('DROP FUNCTION IF EXISTS unlink_file_from_book(UUID)');
  await knex.raw('DROP FUNCTION IF EXISTS link_file_to_book(UUID, UUID)');
  
  // Remover view
  await knex.raw('DROP VIEW IF EXISTS v_files_with_books');
  
  // Remover colunas
  await knex.schema.alterTable('books', (table) => {
    table.dropColumn('file_id');
  });
  
  await knex.schema.alterTable('files', (table) => {
    table.dropColumn('linked_book_id');
    table.dropColumn('linked_at');
  });
} 