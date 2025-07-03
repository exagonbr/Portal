-- Migration to refactor user roles from boolean flags to a dedicated table structure

-- 1. Create the new 'roles' table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the new 'user_roles' pivot table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 3. Populate the 'roles' table with standard roles
-- Use INSERT ... ON CONFLICT to avoid errors on re-runs
INSERT INTO roles (name, description) VALUES
('STUDENT', 'Student user role'),
('TEACHER', 'Teacher user role'),
('MANAGER', 'Manager user role'),
('ADMIN', 'Administrator user role'),
('SYSTEM_ADMIN', 'System Administrator user role'),
('PARENT', 'Parent or Guardian user role'),
('COORDINATOR', 'Coordinator user role')
ON CONFLICT (name) DO NOTHING;

-- 4. Migrate existing users to the new system
DO $$
DECLARE
    student_role_id UUID;
    teacher_role_id UUID;
    manager_role_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO student_role_id FROM roles WHERE name = 'STUDENT';
    SELECT id INTO teacher_role_id FROM roles WHERE name = 'TEACHER';
    SELECT id INTO manager_role_id FROM roles WHERE name = 'MANAGER';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';

    -- Migrate students
    IF student_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, student_role_id FROM users WHERE is_student = true
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    -- Migrate teachers
    IF teacher_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, teacher_role_id FROM users WHERE is_teacher = true
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    -- Migrate managers
    IF manager_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, manager_role_id FROM users WHERE is_manager = true
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    -- Migrate admins
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, admin_role_id FROM users WHERE is_admin = true
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$;

-- 5. (Optional but recommended) Remove old boolean flag columns
-- It's safer to do this in a separate, later migration after verifying the data.
-- For now, I will comment this out.
--
-- ALTER TABLE users
-- DROP COLUMN IF EXISTS is_student,
-- DROP COLUMN IF EXISTS is_teacher,
-- DROP COLUMN IF EXISTS is_manager,
-- DROP COLUMN IF EXISTS is_admin;

-- Add a note that the migration is complete
SELECT 'User roles refactoring migration completed successfully.';