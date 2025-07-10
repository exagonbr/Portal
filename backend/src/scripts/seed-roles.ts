import { AppDataSource } from '../config/typeorm.config';
import { Role } from '../entities/Role';
enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  PRINCIPAL = "PRINCIPAL",
  LIBRARIAN = "LIBRARIAN"
}

async function seedRoles() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const roleRepository = AppDataSource.getRepository(Role);

    // Check existing roles
    const existingRoles = await roleRepository.find();
    console.log('Existing roles:', existingRoles.map(r => r.name));

    // Define all required roles
    const requiredRoles = [
      {
        name: UserRole.SYSTEM_ADMIN,
        description: 'System Administrator with full access'
      },
      {
        name: UserRole.INSTITUTION_MANAGER,
        description: 'Institution Manager with administrative access'
      },
      {
        name: UserRole.ACADEMIC_COORDINATOR,
        description: 'Academic Coordinator with curriculum management access'
      },
      {
        name: UserRole.TEACHER,
        description: 'Teacher with classroom management access'
      },
      {
        name: UserRole.STUDENT,
        description: 'Student with learning access'
      },
      {
        name: UserRole.GUARDIAN,
        description: 'Guardian with child monitoring access'
      }
    ];

    let createdCount = 0;

    for (const roleData of requiredRoles) {
      const existingRole = existingRoles.find(r => r.name === roleData.name);
      
      if (!existingRole) {
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
        console.log(`✅ Created role: ${roleData.name}`);
        createdCount++;
      } else {
        console.log(`⚠️  Role already exists: ${roleData.name}`);
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount} new roles`);

    // Show final roles
    const finalRoles = await roleRepository.find();
    console.log('\nFinal roles in database:', finalRoles.map(r => r.name));

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
seedRoles();
