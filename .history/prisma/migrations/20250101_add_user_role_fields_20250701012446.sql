-- Migration: Add new boolean fields to users table
-- Date: 2025-01-01
-- Description: Add is_certified and is_manager fields to users table

-- Add is_certified field
ALTER TABLE public."users" ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT false;

-- Add is_manager field  
ALTER TABLE public."users" ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT false;

-- Update existing records to have default values
UPDATE public."users" SET is_certified = false WHERE is_certified IS NULL;
UPDATE public."users" SET is_manager = false WHERE is_manager IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public."users".is_certified IS 'Indicates if the user has certification status';
COMMENT ON COLUMN public."users".is_manager IS 'Indicates if the user has manager role permissions';