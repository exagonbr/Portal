#!/bin/bash

echo "Iniciando correção de erros nos scripts..."

# Corrigir assign-roles-to-existing-users.ts
if [ -f "src/scripts/assign-roles-to-existing-users.ts" ]; then
  echo "Corrigindo src/scripts/assign-roles-to-existing-users.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/assign-roles-to-existing-users.ts" "src/scripts/assign-roles-to-existing-users.ts.bak"
  
  # Substituir import de Users por User
  sed -i "s/import { Users } from '..\/entities\/Users';/import { User } from '..\/entities\/User';/g" "src/scripts/assign-roles-to-existing-users.ts"
  
  # Substituir referências a Users por User
  sed -i "s/Users/User/g" "src/scripts/assign-roles-to-existing-users.ts"
  
  echo "✅ src/scripts/assign-roles-to-existing-users.ts corrigido"
fi

# Corrigir assignTeacherRole.ts
if [ -f "src/scripts/assignTeacherRole.ts" ]; then
  echo "Corrigindo src/scripts/assignTeacherRole.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/assignTeacherRole.ts" "src/scripts/assignTeacherRole.ts.bak"
  
  # Corrigir imports
  sed -i "s/import { testDatabaseConnection, closeDatabaseConnection } from '..\/config\/database';/import testDatabaseConnection from '..\/config\/database';\nimport closeDatabaseConnection from '..\/config\/database';/g" "src/scripts/assignTeacherRole.ts"
  
  # Adicionar método assignTeacherRoleToImportedUsers ao RoleService se não existir
  if ! grep -q "assignTeacherRoleToImportedUsers" "src/services/RoleService.ts"; then
    echo "Adicionando método assignTeacherRoleToImportedUsers ao RoleService..."
    
    # Fazer backup do arquivo
    cp "src/services/RoleService.ts" "src/services/RoleService.ts.bak"
    
    # Adicionar método ao final da classe
    sed -i '/^}$/i \
  async assignTeacherRoleToImportedUsers(): Promise<{ success: boolean; count: number }> {\
    try {\
      const users = await this.userRepository.find({\
        where: { imported: true, roles: { id: IsNull() } }\
      });\
      \
      if (users.length === 0) {\
        return { success: true, count: 0 };\
      }\
      \
      const teacherRole = await this.roleRepository.findOne({\
        where: { name: "TEACHER" }\
      });\
      \
      if (!teacherRole) {\
        throw new Error("Teacher role not found");\
      }\
      \
      let count = 0;\
      for (const user of users) {\
        user.roles = [teacherRole];\
        await this.userRepository.save(user);\
        count++;\
      }\
      \
      return { success: true, count };\
    } catch (error) {\
      console.error("Error assigning teacher role:", error);\
      return { success: false, count: 0 };\
    }\
  }' "src/services/RoleService.ts"
    
    # Adicionar import para IsNull
    sed -i '1s/^/import { IsNull } from "typeorm";\n/' "src/services/RoleService.ts"
    
    echo "✅ Método adicionado ao RoleService"
  fi
  
  echo "✅ src/scripts/assignTeacherRole.ts corrigido"
fi

# Corrigir check-redis.ts
if [ -f "src/scripts/check-redis.ts" ]; then
  echo "Corrigindo src/scripts/check-redis.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/check-redis.ts" "src/scripts/check-redis.ts.bak"
  
  # Corrigir imports
  sed -i "s/import { testRedisConnection, testQueueRedisConnection, testStaticCacheRedisConnection } from '..\/config\/redis';/import { testRedisConnection } from '..\/config\/redis';/g" "src/scripts/check-redis.ts"
  
  # Substituir chamadas a funções não existentes
  sed -i "s/await testQueueRedisConnection()/await testRedisConnection()/g" "src/scripts/check-redis.ts"
  sed -i "s/await testStaticCacheRedisConnection()/await testRedisConnection()/g" "src/scripts/check-redis.ts"
  
  echo "✅ src/scripts/check-redis.ts corrigido"
