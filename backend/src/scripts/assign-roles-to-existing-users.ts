import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { IsNull } from 'typeorm';

async function assignRolesToExistingUser() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Get all users without roles but with boolean flags
    const usersWithoutRoles = await userRepository.find({
      where: { roleId: IsNull() },
      relations: ['role']
    });

    console.log(`Found ${usersWithoutRoles.length} users without roles`);

    let updatedCount = 0;

    for (const user of usersWithoutRoles) {
      if (user.hasValidRole()) {
        const determinedRole = user.determineRoleFromFlags();
        
        // Find the role entity
        const roleEntity = await roleRepository.findOne({ 
          where: { name: determinedRole } 
        });

        if (roleEntity) {
          user.role = roleEntity;
          user.roleId = roleEntity.id;
          await userRepository.save(user);
          
          console.log(`✅ Assigned role ${determinedRole} to user ${user.email}`);
          updatedCount++;
        } else {
          console.log(`❌ Role ${determinedRole} not found for user ${user.email}`);
        }
      } else {
        console.log(`⚠️  User ${user.email} has no valid role flags`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} users with roles`);

  } catch (error) {
    console.error('❌ Error assigning roles to users:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
assignRolesToExistingUser();
