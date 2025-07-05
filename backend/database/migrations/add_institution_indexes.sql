-- Script para adicionar índices para otimização de consultas na tabela institutions
-- Executar em produção após análise de impacto

-- Verificar se os índices já existem antes de criar
DO $$
BEGIN
    -- Índice para a coluna name
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'institutions' AND indexname = 'idx_institutions_name'
    ) THEN
        CREATE INDEX idx_institutions_name ON institutions(name);
        RAISE NOTICE 'Índice idx_institutions_name criado com sucesso';
    ELSE
        RAISE NOTICE 'Índice idx_institutions_name já existe';
    END IF;

    -- Índice para a coluna code
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'institutions' AND indexname = 'idx_institutions_code'
    ) THEN
        CREATE INDEX idx_institutions_code ON institutions(code);
        RAISE NOTICE 'Índice idx_institutions_code criado com sucesso';
    ELSE
        RAISE NOTICE 'Índice idx_institutions_code já existe';
    END IF;

    -- Índice para a coluna type
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'institutions' AND indexname = 'idx_institutions_type'
    ) THEN
        CREATE INDEX idx_institutions_type ON institutions(type);
        RAISE NOTICE 'Índice idx_institutions_type criado com sucesso';
    ELSE
        RAISE NOTICE 'Índice idx_institutions_type já existe';
    END IF;

    -- Índice para a coluna status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'institutions' AND indexname = 'idx_institutions_status'
    ) THEN
        CREATE INDEX idx_institutions_status ON institutions(status);
        RAISE NOTICE 'Índice idx_institutions_status criado com sucesso';
    ELSE
        RAISE NOTICE 'Índice idx_institutions_status já existe';
    END IF;

    -- Índice para busca por texto em name e code (pode ser útil para consultas LIKE)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'institutions' AND indexname = 'idx_institutions_name_code_search'
    ) THEN
        CREATE INDEX idx_institutions_name_code_search ON institutions USING gin (name gin_trgm_ops, code gin_trgm_ops);
        RAISE NOTICE 'Índice idx_institutions_name_code_search criado com sucesso';
    ELSE
        RAISE NOTICE 'Índice idx_institutions_name_code_search já existe';
    END IF;
END $$;

-- Analisar a tabela para atualizar estatísticas do planejador de consultas
ANALYZE institutions;

-- Nota: O índice gin_trgm_ops requer a extensão pg_trgm
-- Verificar se a extensão está disponível e instalá-la se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
    ) THEN
        CREATE EXTENSION pg_trgm;
        RAISE NOTICE 'Extensão pg_trgm instalada com sucesso';
    ELSE
        RAISE NOTICE 'Extensão pg_trgm já está instalada';
    END IF;
END $$; 