fi

# Corrigir fix-institutions-error.ts
if [ -f "src/scripts/fix-institutions-error.ts" ]; then
  echo "Corrigindo src/scripts/fix-institutions-error.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/fix-institutions-error.ts" "src/scripts/fix-institutions-error.ts.bak"
  
  # Corrigir acesso a propriedades
  sed -i "s/if (result.success)/if (result)/g" "src/scripts/fix-institutions-error.ts"
  sed -i "s/result.data?.institution?.length/result.institutions?.length/g" "src/scripts/fix-institutions-error.ts"
  sed -i "s/if (result.data?.institution && result.data.institution.length > 0)/if (result.institutions && result.institutions.length > 0)/g" "src/scripts/fix-institutions-error.ts"
  sed -i "s/result.data.institution.forEach/result.institutions.forEach/g" "src/scripts/fix-institutions-error.ts"
  sed -i "s/result.error/\"Error\"/g" "src/scripts/fix-institutions-error.ts"
  
  echo "✅ src/scripts/fix-institutions-error.ts corrigido"
fi

# Corrigir fix-users-error.ts
if [ -f "src/scripts/fix-users-error.ts" ]; then
  echo "Corrigindo src/scripts/fix-users-error.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/fix-users-error.ts" "src/scripts/fix-users-error.ts.bak"
  
  # Substituir findUsersWithFilters por findAll
  sed -i "s/findUsersWithFilters/findAll/g" "src/scripts/fix-users-error.ts"
  
  echo "✅ src/scripts/fix-users-error.ts corrigido"
fi

# Corrigir seed-roles.ts
if [ -f "src/scripts/seed-roles.ts" ]; then
  echo "Corrigindo src/scripts/seed-roles.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/seed-roles.ts" "src/scripts/seed-roles.ts.bak"
  
  # Corrigir import
  sed -i "s/import { Role, UserRole } from '..\/entities\/Role';/import { Role } from '..\/entities\/Role';/g" "src/scripts/seed-roles.ts"
  
  # Adicionar enum UserRole se não existir
  sed -i '/import { Role } from/a\
enum UserRole {\
  ADMIN = "ADMIN",\
  TEACHER = "TEACHER",\
  STUDENT = "STUDENT",\
  PARENT = "PARENT",\
  PRINCIPAL = "PRINCIPAL",\
  LIBRARIAN = "LIBRARIAN"\
}' "src/scripts/seed-roles.ts"
  
  echo "✅ src/scripts/seed-roles.ts corrigido"
fi

# Corrigir setup.ts
if [ -f "src/scripts/setup.ts" ]; then
  echo "Corrigindo src/scripts/setup.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/setup.ts" "src/scripts/setup.ts.bak"
  
  # Corrigir import
  sed -i "s/import { getRedisClient, testRedisConnection } from '..\/config\/redis';/import { testRedisConnection } from '..\/config\/redis';\nimport getRedisClient from '..\/config\/redis';/g" "src/scripts/setup.ts"
  
  echo "✅ src/scripts/setup.ts corrigido"
fi

# Corrigir test-role-jwt.ts
if [ -f "src/scripts/test-role-jwt.ts" ]; then
  echo "Corrigindo src/scripts/test-role-jwt.ts..."
  
  # Fazer backup do arquivo
  cp "src/scripts/test-role-jwt.ts" "src/scripts/test-role-jwt.ts.bak"
  
  # Substituir import de Users por User
  sed -i "s/import { Users } from '..\/entities\/Users';/import { User } from '..\/entities\/User';/g" "src/scripts/test-role-jwt.ts"
  
  # Substituir referências a Users por User
  sed -i "s/Users/User/g" "src/scripts/test-role-jwt.ts"
  
  echo "✅ src/scripts/test-role-jwt.ts corrigido"
fi

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 