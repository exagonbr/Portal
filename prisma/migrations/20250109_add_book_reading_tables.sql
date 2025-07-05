-- Migration: Add book reading tracking tables
-- Date: 2025-01-09
-- Description: Creates tables for tracking book reading progress, highlights, bookmarks, annotations, and favorites

-- Create book_progress table
CREATE TABLE IF NOT EXISTS book_progress (
    id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
    book_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    current_page INTEGER DEFAULT 0,
    total_pages INTEGER NOT NULL,
    progress_percent DOUBLE PRECISION DEFAULT 0,
    last_position TEXT,
    reading_time INTEGER DEFAULT 0, -- in seconds
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_book_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT unique_book_user_progress UNIQUE (book_id, user_id)
);

-- Create indexes for book_progress
CREATE INDEX idx_book_progress_user_id ON book_progress(user_id);
CREATE INDEX idx_book_progress_book_id ON book_progress(book_id);
CREATE INDEX idx_book_progress_last_read_at ON book_progress(last_read_at);

-- Create book_highlights table
CREATE TABLE IF NOT EXISTS book_highlights (
    id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
    book_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    page_number INTEGER NOT NULL,
    start_position TEXT NOT NULL,
    end_position TEXT NOT NULL,
    highlighted_text TEXT NOT NULL,
    color VARCHAR(7) DEFAULT '#FFFF00',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_book_highlights_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_highlights_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for book_highlights
CREATE INDEX idx_book_highlights_user_id ON book_highlights(user_id);
CREATE INDEX idx_book_highlights_book_id ON book_highlights(book_id);
CREATE INDEX idx_book_highlights_page_number ON book_highlights(page_number);

-- Create book_bookmarks table
CREATE TABLE IF NOT EXISTS book_bookmarks (
    id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
    book_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    page_number INTEGER NOT NULL,
    position TEXT NOT NULL,
    title TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_book_bookmarks_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for book_bookmarks
CREATE INDEX idx_book_bookmarks_user_id ON book_bookmarks(user_id);
CREATE INDEX idx_book_bookmarks_book_id ON book_bookmarks(book_id);
CREATE INDEX idx_book_bookmarks_page_number ON book_bookmarks(page_number);

-- Create book_annotations table
CREATE TABLE IF NOT EXISTS book_annotations (
    id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
    book_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    page_number INTEGER NOT NULL,
    position TEXT,
    referenced_text TEXT,
    annotation TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'note',
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_book_annotations_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_annotations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for book_annotations
CREATE INDEX idx_book_annotations_user_id ON book_annotations(user_id);
CREATE INDEX idx_book_annotations_book_id ON book_annotations(book_id);
CREATE INDEX idx_book_annotations_page_number ON book_annotations(page_number);
CREATE INDEX idx_book_annotations_type ON book_annotations(type);

-- Create book_favorites table
CREATE TABLE IF NOT EXISTS book_favorites (
    id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
    book_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_book_favorites_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT unique_book_user_favorite UNIQUE (book_id, user_id)
);

-- Create indexes for book_favorites
CREATE INDEX idx_book_favorites_user_id ON book_favorites(user_id);
CREATE INDEX idx_book_favorites_book_id ON book_favorites(book_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_book_progress_updated_at BEFORE UPDATE ON book_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_highlights_updated_at BEFORE UPDATE ON book_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_bookmarks_updated_at BEFORE UPDATE ON book_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_annotations_updated_at BEFORE UPDATE ON book_annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE book_progress IS 'Tracks user reading progress for each book';
COMMENT ON TABLE book_highlights IS 'Stores text highlights made by users in books';
COMMENT ON TABLE book_bookmarks IS 'Stores bookmarks/saved positions in books';
COMMENT ON TABLE book_annotations IS 'Stores user notes and annotations on books';
COMMENT ON TABLE book_favorites IS 'Tracks which books users have marked as favorites';

COMMENT ON COLUMN book_progress.reading_time IS 'Total reading time in seconds';
COMMENT ON COLUMN book_progress.last_position IS 'JSON string with detailed position info (page, paragraph, line, etc)';
COMMENT ON COLUMN book_highlights.color IS 'Hex color code for the highlight';
COMMENT ON COLUMN book_annotations.type IS 'Type of annotation: note, question, comment, etc'; 