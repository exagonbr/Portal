-- CreateTable
CREATE TABLE "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert roles
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at") VALUES
('1', 'SYSTEM_ADMIN', 'Administrador do Sistema', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2', 'INSTITUTION_MANAGER', 'Gestor da Instituição', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3', 'TEACHER', 'Professor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4', 'STUDENT', 'Estudante', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5', 'ACADEMIC_COORDINATOR', 'Coordenador Acadêmico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6', 'GUARDIAN', 'Responsável', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert users
-- Senha para todos: password123 (armazenada de forma não segura por enquanto, deve ser substituída por hash)
INSERT INTO "users" ("id", "email", "name", "password", "role_id", "active", "created_at", "updated_at") VALUES
('1', 'admin@sabercon.edu.br', 'Administrador do Sistema', 'password123', '1', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2', 'gestor@sabercon.edu.br', 'Gestor da Instituição', 'password123', '2', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3', 'professor@sabercon.edu.br', 'Professor', 'password123', '3', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4', 'julia.c@ifsp.com', 'Julia', 'password123', '4', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5', 'coordenador@sabercon.edu.com', 'Coordenador Acadêmico', 'password123', '5', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6', 'renato@gmail.com', 'Renato', 'password123', '6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 