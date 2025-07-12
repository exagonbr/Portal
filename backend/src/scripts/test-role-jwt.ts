import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import AuthService from '../services/AuthService';

async function testRoleJWT() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // Test cases for different role combinations
    const testCases = [
      { 
        flags: { 
          isAdmin: true, isManager: false, isCoordinator: false, 
          isTeacher: false, isStudent: false, isGuardian: false 
        }, 
        expectedRole: 'SYSTEM_ADMIN' 
      },
      { 
        flags: { 
          isAdmin: false, isManager: true, isCoordinator: false, 
          isTeacher: false, isStudent: false, isGuardian: false 
        }, 
        expectedRole: 'INSTITUTION_MANAGER' 
      },
      { 
        flags: { 
          isAdmin: false, isManager: false, isCoordinator: true, 
          isTeacher: false, isStudent: false, isGuardian: false 
        }, 
        expectedRole: 'ACADEMIC_COORDINATOR' 
      },
      { 
        flags: { 
          isAdmin: false, isManager: false, isCoordinator: false, 
          isTeacher: true, isStudent: false, isGuardian: false 
        }, 
        expectedRole: 'TEACHER' 
      },
      { 
        flags: { 
          isAdmin: false, isManager: false, isCoordinator: false, 
          isTeacher: false, isStudent: true, isGuardian: false 
        }, 
        expectedRole: 'STUDENT' 
      },
      { 
        flags: { 
          isAdmin: false, isManager: false, isCoordinator: false, 
          isTeacher: false, isStudent: false, isGuardian: true 
        }, 
        expectedRole: 'GUARDIAN' 
      },
    ];

    console.log('🧪 Starting JWT Role Assignment Tests\n');

    for (const testCase of testCases) {
      // Create test user
      const testUser = userRepository.create({
        email: `test_${Date.now()}@test.com`,
        fullName: 'Test User',
        password: 'test123',
        enabled: true,
        ...testCase.flags
      });

      await userRepository.save(testUser);

      // Test login
      const result = await AuthService.login(testUser.email, 'test123');
      
      if (result.success && result.data) {
        // Decode JWT without verification to check payload
        const payload = JSON.parse(Buffer.from(
          result.data.accessToken.split('.')[1], 'base64'
        ).toString());

        console.log(`\n📝 Test Case: ${Object.keys(testCase.flags).join(', ')}`);
        console.log(`Expected Role: ${testCase.expectedRole}`);
        console.log(`Actual Role: ${payload.role}`);
        console.log(`Has Expected Permissions: ${
          Array.isArray(payload.permissions) && 
          payload.permissions.length > 0 ? '✅' : '❌'
        }`);
        
        if (payload.role === testCase.expectedRole) {
          console.log('✅ Role assignment correct');
        } else {
          console.log('❌ Role assignment incorrect');
        }
      } else {
        console.log(`❌ Login failed for test case ${Object.keys(testCase.flags).join(', ')}`);
        console.log(`Error: ${result.message}`);
      }

      // Cleanup test user
      await userRepository.remove(testUser);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the tests
testRoleJWT();
