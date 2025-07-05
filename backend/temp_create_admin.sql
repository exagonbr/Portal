-- Inserir uma instituição básica
INSERT INTO institution (name, description, status) 
VALUES ('Sabercon Educação', 'Instituição principal do sistema Sabercon', 'active')
ON CONFLICT DO NOTHING;

-- Inserir role de admin se não existir
INSERT INTO roles (name, description, status) 
VALUES ('SYSTEM_ADMIN', 'Administrador do Sistema - Acesso completo a toda a plataforma', 'active')
ON CONFLICT (name) DO NOTHING;

-- Inserir usuário admin
INSERT INTO users (email, password, name, is_active, role_id, institution_id)
SELECT 
  'admin@sabercon.com',
  '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO', -- password123
  'Administrador do Sistema',
  true,
  r.id,
  i.id
FROM roles r, institution i
WHERE r.name = 'SYSTEM_ADMIN' 
  AND i.name = 'Sabercon Educação'
ON CONFLICT (email) DO NOTHING;