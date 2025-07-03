-- Migration: Add new boolean fields to users table
-- Date: 2025-01-01
-- Description: Add role-based boolean fields to users table

-- Note: is_certified and is_manager already exist in the table
-- Adding the missing fields that were requested:

-- Add is_institution_manager field (if not exists)
ALTER TABLE public."users" ADD COLUMN IF NOT EXISTS is_institution_manager BOOLEAN DEFAULT false;

-- Add is_coordinator field (if not exists)
ALTER TABLE public."users" ADD COLUMN IF NOT EXISTS is_coordinator BOOLEAN DEFAULT false;

-- Add is_guardian field (if not exists)
ALTER TABLE public."users" ADD COLUMN IF NOT EXISTS is_guardian BOOLEAN DEFAULT false;

-- Update existing records to have default values
UPDATE public."users" SET is_institution_manager = false WHERE is_institution_manager IS NULL;
UPDATE public."users" SET is_coordinator = false WHERE is_coordinator IS NULL;
UPDATE public."users" SET is_guardian = false WHERE is_guardian IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public."users".is_institution_manager IS 'Indicates if the user has institution manager role';
COMMENT ON COLUMN public."users".is_coordinator IS 'Indicates if the user has coordinator role';
COMMENT ON COLUMN public."users".is_guardian IS 'Indicates if the user has guardian role';